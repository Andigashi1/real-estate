/*
  Warnings:

  - Added the required column `location` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Project" ("area", "bedrooms", "createdAt", "description", "developer", "id", "price", "slug", "title", "type") SELECT "area", "bedrooms", "createdAt", "description", "developer", "id", "price", "slug", "title", "type" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
