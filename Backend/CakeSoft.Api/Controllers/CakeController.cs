using CakeSoft.Api.BLL.Services;
using CakeSoft.Api.DTO.Cake;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeSoft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CakeController : ControllerBase
{
    private readonly ICakeService _cakeService;

    public CakeController(ICakeService cakeService)
    {
        _cakeService = cakeService;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _cakeService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCakes()
    {
        var cakes = await _cakeService.GetAllCakesAsync();
        return Ok(cakes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCake(int id)
    {
        var cake = await _cakeService.GetCakeByIdAsync(id);
        if (cake == null)
            return NotFound(new { message = "Không tìm thấy bánh." });

        return Ok(cake);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCake([FromForm] CreateCakeRequest request)
    {
        try
        {
            var result = await _cakeService.CreateCakeAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi thêm bánh: " + ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCake(int id, [FromForm] UpdateCakeRequest request)
    {
        try
        {
            var result = await _cakeService.UpdateCakeAsync(id, request);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy bánh." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi cập nhật bánh: " + ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCake(int id)
    {
        try
        {
            var success = await _cakeService.DeleteCakeAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy bánh." });

            return Ok(new { message = "Xóa bánh thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi xóa bánh: " + ex.Message });
        }
    }

    [HttpPatch("{id}/restore")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RestoreCake(int id)
    {
        try
        {
            var success = await _cakeService.RestoreCakeAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy bánh." });

            return Ok(new { message = "Khôi phục bánh thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi khôi phục bánh: " + ex.Message });
        }
    }
}
