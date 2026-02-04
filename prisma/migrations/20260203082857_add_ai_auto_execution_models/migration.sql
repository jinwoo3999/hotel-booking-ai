-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "autoBookingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoRoomHoldEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoVoucherEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priceAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "proactiveSuggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxAutoBookingAmount" DOUBLE PRECISION NOT NULL DEFAULT 3000000,
    "consentGivenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehaviorPattern" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingsPerYear" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastBookingDate" TIMESTAMP(3),
    "favoriteDestinations" JSONB NOT NULL DEFAULT '[]',
    "avgBookingLeadTime" INTEGER NOT NULL DEFAULT 14,
    "avgStayDuration" INTEGER NOT NULL DEFAULT 2,
    "avgPricePerNight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preferredHotelTypes" TEXT[],
    "preferredAmenities" TEXT[],
    "avgTimeOnHotel" INTEGER NOT NULL DEFAULT 0,
    "hotelsViewedPerBooking" INTEGER NOT NULL DEFAULT 5,
    "viewingToBookingRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "priceSensitivity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "impulseBuyer" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "plannerType" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BehaviorPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomHold" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "heldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "convertedToBookingId" TEXT,

    CONSTRAINT "RoomHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProactiveSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "message" TEXT NOT NULL,
    "actionType" TEXT,
    "actionData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveredAt" TIMESTAMP(3),
    "actedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProactiveSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION,
    "alertOnAnyDrop" BOOLEAN NOT NULL DEFAULT true,
    "minDropPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "lastKnownPrice" DOUBLE PRECISION NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertsSent" INTEGER NOT NULL DEFAULT 0,
    "lastAlertSent" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceWatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoActionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actionData" JSONB NOT NULL,
    "result" JSONB,
    "executionTime" INTEGER NOT NULL,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "favoriteLocations" TEXT[],
    "budgetMin" DOUBLE PRECISION,
    "budgetMax" DOUBLE PRECISION,
    "preferredRoomTypes" TEXT[],
    "preferredAmenities" TEXT[],
    "travelCompanions" INTEGER NOT NULL DEFAULT 2,
    "travelFrequency" TEXT,
    "inferredBudget" DOUBLE PRECISION,
    "preferredSeasons" TEXT[],
    "hotelTypePreference" TEXT,
    "avgBookingLeadTime" INTEGER,
    "avgStayDuration" INTEGER,
    "personalizationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dataCollectionConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isWeekend" BOOLEAN NOT NULL,
    "isHoliday" BOOLEAN NOT NULL,
    "seasonalFlag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "extractedInfo" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ConversationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConsent_userId_key" ON "UserConsent"("userId");

-- CreateIndex
CREATE INDEX "UserConsent_userId_idx" ON "UserConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BehaviorPattern_userId_key" ON "BehaviorPattern"("userId");

-- CreateIndex
CREATE INDEX "BehaviorPattern_userId_idx" ON "BehaviorPattern"("userId");

-- CreateIndex
CREATE INDEX "RoomHold_userId_idx" ON "RoomHold"("userId");

-- CreateIndex
CREATE INDEX "RoomHold_roomId_idx" ON "RoomHold"("roomId");

-- CreateIndex
CREATE INDEX "RoomHold_expiresAt_idx" ON "RoomHold"("expiresAt");

-- CreateIndex
CREATE INDEX "RoomHold_status_idx" ON "RoomHold"("status");

-- CreateIndex
CREATE INDEX "ProactiveSuggestion_userId_status_idx" ON "ProactiveSuggestion"("userId", "status");

-- CreateIndex
CREATE INDEX "ProactiveSuggestion_priority_idx" ON "ProactiveSuggestion"("priority");

-- CreateIndex
CREATE INDEX "ProactiveSuggestion_expiresAt_idx" ON "ProactiveSuggestion"("expiresAt");

-- CreateIndex
CREATE INDEX "PriceWatch_userId_active_idx" ON "PriceWatch"("userId", "active");

-- CreateIndex
CREATE INDEX "PriceWatch_hotelId_idx" ON "PriceWatch"("hotelId");

-- CreateIndex
CREATE INDEX "PriceWatch_lastChecked_idx" ON "PriceWatch"("lastChecked");

-- CreateIndex
CREATE INDEX "AutoActionLog_userId_createdAt_idx" ON "AutoActionLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AutoActionLog_actionType_idx" ON "AutoActionLog"("actionType");

-- CreateIndex
CREATE INDEX "AutoActionLog_status_idx" ON "AutoActionLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_createdAt_idx" ON "UserInteraction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserInteraction_interactionType_idx" ON "UserInteraction"("interactionType");

-- CreateIndex
CREATE INDEX "PriceHistory_roomId_date_idx" ON "PriceHistory"("roomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PriceHistory_roomId_date_key" ON "PriceHistory"("roomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationSession_sessionId_key" ON "ConversationSession"("sessionId");

-- CreateIndex
CREATE INDEX "ConversationSession_userId_idx" ON "ConversationSession"("userId");

-- CreateIndex
CREATE INDEX "ConversationSession_sessionId_idx" ON "ConversationSession"("sessionId");

-- CreateIndex
CREATE INDEX "ConversationSession_lastActive_idx" ON "ConversationSession"("lastActive");

-- AddForeignKey
ALTER TABLE "UserConsent" ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorPattern" ADD CONSTRAINT "BehaviorPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomHold" ADD CONSTRAINT "RoomHold_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomHold" ADD CONSTRAINT "RoomHold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProactiveSuggestion" ADD CONSTRAINT "ProactiveSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceWatch" ADD CONSTRAINT "PriceWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceWatch" ADD CONSTRAINT "PriceWatch_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoActionLog" ADD CONSTRAINT "AutoActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationSession" ADD CONSTRAINT "ConversationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
