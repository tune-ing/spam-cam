import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Camera, Download, Sparkles } from "lucide-react";
import { ScanView } from "@/components/ScanView";
import { CalendarBoard } from "@/components/CalendarBoard";
import { EventDialog } from "@/components/EventDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadAllIcs, loadEvents, saveEvents, type CalEvent } from "@/lib/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpamCam — Snap flyers, save plans" },
      {
        name: "description",
        content:
          "Snap a flyer, review the event details and add it to your calendar with SpamCam.",
      },
      { property: "og:title", content: "SpamCam — Snap flyers, save plans" },
      {
        property: "og:description",
        content:
          "Snap a poster, review the details and add the event to your calendar.",
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
    const loaded = loadEvents();
    setEvents(loaded);
  }, []);

  const persist = (next: CalEvent[]) => {
    setEvents(next);
    saveEvents(next);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Your plans</p>
          <h2 className="font-display text-3xl font-bold">SpamCam Events</h2>
        </div>
        <Button variant="outline" className="h-12" onClick={() => downloadAllIcs(events)} disabled={!events.length}>
          <Download /> Export calendar
        </Button>
      </div>
      <CalendarBoard events={events} onSelect={setSelected} />
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-background">
      <header className="z-10 shrink-0 border-b border-border bg-card px-5 py-3 md:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Camera className="size-5" /></span>
            <span className="font-display text-2xl font-bold leading-none text-foreground">SpamCam<span className="text-primary">.</span></span>
          </div>
          <Sparkles className="size-5 text-accent" aria-hidden="true" />
        </div>
      </header>
      {/* Mobile: tabbed single column. Desktop (md+): form left, calendar right. */}
      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 pb-28 pt-6 md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-start md:gap-8 md:px-8 md:pb-6">
        <div className={cn(tab !== "scan" && "hidden", "md:block")}>{scanPane}</div>
        <div className={cn(tab !== "calendar" && "hidden", "md:block")}>{calendarPane}</div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "scan", label: "Scan Flyer", Icon: Camera },
              { id: "calendar", label: "My Calendar", Icon: CalendarDays },
            ] as const
          ).map(({ id, label, Icon }) => (
            <Button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                 "flex min-h-12 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                tab === id
                   ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Button>
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
