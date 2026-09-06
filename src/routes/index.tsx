import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, ScanLine } from "lucide-react";
import { ScanView } from "@/components/ScanView";
import { CalendarBoard } from "@/components/CalendarBoard";
import { EventDialog } from "@/components/EventDialog";
import { LiveFeedCard } from "@/components/LiveFeedCard";
import { cn } from "@/lib/utils";
import { loadEvents, saveEvents, type CalEvent } from "@/lib/events";
import { syncFeedToCloud } from "@/lib/feed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlyerScan — Scan Paper Flyers into Calendar Events" },
      {
        name: "description",
        content:
          "Photograph any paper flyer and let AI vision pull out the title, date, time and venue — then save it to your calendar or Google Calendar in one tap.",
      },
      { property: "og:title", content: "FlyerScan — Scan Paper Flyers into Calendar Events" },
      {
        property: "og:description",
        content:
          "Snap a poster, review the AI-extracted details, and sync the event to Google Calendar or download an .ics file.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState<"scan" | "calendar">("scan");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selected, setSelected] = useState<CalEvent | null>(null);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const persist = (next: CalEvent[]) => {
    setEvents(next);
    saveEvents(next);
    syncFeedToCloud(next).catch((err) =>
      console.error("Failed to sync live calendar feed:", err),
    );
  };

  const scanPane = (
    <ScanView
      onSave={(e) => {
        persist([...events, e]);
        setTab("calendar");
      }}
    />
  );
  const calendarPane = (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">My Calendar</h1>
      <LiveFeedCard />
      <CalendarBoard events={events} onSelect={setSelected} />
    </div>
  );

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-background md:max-w-6xl">
      {/* Mobile: tabbed single column. Desktop (md+): form left, calendar right. */}
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6 md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-start md:gap-8 md:px-8 md:pb-6">
        <div className={cn(tab !== "scan" && "hidden", "md:block")}>{scanPane}</div>
        <div className={cn(tab !== "calendar" && "hidden", "md:block")}>{calendarPane}</div>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "scan", label: "Scan Flyer", Icon: ScanLine },
              { id: "calendar", label: "My Calendar", Icon: CalendarDays },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
                tab === id
                  ? "ink-gradient text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <EventDialog
        event={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => persist(events.filter((e) => e.id !== id))}
      />
    </div>
  );
}
