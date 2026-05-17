using CakeSoft.Api.DAL.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CakeSoft.Api.DAL;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<CakeCategory> CakeCategories { get; set; }
    public DbSet<Cake> Cakes { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceDetail> InvoiceDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure precision for decimals
        builder.Entity<Cake>()
            .Property(c => c.Price)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Invoice>()
            .Property(i => i.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<InvoiceDetail>()
            .Property(d => d.UnitPrice)
            .HasColumnType("decimal(18,2)");
    }
}
