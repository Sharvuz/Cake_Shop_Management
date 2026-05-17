using CakeSoft.Api.BLL.Services;
using CakeSoft.Api.DTO.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CakeSoft.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (response == null)
            return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác." });

        return Ok(response);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterEmployeeRequest request)
    {
        var success = await _authService.RegisterEmployeeAsync(request);
        if (success)
            return Ok(new { message = "Tạo tài khoản nhân viên thành công." });

        return BadRequest(new { message = "Tạo tài khoản thất bại. Tên đăng nhập có thể đã tồn tại." });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _authService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var success = await _authService.UpdateProfileAsync(userId, request);
        if (success)
            return Ok(new { message = "Cập nhật thông tin thành công." });

        return BadRequest(new { message = "Cập nhật thông tin thất bại." });
    }



    [HttpGet("employees")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllEmployees()
    {
        var employees = await _authService.GetAllEmployeesAsync();
        return Ok(employees);
    }

    [HttpPut("employees/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEmployee(string id, [FromBody] UpdateEmployeeRequest request)
    {
        var success = await _authService.UpdateEmployeeAsync(id, request);
        if (success)
            return Ok(new { message = "Cập nhật thông tin nhân viên thành công." });

        return BadRequest(new { message = "Cập nhật thất bại. Nhân viên không tồn tại." });
    }

    [HttpPatch("employees/{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateEmployee(string id)
    {
        var success = await _authService.DeactivateEmployeeAsync(id);
        if (success)
            return Ok(new { message = "Đã vô hiệu hóa tài khoản nhân viên." });

        return BadRequest(new { message = "Vô hiệu hóa thất bại." });
    }

    [HttpPatch("employees/{id}/reactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReactivateEmployee(string id)
    {
        var success = await _authService.ReactivateEmployeeAsync(id);
        if (success)
            return Ok(new { message = "Đã kích hoạt lại tài khoản nhân viên." });

        return BadRequest(new { message = "Kích hoạt lại thất bại." });
    }
}

