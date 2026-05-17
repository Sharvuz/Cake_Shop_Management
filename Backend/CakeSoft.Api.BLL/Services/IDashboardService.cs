using CakeSoft.Api.DTO.Dashboard;

namespace CakeSoft.Api.BLL.Services;

public interface IDashboardService
{
    Task<AdminDashboardResponse> GetAdminDashboardAsync();
    Task<EmployeeDashboardResponse> GetEmployeeDashboardAsync(string userId);
}
