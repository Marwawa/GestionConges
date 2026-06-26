namespace backend.Models;

public class Notification
{
    public int Id { get; set; }
    public int UtilisateurId { get; set; }
    public Utilisateur? Utilisateur { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool EstLue { get; set; }
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public int? CongeId { get; set; }
    public Conge? Conge { get; set; }
    public int? DemandeurId { get; set; }
    public Utilisateur? Demandeur { get; set; }
}
