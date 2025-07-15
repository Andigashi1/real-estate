/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Project` table. All the data in the column will be lost.
  - You are about to alter the column `furnished` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - You are about to drop the column `area` on the `UnitType` table. All the data in the column will be lost.
  - You are about to drop the column `available` on the `UnitType` table. All the data in the column will be lost.
  - You are about to drop the column `cheapest` on the `UnitType` table. All the data in the column will be lost.
  - You are about to drop the column `mostExpensive` on the `UnitType` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `UnitType` table. All the data in the column will be lost.
  - Added the required column `maxArea` to the `UnitType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPrice` to the `UnitType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minArea` to the `UnitType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPrice` to the `UnitType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `createdAt`,
    MODIFY `location` VARCHAR(191) NULL,
    MODIFY `type` VARCHAR(191) NULL,
    MODIFY `developer` VARCHAR(191) NULL,
    MODIFY `furnished` BOOLEAN NULL,
    MODIFY `newLaunch` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `UnitType` DROP COLUMN `area`,
    DROP COLUMN `available`,
    DROP COLUMN `cheapest`,
    DROP COLUMN `mostExpensive`,
    DROP COLUMN `name`,
    ADD COLUMN `maxArea` DOUBLE NOT NULL,
    ADD COLUMN `maxPrice` DOUBLE NOT NULL,
    ADD COLUMN `minArea` DOUBLE NOT NULL,
    ADD COLUMN `minPrice` DOUBLE NOT NULL,
    MODIFY `price` DOUBLE NULL;
