using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Models.Pages;

namespace test.Cms12.Controllers;

// NOTE: Commented out for headless migration (Fas 3)
// This controller is no longer needed - React handles page rendering via Content API
// To restore: Uncomment this class and restore Views/ProjectsPage/Index.cshtml
/*
[Authorize]
public class ProjectsPageController : PageController<ProjectsPage>
{
    public IActionResult Index(ProjectsPage currentPage) => View(currentPage);
}
*/
