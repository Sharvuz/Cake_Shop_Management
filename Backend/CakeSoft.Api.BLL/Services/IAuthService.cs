using CakeSoft.Api.DTO.Auth;

namespace CakeSoft.Api.BLL.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<bool> RegisterEmployeeAsync(RegisterEmployeeRequest request);
    Task<UserProfileDto?> GetUserProfileAsync(string userId);
    Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task<List<EmployeeListItemDto>> GetAllEmployeesAsync();
    Task<bool> UpdateEmployeeAsync(string employeeId, UpdateEmployeeRequest request);
    Task<bool> DeactivateEmployeeAsync(string employeeId);
    Task<bool> ReactivateEmployeeAsync(string employeeId);
}
