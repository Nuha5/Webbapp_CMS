using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Models.Pages;

namespace test.Cms12.Controllers;

[Authorize]
public class ProjectDashboardPageController : PageController<ProjectDashboardPage>
{
    public IActionResult Index(ProjectDashboardPage currentPage) => View(currentPage);
}
