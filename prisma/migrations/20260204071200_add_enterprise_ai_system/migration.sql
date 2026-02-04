-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "businessTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "AIDelegation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canPlaceBookings" BOOLEAN NOT NULL DEFAULT false,
    "canCancelBookings" BOOLEAN NOT NULL DEFAULT false,
    "canOptimizeRefunds" BOOLEAN NOT NULL DEFAULT false,
    "canRebookForPolicy" BOOLEAN NOT NULL DEFAULT false,
    "maxBudgetPerBooking" DOUBLE PRECISION,
    "cancellationTimeWindow" INTEGER,
    "refundThreshold" DOUBLE PRECISION,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIDelegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "guests" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "intentType" TEXT NOT NULL,
    "matchedTags" TEXT[],
    "optimizationScore" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREPARED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftCancellation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "estimatedRefund" DOUBLE PRECISION NOT NULL,
    "refundPercentage" DOUBLE PRECISION NOT NULL,
    "policyType" TEXT NOT NULL,
    "optimalCancelTime" TIMESTAMP(3),
    "reasoning" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREPARED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITaskLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "taskType" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "executionTime" INTEGER NOT NULL,
    "wasDelegated" BOOLEAN NOT NULL DEFAULT false,
    "wasAutoExecuted" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AITaskLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIDelegation_userId_key" ON "AIDelegation"("userId");

-- CreateIndex
CREATE INDEX "AIDelegation_userId_idx" ON "AIDelegation"("userId");

-- CreateIndex
CREATE INDEX "DraftBooking_userId_status_idx" ON "DraftBooking"("userId", "status");

-- CreateIndex
CREATE INDEX "DraftBooking_expiresAt_idx" ON "DraftBooking"("expiresAt");

-- CreateIndex
CREATE INDEX "DraftCancellation_userId_status_idx" ON "DraftCancellation"("userId", "status");

-- CreateIndex
CREATE INDEX "DraftCancellation_bookingId_idx" ON "DraftCancellation"("bookingId");

-- CreateIndex
CREATE INDEX "AITaskLog_userId_createdAt_idx" ON "AITaskLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AITaskLog_taskType_idx" ON "AITaskLog"("taskType");

-- CreateIndex
CREATE INDEX "AITaskLog_wasDelegated_idx" ON "AITaskLog"("wasDelegated");

-- AddForeignKey
ALTER TABLE "AIDelegation" ADD CONSTRAINT "AIDelegation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftBooking" ADD CONSTRAINT "DraftBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftBooking" ADD CONSTRAINT "DraftBooking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftBooking" ADD CONSTRAINT "DraftBooking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftCancellation" ADD CONSTRAINT "DraftCancellation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftCancellation" ADD CONSTRAINT "DraftCancellation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITaskLog" ADD CONSTRAINT "AITaskLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
