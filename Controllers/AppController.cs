using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace test.Cms12.Controllers;

/// <summary>
/// Headless/React routing fallback
/// Serves the React app for headless routes (/ and /dashboard/*)
/// Without this, unmatched routes would result in 404
/// </summary>
[Authorize]
public class AppController : Controller
{
    /// <summary>
    /// GET / → Serves React app for Projects page
    /// GET /dashboard/* → Serves React app for Dashboard page
    /// </summary>
    [Route("{*url}")]
    [HttpGet]
    public IActionResult Index(string url)
    {
        // For headless React app, we serve a minimal HTML shell
        // In development, React is loaded from Vite dev server (port 5174)
        // In production, React would be bundled and served from wwwroot/
        
        var isDevelopment = HttpContext.RequestServices
            .GetService(typeof(Microsoft.AspNetCore.Hosting.IWebHostEnvironment)) 
            is Microsoft.AspNetCore.Hosting.IWebHostEnvironment env 
            && env.IsDevelopment();
        
        string reactScript = isDevelopment
            ? @"<script type=""module"" src=""https://localhost:5174/src/main.tsx""></script>"
            : @"<script type=""module"" src=""/client/index.js""></script>";
        
        var html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <meta name=""csrf-token"" content="""" />
    <meta name=""app-page"" content=""projects-page"" />
    <title>Projects</title>
    {(isDevelopment ? @"<script type=""module"" src=""https://localhost:5174/@vite/client""></script>" : "")}
</head>
<body>
    <div id=""root""></div>
    {reactScript}
</body>
</html>";
        
        return Content(html, "text/html");
    }
}
