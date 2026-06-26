using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SoldesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SoldeCongeService _soldeCongeService;

        public SoldesController(AppDbContext context, SoldeCongeService soldeCongeService)
        {
            _context = context;
            _soldeCongeService = soldeCongeService;
        }

        // GET: api/soldes/utilisateur/3
        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByUtilisateur(int utilisateurId)
        {
            var soldes = await _soldeCongeService.GarantirSoldesAnneeAsync(utilisateurId, DateTime.Now.Year);

            return soldes.Select(s => new
            {
                s.Id,
                s.UtilisateurId,
                s.TypeConge,
                s.Annee,
                NombreJoursDispo = s.NombreJoursDispo,
                NombreJoursPris = s.NombreJoursPris,
                TotalAnnuel = s.NombreJoursDispo,
                Pris = s.NombreJoursPris,
                Restant = Math.Max(0, s.NombreJoursDispo - s.NombreJoursPris),
            }).ToList();
        }

        // PUT: api/soldes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SoldeConge solde)
        {
            if (id != solde.Id) return BadRequest();
            _context.Entry(solde).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
