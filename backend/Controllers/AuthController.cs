using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = "";
            public string MotDePasse { get; set; } = "";
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; } = "";
            public string CinOuMatricule { get; set; } = "";
            public string Telephone { get; set; } = "";
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Chercher l'utilisateur par email et mot de passe
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == request.Email 
                                       && u.MotDePasse == request.MotDePasse
                                       && u.EstActif );

            if (utilisateur == null)
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });

            // Créer le token JWT
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
                new Claim(ClaimTypes.Email, utilisateur.Email),
                new Claim(ClaimTypes.Name, $"{utilisateur.Nom} {utilisateur.Prenom}"),
                new Claim(ClaimTypes.Role, utilisateur.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                utilisateur = new
                {
                    utilisateur.Id,
                    utilisateur.Nom,
                    utilisateur.Prenom,
                    utilisateur.Email,
                    utilisateur.Role,
                    utilisateur.Service
                }
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (utilisateur == null)
                return Ok(new { message = "Demande enregistrée." });

            var admins = await _context.Utilisateurs
                .Where(u => u.Role == "Admin" && u.EstActif)
                .ToListAsync();

            foreach (var admin in admins)
            {
                _context.Notifications.Add(new Notification
                {
                    UtilisateurId = admin.Id,
                    DemandeurId = utilisateur.Id,
                    Type = "MotDePasseOublie",
                    Message = $"{utilisateur.Prenom} {utilisateur.Nom} a oublié son mot de passe. CIN/Matricule: {request.CinOuMatricule}, Téléphone: {request.Telephone}."
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Demande enregistrée." });
        }
    }
}
