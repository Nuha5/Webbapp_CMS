using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAnnotations;

namespace test.Cms12.Models.Pages;

[ContentType(
    DisplayName = "Project Dashboard Page",
    GUID = "b9c9b8fe-4ed3-4ff6-9c8b-cc8fe8f2b1de",
    Description = "Single project dashboard rendered by React"
)]
public class ProjectDashboardPage : BasePage
{
    [Display(Name = "Projects page", GroupName = SystemTabNames.Content, Order = 10)]
    public virtual ContentReference? ProjectsPage { get; set; }

    [CultureSpecific]
    [Display(Name = "Heading", GroupName = SystemTabNames.Content, Order = 20)]
    public virtual string? Heading { get; set; }

    [CultureSpecific]
    [Display(Name = "Instructions", GroupName = SystemTabNames.Content, Order = 30)]
    public virtual XhtmlString? Instructions { get; set; }

    [CultureSpecific]
    [Display(Name = "Column title: To Do", GroupName = SystemTabNames.Content, Order = 40)]
    public virtual string? ColTitleToDo { get; set; }

    [CultureSpecific]
    [Display(Name = "Column title: In Progress", GroupName = SystemTabNames.Content, Order = 50)]
    public virtual string? ColTitleInProgress { get; set; }

    [CultureSpecific]
    [Display(Name = "Column title: Done", GroupName = SystemTabNames.Content, Order = 60)]
    public virtual string? ColTitleDone { get; set; }

    [Display(Name = "Sidebar content", GroupName = SystemTabNames.Content, Order = 330)]
    public virtual ContentArea? SidebarContent { get; set; }
}
