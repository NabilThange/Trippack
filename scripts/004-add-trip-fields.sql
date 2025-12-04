-- Add new fields to trips table for enhanced trip creation
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add index for public trips (for future discovery feature)
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public) WHERE is_public = true;

-- Comment on columns
COMMENT ON COLUMN trips.is_public IS 'Whether the trip is publicly visible or private';
COMMENT ON COLUMN trips.destination IS 'The destination of the trip';
COMMENT ON COLUMN trips.start_date IS 'When the trip starts';
COMMENT ON COLUMN trips.end_date IS 'When the trip ends';
