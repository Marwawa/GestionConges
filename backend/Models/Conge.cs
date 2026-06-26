namespace backend.Models;

public class Conge
{
    public int Id { get; set; }
    public int UtilisateurId { get; set; }
    public Utilisateur? Utilisateur { get; set; }
    public string TypeConge { get; set; } = string.Empty;
    public DateOnly DateDebut { get; set; }
    public DateOnly DateFin { get; set; }
    public int NombreJours { get; set; }
    public string? Motif { get; set; }
    public string? CertificatMedicalNom { get; set; }
    public string? CertificatMedicalPath { get; set; }
    public string Statut { get; set; } = "EnAttente";
    public string? Commentaire { get; set; }
    public DateOnly? DateDebutProposee { get; set; }
    public DateOnly? DateFinProposee { get; set; }
    public string? CommentaireProposition { get; set; }
    public DateTime? DateProposition { get; set; }
    public int? RemplacantId { get; set; }
    public Utilisateur? Remplacant { get; set; }
    public DateTime DateDemande { get; set; } = DateTime.Now;
    public DateTime? DateTraitement { get; set; }
}
