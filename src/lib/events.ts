export type CalEvent = {
  id: string;
  title: string;
  startDate: string; // local ISO, YYYY-MM-DDTHH:mm
  endDate: string;
  location: string;
  description: string;
  image?: string; // flyer photo: asset path or data URL
};

const STORAGE_KEY = "flyerscan.events.v1";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Compact UTC stamp: YYYYMMDDTHHMMSSZ */
export function toUtcStamp(local: string) {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(e: CalEvent) {
  const params = [
    `text=${encodeURIComponent(e.title)}`,
    `dates=${toUtcStamp(e.startDate)}/${toUtcStamp(e.endDate)}`,
    `location=${encodeURIComponent(e.location)}`,
    `details=${encodeURIComponent(eventDescription(e.description))}`,
  ].join("&");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params}`;
}

export function eventDescription(description: string) {
  const text = description.trim();
  return /\[From your SpamCam\]/i.test(text) ? text : [text.replace(/\s*from your SpamCam\s*$/i, ""), "[From your SpamCam]"].filter(Boolean).join("\n\n");
}

const escIcs = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

function eventIcsLines(e: CalEvent) {
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@spamcam`,
    `DTSTAMP:${toUtcStamp(toLocalInput(new Date()))}`,
    `DTSTART:${toUtcStamp(e.startDate)}`,
    `DTEND:${toUtcStamp(e.endDate)}`,
    `SUMMARY:${escIcs(e.title)}`,
    `LOCATION:${escIcs(e.location)}`,
    `DESCRIPTION:${escIcs(eventDescription(e.description))}`,
    "END:VEVENT",
  ];
}

export function buildCalendarIcs(events: CalEvent[]) {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SpamCam//EN", "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:SpamCam Events",
    ...events.flatMap(eventIcsLines),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function buildIcs(e: CalEvent) {
  return buildCalendarIcs([e]);
}

function downloadCalendar(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadIcs(e: CalEvent) {
  downloadCalendar(buildIcs(e), `${e.title.replace(/[^\w-]+/g, "-").toLowerCase() || "event"}.ics`);
}

export async function addToDeviceCalendar(e: CalEvent) {
  const file = new File([buildIcs(e)], `${e.title.replace(/[^\w-]+/g, "-").toLowerCase() || "event"}.ics`, { type: "text/calendar" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: e.title });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  downloadIcs(e);
}

export function downloadAllIcs(events: CalEvent[]) {
  downloadCalendar(buildCalendarIcs(events), "SpamCam Events.ics");
}

export function loadEvents(): CalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as CalEvent[];
    if (!Array.isArray(stored)) return [];
    const events = stored.filter((event) => !["sample-1", "sample-2", "sample-3"].includes(event.id));
    if (events.length !== stored.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return events;
  } catch {
    return [];
  }
}

export function saveEvents(events: CalEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
