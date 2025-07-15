/*
  Warnings:

  - Made the column `furnished` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Project` MODIFY `furnished` VARCHAR(191) NOT NULL;
