/*
  Warnings:

  - Made the column `newLaunch` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Project` ADD COLUMN `cheapestPrice` DOUBLE NULL,
    ADD COLUMN `mostExpensivePrice` DOUBLE NULL,
    MODIFY `newLaunch` BOOLEAN NOT NULL DEFAULT false;
