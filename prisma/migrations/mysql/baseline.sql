-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,

    INDEX `Project_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Phase` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Phase_projectId_idx`(`projectId`),
    UNIQUE INDEX `Phase_projectId_order_key`(`projectId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhaseDetail` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `objective` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `acceptanceChecks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PhaseDetail_phaseId_key`(`phaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Decision` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `rationale` VARCHAR(191) NOT NULL,
    `impact` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Decision_phaseId_idx`(`phaseId`),
    INDEX `Decision_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Problem` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Problem_phaseId_idx`(`phaseId`),
    INDEX `Problem_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resolution` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `summary` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `resolvedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Resolution_phaseId_idx`(`phaseId`),
    INDEX `Resolution_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DebugLog` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'info',
    `metadata` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DebugLog_phaseId_idx`(`phaseId`),
    INDEX `DebugLog_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Artifact` (
    `id` VARCHAR(191) NOT NULL,
    `phaseId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `uri` VARCHAR(191) NOT NULL,
    `metadata` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Artifact_phaseId_idx`(`phaseId`),
    INDEX `Artifact_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Phase` ADD CONSTRAINT `Phase_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhaseDetail` ADD CONSTRAINT `PhaseDetail_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Decision` ADD CONSTRAINT `Decision_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Decision` ADD CONSTRAINT `Decision_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Problem` ADD CONSTRAINT `Problem_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem` ADD CONSTRAINT `Problem_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Resolution` ADD CONSTRAINT `Resolution_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resolution` ADD CONSTRAINT `Resolution_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `DebugLog` ADD CONSTRAINT `DebugLog_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebugLog` ADD CONSTRAINT `DebugLog_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Artifact` ADD CONSTRAINT `Artifact_phaseId_fkey` FOREIGN KEY (`phaseId`) REFERENCES `Phase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Artifact` ADD CONSTRAINT `Artifact_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

