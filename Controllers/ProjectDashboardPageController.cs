using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Models.Pages;

namespace test.Cms12.Controllers;

// NOTE: Commented out for headless migration (Fas 3)
// This controller is no longer needed - React handles page rendering via Content API
// To restore: Uncomment this class and restore Views/ProjectDashboardPage/Index.cshtml
/*
[Authorize]
public class ProjectDashboardPageController : PageController<ProjectDashboardPage>
{
    public IActionResult Index(ProjectDashboardPage currentPage) => View(currentPage);
}
*/
