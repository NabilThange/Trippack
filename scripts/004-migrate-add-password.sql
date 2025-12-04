-- Run this script to add the password_hash column to your existing profiles table

-- Step 1: Add the password_hash column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: Drop the old foreign key constraint to auth.users if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Make sure the id column can be auto-generated (if it was linked to auth.users)
-- First check if we need to change the id column type
DO $$
BEGIN
  -- Check if we need to set a default for id
  IF NOT EXISTS (
    SELECT 1 FROM pg_attrdef ad
    JOIN pg_attribute a ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
    WHERE a.attrelid = 'profiles'::regclass AND a.attname = 'id'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Step 4: Disable RLS for simpler access (we handle auth at app level)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Step 5: Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view trips" ON trips;
DROP POLICY IF EXISTS "Owner can update trip" ON trips;
DROP POLICY IF EXISTS "Owner can delete trip" ON trips;
DROP POLICY IF EXISTS "Authenticated users can create trips" ON trips;
DROP POLICY IF EXISTS "Members can view trip members" ON trip_members;
DROP POLICY IF EXISTS "Owner can manage members" ON trip_members;
DROP POLICY IF EXISTS "Users can request to join" ON trip_members;
DROP POLICY IF EXISTS "Members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Creator can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Creator can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Members can toggle packed status" ON tasks;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles';
