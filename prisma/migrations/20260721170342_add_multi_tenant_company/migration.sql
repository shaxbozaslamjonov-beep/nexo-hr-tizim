-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- Seed a default company and backfill existing rows so the new
-- required companyId columns below can be added without data loss.
INSERT INTO "Company" ("id", "name", "slug", "plan")
VALUES ('cf718f79-9b52-4d5e-afc1-bacc0a972679', 'Nexo Demo', 'nexo-demo', 'trial');

-- AlterTable: User
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;
UPDATE "User" SET "companyId" = 'cf718f79-9b52-4d5e-afc1-bacc0a972679' WHERE "companyId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;
CREATE INDEX "User_companyId_idx" ON "User"("companyId");
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Vacancy
ALTER TABLE "Vacancy" ADD COLUMN "companyId" TEXT;
UPDATE "Vacancy" SET "companyId" = 'cf718f79-9b52-4d5e-afc1-bacc0a972679' WHERE "companyId" IS NULL;
ALTER TABLE "Vacancy" ALTER COLUMN "companyId" SET NOT NULL;
CREATE INDEX "Vacancy_companyId_idx" ON "Vacancy"("companyId");
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
