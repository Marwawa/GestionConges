using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationsAndCongeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CertificatMedicalNom",
                table: "Conges",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificatMedicalPath",
                table: "Conges",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommentaireProposition",
                table: "Conges",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateDebutProposee",
                table: "Conges",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateFinProposee",
                table: "Conges",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateProposition",
                table: "Conges",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UtilisateurId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstLue = table.Column<bool>(type: "bit", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CongeId = table.Column<int>(type: "int", nullable: true),
                    DemandeurId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Conges_CongeId",
                        column: x => x.CongeId,
                        principalTable: "Conges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notifications_Utilisateurs_DemandeurId",
                        column: x => x.DemandeurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CongeId",
                table: "Notifications",
                column: "CongeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DemandeurId",
                table: "Notifications",
                column: "DemandeurId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UtilisateurId",
                table: "Notifications",
                column: "UtilisateurId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropColumn(
                name: "CertificatMedicalNom",
                table: "Conges");

            migrationBuilder.DropColumn(
                name: "CertificatMedicalPath",
                table: "Conges");

            migrationBuilder.DropColumn(
                name: "CommentaireProposition",
                table: "Conges");

            migrationBuilder.DropColumn(
                name: "DateDebutProposee",
                table: "Conges");

            migrationBuilder.DropColumn(
                name: "DateFinProposee",
                table: "Conges");

            migrationBuilder.DropColumn(
                name: "DateProposition",
                table: "Conges");
        }
    }
}
