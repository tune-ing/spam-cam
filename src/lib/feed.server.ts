// Server-only helpers for the live calendar feed. Never import from the browser.

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function icsStamp(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

export type FeedEventRow = {
  feed_token: string;
  event_id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
};

export async function replaceFeedEvents(
  feedToken: string,
  events: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
  }>,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error: delError } = await supabaseAdmin
    .from("feed_events")
    .delete()
    .eq("feed_token", feedToken);
  if (delError) throw new Error(delError.message);

  if (events.length === 0) return;

  const rows = events.map((e) => ({
    feed_token: feedToken,
    event_id: e.id,
    title: e.title,
    start_date: new Date(e.startDate).toISOString(),
    end_date: new Date(e.endDate).toISOString(),
    location: e.location ?? "",
    description: e.description ?? "",
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabaseAdmin.from("feed_events").insert(rows);
  if (error) throw new Error(error.message);
}

export async function getFeedEvents(feedToken: string): Promise<FeedEventRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("feed_events")
    .select("feed_token, event_id, title, start_date, end_date, location, description")
    .eq("feed_token", feedToken)
    .order("start_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as FeedEventRow[];
}

export function buildFeedIcs(rows: FeedEventRow[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlyerScan//Feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:FlyerScan Events",
    // Suggest subscribers refresh hourly.
    "X-PUBLISHED-TTL:PT1H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
  ];
  for (const r of rows) {
    const start = new Date(r.start_date);
    const end = new Date(r.end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.event_id}@flyerscan`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${esc(r.title)}`,
      `LOCATION:${esc(r.location ?? "")}`,
      `DESCRIPTION:${esc(r.description ?? "")}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
