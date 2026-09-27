import { useRef, useState } from "react";
import {
  Camera,
  ImageUp,
  Loader2,
  MapPin,
  Sparkles,
  TriangleAlert,
  X,
  CalendarPlus,
  Download,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { downloadIcs, googleCalendarUrl, toLocalInput, type CalEvent } from "@/lib/events";

type Draft = Omit<CalEvent, "id">;

const EMPTY: Draft = { title: "", startDate: "", endDate: "", location: "", description: "" };

function toInputValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return toLocalInput(d);
}

export function ScanView({ onSave }: { onSave: (e: CalEvent) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uncertain, setUncertain] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [attachImage, setAttachImage] = useState(true);

  const readFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Downscale so the attached photo stays small enough for localStorage.
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        if (scale >= 1) {
          setImage(dataUrl);
        } else {
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImage(canvas.toDataURL("image/jpeg", 0.82));
        }
        setDraft(null);
        setUncertain([]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const extract = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/parse-flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = (await res.json()) as Record<string, string> & { uncertainFields?: string[] };
      if (!res.ok) throw new Error(data["error"] ?? "Extraction failed.");
      setDraft({
        title: data["title"] ?? "",
        startDate: toInputValue(data["startDate"] ?? ""),
        endDate: toInputValue(data["endDate"] ?? ""),
        location: data["location"] ?? "",
        description: data["description"] ?? "",
      });
      const flagged = new Set(data.uncertainFields ?? []);
      for (const k of ["title", "startDate", "endDate", "location", "description"] as const) {
        if (!data[k]) flagged.add(k);
      }
      setUncertain([...flagged]);
      toast.success("Flyer read — review the details below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const current: CalEvent | null = draft ? { id: crypto.randomUUID(), ...draft } : null;

  const reset = () => {
    setDraft(null);
    setImage(null);
    setUncertain([]);
    setAttachImage(true);
  };

  const field = (key: keyof Draft, label: string, icon?: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="flex items-center gap-2 text-xs uppercase tracking-widest">
        {icon}
        {label}
        {uncertain.includes(key) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/25 px-2 py-0.5 text-[0.65rem] font-medium normal-case tracking-normal text-warning-foreground">
            <TriangleAlert className="size-3" /> check this
          </span>
        )}
      </Label>
      {key === "description" ? (
        <Textarea
          id={key}
          rows={3}
          className={cn("text-base", uncertain.includes(key) && "border-warning bg-warning/10")}
          value={draft?.[key] ?? ""}
          onChange={(ev) => setDraft((d) => (d ? { ...d, [key]: ev.target.value } : d))}
        />
      ) : (
        <Input
          id={key}
          type={key === "startDate" || key === "endDate" ? "datetime-local" : "text"}
          className={cn("h-12 text-base", uncertain.includes(key) && "border-warning bg-warning/10")}
          value={draft?.[key] ?? ""}
          onChange={(ev) => setDraft((d) => (d ? { ...d, [key]: ev.target.value } : d))}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase text-primary">Spotted something good?</p>
        <h1 className="font-display text-4xl font-bold leading-tight">
          See a flyer.<br /><span className="text-primary">Make a plan.</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Snap a flyer. We’ll grab the details so you don’t miss out.
        </p>
      </header>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => readFile(e.target.files?.[0])}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => readFile(e.target.files?.[0])}
      />

      {image ? (
        <div className="surface-paper relative overflow-hidden rounded-2xl border border-border p-3">
          <img src={image} alt="Flyer preview" className="h-56 w-full rounded-xl object-cover" />
          <button
            onClick={reset}
            aria-label="Remove photo"
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-foreground/70 text-background backdrop-blur"
          >
            <X className="size-5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "grid gap-3 rounded-2xl border-2 border-dashed border-border p-5 transition-colors",
            dragging && "border-primary bg-primary/5",
          )}
        >
          <Button className="h-14 text-base" onClick={() => cameraRef.current?.click()}>
            <Camera className="size-5" /> Scan Flyer with Camera
          </Button>
          <Button
            variant="secondary"
            className="h-12 text-base"
            onClick={() => libraryRef.current?.click()}
          >
            <ImageUp className="size-5" /> Choose from Photo Library
          </Button>
          <p className="text-center text-xs text-muted-foreground">or drop an image here</p>
        </div>
      )}

      {image && (
        <Button className="h-14 w-full text-base" disabled={loading} onClick={extract}>
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          {loading ? "Reading the flyer…" : "Extract Event Details"}
        </Button>
      )}

      {draft && current && (
        <section className="surface-paper space-y-4 rounded-2xl border border-border p-4">
          <h2 className="font-display text-lg">Review & confirm</h2>
          {field("title", "Event name")}
          <div className="grid gap-4">
            {field("startDate", "Starts")}
            {field("endDate", "Ends")}
          </div>
          {field("location", "Location / venue", <MapPin className="size-3.5" />)}
          {field("description", "Description / notes")}

          <label
            htmlFor="attach-flyer"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 text-sm"
          >
            <Switch
              id="attach-flyer"
              checked={attachImage}
              onCheckedChange={setAttachImage}
            />
            Save original flyer photo with event
          </label>

          <div className="grid gap-2 pt-1">
            <Button
              className="h-12 text-base"
              onClick={() => {
                onSave(attachImage && image ? { ...current, image } : current);
                reset();
                toast.success("Saved to your in-app calendar.");
              }}
            >
              <CalendarCheck className="size-5" /> Save to In-App Calendar
            </Button>
            <Button asChild variant="secondary" className="h-12 text-base">
              <a href={googleCalendarUrl(current)} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="size-5" /> Add to Google Calendar
              </a>
            </Button>
            <Button variant="outline" className="h-12" onClick={() => downloadIcs(current)}>
              <Download className="size-4" /> Add to My Calendar
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
