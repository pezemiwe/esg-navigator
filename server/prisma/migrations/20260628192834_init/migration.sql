-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AssessmentProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL DEFAULT '',
    "isGroupAssessment" BOOLEAN NOT NULL DEFAULT false,
    "activeEntityId" TEXT NOT NULL DEFAULT 'parent',
    CONSTRAINT "AssessmentProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "sectorId" TEXT NOT NULL DEFAULT '',
    "subSector" TEXT NOT NULL DEFAULT '',
    "relationshipType" TEXT NOT NULL DEFAULT 'Standalone',
    "governanceJson" TEXT NOT NULL DEFAULT '{}',
    "valueChainJson" TEXT NOT NULL DEFAULT '{}',
    "phase4Json" TEXT NOT NULL DEFAULT '{}',
    "phase5Json" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "Entity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AssessmentProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entity_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Entity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SrroItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "valueChainStage" TEXT NOT NULL DEFAULT '',
    "financialImpact" TEXT NOT NULL DEFAULT '',
    "strategicImpact" TEXT NOT NULL DEFAULT '',
    "operationalImpact" TEXT NOT NULL DEFAULT '',
    "timeHorizon" TEXT NOT NULL DEFAULT '',
    "likelihood" INTEGER NOT NULL DEFAULT 1,
    "magnitude" INTEGER NOT NULL DEFAULT 1,
    "neededByPrimaryUser" TEXT NOT NULL DEFAULT '',
    "includeInFinalList" TEXT NOT NULL DEFAULT '',
    "srroCrro" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SrroItem_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SrroItem_entityId_ref_key" ON "SrroItem"("entityId", "ref");
