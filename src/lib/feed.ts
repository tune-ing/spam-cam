import { syncFeed } from "./feed.functions";
import type { CalEvent } from "./events";

const TOKEN_KEY = "flyerscan.feedtoken.v1";

export function getFeedToken(): string {
  if (typeof window === "undefined") return "";
  let token = window.localStorage.getItem(TOKEN_KEY);
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    token = crypto.randomUUID();
    window.localStorage.setItem(TOKEN_KEY, token);
  }
  return token.toLowerCase();
}

export function getFeedUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/public/calendar/${getFeedToken()}.ics`;
}

/** Push the full event list to the cloud feed so subscribers stay up to date. */
export async function syncFeedToCloud(events: CalEvent[]) {
  const feedToken = getFeedToken();
  if (!feedToken) return;
  await syncFeed({
    data: {
      feedToken,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location,
        description: e.description,
      })),
    },
  });
}
