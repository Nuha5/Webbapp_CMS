using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAnnotations;

namespace test.Cms12.Models.Pages;

[ContentType(
    DisplayName = "Projects Page",
    GUID = "8d6d3f2a-0a2d-4e76-b3c5-2f9c2d6b12aa",
    Description = "Projects list rendered by React"
)]
public class ProjectsPage : BasePage
{
    [CultureSpecific]
    [Display(Name = "Heading", GroupName = SystemTabNames.Content, Order = 10)]
    public virtual string? Heading { get; set; }

    [CultureSpecific]
    [Display(Name = "Intro text", GroupName = SystemTabNames.Content, Order = 20)]
    public virtual XhtmlString? IntroText { get; set; }

    [Display(Name = "Project dashboard page", GroupName = SystemTabNames.Content, Order = 30)]
    public virtual ContentReference? ProjectDashboardPage { get; set; }

    [Display(Name = "Top content", GroupName = SystemTabNames.Content, Order = 120)]
    public virtual ContentArea? TopContent { get; set; }
}
