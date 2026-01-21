-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('voice_reference', 'image_reference', 'video_reference');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('system', 'user', 'assistant');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('user_audio', 'assistant_audio');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ageNumber" INTEGER NOT NULL,
    "tonePreset" TEXT NOT NULL,
    "customToneText" TEXT,
    "contextPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaMedia" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "durationSeconds" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "title" TEXT,
    "toneSnapshot" TEXT NOT NULL,
    "contextSnapshot" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "text" TEXT NOT NULL,
    "clientTimestamp" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionArtifact" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "artifactType" "ArtifactType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "durationSeconds" DOUBLE PRECISION,
    "clientTimestamp" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_consentVersion_idx" ON "ConsentRecord"("userId", "consentVersion");

-- CreateIndex
CREATE INDEX "Persona_userId_idx" ON "Persona"("userId");

-- CreateIndex
CREATE INDEX "PersonaMedia_personaId_mediaType_idx" ON "PersonaMedia"("personaId", "mediaType");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_personaId_idx" ON "Session"("personaId");

-- CreateIndex
CREATE INDEX "SessionMessage_sessionId_createdAt_idx" ON "SessionMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionArtifact_sessionId_createdAt_idx" ON "SessionArtifact"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyEvent_userId_idx" ON "SafetyEvent"("userId");

-- CreateIndex
CREATE INDEX "SafetyEvent_sessionId_idx" ON "SafetyEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaMedia" ADD CONSTRAINT "PersonaMedia_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMessage" ADD CONSTRAINT "SessionMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionArtifact" ADD CONSTRAINT "SessionArtifact_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;