BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Candidato] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nomeCompleto] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [telefone] NVARCHAR(20),
    [areaInteresse] NVARCHAR(255),
    [resumoProfissional] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Candidato_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Candidato_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Candidato_email_key] UNIQUE NONCLUSTERED ([email])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
