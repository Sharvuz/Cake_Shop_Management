using CakeSoft.Api.DAL;
using CakeSoft.Api.DAL.Entities;
using CakeSoft.Api.DTO.Dashboard;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CakeSoft.Api.BLL.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    private readonly UserManager<AppUser> _userManager;

    public DashboardService(AppDbContext context, UserManager<AppUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<AdminDashboardResponse> GetAdminDashboardAsync()
    {
        var totalRevenue = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Completed)
            .SumAsync(i => i.TotalAmount);

        var totalOrders = await _context.Invoices.CountAsync();

        var pendingOrders = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Pending)
            .CountAsync();

        var outOfStockCakes = await _context.Cakes
            .Where(c => c.Quantity == 0)
            .CountAsync();

        var employees = await _userManager.GetUsersInRoleAsync("Employee");
        var totalEmployees = employees.Count;


        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);
        var startOfPeriod = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var invoicesInPeriod = await _context.Invoices
            .Where(i => i.CreatedAt >= startOfPeriod)
            .Select(i => new { i.CreatedAt, i.Status, i.TotalAmount })
            .ToListAsync();

        var monthlyGroups = invoicesInPeriod
            .GroupBy(i => new { i.CreatedAt.Year, i.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .ToList();

        var monthlyRevenue = monthlyGroups
            .Select(g => new ChartDataPoint(
                $"T{g.Key.Month}/{g.Key.Year % 100:D2}",
                g.Where(i => i.Status == InvoiceStatus.Completed).Sum(i => i.TotalAmount)
            )).ToList();

        var monthlyOrders = monthlyGroups
            .Select(g => new ChartDataPoint(
                $"T{g.Key.Month}/{g.Key.Year % 100:D2}",
                g.Count()
            )).ToList();


        var invoiceDetails = await _context.InvoiceDetails
            .Include(d => d.Cake)
            .Select(d => new { d.CakeId, CakeName = d.Cake!.Name, d.Quantity, d.UnitPrice })
            .ToListAsync();

        var topCakes = invoiceDetails
            .GroupBy(d => new { d.CakeId, d.CakeName })
            .Select(g => new TopCakeItem(
                g.Key.CakeName,
                g.Sum(d => d.Quantity),
                g.Sum(d => d.Quantity * d.UnitPrice)
            ))
            .OrderByDescending(x => x.TotalSold)
            .Take(5)
            .ToList();


        var allStatuses = await _context.Invoices
            .Select(i => i.Status)
            .ToListAsync();

        var statusDist = allStatuses
            .GroupBy(s => s)
            .Select(g => new OrderStatusItem(g.Key.ToString(), g.Count()))
            .ToList();

        return new AdminDashboardResponse
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            OutOfStockCakes = outOfStockCakes,
            TotalEmployees = totalEmployees,
            MonthlyRevenue = monthlyRevenue,
            MonthlyOrders = monthlyOrders,
            TopCakes = topCakes,
            OrderStatusDistribution = statusDist
        };
    }

    public async Task<EmployeeDashboardResponse> GetEmployeeDashboardAsync(string userId)
    {

        var allOrders = await _context.Invoices
            .Where(i => i.UserId == userId)
            .Select(i => new { i.CreatedAt, i.Status, i.TotalAmount })
            .ToListAsync();

        var today = DateTime.UtcNow.Date;

        var todayRevenue = allOrders
            .Where(i => i.Status == InvoiceStatus.Completed && i.CreatedAt.Date == today)
            .Sum(i => i.TotalAmount);

        var todayOrders = allOrders
            .Count(i => i.CreatedAt.Date == today);

        var pendingOrders = allOrders
            .Count(i => i.Status == InvoiceStatus.Pending);

        var totalRevenue = allOrders
            .Where(i => i.Status == InvoiceStatus.Completed)
            .Sum(i => i.TotalAmount);

        var totalOrders = allOrders.Count;

        var highestOrderAmount = allOrders.Count > 0
            ? allOrders.Max(i => i.TotalAmount)
            : 0m;

        var averageOrderAmount = allOrders.Count > 0
            ? allOrders.Average(i => i.TotalAmount)
            : 0m;

        var completedOrders = allOrders.Count(i => i.Status == InvoiceStatus.Completed);
        var cancelledOrders = allOrders.Count(i => i.Status == InvoiceStatus.Cancelled);


        var sevenDaysAgo = today.AddDays(-6);

        var weeklyLookup = allOrders
            .Where(i => i.CreatedAt.Date >= sevenDaysAgo)
            .GroupBy(i => i.CreatedAt.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var weeklyOrders = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var date = sevenDaysAgo.AddDays(offset);
                var count = weeklyLookup.TryGetValue(date, out var c) ? c : 0;
                return new ChartDataPoint(date.ToString("dd/MM"), count);
            })
            .ToList();

        return new EmployeeDashboardResponse
        {
            TodayRevenue = todayRevenue,
            TodayOrders = todayOrders,
            PendingOrders = pendingOrders,
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            HighestOrderAmount = highestOrderAmount,
            AverageOrderAmount = averageOrderAmount,
            CompletedOrders = completedOrders,
            CancelledOrders = cancelledOrders,
            WeeklyOrders = weeklyOrders
        };
    }
}
