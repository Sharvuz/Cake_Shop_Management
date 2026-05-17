namespace CakeSoft.Api.DTO.Dashboard;

public record ChartDataPoint(string Label, decimal Value);
public record TopCakeItem(string Name, int TotalSold, decimal Revenue);
public record OrderStatusItem(string Status, int Count);

public class AdminDashboardResponse
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int OutOfStockCakes { get; set; }
    public int TotalEmployees { get; set; }

    // Chart data
    public List<ChartDataPoint> MonthlyRevenue { get; set; } = new();
    public List<ChartDataPoint> MonthlyOrders { get; set; } = new();
    public List<TopCakeItem> TopCakes { get; set; } = new();
    public List<OrderStatusItem> OrderStatusDistribution { get; set; } = new();
}

public class EmployeeDashboardResponse
{
    public decimal TodayRevenue { get; set; }
    public int TodayOrders { get; set; }
    public int PendingOrders { get; set; }

    // Extended stats
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal HighestOrderAmount { get; set; }
    public decimal AverageOrderAmount { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }

    // Chart data
    public List<ChartDataPoint> WeeklyOrders { get; set; } = new();
}
