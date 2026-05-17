using CakeSoft.Api.DAL;
using CakeSoft.Api.DAL.Entities;
using CakeSoft.Api.DTO.Invoice;
using Microsoft.EntityFrameworkCore;

namespace CakeSoft.Api.BLL.Services;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InvoiceResponse> CreateInvoiceAsync(string userId, CreateInvoiceRequest request)
    {
        if (request.Items == null || !request.Items.Any())
        {
            throw new ArgumentException("Giỏ hàng trống.");
        }

        var invoice = new Invoice
        {
            UserId = userId,
            Status = InvoiceStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            TotalAmount = 0
        };

        _context.Invoices.Add(invoice);

        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var cake = await _context.Cakes.FindAsync(item.CakeId);
            if (cake == null)
            {
                throw new ArgumentException($"Không tìm thấy bánh có mã {item.CakeId}");
            }

            if (cake.Quantity < item.Quantity)
            {
                throw new InvalidOperationException($"Số lượng bánh '{cake.Name}' trong kho không đủ (còn {cake.Quantity}).");
            }


            cake.Quantity -= item.Quantity;

            var detail = new InvoiceDetail
            {
                Invoice = invoice,
                CakeId = item.CakeId,
                Quantity = item.Quantity,
                UnitPrice = cake.Price
            };

            _context.InvoiceDetails.Add(detail);
            totalAmount += (cake.Price * item.Quantity);
        }

        invoice.TotalAmount = totalAmount;

        await _context.SaveChangesAsync();

        return await GetInvoiceByIdAsync(invoice.Id) ?? throw new Exception("Error retrieving saved invoice.");
    }

    public async Task<IEnumerable<InvoiceResponse>> GetInvoicesAsync(InvoiceStatus? statusFilter = null, string? userId = null)
    {
        var query = _context.Invoices
            .Include(i => i.User)
            .Include(i => i.InvoiceDetails)
            .ThenInclude(d => d.Cake)
            .AsQueryable();

        if (statusFilter.HasValue)
        {
            query = query.Where(i => i.Status == statusFilter.Value);
        }

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(i => i.UserId == userId);
        }

        var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();

        return invoices.Select(MapToResponse);
    }

    public async Task<InvoiceResponse?> UpdateInvoiceStatusAsync(int invoiceId, InvoiceStatus newStatus)
    {
        var invoice = await _context.Invoices
            .Include(i => i.InvoiceDetails)
            .ThenInclude(d => d.Cake)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        if (invoice.Status == InvoiceStatus.Completed || invoice.Status == InvoiceStatus.Cancelled)
        {
            throw new InvalidOperationException($"Không thể thay đổi trạng thái của hóa đơn đã {(invoice.Status == InvoiceStatus.Completed ? "Hoàn thành" : "Hủy")}.");
        }


        if (invoice.Status != InvoiceStatus.Cancelled && newStatus == InvoiceStatus.Cancelled)
        {
            foreach (var detail in invoice.InvoiceDetails)
            {
                if (detail.Cake != null)
                {
                    detail.Cake.Quantity += detail.Quantity;
                }
            }
        }
        

        if (invoice.Status == InvoiceStatus.Cancelled && newStatus != InvoiceStatus.Cancelled)
        {
            foreach (var detail in invoice.InvoiceDetails)
            {
                if (detail.Cake != null)
                {
                    if (detail.Cake.Quantity < detail.Quantity)
                    {
                        throw new InvalidOperationException($"Không đủ tồn kho để khôi phục đơn hàng cho bánh '{detail.Cake.Name}'.");
                    }
                    detail.Cake.Quantity -= detail.Quantity;
                }
            }
        }

        invoice.Status = newStatus;
        await _context.SaveChangesAsync();

        return await GetInvoiceByIdAsync(invoice.Id);
    }

    private async Task<InvoiceResponse?> GetInvoiceByIdAsync(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.User)
            .Include(i => i.InvoiceDetails)
            .ThenInclude(d => d.Cake)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return null;

        return MapToResponse(invoice);
    }

    private InvoiceResponse MapToResponse(Invoice invoice)
    {
        return new InvoiceResponse
        {
            Id = invoice.Id,
            UserId = invoice.UserId,
            UserName = invoice.User?.FullName ?? "Unknown",
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status.ToString(),
            CreatedAt = invoice.CreatedAt,
            Details = invoice.InvoiceDetails.Select(d => new InvoiceDetailResponse
            {
                Id = d.Id,
                CakeId = d.CakeId,
                CakeName = d.Cake?.Name ?? "Deleted Cake",
                ImageUrl = d.Cake?.ImageUrl ?? "",
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice,
                CakeIsActive = d.Cake?.IsActive ?? false
            }).ToList()
        };
    }
}
