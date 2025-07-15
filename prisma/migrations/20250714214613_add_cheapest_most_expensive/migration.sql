-- DropForeignKey
ALTER TABLE `UnitType` DROP FOREIGN KEY `UnitType_projectId_fkey`;

-- DropIndex
DROP INDEX `UnitType_projectId_idx` ON `UnitType`;

-- AlterTable
ALTER TABLE `UnitType` ADD COLUMN `cheapest` DOUBLE NULL,
    ADD COLUMN `mostExpensive` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `UnitType` ADD CONSTRAINT `UnitType_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
