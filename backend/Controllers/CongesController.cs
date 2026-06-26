using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    public class UpdateStatutDto
    {
        public string Statut { get; set; } = "";
        public string? Commentaire { get; set; }
    }

    public class PropositionDatesDto
    {
        public DateOnly DateDebutProposee { get; set; }
        public DateOnly DateFinProposee { get; set; }
        public string? Commentaire { get; set; }
    }

    public class CreateCongeDto
    {
        public int UtilisateurId { get; set; }
        public string TypeConge { get; set; } = "";
        public DateOnly DateDebut { get; set; }
        public DateOnly DateFin { get; set; }
        public string? Motif { get; set; }
        public IFormFile? CertificatMedical { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CongesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SoldeCongeService _soldeCongeService;

        public CongesController(AppDbContext context, SoldeCongeService soldeCongeService)
        {
            _context = context;
            _soldeCongeService = soldeCongeService;
        }

        // GET: api/conges
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Conge>>> GetAll()
        {
            return await _context.Conges
                .Include(c => c.Utilisateur)
                .ToListAsync();
        }

        // GET: api/conges/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Conge>> GetById(int id)
        {
            var conge = await _context.Conges
                .Include(c => c.Utilisateur)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (conge == null) return NotFound();
            return conge;
        }

        // GET: api/conges/utilisateur/3
        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<ActionResult<IEnumerable<Conge>>> GetByUtilisateur(int utilisateurId)
        {
            return await _context.Conges
                .Where(c => c.UtilisateurId == utilisateurId)
                .ToListAsync();
        }

        // GET: api/conges/jours-ouvrables?dateDebut=2026-07-01&dateFin=2026-07-10
        [HttpGet("jours-ouvrables")]
        public ActionResult<int> GetJoursOuvrables([FromQuery] DateOnly dateDebut, [FromQuery] DateOnly dateFin)
        {
            if (dateFin < dateDebut)
                return BadRequest(new { message = "La date de fin doit être après la date de début." });
            return Ok(JoursFeriesMarocService.CalculerJoursOuvrables(dateDebut, dateFin));
        }

        // GET: api/conges/jours-feries?annee=2026
        [HttpGet("jours-feries")]
        public ActionResult<IEnumerable<DateOnly>> GetJoursFeries([FromQuery] int? annee)
        {
            return Ok(JoursFeriesMarocService.GetJoursFeries(annee ?? DateTime.Now.Year).OrderBy(j => j));
        }

        // POST: api/conges
        [HttpPost]
        public async Task<ActionResult<Conge>> Create([FromForm] CreateCongeDto dto)
        {
            if (dto.TypeConge == "Maladie" && dto.CertificatMedical == null)
                return BadRequest(new { message = "Le certificat médical PDF est obligatoire pour un congé maladie." });

            string? certificatNom = null;
            string? certificatPath = null;

            if (dto.CertificatMedical != null)
            {
                if (!dto.CertificatMedical.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ||
                    dto.CertificatMedical.ContentType != "application/pdf")
                {
                    return BadRequest(new { message = "Le certificat médical doit être un fichier PDF." });
                }

                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "CertificatsMedicaux");
                Directory.CreateDirectory(uploadsDir);
                certificatNom = Path.GetFileName(dto.CertificatMedical.FileName);
                var storedName = $"{Guid.NewGuid():N}.pdf";
                certificatPath = Path.Combine("Uploads", "CertificatsMedicaux", storedName);
                var fullPath = Path.Combine(uploadsDir, storedName);

                await using var stream = System.IO.File.Create(fullPath);
                await dto.CertificatMedical.CopyToAsync(stream);
            }

            var conge = new Conge
            {
                UtilisateurId = dto.UtilisateurId,
                TypeConge = dto.TypeConge,
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                Motif = dto.Motif,
                CertificatMedicalNom = certificatNom,
                CertificatMedicalPath = certificatPath,
            };

            conge.Statut = "En attente";
            conge.DateDemande = DateTime.Now;
            conge.NombreJours = JoursFeriesMarocService.CalculerJoursOuvrables(dto.DateDebut, dto.DateFin);
            if (conge.NombreJours <= 0)
                return BadRequest(new { message = "La période choisie ne contient aucun jour ouvrable." });

            _context.Conges.Add(conge);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = conge.Id }, conge);
        }

        // PUT: api/conges/5/statut
        [HttpPut("{id}/statut")]
        public async Task<IActionResult> UpdateStatut(int id, [FromBody] UpdateStatutDto dto)
        {
            var conge = await _context.Conges.FindAsync(id);
            if (conge == null) return NotFound();
            conge.Statut = dto.Statut;
            conge.Commentaire = dto.Commentaire;
            conge.DateTraitement = DateTime.Now;
            await _context.SaveChangesAsync();
            await _soldeCongeService.RecalculerSoldesAutourCongeAsync(conge);
            return NoContent();
        }

        [HttpPut("{id}/proposition-dates")]
        public async Task<IActionResult> ProposerDates(int id, [FromBody] PropositionDatesDto dto)
        {
            var conge = await _context.Conges
                .Include(c => c.Utilisateur)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (conge == null) return NotFound();

            conge.Statut = "Changement demandé";
            conge.DateDebutProposee = dto.DateDebutProposee;
            conge.DateFinProposee = dto.DateFinProposee;
            conge.CommentaireProposition = dto.Commentaire;
            conge.DateProposition = DateTime.Now;

            _context.Notifications.Add(new Notification
            {
                UtilisateurId = conge.UtilisateurId,
                CongeId = conge.Id,
                Type = "PropositionDatesConge",
                Message = $"Une nouvelle date de congé est proposée pour votre demande du {conge.DateDebut:dd/MM/yyyy} au {conge.DateFin:dd/MM/yyyy}."
            });

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/reponse-proposition")]
        public async Task<IActionResult> RepondreProposition(int id, [FromQuery] bool accepte)
        {
            var conge = await _context.Conges.FindAsync(id);
            if (conge == null) return NotFound();

            if (accepte)
            {
                if (conge.DateDebutProposee == null || conge.DateFinProposee == null)
                    return BadRequest(new { message = "Aucune proposition disponible." });

                conge.DateDebut = conge.DateDebutProposee.Value;
                conge.DateFin = conge.DateFinProposee.Value;
                conge.NombreJours = JoursFeriesMarocService.CalculerJoursOuvrables(conge.DateDebut, conge.DateFin);
                conge.Statut = "Approuvé";
            }
            else
            {
                conge.Statut = "Rejeté";
            }

            conge.DateTraitement = DateTime.Now;
            await _context.SaveChangesAsync();
            await _soldeCongeService.RecalculerSoldesAutourCongeAsync(conge);
            return NoContent();
        }

        // DELETE: api/conges/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var conge = await _context.Conges.FindAsync(id);
            if (conge == null) return NotFound();
            _context.Conges.Remove(conge);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
