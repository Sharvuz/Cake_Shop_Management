using CakeSoft.Api.BLL.Services;
using CakeSoft.Api.DAL;
using CakeSoft.Api.DAL.Entities;
using CakeSoft.Api.DTO.Cake;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CakeSoft.Api.BLL.Services;

public class CakeService : ICakeService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CakeService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task<IEnumerable<CakeCategoryResponse>> GetCategoriesAsync()
    {
        return await _context.CakeCategories
            .Select(c => new CakeCategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<CakeResponse>> GetAllCakesAsync()
    {
        return await _context.Cakes
            .Include(c => c.Category)
            .OrderByDescending(c => c.Id)
            .Select(c => new CakeResponse
            {
                Id = c.Id,
                Name = c.Name,
                CategoryId = c.CategoryId,
                CategoryName = c.Category != null ? c.Category.Name : "",
                Price = c.Price,
                Quantity = c.Quantity,
                ImageUrl = c.ImageUrl,
                Description = c.Description,
                IsActive = c.IsActive
            })
            .ToListAsync();
    }

    public async Task<CakeResponse?> GetCakeByIdAsync(int id)
    {
        var cake = await _context.Cakes
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cake == null) return null;

        return new CakeResponse
        {
            Id = cake.Id,
            Name = cake.Name,
            CategoryId = cake.CategoryId,
            CategoryName = cake.Category?.Name ?? "",
            Price = cake.Price,
            Quantity = cake.Quantity,
            ImageUrl = cake.ImageUrl,
            Description = cake.Description,
            IsActive = cake.IsActive
        };
    }

    public async Task<CakeResponse> CreateCakeAsync(CreateCakeRequest request)
    {
        var imageUrl = await SaveImageAsync(request.Image);

        var cake = new Cake
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            Price = request.Price,
            Quantity = request.Quantity,
            Description = request.Description,
            ImageUrl = imageUrl
        };

        _context.Cakes.Add(cake);
        await _context.SaveChangesAsync();

        return await GetCakeByIdAsync(cake.Id) ?? throw new Exception("Error retrieving saved cake.");
    }

    public async Task<CakeResponse?> UpdateCakeAsync(int id, UpdateCakeRequest request)
    {
        var cake = await _context.Cakes.FindAsync(id);
        if (cake == null) return null;

        cake.Name = request.Name;
        cake.CategoryId = request.CategoryId;
        cake.Price = request.Price;
        cake.Quantity = request.Quantity;
        cake.Description = request.Description;

        if (request.Image != null)
        {
            DeleteImageFile(cake.ImageUrl);
            
            cake.ImageUrl = await SaveImageAsync(request.Image);
        }

        await _context.SaveChangesAsync();

        return await GetCakeByIdAsync(cake.Id);
    }

    public async Task<bool> DeleteCakeAsync(int id)
    {
        var cake = await _context.Cakes.FindAsync(id);
        if (cake == null) return false;


        cake.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreCakeAsync(int id)
    {
        var cake = await _context.Cakes.FindAsync(id);
        if (cake == null) return false;

        cake.IsActive = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<string> SaveImageAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return string.Empty;
        }

        var imagesPath = Path.Combine(_env.ContentRootPath, "Images");
        if (!Directory.Exists(imagesPath))
        {
            Directory.CreateDirectory(imagesPath);
        }

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(imagesPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }


        return $"/Images/{fileName}";
    }

    private void DeleteImageFile(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl)) return;


        var fileName = Path.GetFileName(imageUrl);
        if (string.IsNullOrEmpty(fileName)) return;

        var filePath = Path.Combine(_env.ContentRootPath, "Images", fileName);
        if (File.Exists(filePath))
        {
            try
            {
                File.Delete(filePath);
            }
            catch
            {

            }
        }
    }
}
