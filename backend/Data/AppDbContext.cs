using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer("Server=DESKTOP-5ISB2AV\\SQLEXPRESS;Database=GestionCongesDB;Integrated Security=True;TrustServerCertificate=True;Encrypt=False");
        }
    }

    public DbSet<Utilisateur> Utilisateurs { get; set; }
    public DbSet<Conge> Conges { get; set; }
    public DbSet<SoldeConge> SoldesConges { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Conge>()
            .HasOne(c => c.Utilisateur)
            .WithMany()
            .HasForeignKey(c => c.UtilisateurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Conge>()
            .HasOne(c => c.Remplacant)
            .WithMany()
            .HasForeignKey(c => c.RemplacantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Utilisateur)
            .WithMany()
            .HasForeignKey(n => n.UtilisateurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Conge)
            .WithMany()
            .HasForeignKey(n => n.CongeId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Demandeur)
            .WithMany()
            .HasForeignKey(n => n.DemandeurId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
