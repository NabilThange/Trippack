-- Update script for Collaborative Travel Packer Database

-- 1. Add auto_approve_members column to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS auto_approve_members BOOLEAN DEFAULT FALSE;

-- 2. Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add folder_id column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_folders_trip_id ON folders(trip_id);
CREATE INDEX IF NOT EXISTS idx_tasks_folder_id ON tasks(folder_id);

-- 5. Enable RLS on folders table (if not already enabled by default, but good practice)
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for folders (mirroring trip access)
-- Policy to allow trip members to view folders
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

-- Policy to allow trip members to insert folders
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

-- Policy to allow trip members to update folders
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

-- Policy to allow trip members to delete folders
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
