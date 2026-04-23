using EPiServer.Cms.Shell;
using EPiServer.Cms.UI.AspNetIdentity;
using EPiServer.Scheduler;
using EPiServer.Web.Routing;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using test.Cms12.Handlers;
using test.Cms12.Hubs;
using test.Cms12.Security;
using test.Cms12.Services;

namespace test.Cms12;

public class Startup(IWebHostEnvironment env)
{
    private readonly IWebHostEnvironment _env = env;

    public void ConfigureServices(IServiceCollection services)
    {
        if (_env.IsDevelopment())
        {
            AppDomain.CurrentDomain.SetData(
                "DataDirectory",
                Path.Combine(_env.ContentRootPath, "App_Data")
            );

            services.Configure<SchedulerOptions>(o => o.Enabled = false);
        }

        services
            .AddCmsAspNetIdentity<ApplicationUser>()
            .AddCms()
            .AddAdminUserRegistration()
            .AddEmbeddedLocalization<Startup>();

        // En gång – och centralt CSRF för POST/PUT/DELETE/PATCH
        services.AddControllers(o =>
        {
            o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
        });

        // Exception handling
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.AddHttpContextAccessor();

        // HttpClient for Task-API (disable system proxy to prevent Fiddler interception)
        services
            .AddHttpClient("TaskApiClient")
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { UseProxy = false });

        // Cookie events: undvik redirect för API + SignalR negotiate
        services.ConfigureApplicationCookie(o =>
        {
            o.Events = new CookieAuthenticationEvents
            {
                OnRedirectToLogin = ctx =>
                {
                    if (
                        ctx.Request.Path.StartsWithSegments("/dashboard-api")
                        || ctx.Request.Path.StartsWithSegments("/hubs")
                    )
                    {
                        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    }
                    ctx.Response.Redirect(ctx.RedirectUri);
                    return Task.CompletedTask;
                },
                OnRedirectToAccessDenied = ctx =>
                {
                    if (
                        ctx.Request.Path.StartsWithSegments("/dashboard-api")
                        || ctx.Request.Path.StartsWithSegments("/hubs")
                    )
                    {
                        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }
                    ctx.Response.Redirect(ctx.RedirectUri);
                    return Task.CompletedTask;
                },
            };
        });

        services.AddScoped<IProjectAccessService, ProjectAccessService>();
        services.AddSignalR();

        // DI
        services.AddScoped<ITaskApiClient, TaskApiClient>();
        services.AddScoped<IUserLookupService, UserLookupService>();
        services.AddScoped<IRealtimeNotifier, RealtimeNotifier>();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        // Exception handler middleware (must be early in the pipeline)
        app.UseExceptionHandler();

        //  CSP tidigt i pipeline (innan statiska filer, innan routing, innan auth)
        app.UseContentSecurityPolicy();

        app.UseStaticFiles();
        app.UseRouting();

        app.UseWebSockets();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ProjectHub>("/hubs/projects");
            endpoints.MapContent();
        });
    }
}
