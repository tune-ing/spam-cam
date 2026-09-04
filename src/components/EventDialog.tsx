import { useState } from "react";
import { CalendarPlus, Download, MapPin, Trash2, Clock, Expand, X } from "lucide-react";
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
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
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
                  <p className="rounded-xl bg-muted p-3 text-muted-foreground">
                    {event.description}
                  </p>
                )}
                {event.image && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Original Flyer / Scan
                    </p>
                    <button
                      onClick={() => setLightbox(true)}
                      aria-label="Enlarge flyer photo"
                      className="group relative block w-full overflow-hidden rounded-xl border border-border"
                    >
                      <img
                        src={event.image}
                        alt={`Flyer for ${event.title}`}
                        loading="lazy"
                        className="h-36 w-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-xs text-background backdrop-blur">
                        <Expand className="size-3.5" /> Enlarge
                      </span>
                    </button>
                  </div>
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

      {lightbox && event?.image && (
        <div
          role="dialog"
          aria-label="Flyer photo enlarged"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <img
            src={event.image}
            alt={`Flyer for ${event.title}`}
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            aria-label="Close enlarged flyer"
            className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-full bg-background/20 text-background backdrop-blur transition-colors hover:bg-background/30"
          >
            <X className="size-6" />
          </button>
        </div>
      )}
    </>
  );
}
