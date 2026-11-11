/*
# Create executors table

1. New Tables
- `executors` — справочник исполнителей
  - `id` (uuid, primary key)
  - `position` (text, not null) — должность исполнителя
  - `employee` (text, not null) — фамилия/сотрудник (короткое имя)
  - `full_name` (text, not null) — ФИО (полное имя)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `executors`.
- Grant CRUD to `anon` + `authenticated` so the Data API can reach the table.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (single-tenant app, no sign-in).
*/

CREATE TABLE IF NOT EXISTS executors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  employee text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE executors ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON executors TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_executors" ON executors;
CREATE POLICY "anon_select_executors" ON executors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_executors" ON executors;
CREATE POLICY "anon_insert_executors" ON executors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_executors" ON executors;
CREATE POLICY "anon_update_executors" ON executors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_executors" ON executors;
CREATE POLICY "anon_delete_executors" ON executors FOR DELETE
  TO anon, authenticated USING (true);
