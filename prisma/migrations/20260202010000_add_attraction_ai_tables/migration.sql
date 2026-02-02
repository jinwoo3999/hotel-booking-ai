-- Skip the problematic PaymentStatus migration (already applied)
-- Just add Attraction table if it doesn't exist

-- Create Attraction table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "Attraction_city_idx" ON "Attraction"("city");
CREATE INDEX IF NOT EXISTS "Attraction_status_idx" ON "Attraction"("status");

-- Also create AI_Conversation table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AI_Conversation" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "intent" TEXT NOT NULL,
  "params" JSONB NOT NULL,
  "inputText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AI_Conversation_pkey" PRIMARY KEY ("id")
);

