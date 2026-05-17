namespace CakeSoft.Api.DAL.Entities;

public class InvoiceDetail
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int CakeId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public Invoice? Invoice { get; set; }
    public Cake? Cake { get; set; }
}
