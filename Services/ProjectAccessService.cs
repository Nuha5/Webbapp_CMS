using Microsoft.Data.SqlClient;

namespace test.Cms12.Services;

public class ProjectAccessService(IConfiguration cfg) : IProjectAccessService
{
    private readonly string _cs =
        cfg.GetConnectionString("EPiServerDB")
        ?? throw new InvalidOperationException("Missing connection string: EPiServerDB");

    public async Task<bool> IsMemberAsync(Guid projectId, string userId)
    {
        await using var con = new SqlConnection(_cs);
        await con.OpenAsync();

        await using var cmd = new SqlCommand(
            """
                SELECT TOP 1 1
                
                FROM dbo.ProjectMembers
                WHERE ProjectId = @ProjectId AND UserId = @UserId;
            """,
            con
        );

        cmd.Parameters.AddWithValue("@ProjectId", projectId);
        cmd.Parameters.AddWithValue("@UserId", userId);

        var result = await cmd.ExecuteScalarAsync();
        return result is not null;
    }
}
