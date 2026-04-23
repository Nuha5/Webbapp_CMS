namespace test.Cms12;

using Serilog;

public class Program
{
    public static void Main(string[] args) => CreateHostBuilder(args).Build().Run();

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .UseSerilog(
                (context, loggerConfig) =>
                {
                    loggerConfig
                        .MinimumLevel.Information()
                        .WriteTo.Console()
                        .WriteTo.File(
                            "logs/cms-.txt",
                            rollingInterval: Serilog.RollingInterval.Day
                        );
                }
            )
            .ConfigureCmsDefaults()
            .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>());
}
