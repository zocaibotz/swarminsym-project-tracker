BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Project] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Project_status_df] DEFAULT 'active',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [ownerId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Phase] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Phase_status_df] DEFAULT 'pending',
    [startedAt] DATETIME2,
    [completedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Phase_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Phase_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Phase_projectId_order_key] UNIQUE NONCLUSTERED ([projectId],[order])
);

-- CreateTable
CREATE TABLE [dbo].[PhaseDetail] (
    [id] NVARCHAR(1000) NOT NULL,
    [phaseId] NVARCHAR(1000) NOT NULL,
    [objective] NVARCHAR(1000) NOT NULL,
    [notes] NVARCHAR(1000),
    [acceptanceChecks] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PhaseDetail_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PhaseDetail_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PhaseDetail_phaseId_key] UNIQUE NONCLUSTERED ([phaseId])
);

-- CreateTable
CREATE TABLE [dbo].[Decision] (
    [id] NVARCHAR(1000) NOT NULL,
    [phaseId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000),
    [title] NVARCHAR(1000) NOT NULL,
    [rationale] NVARCHAR(1000) NOT NULL,
    [impact] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Decision_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Decision_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Problem] (
    [id] NVARCHAR(1000) NOT NULL,
    [phaseId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000),
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [severity] NVARCHAR(1000) NOT NULL CONSTRAINT [Problem_severity_df] DEFAULT 'medium',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Problem_status_df] DEFAULT 'open',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Problem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Problem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Resolution] (
    [id] NVARCHAR(1000) NOT NULL,
    [phaseId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000),
    [summary] NVARCHAR(1000) NOT NULL,
    [details] NVARCHAR(1000) NOT NULL,
    [resolvedAt] DATETIME2 NOT NULL CONSTRAINT [Resolution_resolvedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Resolution_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Resolution_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DebugLog] (
    [id] NVARCHAR(1000) NOT NULL,
    [phaseId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000),
    [message] NVARCHAR(1000) NOT NULL,
    [level] NVARCHAR(1000) NOT NULL CONSTRAINT [DebugLog_level_df] DEFAULT 'info',
    [metadata] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DebugLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DebugLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Artifact] (
    [id] NVARCHAR(1000) NOT NULL,
    [phaseId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000),
    [type] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [uri] NVARCHAR(1000) NOT NULL,
    [metadata] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Artifact_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Artifact_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Project_ownerId_idx] ON [dbo].[Project]([ownerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Phase_projectId_idx] ON [dbo].[Phase]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Decision_phaseId_idx] ON [dbo].[Decision]([phaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Decision_authorId_idx] ON [dbo].[Decision]([authorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Problem_phaseId_idx] ON [dbo].[Problem]([phaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Problem_authorId_idx] ON [dbo].[Problem]([authorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Resolution_phaseId_idx] ON [dbo].[Resolution]([phaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Resolution_authorId_idx] ON [dbo].[Resolution]([authorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DebugLog_phaseId_idx] ON [dbo].[DebugLog]([phaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DebugLog_authorId_idx] ON [dbo].[DebugLog]([authorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Artifact_phaseId_idx] ON [dbo].[Artifact]([phaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Artifact_authorId_idx] ON [dbo].[Artifact]([authorId]);

-- AddForeignKey
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Phase] ADD CONSTRAINT [Phase_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PhaseDetail] ADD CONSTRAINT [PhaseDetail_phaseId_fkey] FOREIGN KEY ([phaseId]) REFERENCES [dbo].[Phase]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Decision] ADD CONSTRAINT [Decision_phaseId_fkey] FOREIGN KEY ([phaseId]) REFERENCES [dbo].[Phase]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Decision] ADD CONSTRAINT [Decision_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Problem] ADD CONSTRAINT [Problem_phaseId_fkey] FOREIGN KEY ([phaseId]) REFERENCES [dbo].[Phase]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Problem] ADD CONSTRAINT [Problem_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Resolution] ADD CONSTRAINT [Resolution_phaseId_fkey] FOREIGN KEY ([phaseId]) REFERENCES [dbo].[Phase]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Resolution] ADD CONSTRAINT [Resolution_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DebugLog] ADD CONSTRAINT [DebugLog_phaseId_fkey] FOREIGN KEY ([phaseId]) REFERENCES [dbo].[Phase]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DebugLog] ADD CONSTRAINT [DebugLog_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Artifact] ADD CONSTRAINT [Artifact_phaseId_fkey] FOREIGN KEY ([phaseId]) REFERENCES [dbo].[Phase]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Artifact] ADD CONSTRAINT [Artifact_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

