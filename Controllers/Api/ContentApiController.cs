using System.Globalization;
using EPiServer;
using EPiServer.Core;
using EPiServer.Web.Routing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Models.Blocks;
using test.Cms12.Models.Pages;

namespace test.Cms12.Controllers.Api;

/// <summary>
/// Content API - Headless content delivery for React frontend
/// Exposes Episerver pages and blocks as JSON
/// </summary>
[Authorize]
[ApiController]
[Route("api/content")]
public class ContentApiController : ControllerBase
{
    private readonly IContentLoader _contentLoader;
    private readonly UrlResolver _urlResolver;
    private readonly IContentRepository _contentRepository;

    public ContentApiController(
        IContentLoader contentLoader,
        UrlResolver urlResolver,
        IContentRepository contentRepository
    )
    {
        _contentLoader = contentLoader;
        _urlResolver = urlResolver;
        _contentRepository = contentRepository;
    }

    /// <summary>
    /// GET /api/content/projects-page
    /// Returns ProjectsPage data with metadata and top alerts
    /// </summary>
    [HttpGet("projects-page")]
    public async Task<ActionResult<ProjectsPageDto>> GetProjectsPageAsync()
    {
        try
        {
            // Get all pages of type ProjectsPage
            var pages = _contentLoader.GetChildren<ProjectsPage>(ContentReference.RootPage);
            var page = pages.FirstOrDefault();

            if (page == null)
                return NotFound(new { error = "ProjectsPage not found" });

            // Load page with full details
            var fullPage = _contentLoader.Get<ProjectsPage>(page.ContentLink);
            var topAlerts = await GetTopAlertsInternalAsync(fullPage.TopAlerts);

            var dashboardUrl = fullPage.ProjectDashboardPage != null
                ? _urlResolver.GetUrl(fullPage.ProjectDashboardPage)
                : null;

            var dto = new ProjectsPageDto
            {
                Title = fullPage.MetaTitle ?? fullPage.Heading ?? "Projects",
                Description = fullPage.MetaDescription,
                Heading = fullPage.Heading,
                IntroText = fullPage.IntroText?.ToString(),
                ProjectDashboardPageUrl = dashboardUrl,
                TopAlerts = topAlerts,
                Url = _urlResolver.GetUrl(fullPage.ContentLink)
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Failed to load projects page: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/content/dashboard-page
    /// Returns ProjectDashboardPage data with kanban column titles
    /// </summary>
    [HttpGet("dashboard-page")]
    public async Task<ActionResult<DashboardPageDto>> GetDashboardPageAsync()
    {
        try
        {
            // Get all pages of type ProjectDashboardPage
            var pages = _contentLoader.GetChildren<ProjectDashboardPage>(ContentReference.RootPage);
            var page = pages.FirstOrDefault();

            if (page == null)
                return NotFound(new { error = "ProjectDashboardPage not found" });

            // Load page with full details
            var fullPage = _contentLoader.Get<ProjectDashboardPage>(page.ContentLink);
            var topAlerts = await GetTopAlertsInternalAsync(fullPage.TopAlerts);

            var projectsPageUrl = fullPage.ProjectsPage != null
                ? _urlResolver.GetUrl(fullPage.ProjectsPage)
                : null;

            var dto = new DashboardPageDto
            {
                Title = fullPage.MetaTitle ?? fullPage.Heading ?? "Project Dashboard",
                Description = fullPage.MetaDescription,
                Heading = fullPage.Heading,
                Instructions = fullPage.Instructions?.ToString(),
                ColumnTitleToDo = fullPage.ColTitleToDo ?? "To Do",
                ColumnTitleInProgress = fullPage.ColTitleInProgress ?? "In Progress",
                ColumnTitleDone = fullPage.ColTitleDone ?? "Done",
                ProjectsPageUrl = projectsPageUrl,
                TopAlerts = topAlerts,
                Url = _urlResolver.GetUrl(fullPage.ContentLink)
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Failed to load dashboard page: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/content/top-alerts
    /// Returns currently active top alert blocks
    /// </summary>
    [HttpGet("top-alerts")]
    public async Task<ActionResult<IEnumerable<TopAlertDto>>> GetTopAlertsAsync()
    {
        try
        {
            var alerts = await GetTopAlertsInternalAsync(null);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Failed to load alerts: {ex.Message}" });
        }
    }

    /// <summary>
    /// Internal helper to fetch and filter TopAlertBlocks from ContentArea
    /// </summary>
    private async Task<List<TopAlertDto>> GetTopAlertsInternalAsync(ContentArea? contentArea)
    {
        var alerts = new List<TopAlertDto>();

        if (contentArea == null || contentArea.Count == 0)
            return alerts;

        var now = DateTime.Now;

        foreach (var item in contentArea.Items)
        {
            try
            {
                if (item?.ContentLink == null)
                    continue;

                if (!_contentLoader.TryGet<TopAlertBlock>(item.ContentLink, out var block))
                    continue;

                // Only include enabled alerts within date range
                if (!block.IsEnabled)
                    continue;

                if (block.ShowFromDate > now || block.ShowToDate < now)
                    continue;

                alerts.Add(new TopAlertDto(
                    Id: item.ContentLink.ID,
                    Message: block.Message ?? string.Empty,
                    AlertType: block.AlertType.ToString(),
                    ShowFromDate: block.ShowFromDate,
                    ShowToDate: block.ShowToDate
                ));
            }
            catch
            {
                // Skip blocks that fail to load
                continue;
            }
        }

        return await Task.FromResult(alerts);
    }
}

/// <summary>
/// Data Transfer Objects for Content API responses
/// </summary>

public record TopAlertDto(
    int Id,
    string Message,
    string AlertType,
    DateTime ShowFromDate,
    DateTime ShowToDate
);

public record ProjectsPageDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? Heading { get; set; }
    public string? IntroText { get; set; }
    public string? ProjectDashboardPageUrl { get; set; }
    public string? Url { get; set; }
    public List<TopAlertDto> TopAlerts { get; set; } = new();
}

public record DashboardPageDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? Heading { get; set; }
    public string? Instructions { get; set; }
    public string? ColumnTitleToDo { get; set; }
    public string? ColumnTitleInProgress { get; set; }
    public string? ColumnTitleDone { get; set; }
    public string? ProjectsPageUrl { get; set; }
    public string? Url { get; set; }
    public List<TopAlertDto> TopAlerts { get; set; } = new();
}
