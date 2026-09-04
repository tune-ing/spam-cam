import { CalendarPlus, Download, MapPin, Trash2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadIcs, googleCalendarUrl, type CalEvent } from "@/lib/events";

function fmt(local: string) {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventDialog({
  event,
  onClose,
  onDelete,
}: {
  event: CalEvent | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[min(92vw,26rem)] rounded-2xl">
        {event && (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-2xl leading-tight">
                {event.title}
              </DialogTitle>
              <DialogDescription className="sr-only">Event details</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2 text-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  {fmt(event.startDate)}
                  <span className="text-muted-foreground"> → </span>
                  {fmt(event.endDate)}
                </span>
              </p>
              {event.location && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{event.location}</span>
                </p>
              )}
              {event.description && (
                <p className="rounded-xl bg-muted p-3 text-muted-foreground">{event.description}</p>
              )}
            </div>
            <div className="mt-2 grid gap-2">
              <Button asChild className="h-12 text-base">
                <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="size-5" /> Export to Google Calendar
                </a>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" className="h-12" onClick={() => downloadIcs(event)}>
                  <Download className="size-4" /> .ics
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    onDelete(event.id);
                    onClose();
                  }}
                >
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
