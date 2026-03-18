-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Phase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhaseDetail" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "notes" TEXT,
    "acceptanceChecks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Decision" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Problem" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resolution" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "authorId" TEXT,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DebugLog" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "authorId" TEXT,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebugLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Artifact" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "authorId" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "public"."Project"("ownerId");

-- CreateIndex
CREATE INDEX "Phase_projectId_idx" ON "public"."Phase"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_projectId_order_key" ON "public"."Phase"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseDetail_phaseId_key" ON "public"."PhaseDetail"("phaseId");

-- CreateIndex
CREATE INDEX "Decision_phaseId_idx" ON "public"."Decision"("phaseId");

-- CreateIndex
CREATE INDEX "Decision_authorId_idx" ON "public"."Decision"("authorId");

-- CreateIndex
CREATE INDEX "Problem_phaseId_idx" ON "public"."Problem"("phaseId");

-- CreateIndex
CREATE INDEX "Problem_authorId_idx" ON "public"."Problem"("authorId");

-- CreateIndex
CREATE INDEX "Resolution_phaseId_idx" ON "public"."Resolution"("phaseId");

-- CreateIndex
CREATE INDEX "Resolution_authorId_idx" ON "public"."Resolution"("authorId");

-- CreateIndex
CREATE INDEX "DebugLog_phaseId_idx" ON "public"."DebugLog"("phaseId");

-- CreateIndex
CREATE INDEX "DebugLog_authorId_idx" ON "public"."DebugLog"("authorId");

-- CreateIndex
CREATE INDEX "Artifact_phaseId_idx" ON "public"."Artifact"("phaseId");

-- CreateIndex
CREATE INDEX "Artifact_authorId_idx" ON "public"."Artifact"("authorId");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Phase" ADD CONSTRAINT "Phase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PhaseDetail" ADD CONSTRAINT "PhaseDetail_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Decision" ADD CONSTRAINT "Decision_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Decision" ADD CONSTRAINT "Decision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Problem" ADD CONSTRAINT "Problem_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Problem" ADD CONSTRAINT "Problem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resolution" ADD CONSTRAINT "Resolution_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resolution" ADD CONSTRAINT "Resolution_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DebugLog" ADD CONSTRAINT "DebugLog_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebugLog" ADD CONSTRAINT "DebugLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Artifact" ADD CONSTRAINT "Artifact_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Artifact" ADD CONSTRAINT "Artifact_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

