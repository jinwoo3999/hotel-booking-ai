-- Voucher linkage for Booking + pricing fields on Policy

-- Add voucher relation to Booking
ALTER TABLE "Booking" ADD COLUMN "voucherId" TEXT;

-- Add pricing fields to Policy
ALTER TABLE "Policy" ADD COLUMN "serviceFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Policy" ADD COLUMN "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Index for voucher lookups
CREATE INDEX "Booking_voucherId_idx" ON "Booking"("voucherId");

-- FK to Voucher (set null if voucher is removed)
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_voucherId_fkey"
  FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

