using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    public class ChangerMotDePasseDto
    {
        public string NouveauMotDePasse { get; set; } = "";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class UtilisateursController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UtilisateursController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Utilisateur>>> GetAll()
        {
            return await _context.Utilisateurs.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Utilisateur>> GetById(int id)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null) return NotFound();
            return utilisateur;
        }

        [HttpPost]
        public async Task<ActionResult<Utilisateur>> Create(Utilisateur utilisateur)
        {
            _context.Utilisateurs.Add(utilisateur);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = utilisateur.Id }, utilisateur);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Utilisateur utilisateur)
        {
            if (id != utilisateur.Id) return BadRequest();
            _context.Entry(utilisateur).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ChangerMotDePasseDto dto)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null) return NotFound();
            utilisateur.MotDePasse = dto.NouveauMotDePasse;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null) return NotFound();
            _context.Utilisateurs.Remove(utilisateur);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}