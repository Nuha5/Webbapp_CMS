using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Services;

namespace test.Cms12.Controllers;

[Authorize]
[ApiController]
[Route("dashboard-api/projects")]
public class ProjectProxyController(
    ITaskApiClient api,
    IUserLookupService users,
    IRealtimeNotifier rt
) : ControllerBase
{
    private readonly ITaskApiClient _api = api;
    private readonly IUserLookupService _users = users;
    private readonly IRealtimeNotifier _rt = rt;

    // ---------- Projects ----------
    [HttpGet]
    public async Task<IActionResult> GetProjectsAsync() =>
        await ProxyAsync(() => _api.GetAsync("/api/projects"));

    [HttpPost]
    public async Task<IActionResult> CreateProjectAsync([FromBody] object req) =>
        await ProxyAsync(() => _api.PostAsync("/api/projects", req));

    [HttpDelete("{projectId:guid}")]
    public async Task<IActionResult> DeleteProjectAsync(Guid projectId) =>
        await ProxyAsync(() => _api.DeleteAsync($"/api/projects/{projectId}"));

    [HttpPut("{projectId:guid}")]
    public async Task<IActionResult> UpdateProjectAsync(Guid projectId, [FromBody] object req) =>
        await ProxyAsync(() => _api.PutAsync($"/api/projects/{projectId}", req));

    // ---------- Share by email ----------
    public record ShareByEmailRequest(string Email, string? Role);

    [HttpPost("{projectId:guid}/members")]
    public async Task<IActionResult> AddMemberAsync(
        Guid projectId,
        [FromBody] ShareByEmailRequest req
    )
    {
        if (string.IsNullOrWhiteSpace(req.Email))
        {
            return BadRequest(new { error = "Email is required" });
        }

        var userIdToAdd = await _users.FindUserIdByEmail(req.Email);
        if (string.IsNullOrWhiteSpace(userIdToAdd))
        {
            return NotFound(new { error = "User not found" });
        }

        var payload = new
        {
            UserId = userIdToAdd,
            Role = string.IsNullOrWhiteSpace(req.Role) ? "Member" : req.Role.Trim(),
        };

        return await ProxyAsync(() =>
            _api.PostAsync($"/api/projects/{projectId}/members", payload)
        );
    }

    // ---------- Tasks per project ----------
    [HttpGet("{projectId:guid}/tasks")]
    public async Task<IActionResult> GetTasksAsync(Guid projectId) =>
        await ProxyAsync(() => _api.GetAsync($"/api/projects/{projectId}/tasks"));

    [HttpPost("{projectId:guid}/tasks")]
    public async Task<IActionResult> CreateTaskAsync(Guid projectId, [FromBody] object req)
    {
        var result = await ProxyAsync(() =>
            _api.PostAsync($"/api/projects/{projectId}/tasks", req)
        );
        if (Is2xx(Response.StatusCode))
        {
            await _rt.TasksChanged(projectId);
        }

        return result;
    }

    [HttpPut("{projectId:guid}/tasks/{taskId:guid}")]
    public async Task<IActionResult> UpdateTaskAsync(
        Guid projectId,
        Guid taskId,
        [FromBody] object req
    )
    {
        var result = await ProxyAsync(() =>
            _api.PutAsync($"/api/projects/{projectId}/tasks/{taskId}", req)
        );
        if (Is2xx(Response.StatusCode))
        {
            await _rt.TasksChanged(projectId);
        }

        return result;
    }

    [HttpDelete("{projectId:guid}/tasks/{taskId:guid}")]
    public async Task<IActionResult> DeleteTaskAsync(Guid projectId, Guid taskId)
    {
        var result = await ProxyAsync(() =>
            _api.DeleteAsync($"/api/projects/{projectId}/tasks/{taskId}")
        );
        if (Is2xx(Response.StatusCode))
        {
            await _rt.TasksChanged(projectId);
        }

        return result;
    }

    [HttpPut("{projectId:guid}/tasks/reorder")]
    public async Task<IActionResult> ReorderTasksAsync(Guid projectId, [FromBody] object req)
    {
        var result = await ProxyAsync(() =>
            _api.PutAsync($"/api/projects/{projectId}/tasks/reorder", req)
        );
        if (Is2xx(Response.StatusCode))
        {
            await _rt.TasksChanged(projectId);
        }

        return result;
    }

    [HttpGet("{projectId:guid}/members")]
    public async Task<IActionResult> GetMembersAsync(Guid projectId) =>
        await ProxyAsync(() => _api.GetAsync($"/api/projects/{projectId}/members"));

    // ---------- Helpers ----------
    private async Task<IActionResult> ProxyAsync(
        Func<Task<(int Status, string Body, string? ContentType)>> call
    )
    {
        var (status, body, contentType) = await call();

        Response.StatusCode = status;

        // API kan returnera tom body (NoContent)
        if (string.IsNullOrWhiteSpace(body))
        {
            return new EmptyResult();
        }

        return Content(body, contentType ?? "application/json");
    }

    private static bool Is2xx(int status) => status is >= 200 and <= 299;
}
