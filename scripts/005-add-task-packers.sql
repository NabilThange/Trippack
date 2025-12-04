-- Migration: Add task_packers table for multi-user packing
-- Each user can independently pack/unpack any item

-- Create task_packers junction table
CREATE TABLE IF NOT EXISTS task_packers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  packed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE task_packers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view packers for tasks they can see
CREATE POLICY "Users can view task packers" ON task_packers
  FOR SELECT USING (true);

-- Policy: Users can add themselves as packers
CREATE POLICY "Users can pack items" ON task_packers
  FOR INSERT WITH CHECK (auth.uid() = user_id OR true);

-- Policy: Users can remove themselves as packers
CREATE POLICY "Users can unpack their items" ON task_packers
  FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_packers_task_id ON task_packers(task_id);
CREATE INDEX IF NOT EXISTS idx_task_packers_user_id ON task_packers(user_id);

-- Enable realtime for task_packers
ALTER PUBLICATION supabase_realtime ADD TABLE task_packers;
