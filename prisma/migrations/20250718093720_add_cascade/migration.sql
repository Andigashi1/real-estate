-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `UnitType` DROP FOREIGN KEY `UnitType_projectId_fkey`;

-- DropIndex
DROP INDEX `Image_projectId_fkey` ON `Image`;

-- DropIndex
DROP INDEX `UnitType_projectId_fkey` ON `UnitType`;

-- AddForeignKey
ALTER TABLE `UnitType` ADD CONSTRAINT `UnitType_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
