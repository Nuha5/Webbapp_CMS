using Microsoft.AspNetCore.Diagnostics;

namespace test.Cms12.Handlers;

/// <summary>
/// Global exception handler for structuring and logging unhandled exceptions.
/// Provides JSON responses for API endpoints and structured logging for monitoring.
/// </summary>
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger = logger;

    // LoggerMessage delegates for optimized logging performance
    private static readonly Action<
        ILogger,
        string,
        string,
        string,
        int,
        DateTime,
        Exception?
    > LogUnhandled = LoggerMessage.Define<string, string, string, int, DateTime>(
        LogLevel.Error,
        new EventId(1, nameof(LogUnhandled)),
        "Unhandled exception occurred. TraceId: {TraceId}, Path: {Path}, Method: {Method}, StatusCode: {StatusCode}, Timestamp: {Timestamp:yyyy-MM-dd HH:mm:ss.fff}"
    );

    private static readonly Action<ILogger, string, int, Exception?> LogApiException =
        LoggerMessage.Define<string, int>(
            LogLevel.Debug,
            new EventId(2, nameof(LogApiException)),
            "API exception detected. Returning JSON error response. TraceId: {TraceId}, StatusCode: {StatusCode}"
        );

    private static readonly Action<ILogger, string, Exception?> LogDevelopmentMode =
        LoggerMessage.Define<string>(
            LogLevel.Debug,
            new EventId(3, nameof(LogDevelopmentMode)),
            "Development mode: Including exception details in response. ExceptionType: {ExceptionType}"
        );

    private static readonly Action<ILogger, string, Exception?> LogNonApiException =
        LoggerMessage.Define<string>(
            LogLevel.Debug,
            new EventId(4, nameof(LogNonApiException)),
            "Non-API exception detected. Will be handled by default middleware. TraceId: {TraceId}"
        );

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        var traceId = httpContext.TraceIdentifier;
        var timestamp = DateTime.UtcNow;
        var path = httpContext.Request.Path;
        var method = httpContext.Request.Method;
        var statusCode = GetStatusCode(exception);

        // Log the exception with structured logging for monitoring and debugging
        LogUnhandled(_logger, traceId, path, method, statusCode, timestamp, exception);

        // For API endpoints, return structured JSON error response
        if (path.StartsWithSegments("/dashboard-api"))
        {
            LogApiException(_logger, traceId, statusCode, null);

            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = "application/json";

            var response = new ErrorResponse
            {
                Message = GetUserMessage(exception),
                TraceId = traceId,
                Timestamp = timestamp,
                StatusCode = statusCode,
            };

            // Add exception details in development for debugging
            var env = httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            if (env.IsDevelopment())
            {
                response.ExceptionDetails = new ExceptionDetails
                {
                    ExceptionType = exception.GetType().Name,
                    ExceptionMessage = exception.Message,
                    StackTrace = exception.StackTrace,
                };
                LogDevelopmentMode(_logger, exception.GetType().Name, null);
            }

            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
        }
        else
        {
            // For non-API requests, let the default exception handler middleware handle it
            LogNonApiException(_logger, traceId, null);
        }

        return true;
    }

    /// <summary>
    /// Determines appropriate HTTP status code based on exception type.
    /// </summary>
    private static int GetStatusCode(Exception exception) =>
        exception switch
        {
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            InvalidOperationException => StatusCodes.Status409Conflict,
            HttpRequestException { StatusCode: not null } ex => (int)ex.StatusCode,
            TaskCanceledException or OperationCanceledException =>
                StatusCodes.Status408RequestTimeout,
            _ => StatusCodes.Status500InternalServerError,
        };

    /// <summary>
    /// Gets user-friendly error message based on exception type.
    /// </summary>
    private static string GetUserMessage(Exception exception) =>
        exception switch
        {
            ArgumentException => "Invalid request parameters.",
            UnauthorizedAccessException => "You do not have permission to access this resource.",
            InvalidOperationException => "The operation could not be completed.",
            HttpRequestException => "An external service error occurred.",
            TaskCanceledException or OperationCanceledException => "The request timed out.",
            _ => "An unexpected error occurred. Please try again later.",
        };

    /// <summary>
    /// API error response model with structured error information.
    /// </summary>
    public record ErrorResponse
    {
        public required string Message { get; set; }
        public required string TraceId { get; set; }
        public required DateTime Timestamp { get; set; }
        public required int StatusCode { get; set; }
        public ExceptionDetails? ExceptionDetails { get; set; }
    }

    /// <summary>
    /// Detailed exception information for development debugging.
    /// </summary>
    public record ExceptionDetails
    {
        public required string ExceptionType { get; set; }
        public required string ExceptionMessage { get; set; }
        public string? StackTrace { get; set; }
    }
}
