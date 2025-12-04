-- Fix RLS policies to ensure owners can manage their data and public trips are visible

-- ==========================================
-- TRIPS TABLE POLICIES
-- ==========================================

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

-- ==========================================
-- FOLDERS TABLE POLICIES
-- ==========================================

-- Enable RLS on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- 1. View folders
DROP POLICY IF EXISTS "Trip members can view folders" ON folders;
CREATE POLICY "Trip members can view folders" ON folders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = folders.trip_id
      AND trip_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = folders.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

-- 2. Insert folders
DROP POLICY IF EXISTS "Trip members can insert folders" ON folders;
CREATE POLICY "Trip members can insert folders" ON folders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = folders.trip_id
      AND trip_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = folders.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

-- 3. Update folders
DROP POLICY IF EXISTS "Trip members can update folders" ON folders;
CREATE POLICY "Trip members can update folders" ON folders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = folders.trip_id
      AND trip_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = folders.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

-- 4. Delete folders
DROP POLICY IF EXISTS "Trip members can delete folders" ON folders;
CREATE POLICY "Trip members can delete folders" ON folders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = folders.trip_id
      AND trip_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = folders.trip_id
      AND trips.owner_id = auth.uid()
    )
  );
