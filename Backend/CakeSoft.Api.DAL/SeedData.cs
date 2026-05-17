using System.Text.Json;
using System.Text.RegularExpressions;
using CakeSoft.Api.DAL.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CakeSoft.Api.DAL;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider, string contentRootPath)
    {
        var context = serviceProvider.GetRequiredService<AppDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var logger = serviceProvider.GetRequiredService<ILogger<AppDbContext>>();

        // Apply migrations
        await context.Database.MigrateAsync();

        // Seed Roles
        var roles = new[] { "Admin", "Employee" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed Admin User
        var adminEmail = "admin@cakesoft.local";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new AppUser
            {
                UserName = "admin",
                Email = adminEmail,
                FullName = "System Administrator",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed Employee 1
        var emp1Email = "employee1@cakesoft.local";
        if (await userManager.FindByEmailAsync(emp1Email) == null)
        {
            var empUser = new AppUser
            {
                UserName = "employee1",
                Email = emp1Email,
                FullName = "Nhân viên 1",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(empUser, "Employee@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(empUser, "Employee");
            }
        }

        // Seed Employee 2
        var emp2Email = "employee2@cakesoft.local";
        if (await userManager.FindByEmailAsync(emp2Email) == null)
        {
            var empUser = new AppUser
            {
                UserName = "employee2",
                Email = emp2Email,
                FullName = "Nhân viên 2",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(empUser, "Employee@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(empUser, "Employee");
            }
        }

        // Seed Categories and Cakes from JSON files
        if (!context.CakeCategories.Any())
        {
            // SeedData folder is copied alongside the output (CopyToOutputDirectory)
            var seedDataDir = Path.Combine(AppContext.BaseDirectory, "SeedData");

            if (!Directory.Exists(seedDataDir))
            {
                logger.LogWarning("SeedData directory not found. Skipping cake/category seeding.");
                return;
            }

            var jsonFiles = Directory.GetFiles(seedDataDir, "*.json");
            if (jsonFiles.Length == 0)
            {
                logger.LogWarning("No JSON files found in SeedData directory.");
                return;
            }

            var random = new Random(42);
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);
            httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");

            // Save images alongside ContentRoot so static file middleware can serve them
            var imagesDir = Path.Combine(contentRootPath, "Images");
            if (!Directory.Exists(imagesDir))
            {
                Directory.CreateDirectory(imagesDir);
            }

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            foreach (var jsonFile in jsonFiles.OrderBy(f => f))
            {
                var categoryName = Path.GetFileNameWithoutExtension(jsonFile);
                logger.LogInformation("Seeding category: {Category}", categoryName);

                // Create category
                var category = new CakeCategory
                {
                    Name = categoryName,
                    Description = $"Danh mục {categoryName}"
                };
                context.CakeCategories.Add(category);
                await context.SaveChangesAsync();

                // Parse JSON
                List<CakeSeedItem>? items;
                try
                {
                    var json = await File.ReadAllTextAsync(jsonFile);
                    items = JsonSerializer.Deserialize<List<CakeSeedItem>>(json, jsonOptions);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to parse {File}", jsonFile);
                    continue;
                }

                if (items == null || items.Count == 0) continue;

                foreach (var item in items)
                {
                    // Parse price: "22,000₫" → 22000
                    var price = ParsePrice(item.Price);

                    // Download image
                    var localImageUrl = await DownloadImageAsync(
                        httpClient, item.Image, imagesDir, logger);

                    var cake = new Cake
                    {
                        Name = item.Name,
                        CategoryId = category.Id,
                        Price = price,
                        Quantity = random.Next(1, 101),
                        ImageUrl = localImageUrl,
                        Description = item.Description ?? string.Empty,
                        IsActive = true
                    };
                    context.Cakes.Add(cake);
                }

                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} cakes for category '{Category}'",
                    items.Count, categoryName);
            }
        }
    }

    // ─────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────

    private static decimal ParsePrice(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return 0;
        // Remove non-digit, non-comma characters then strip commas
        var digits = Regex.Replace(raw, @"[^\d,]", "").Replace(",", "");
        return decimal.TryParse(digits, out var result) ? result : 0;
    }

    private static async Task<string> DownloadImageAsync(
        HttpClient httpClient,
        string? imageUrl,
        string imagesDir,
        ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return string.Empty;

        try
        {
            var uri = new Uri(imageUrl);
            // Build a safe filename from the URL path
            var originalName = Path.GetFileName(uri.LocalPath);
            // Sanitize and limit length
            var safeName = Regex.Replace(originalName, @"[^\w.\-]", "_");
            if (safeName.Length > 120) safeName = safeName[^120..];

            var localPath = Path.Combine(imagesDir, safeName);

            // Skip download if already cached
            if (!File.Exists(localPath))
            {
                var bytes = await httpClient.GetByteArrayAsync(imageUrl);
                await File.WriteAllBytesAsync(localPath, bytes);
            }

            return $"/Images/{safeName}";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to download image: {Url}", imageUrl);
            return imageUrl; // fallback to original URL
        }
    }

    // ─────────────────────────────────────────────────
    // DTO for deserializing JSON items
    // ─────────────────────────────────────────────────

    private class CakeSeedItem
    {
        public string Name { get; set; } = string.Empty;
        public string? Price { get; set; }
        public string? Image { get; set; }
        public string? Description { get; set; }
    }
}
