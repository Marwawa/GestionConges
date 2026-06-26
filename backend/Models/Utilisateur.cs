namespace backend.Models;

public class Utilisateur
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MotDePasse { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; 
    public string Service { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; } = DateTime.Now;
    public bool EstActif { get; set; } = true;
}