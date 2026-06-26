using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SoldeCongeService
{
    private static readonly Dictionary<string, int> DroitsAnnuels = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Annuel"] = 22,
        ["Maladie"] = 10,
        ["Exceptionnel"] = 10,
        ["SansSolde"] = 0,
    };

    private readonly AppDbContext _context;

    public SoldeCongeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SoldeConge>> GarantirSoldesAnneeAsync(int utilisateurId, int annee)
    {
        var soldes = await _context.SoldesConges
            .Where(s => s.UtilisateurId == utilisateurId && s.Annee == annee)
            .ToListAsync();

        var changed = false;
        foreach (var type in DroitsAnnuels.Keys)
        {
            if (soldes.Any(s => s.TypeConge == type))
            {
                continue;
            }

            var precedent = await _context.SoldesConges
                .Where(s => s.UtilisateurId == utilisateurId && s.Annee == annee - 1 && s.TypeConge == type)
                .FirstOrDefaultAsync();

            var report = precedent == null ? 0 : Math.Max(0, precedent.NombreJoursDispo - precedent.NombreJoursPris);
            var solde = new SoldeConge
            {
                UtilisateurId = utilisateurId,
                TypeConge = type,
                Annee = annee,
                NombreJoursDispo = DroitsAnnuels[type] + report,
                NombreJoursPris = 0,
            };

            _context.SoldesConges.Add(solde);
            soldes.Add(solde);
            changed = true;
        }

        if (changed)
        {
            await _context.SaveChangesAsync();
        }

        await RecalculerSoldesUtilisateurAsync(utilisateurId, annee);

        return await _context.SoldesConges
            .Where(s => s.UtilisateurId == utilisateurId && s.Annee == annee)
            .OrderByDescending(s => s.TypeConge == "Annuel")
            .ThenBy(s => s.TypeConge)
            .ToListAsync();
    }

    public async Task RecalculerSoldesUtilisateurAsync(int utilisateurId, int annee)
    {
        var soldes = await _context.SoldesConges
            .Where(s => s.UtilisateurId == utilisateurId && s.Annee == annee)
            .ToListAsync();

        foreach (var solde in soldes)
        {
            solde.NombreJoursPris = await _context.Conges
                .Where(c =>
                    c.UtilisateurId == utilisateurId &&
                    c.TypeConge == solde.TypeConge &&
                    c.Statut == "Approuvé" &&
                    c.DateDebut.Year == annee)
                .SumAsync(c => c.NombreJours);
        }

        await _context.SaveChangesAsync();
    }

    public async Task RecalculerSoldesAutourCongeAsync(Conge conge)
    {
        await GarantirSoldesAnneeAsync(conge.UtilisateurId, conge.DateDebut.Year);
        if (conge.DateFin.Year != conge.DateDebut.Year)
        {
            await GarantirSoldesAnneeAsync(conge.UtilisateurId, conge.DateFin.Year);
        }
    }
}
