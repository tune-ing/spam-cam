import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalEvent } from "@/lib/events";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function CalendarBoard({
  events,
  onSelect,
}: {
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);

  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const d = new Date(e.startDate);
      if (Number.isNaN(d.getTime())) continue;
      const k = dayKey(d);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const dayEvents = (byDay.get(dayKey(selected)) ?? []).sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  return (
    <div className="space-y-4">
      <div className="surface-paper rounded-md border border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg">
            {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Next month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[0.7rem] font-medium tracking-wide text-muted-foreground">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = dayKey(d) === dayKey(today);
            const isSel = dayKey(d) === dayKey(selected);
            const count = (byDay.get(dayKey(d)) ?? []).length;
            return (
              <button
                key={d.toISOString()}
                 onClick={() => {
                   setSelected(new Date(d));
                   if (!inMonth) setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                 }}
                 aria-label={d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                 aria-pressed={isSel}
                className={cn(
                   "relative flex h-12 flex-col items-center justify-center rounded-md text-sm transition-colors",
                  inMonth ? "text-foreground" : "text-muted-foreground/40",
                    isSel ? "bg-calendar-selected text-calendar-selected-foreground" : "hover:bg-action-hover hover:text-action-hover-foreground",
                   isToday && "ring-2 ring-calendar-selected ring-inset",
                )}
              >
                 <span className={cn(isToday && !isSel && "font-semibold")}>
                  {d.getDate()}
                </span>
                {count > 0 && (
                  <span
                    className={cn(
                      "mt-0.5 h-1.5 w-1.5 rounded-full",
                       isSel ? "bg-calendar-selected-foreground" : "bg-accent",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="px-1 font-display text-sm uppercase tracking-widest text-muted-foreground">
          {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        {dayEvents.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            <CalendarDays className="size-5" /> Nothing scheduled on this day.
          </div>
        ) : (
          dayEvents.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="surface-paper flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-left transition-transform active:scale-[0.99]"
            >
              <div className="ink-gradient flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-primary-foreground">
                <span className="text-[0.65rem] uppercase opacity-80">
                  {new Date(e.startDate).toLocaleString(undefined, { month: "short" })}
                </span>
                <span className="font-display text-base leading-none">
                  {new Date(e.startDate).getDate()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{e.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(e.startDate).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
