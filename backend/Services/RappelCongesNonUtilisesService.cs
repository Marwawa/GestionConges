using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class RappelCongesNonUtilisesService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RappelCongesNonUtilisesService> _logger;

    public RappelCongesNonUtilisesService(
        IServiceScopeFactory scopeFactory,
        ILogger<RappelCongesNonUtilisesService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await EnvoyerRappelsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi des rappels de conges non utilises.");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task EnvoyerRappelsAsync(CancellationToken stoppingToken)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        if (today.Month != 12 || today.Day < 15)
        {
            return;
        }

        await using var scope = _scopeFactory.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var annee = today.Year;

        var soldes = await context.SoldesConges
            .Where(s => s.Annee == annee && s.TypeConge == "Annuel" && s.NombreJoursDispo > s.NombreJoursPris)
            .ToListAsync(stoppingToken);

        foreach (var solde in soldes)
        {
            var restant = solde.NombreJoursDispo - solde.NombreJoursPris;
            var existe = await context.Notifications.AnyAsync(n =>
                n.UtilisateurId == solde.UtilisateurId &&
                n.Type == $"RappelCongesNonUtilises-{annee}",
                stoppingToken);

            if (existe)
            {
                continue;
            }

            context.Notifications.Add(new Notification
            {
                UtilisateurId = solde.UtilisateurId,
                Type = $"RappelCongesNonUtilises-{annee}",
                Message = $"Il vous reste {restant} jour(s) de conge annuel non utilise(s) avant la fin de l'annee {annee}.",
                EstLue = false,
                DateCreation = DateTime.Now,
            });
        }

        await context.SaveChangesAsync(stoppingToken);
    }
}
