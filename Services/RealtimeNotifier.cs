using Microsoft.AspNetCore.SignalR;
using test.Cms12.Hubs;

namespace test.Cms12.Services;

/// <summary>
/// SignalR-based real-time notification service.
/// Broadcasts project updates to connected clients for live synchronization.
/// </summary>
public interface IRealtimeNotifier
{
    /// <summary>
    /// Notifies all connected clients that tasks in a project have changed.
    /// Used to keep the client UI in sync with backend state.
    /// </summary>
    /// <param name="projectId">The project ID where tasks changed.</param>
    /// <returns>A task representing the async notification operation.</returns>
    Task TasksChanged(Guid projectId);
}

public class RealtimeNotifier(IHubContext<ProjectHub> hub) : IRealtimeNotifier
{
    private readonly IHubContext<ProjectHub> _hub = hub;

    public Task TasksChanged(Guid projectId)
    {
        return _hub
            .Clients.Group(ProjectHub.GroupName(projectId))
            .SendAsync("tasksChanged", new { projectId = projectId.ToString("D") });
    }
}
