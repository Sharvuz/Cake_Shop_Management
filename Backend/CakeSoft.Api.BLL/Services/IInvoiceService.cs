using CakeSoft.Api.DAL.Entities;
using CakeSoft.Api.DTO.Invoice;

namespace CakeSoft.Api.BLL.Services;

public interface IInvoiceService
{
    Task<InvoiceResponse> CreateInvoiceAsync(string userId, CreateInvoiceRequest request);
    Task<IEnumerable<InvoiceResponse>> GetInvoicesAsync(InvoiceStatus? statusFilter = null, string? userId = null);
    Task<InvoiceResponse?> UpdateInvoiceStatusAsync(int invoiceId, InvoiceStatus newStatus);
}
