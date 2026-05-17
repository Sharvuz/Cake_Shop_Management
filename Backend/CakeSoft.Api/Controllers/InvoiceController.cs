using System.Security.Claims;
using CakeSoft.Api.BLL.Services;
using CakeSoft.Api.DAL.Entities;
using CakeSoft.Api.DTO.Invoice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeSoft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính người dùng." });
            }

            var result = await _invoiceService.CreateInvoiceAsync(userId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetInvoices([FromQuery] InvoiceStatus? status)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        string? filterUserId = null;

        // Nếu là Nhân viên, chỉ xem hóa đơn của mình
        if (role != "Admin")
        {
            filterUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        var invoices = await _invoiceService.GetInvoicesAsync(status, filterUserId);
        return Ok(invoices);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] InvoiceStatus newStatus)
    {
        try
        {
            var result = await _invoiceService.UpdateInvoiceStatusAsync(id, newStatus);
            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy hóa đơn." });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
