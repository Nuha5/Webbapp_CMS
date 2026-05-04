using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Models.Pages;

namespace test.Cms12.Controllers;

[Authorize]
public class ProjectsPageController : PageController<ProjectsPage>
{
    public IActionResult Index(ProjectsPage currentPage) => View(currentPage);
}
