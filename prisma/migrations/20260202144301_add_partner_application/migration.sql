-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PartnerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "position" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "roomCount" INTEGER,
    "address" TEXT NOT NULL,
    "website" TEXT,
    "businessLicense" TEXT,
    "taxCode" TEXT,
    "description" TEXT,
    "experience" TEXT,
    "notes" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,

    CONSTRAINT "PartnerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerApplication_status_idx" ON "PartnerApplication"("status");

-- CreateIndex
CREATE INDEX "PartnerApplication_email_idx" ON "PartnerApplication"("email");

-- CreateIndex
CREATE INDEX "PartnerApplication_submittedAt_idx" ON "PartnerApplication"("submittedAt");

-- AddForeignKey
ALTER TABLE "PartnerApplication" ADD CONSTRAINT "PartnerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
