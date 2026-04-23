namespace test.Cms12.Services;

/// <summary>
/// Service for managing and verifying project access permissions.
/// Authenticates whether users have access to specific projects.
/// </summary>
public interface IProjectAccessService
{
    /// <summary>
    /// Checks if a user is a member of a specific project.
    /// </summary>
    /// <param name="projectId">The unique identifier of the project.</param>
    /// <param name="userId">The user ID to verify.</param>
    /// <returns>True if the user is a project member; otherwise, false.</returns>
    Task<bool> IsMemberAsync(Guid projectId, string userId);
}
