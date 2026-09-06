CREATE TABLE public.feed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_token text NOT NULL,
  event_id text NOT NULL,
  title text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feed_token, event_id)
);
CREATE INDEX feed_events_token_idx ON public.feed_events (feed_token);
GRANT ALL ON public.feed_events TO service_role;
ALTER TABLE public.feed_events ENABLE ROW LEVEL SECURITY;