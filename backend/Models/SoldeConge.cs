namespace backend.Models;

public class SoldeConge
{
    public int Id { get; set; }
    public int UtilisateurId { get; set; }
    public Utilisateur? Utilisateur { get; set; }
    public string TypeConge { get; set; } = string.Empty;
    public int NombreJoursDispo { get; set; }
    public int NombreJoursPris { get; set; }
    public int Annee { get; set; } = DateTime.Now.Year;
}