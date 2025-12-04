-- Fix RLS policies to ensure owners can manage their data and public trips are visible

-- 1. Ensure owners can view their own trips (critical for folder insertion checks)
DROP POLICY IF EXISTS "Owners can view their own trips" ON trips;
CREATE POLICY "Owners can view their own trips" ON trips
  FOR SELECT
  USING (owner_id = auth.uid());

-- 2. Ensure owners can update their own trips
DROP POLICY IF EXISTS "Owners can update their own trips" ON trips;
CREATE POLICY "Owners can update their own trips" ON trips
  FOR UPDATE
  USING (owner_id = auth.uid());

-- 3. Ensure owners can delete their own trips
DROP POLICY IF EXISTS "Owners can delete their own trips" ON trips;
CREATE POLICY "Owners can delete their own trips" ON trips
  FOR DELETE
  USING (owner_id = auth.uid());

-- 4. Ensure public can view public trips
DROP POLICY IF EXISTS "Public can view public trips" ON trips;
CREATE POLICY "Public can view public trips" ON trips
  FOR SELECT
  USING (is_public = TRUE);

-- 5. Ensure members can view trips they are part of
DROP POLICY IF EXISTS "Members can view joined trips" ON trips;
CREATE POLICY "Members can view joined trips" ON trips
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
    )
  );
