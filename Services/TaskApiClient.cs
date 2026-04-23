using System.Security.Claims;
using System.Text;
using Polly;

namespace test.Cms12.Services;

/// <summary>
/// HTTP client for communicating with the Task-API backend service.
/// Provides methods to perform CRUD operations on projects, tasks, and members.
/// Includes Polly resilience policies (retry, circuit breaker, timeout) for fault tolerance.
/// </summary>
public interface ITaskApiClient
{
    /// <summary>
    /// Sends a GET request to the Task-API.
    /// </summary>
    /// <param name="path">The API endpoint path (e.g., "/api/projects").</param>
    /// <returns>Tuple containing HTTP status code, response body, and content type.</returns>
    /// <exception cref="InvalidOperationException">Thrown if user context is missing.</exception>
    /// <exception cref="OperationCanceledException">Thrown if the request times out.</exception>
    Task<(int Status, string Body, string? ContentType)> GetAsync(string path);

    /// <summary>
    /// Sends a POST request to the Task-API.
    /// </summary>
    /// <param name="path">The API endpoint path.</param>
    /// <param name="body">The request body object (will be serialized to JSON).</param>
    /// <returns>Tuple containing HTTP status code, response body, and content type.</returns>
    /// <exception cref="InvalidOperationException">Thrown if user context is missing.</exception>
    /// <exception cref="OperationCanceledException">Thrown if the request times out.</exception>
    Task<(int Status, string Body, string? ContentType)> PostAsync(string path, object body);

    /// <summary>
    /// Sends a PUT request to the Task-API.
    /// </summary>
    /// <param name="path">The API endpoint path.</param>
    /// <param name="body">The request body object.</param>
    /// <returns>Tuple containing HTTP status code, response body, and content type.</returns>
    /// <exception cref="InvalidOperationException">Thrown if user context is missing.</exception>
    /// <exception cref="OperationCanceledException">Thrown if the request times out.</exception>
    Task<(int Status, string Body, string? ContentType)> PutAsync(string path, object body);

    /// <summary>
    /// Sends a DELETE request to the Task-API.
    /// </summary>
    /// <param name="path">The API endpoint path.</param>
    /// <returns>Tuple containing HTTP status code, response body, and content type.</returns>
    /// <exception cref="InvalidOperationException">Thrown if user context is missing.</exception>
    /// <exception cref="OperationCanceledException">Thrown if the request times out.</exception>
    Task<(int Status, string Body, string? ContentType)> DeleteAsync(string path);
}

/// <summary>
/// Implementation of ITaskApiClient with resilience policies for fault-tolerant communication.
/// Includes retry logic (3 attempts with exponential backoff), circuit breaker (5 failures),
/// and 30-second timeout protection.
/// </summary>
public class TaskApiClient(
    IHttpClientFactory factory,
    IConfiguration cfg,
    IHttpContextAccessor http
) : ITaskApiClient
{
    private readonly IHttpClientFactory _factory = factory;
    private readonly IConfiguration _cfg = cfg;
    private readonly IHttpContextAccessor _http = http;

    // Polly resilience policies for HTTP calls to Task-API
    private static readonly IAsyncPolicy<HttpResponseMessage> ResiliencePolicy = Policy
        .Handle<HttpRequestException>()
        .Or<OperationCanceledException>()
        .OrResult<HttpResponseMessage>(r =>
            (int)r.StatusCode >= 500 || r.StatusCode == System.Net.HttpStatusCode.RequestTimeout
        )
        .WaitAndRetryAsync<HttpResponseMessage>(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt - 1))
        )
        .WrapAsync(
            Policy
                .Handle<HttpRequestException>()
                .Or<OperationCanceledException>()
                .OrResult<HttpResponseMessage>(r =>
                    (int)r.StatusCode >= 500
                    || r.StatusCode == System.Net.HttpStatusCode.RequestTimeout
                )
                .CircuitBreakerAsync<HttpResponseMessage>(
                    handledEventsAllowedBeforeBreaking: 5,
                    durationOfBreak: TimeSpan.FromSeconds(30)
                )
        )
        .WrapAsync(Policy.TimeoutAsync<HttpResponseMessage>(TimeSpan.FromSeconds(30)));

    private HttpClient Create()
    {
        var apiBase = _cfg["TaskApi:BaseUrl"] ?? "https://localhost:7296";
        var apiKey = _cfg["TaskApi:ApiKey"] ?? _cfg["ApiSecurity:ApiKey"];

        var client = _factory.CreateClient("TaskApiClient");
        client.BaseAddress = new Uri(apiBase);

        client.DefaultRequestHeaders.Remove("X-API-Key");
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            client.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        }

        var user = _http.HttpContext?.User;
        var userId = user?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new InvalidOperationException("Missing NameIdentifier claim for current user.");
        }

        client.DefaultRequestHeaders.Remove("X-USER-ID");
        client.DefaultRequestHeaders.Add("X-USER-ID", userId);

        return client;
    }

    public async Task<(int Status, string Body, string? ContentType)> GetAsync(string path)
    {
        using var client = Create();
        var res = await ResiliencePolicy.ExecuteAsync(() => client.GetAsync(path));
        return await ReadAsync(res);
    }

    public async Task<(int Status, string Body, string? ContentType)> PostAsync(
        string path,
        object body
    )
    {
        using var client = Create();
        using var content = Json(body);
        var res = await ResiliencePolicy.ExecuteAsync(() => client.PostAsync(path, content));
        return await ReadAsync(res);
    }

    public async Task<(int Status, string Body, string? ContentType)> PutAsync(
        string path,
        object body
    )
    {
        using var client = Create();
        using var content = Json(body);
        var res = await ResiliencePolicy.ExecuteAsync(() => client.PutAsync(path, content));
        return await ReadAsync(res);
    }

    public async Task<(int Status, string Body, string? ContentType)> DeleteAsync(string path)
    {
        using var client = Create();
        var res = await ResiliencePolicy.ExecuteAsync(() => client.DeleteAsync(path));
        return await ReadAsync(res);
    }

    private static StringContent Json(object body)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(body);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }

    private static async Task<(int Status, string Body, string? ContentType)> ReadAsync(
        HttpResponseMessage res
    )
    {
        var body = await res.Content.ReadAsStringAsync();
        var ct = res.Content.Headers.ContentType?.ToString();
        return ((int)res.StatusCode, body, ct);
    }
}
