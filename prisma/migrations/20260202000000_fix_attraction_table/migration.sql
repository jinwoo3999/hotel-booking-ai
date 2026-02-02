-- Add Attraction table if it doesn't exist (for database sync)
CREATE TABLE IF NOT EXISTS "Attraction" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT,
  "category" TEXT,
  "description" TEXT,
  "images" TEXT[] NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "Attraction_city_idx" ON "Attraction"("city");
CREATE INDEX IF NOT EXISTS "Attraction_status_idx" ON "Attraction"("status");

