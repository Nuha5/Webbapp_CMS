using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace test.Cms12.Controllers;

[Authorize]
public class LogoutController : Controller
{
    // Säker logout: POST + anti-forgery
    [ValidateAntiForgeryToken]
    [HttpPost("/logout")]
    public async Task<IActionResult> LogoutAsync()
    {
        await HttpContext.SignOutAsync("Identity.Application");
        return Redirect("/Util/Login?ReturnUrl=%2F");
    }

    [AllowAnonymous]
    [HttpGet("/logout")]
    public IActionResult LogoutGet()
    {
        // Istället för login direkt (som kan ge loop), skicka till startsida
        return Redirect("/");
    }
}
