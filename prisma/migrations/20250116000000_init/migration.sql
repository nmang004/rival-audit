-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SALES', 'ADMIN', 'PROJECT_MANAGER');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PROPOSAL', 'INITIAL_CALL', 'SIGNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "notifyOnComplete" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnStatusChange" BOOLEAN NOT NULL DEFAULT true,
    "companyName" TEXT,
    "companyLogo" TEXT,
    "brandPrimaryColor" TEXT,
    "brandSecondaryColor" TEXT,
    "reportFooterText" TEXT,
    "defaultExportFormat" TEXT NOT NULL DEFAULT 'PDF',
    "includeScreenshots" BOOLEAN NOT NULL DEFAULT true,
    "includeClaudeAnalysis" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'LIGHT',
    "defaultView" TEXT NOT NULL DEFAULT 'GRID',
    "itemsPerPage" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'PROPOSAL',
    "seoScore" INTEGER,
    "accessibilityScore" INTEGER,
    "designScore" INTEGER,
    "claudeAnalysis" TEXT,
    "screenshotDesktop" TEXT,
    "screenshotMobile" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "h1Tags" JSONB,
    "coreWebVitals" JSONB,
    "isHomepage" BOOLEAN NOT NULL DEFAULT false,
    "totalKeywords" INTEGER,
    "keywordTrendData" JSONB,
    "topPages" JSONB,
    "semrushData" JSONB,
    "excelReportUrl" TEXT,
    "isSitemapAudit" BOOLEAN NOT NULL DEFAULT false,
    "sitemapUrls" JSONB,
    "contentGaps" JSONB,
    "urlStructureIssues" JSONB,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusChange" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "fromStatus" "AuditStatus" NOT NULL,
    "toStatus" "AuditStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "StatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pdfUrl" TEXT,
    "shareableLink" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportAudit" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ReportAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE INDEX "Audit_createdById_idx" ON "Audit"("createdById");

-- CreateIndex
CREATE INDEX "Audit_createdAt_idx" ON "Audit"("createdAt");

-- CreateIndex
CREATE INDEX "StatusChange_auditId_idx" ON "StatusChange"("auditId");

-- CreateIndex
CREATE INDEX "StatusChange_changedAt_idx" ON "StatusChange"("changedAt");

-- CreateIndex
CREATE INDEX "Note_auditId_idx" ON "Note"("auditId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_shareableLink_key" ON "Report"("shareableLink");

-- CreateIndex
CREATE INDEX "Report_createdById_idx" ON "Report"("createdById");

-- CreateIndex
CREATE INDEX "Report_shareableLink_idx" ON "Report"("shareableLink");

-- CreateIndex
CREATE INDEX "ReportAudit_reportId_idx" ON "ReportAudit"("reportId");

-- CreateIndex
CREATE INDEX "ReportAudit_auditId_idx" ON "ReportAudit"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportAudit_reportId_auditId_key" ON "ReportAudit"("reportId", "auditId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusChange" ADD CONSTRAINT "StatusChange_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAudit" ADD CONSTRAINT "ReportAudit_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportAudit" ADD CONSTRAINT "ReportAudit_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

