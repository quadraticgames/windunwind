/*
  # Create leaderboard table

  1. New Tables
    - `leaderboard`
      - `id` (serial, primary key)
      - `username` (text, not null)
      - `streak` (integer, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `leaderboard` table
    - Add policies for:
      - Anyone can read scores
      - Authenticated users can insert their own scores
*/

CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  streak INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scores
CREATE POLICY "Anyone can read scores"
  ON leaderboard
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert scores
CREATE POLICY "Authenticated users can insert scores"
  ON leaderboard
  FOR INSERT
  TO authenticated
  WITH CHECK (true);