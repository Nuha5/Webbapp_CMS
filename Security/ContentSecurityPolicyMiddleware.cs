using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Microsoft.Net.Http.Headers;

namespace test.Cms12.Security;

public sealed class ContentSecurityPolicyMiddleware(RequestDelegate next)
{
    public const string NonceItemKey = "csp-nonce";
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext ctx, IWebHostEnvironment env)
    {
        var path = ctx.Request.Path.Value ?? "";

        var isDocumentRequest =
            HttpMethods.IsGet(ctx.Request.Method) && AcceptsHtml(ctx.Request.Headers.Accept);

        if (!isDocumentRequest)
        {
            await _next(ctx);
            return;
        }

        var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
        ctx.Items[NonceItemKey] = nonce;

        ctx.Response.OnStarting(() =>
        {
            ctx.Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
            ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            ctx.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
            ctx.Response.Headers[HeaderNames.XFrameOptions] = "SAMEORIGIN";
            ctx.Response.Headers[HeaderNames.ContentSecurityPolicy] = BuildPolicy(path, env, nonce);
            return Task.CompletedTask;
        });

        await _next(ctx);
    }

    private static bool AcceptsHtml(StringValues accept) =>
        accept.Any(v => v.Contains("text/html", StringComparison.OrdinalIgnoreCase));

    private static string BuildPolicy(string path, IWebHostEnvironment env, string nonce)
    {
        var isOptimizelyUi =
            path.StartsWith("/EPiServer", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/episerver", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/Util", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/util", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/modules", StringComparison.OrdinalIgnoreCase);

        // Optimizely CMS UI behöver inline script/style.
        // Därför använder vi INTE nonce i den grenen.
        if (isOptimizelyUi)
        {
            if (env.IsDevelopment())
            {
                return string.Join(
                    "; ",
                    [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://localhost:5174",
                        "style-src 'self' 'unsafe-inline' https://localhost:5174",
                        "img-src 'self' data: blob: https:",
                        "font-src 'self' data: https://dhm5hy2vn8l0l.cloudfront.net",
                        "connect-src 'self' https: wss: https://localhost:5174 wss://localhost:5174 https://localhost:5000 wss://localhost:5000",
                        "object-src 'none'",
                        "base-uri 'self'",
                        "form-action 'self'",
                        "frame-ancestors 'self'",
                    ]
                );
            }

            return string.Join(
                "; ",
                [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline'",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: blob: https:",
                    "font-src 'self' data: https://dhm5hy2vn8l0l.cloudfront.net",
                    "connect-src 'self' https: wss:",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'self'",
                ]
            );
        }

        if (env.IsDevelopment())
        {
            return string.Join(
                "; ",
                [
                    "default-src 'self'",
                    $"script-src 'self' 'nonce-{nonce}' 'unsafe-eval' https://localhost:5174",
                    $"style-src 'self' 'nonce-{nonce}' https://localhost:5174",
                    "img-src 'self' data: blob:",
                    "font-src 'self' data:",
                    "connect-src 'self' https://localhost:5174 wss://localhost:5174 https://localhost:5000 wss://localhost:5000",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'self'",
                    "script-src-attr 'none'",
                ]
            );
        }

        return string.Join(
            "; ",
            [
                "default-src 'self'",
                $"script-src 'self' 'nonce-{nonce}'",
                $"style-src 'self' 'nonce-{nonce}'",
                "img-src 'self' data: blob:",
                "font-src 'self' data:",
                "connect-src 'self'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'self'",
                "script-src-attr 'none'",
            ]
        );
    }
}
