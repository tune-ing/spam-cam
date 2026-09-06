import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { replaceFeedEvents } from "./feed.server";

const feedEventSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  location: z.string().max(1000).default(""),
  description: z.string().max(5000).default(""),
});

// Public by design: access to a feed is gated by its unguessable token.
export const syncFeed = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        feedToken: z
          .string()
          .regex(/^[0-9a-f-]{36}$/i, "Invalid feed token"),
        events: z.array(feedEventSchema).max(500),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await replaceFeedEvents(data.feedToken.toLowerCase(), data.events);
    return { ok: true };
  });
