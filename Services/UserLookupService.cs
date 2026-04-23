using Microsoft.Data.SqlClient;

namespace test.Cms12.Services;

/// <summary>
/// Service for looking up user information by email address.
/// Used to resolve email addresses to internal user IDs for member management.
/// </summary>
public interface IUserLookupService
{
    /// <summary>
    /// Finds a user ID by their email address.
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <returns>The user ID if found; otherwise, null.</returns>
    Task<string?> FindUserIdByEmail(string email);
}

public class UserLookupService(IConfiguration cfg) : IUserLookupService
{
    private readonly IConfiguration _cfg = cfg;

    public async Task<string?> FindUserIdByEmail(string email)
    {
        var cs =
            _cfg.GetConnectionString("EPiServerDB")
            ?? throw new InvalidOperationException(
                "Missing connection string EPiServerDB in webapp"
            );

        await using var con = new SqlConnection(cs);
        await con.OpenAsync();

        var normalized = email.Trim().ToUpperInvariant();

        await using var cmd = new SqlCommand(
            @"
SELECT TOP 1 Id
FROM dbo.AspNetUsers
WHERE NormalizedEmail = @Email OR Email = @RawEmail;",
            con
        );

        cmd.Parameters.AddWithValue("@Email", normalized);
        cmd.Parameters.AddWithValue("@RawEmail", email.Trim());

        var result = await cmd.ExecuteScalarAsync();
        return result?.ToString();
    }
}
