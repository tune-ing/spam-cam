export type CalEvent = {
  id: string;
  title: string;
  startDate: string; // local ISO, YYYY-MM-DDTHH:mm
  endDate: string;
  location: string;
  description: string;
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
    `details=${encodeURIComponent(e.description)}`,
  ].join("&");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params}`;
}

export function buildIcs(e: CalEvent) {
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlyerScan//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.id}@flyerscan`,
    `DTSTAMP:${toUtcStamp(toLocalInput(new Date()))}`,
    `DTSTART:${toUtcStamp(e.startDate)}`,
    `DTEND:${toUtcStamp(e.endDate)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.location)}`,
    `DESCRIPTION:${esc(e.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(e: CalEvent) {
  const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.replace(/[^\w-]+/g, "-").toLowerCase() || "event"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function sampleEvents(): CalEvent[] {
  const now = new Date();
  const at = (dayOffset: number, hour: number, minutes = 0) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minutes);
    return toLocalInput(d);
  };
  return [
    {
      id: "sample-1",
      title: "Riverside Night Market",
      startDate: at(2, 18),
      endDate: at(2, 22),
      location: "Dock 4, Riverside Quay",
      description: "Street food stalls, live brass band, free entry before 7pm.",
    },
    {
      id: "sample-2",
      title: "Basement Vinyl Fair",
      startDate: at(6, 11),
      endDate: at(6, 16),
      location: "Old Print Works, 22 Cable St",
      description: "40+ sellers. $5 at the door, cash only.",
    },
    {
      id: "sample-3",
      title: "Community Garden Workday",
      startDate: at(11, 9, 30),
      endDate: at(11, 12, 30),
      location: "Hillcrest Community Garden",
      description: "Bring gloves. Coffee and pastries provided.",
    },
  ];
}

export function loadEvents(): CalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = sampleEvents();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as CalEvent[];
  } catch {
    return sampleEvents();
  }
}

export function saveEvents(events: CalEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
