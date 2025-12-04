-- Disable RLS on folders table since the app uses custom auth (not Supabase Auth)
-- The API routes already handle authorization via getSession()

-- Disable RLS on folders
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow all operations,
-- you can drop restrictive policies and create permissive ones:
-- DROP POLICY IF EXISTS "Trip members can view folders" ON folders;
-- DROP POLICY IF EXISTS "Trip members can insert folders" ON folders;
-- DROP POLICY IF EXISTS "Trip members can update folders" ON folders;
-- DROP POLICY IF EXISTS "Trip members can delete folders" ON folders;
-- CREATE POLICY "Allow all operations" ON folders FOR ALL USING (true);
