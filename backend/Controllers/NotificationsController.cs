using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    public class MotDePasseOublieDto
    {
        public string Email { get; set; } = "";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("utilisateur/{utilisateurId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetByUtilisateur(int utilisateurId)
        {
            return await _context.Notifications
                .Include(n => n.Demandeur)
                .Include(n => n.Conge)
                .Where(n => n.UtilisateurId == utilisateurId)
                .OrderByDescending(n => n.DateCreation)
                .Take(20)
                .ToListAsync();
        }

        [HttpPut("{id}/lue")]
        public async Task<IActionResult> MarquerLue(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();
            notification.EstLue = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("mot-de-passe-oublie")]
        public async Task<IActionResult> MotDePasseOublie([FromBody] MotDePasseOublieDto dto)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (utilisateur == null)
                return NotFound(new { message = "Aucun compte trouvé avec cet email." });

            var admin = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Role == "Admin");

            if (admin == null)
                return NotFound(new { message = "Aucun administrateur trouvé." });

            _context.Notifications.Add(new Notification
            {
                UtilisateurId = admin.Id,
                DemandeurId = utilisateur.Id,
                Type = "MotDePasseOublie",
                Message = $"{utilisateur.Prenom} {utilisateur.Nom} ({utilisateur.Email}) a oublié son mot de passe.",
                EstLue = false,
                DateCreation = DateTime.Now,
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Votre demande a été envoyée à l'administrateur." });
        }
    }
}