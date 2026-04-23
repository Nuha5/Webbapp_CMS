using Microsoft.AspNetCore.Builder;

namespace test.Cms12.Security;

public static class ContentSecurityPolicyExtensions
{
    public static IApplicationBuilder UseContentSecurityPolicy(this IApplicationBuilder app) =>
        app.UseMiddleware<ContentSecurityPolicyMiddleware>();
}
