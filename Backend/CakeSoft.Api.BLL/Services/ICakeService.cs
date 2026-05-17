using CakeSoft.Api.DTO.Cake;

namespace CakeSoft.Api.BLL.Services;

public interface ICakeService
{
    Task<IEnumerable<CakeCategoryResponse>> GetCategoriesAsync();
    Task<IEnumerable<CakeResponse>> GetAllCakesAsync();
    Task<CakeResponse?> GetCakeByIdAsync(int id);
    Task<CakeResponse> CreateCakeAsync(CreateCakeRequest request);
    Task<CakeResponse?> UpdateCakeAsync(int id, UpdateCakeRequest request);
    Task<bool> DeleteCakeAsync(int id);
    Task<bool> RestoreCakeAsync(int id);
}
