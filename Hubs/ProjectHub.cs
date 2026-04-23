using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using test.Cms12.Services;

namespace test.Cms12.Hubs;

[Authorize] // använder cookie-auth från Optimizely
public class ProjectHub(IProjectAccessService access) : Hub
{
    private readonly IProjectAccessService _access = access;

    // Grupper namnges stabilt så både server + client kan matcha
    public static string GroupName(Guid projectId) => $"project:{projectId:D}";

    // Klienten kallar: conn.invoke("JoinProjectAsync", projectIdString)
    public async Task JoinProjectAsync(string projectId)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("Unauthorized: missing user id.");
        }

        if (!Guid.TryParse(projectId, out var pid))
        {
            throw new HubException("Invalid project id.");
        }

        // Kontroll: bara medlemmar får joina projektets realtime-grupp
        var isMember = await _access.IsMemberAsync(pid, userId);
        if (!isMember)
        {
            throw new HubException("Forbidden: not a member of this project.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(pid));
    }

    // Klienten kallar: conn.invoke("LeaveProjectAsync", projectIdString)
    public async Task LeaveProjectAsync(string projectId)
    {
        if (!Guid.TryParse(projectId, out var pid))
        {
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(pid));
    }
}
