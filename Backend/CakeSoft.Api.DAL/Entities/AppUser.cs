using Microsoft.AspNetCore.Identity;

namespace CakeSoft.Api.DAL.Entities;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
