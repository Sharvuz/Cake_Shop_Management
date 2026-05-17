namespace CakeSoft.Api.DAL.Entities;

public class CakeCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<Cake> Cakes { get; set; } = new List<Cake>();
}
