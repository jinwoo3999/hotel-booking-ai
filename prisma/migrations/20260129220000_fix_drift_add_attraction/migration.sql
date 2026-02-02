-- Fix PaymentStatus enum drift (FAILED -> CANCELLED) without data loss
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'PaymentStatus' AND e.enumlabel = 'FAILED'
    ) THEN
      UPDATE "Payment"
      SET "status" = 'CANCELLED'
      WHERE "status"::text = 'FAILED';

      ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
      CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

      ALTER TABLE "Payment"
        ALTER COLUMN "status" DROP DEFAULT;
      ALTER TABLE "Payment"
        ALTER COLUMN "status" TYPE "PaymentStatus"
        USING (CASE WHEN "status"::text = 'FAILED' THEN 'CANCELLED' ELSE "status"::text END)::"PaymentStatus";
      ALTER TABLE "Payment"
        ALTER COLUMN "status" SET DEFAULT 'PENDING';

      DROP TYPE "PaymentStatus_old";
    END IF;
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- AI_Conversation table (logging)
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

CREATE INDEX IF NOT EXISTS "AI_Conversation_sessionId_idx" ON "AI_Conversation"("sessionId");
CREATE INDEX IF NOT EXISTS "AI_Conversation_userId_idx" ON "AI_Conversation"("userId");

-- Attraction model + enum
DO $$
BEGIN
  CREATE TYPE "AttractionStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Attraction" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT,
  "category" TEXT,
  "description" TEXT,
  "images" TEXT[] NOT NULL,
  "status" "AttractionStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Attraction_city_idx" ON "Attraction"("city");
CREATE INDEX IF NOT EXISTS "Attraction_status_idx" ON "Attraction"("status");
