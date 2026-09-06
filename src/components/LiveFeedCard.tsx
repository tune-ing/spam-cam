import { useState } from "react";
import { Check, Copy, Rss } from "lucide-react";
import { getFeedUrl } from "@/lib/feed";

export function LiveFeedCard() {
  const [copied, setCopied] = useState(false);
  const feedUrl = getFeedUrl();
  if (!feedUrl) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your calendar feed link:", feedUrl);
    }
  };

  return (
    <section className="surface-paper rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="ink-gradient flex size-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
          <Rss className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg leading-tight">Live calendar feed</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Subscribe once and every event you save here appears in your other calendar
            automatically — no re-exporting.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={feedUrl}
              onFocus={(e) => e.target.select()}
              className="h-11 min-w-0 flex-1 truncate rounded-xl border border-input bg-muted px-3 text-xs text-muted-foreground"
              aria-label="Your calendar feed link"
            />
            <button
              onClick={copy}
              className="ink-gradient flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium text-primary-foreground"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            In Google Calendar: <span className="font-medium">Other calendars → From URL</span> and
            paste this link. In Apple Calendar: <span className="font-medium">File → New Calendar
            Subscription</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
