-- Blog/Cẩm nang

DO $$ BEGIN
  CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PENDING_REVIEW');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "coverImage" TEXT,
  "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_status_idx" ON "BlogPost"("status");
CREATE INDEX IF NOT EXISTS "BlogPost_authorId_idx" ON "BlogPost"("authorId");

ALTER TABLE "BlogPost"
  ADD CONSTRAINT "BlogPost_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

