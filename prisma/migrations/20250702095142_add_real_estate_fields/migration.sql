/*
  Warnings:

  - You are about to drop the column `githubUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `liveUrl` on the `Project` table. All the data in the column will be lost.
  - Added the required column `area` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bedrooms` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `developer` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "area" REAL NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Project" ("createdAt", "description", "id", "title") SELECT "createdAt", "description", "id", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
