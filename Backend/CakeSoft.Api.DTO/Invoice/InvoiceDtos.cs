

namespace CakeSoft.Api.DTO.Invoice;

public class CreateInvoiceRequest
{
    public List<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
}

public class InvoiceItemDto
{
    public int CakeId { get; set; }
    public int Quantity { get; set; }
}

public class InvoiceDetailResponse
{
    public int Id { get; set; }
    public int CakeId { get; set; }
    public string CakeName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public bool CakeIsActive { get; set; } = true;
}

public class InvoiceResponse
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<InvoiceDetailResponse> Details { get; set; } = new List<InvoiceDetailResponse>();
}
