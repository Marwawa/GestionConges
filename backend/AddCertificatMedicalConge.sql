IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Utilisateurs] (
    [Id] int NOT NULL IDENTITY,
    [Nom] nvarchar(max) NOT NULL,
    [Prenom] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [MotDePasse] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [Service] nvarchar(max) NOT NULL,
    [DateCreation] datetime2 NOT NULL,
    [EstActif] bit NOT NULL,
    CONSTRAINT [PK_Utilisateurs] PRIMARY KEY ([Id])
);

CREATE TABLE [Conges] (
    [Id] int NOT NULL IDENTITY,
    [UtilisateurId] int NOT NULL,
    [TypeConge] nvarchar(max) NOT NULL,
    [DateDebut] date NOT NULL,
    [DateFin] date NOT NULL,
    [NombreJours] int NOT NULL,
    [Motif] nvarchar(max) NOT NULL,
    [Statut] nvarchar(max) NOT NULL,
    [Commentaire] nvarchar(max) NULL,
    [RemplacantId] int NULL,
    [DateDemande] datetime2 NOT NULL,
    [DateTraitement] datetime2 NULL,
    CONSTRAINT [PK_Conges] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Conges_Utilisateurs_RemplacantId] FOREIGN KEY ([RemplacantId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Conges_Utilisateurs_UtilisateurId] FOREIGN KEY ([UtilisateurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [SoldesConges] (
    [Id] int NOT NULL IDENTITY,
    [UtilisateurId] int NOT NULL,
    [TypeConge] nvarchar(max) NOT NULL,
    [NombreJoursDispo] int NOT NULL,
    [NombreJoursPris] int NOT NULL,
    [Annee] int NOT NULL,
    CONSTRAINT [PK_SoldesConges] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SoldesConges_Utilisateurs_UtilisateurId] FOREIGN KEY ([UtilisateurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Conges_RemplacantId] ON [Conges] ([RemplacantId]);

CREATE INDEX [IX_Conges_UtilisateurId] ON [Conges] ([UtilisateurId]);

CREATE INDEX [IX_SoldesConges_UtilisateurId] ON [SoldesConges] ([UtilisateurId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260623111650_InitialCreate', N'10.0.9');

COMMIT;
GO

