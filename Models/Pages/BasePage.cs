using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAnnotations;

namespace test.Cms12.Models.Pages;

/// <summary>
/// Bas-klass för alla sidor med gemensamma SEO-egenskaper.
/// Alla nya sidor bör ärva från denna klass för automatisk metadata-stöd.
/// </summary>
public abstract class BasePage : PageData
{
    [CultureSpecific]
    [Display(
        Name = "Meta Title",
        Description = "Titel som visas i sökresultat (max 60 tecken)",
        GroupName = "SEO",
        Order = 1
    )]
    [StringLength(60)]
    public virtual string? MetaTitle { get; set; }

    [CultureSpecific]
    [Display(
        Name = "Meta Description",
        Description = "Beskrivning som visas under titeln i sökresultat (max 160 tecken)",
        GroupName = "SEO",
        Order = 2
    )]
    [StringLength(160)]
    public virtual string? MetaDescription { get; set; }

    [Display(
        Name = "Top Alerts",
        Description = "Add alert banners that will appear at the top of all pages",
        GroupName = "System",
        Order = 1
    )]
    public virtual ContentArea? TopAlerts { get; set; }
}
