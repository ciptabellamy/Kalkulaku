/*
# Create bi_rate_cache table for Bank Indonesia rate data

1. New Tables
- `bi_rate_cache`
  - `id` (int, primary key, always 1 — singleton row)
  - `bi_rate` (numeric, BI 7-Day Reverse Repo Rate percentage)
  - `deposit_facility` (numeric, Deposit Facility rate percentage)
  - `lending_facility` (numeric, Lending Facility rate percentage)
  - `meeting_date` (text, date of BI Board of Governors meeting, e.g. "22 Juli 2026")
  - `updated_at` (timestamptz, when this row was last refreshed)

2. Security
- Enable RLS on `bi_rate_cache`.
- Allow anon + authenticated SELECT (public reference data, no sign-in needed).
- Allow anon + authenticated INSERT/UPDATE (edge function uses service role so these are not strictly needed, but kept for completeness).
- No DELETE policy — the singleton row should never be deleted.

3. Notes
- This is a single-tenant no-auth app. The anon key client reads this table directly.
- The edge function writes to this table using the service role key (bypasses RLS).
- A seed row is inserted with fallback values so the app always has data even before the first scrape.
*/

CREATE TABLE IF NOT EXISTS bi_rate_cache (
  id int PRIMARY KEY DEFAULT 1,
  bi_rate numeric NOT NULL DEFAULT 0,
  deposit_facility numeric NOT NULL DEFAULT 0,
  lending_facility numeric NOT NULL DEFAULT 0,
  meeting_date text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE bi_rate_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_bi_rate" ON bi_rate_cache;
CREATE POLICY "anon_read_bi_rate"
  ON bi_rate_cache FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_write_bi_rate" ON bi_rate_cache;
CREATE POLICY "anon_write_bi_rate"
  ON bi_rate_cache FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bi_rate" ON bi_rate_cache;
CREATE POLICY "anon_update_bi_rate"
  ON bi_rate_cache FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed with fallback values (will be overwritten by edge function on first scrape)
INSERT INTO bi_rate_cache (id, bi_rate, deposit_facility, lending_facility, meeting_date, updated_at)
VALUES (1, 5.75, 4.75, 6.50, '22 Juli 2026', now())
ON CONFLICT (id) DO NOTHING;
