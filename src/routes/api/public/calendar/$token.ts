import { createFileRoute } from "@tanstack/react-router";
import { buildFeedIcs, getFeedEvents } from "@/lib/feed.server";

export const Route = createFileRoute("/api/public/calendar/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token?.toLowerCase() ?? "";
        if (!/^[0-9a-f-]{36}$/.test(token)) {
          return new Response("Not found", { status: 404 });
        }
        const rows = await getFeedEvents(token);
        const ics = buildFeedIcs(rows);
        return new Response(ics, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="flyerscan.ics"',
            // Let calendar apps re-fetch on their own schedule.
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
