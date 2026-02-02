-- PaymentStatus: FAILED -> CANCELLED
DO $$ BEGIN
  ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update payment status values
DO $$ BEGIN
  ALTER TABLE "Payment"
    ALTER COLUMN "status" DROP DEFAULT;

  ALTER TABLE "Payment"
    ALTER COLUMN "status" TYPE "PaymentStatus"
    USING (
      CASE
        WHEN "status"::text = 'FAILED' THEN 'CANCELLED'
        ELSE "status"::text
      END
    )::"PaymentStatus";

  ALTER TABLE "Payment"
    ALTER COLUMN "status" SET DEFAULT 'PENDING';
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop old enum if exists
DO $$ BEGIN
  DROP TYPE IF EXISTS "PaymentStatus_old";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- AIConversation table
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
