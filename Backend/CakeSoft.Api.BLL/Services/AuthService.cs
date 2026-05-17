using CakeSoft.Api.DAL.Entities;
using CakeSoft.Api.DTO.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CakeSoft.Api.BLL.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<AppUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Employee";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Role, role)
            }),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpiryMinutes"]!)),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new AuthResponse
        {
            Token = tokenHandler.WriteToken(token),
            FullName = user.FullName,
            Role = role
        };
    }

    public async Task<bool> RegisterEmployeeAsync(RegisterEmployeeRequest request)
    {
        var user = new AppUser
        {
            UserName = request.Username,
            Email = request.Email,
            FullName = request.FullName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "Employee");
            return true;
        }
        return false;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? string.Empty
        };
    }

    public async Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.FullName = request.FullName;

        var updateResult = await _userManager.UpdateAsync(user);
        return updateResult.Succeeded;
    }

    public async Task<List<EmployeeListItemDto>> GetAllEmployeesAsync()
    {
        var employees = await _userManager.GetUsersInRoleAsync("Employee");
        var result = new List<EmployeeListItemDto>();

        foreach (var emp in employees.OrderByDescending(e => e.CreatedAt))
        {
            var roles = await _userManager.GetRolesAsync(emp);
            result.Add(new EmployeeListItemDto
            {
                Id = emp.Id,
                Username = emp.UserName ?? string.Empty,
                Email = emp.Email ?? string.Empty,
                FullName = emp.FullName,
                Role = roles.FirstOrDefault() ?? "Employee",
                CreatedAt = emp.CreatedAt,
                IsActive = !emp.LockoutEnabled || emp.LockoutEnd == null || emp.LockoutEnd < DateTimeOffset.UtcNow
            });
        }

        return result;
    }

    public async Task<bool> UpdateEmployeeAsync(string employeeId, UpdateEmployeeRequest request)
    {
        var user = await _userManager.FindByIdAsync(employeeId);
        if (user == null) return false;

        user.FullName = request.FullName;
        if (!string.IsNullOrWhiteSpace(request.Email))
            user.Email = request.Email;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> DeactivateEmployeeAsync(string employeeId)
    {
        var user = await _userManager.FindByIdAsync(employeeId);
        if (user == null) return false;

        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> ReactivateEmployeeAsync(string employeeId)
    {
        var user = await _userManager.FindByIdAsync(employeeId);
        if (user == null) return false;

        user.LockoutEnd = null;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }
}
