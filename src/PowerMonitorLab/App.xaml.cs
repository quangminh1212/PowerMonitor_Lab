using System.Threading;
using System.Windows;

namespace PowerMonitorLab;

public partial class App : Application
{
    private Mutex? _singleInstanceMutex;
    private LocalWebHost? _webHost;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        _singleInstanceMutex = new Mutex(initiallyOwned: true, "Local\\PowerMonitorLab.SingleInstance", out var isFirstInstance);
        if (!isFirstInstance)
        {
            MessageBox.Show("Power Monitor Lab is already running.", "Power Monitor Lab", MessageBoxButton.OK, MessageBoxImage.Information);
            Shutdown();
            return;
        }

        try
        {
            _webHost = await LocalWebHost.StartAsync();
            var window = new MainWindow(_webHost);
            MainWindow = window;
            window.Show();
        }
        catch (Exception exception)
        {
            MessageBox.Show(
                $"Power Monitor Lab could not start its local web app.\n\n{exception.Message}",
                "Power Monitor Lab",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Shutdown(-1);
        }
    }

    protected override void OnExit(ExitEventArgs e)
    {
        if (_webHost is not null)
        {
            try
            {
                _webHost.DisposeAsync().AsTask().GetAwaiter().GetResult();
            }
            catch
            {
                // The window already reports startup and shutdown failures that affect the user.
            }
        }

        if (_singleInstanceMutex is not null)
        {
            try
            {
                _singleInstanceMutex.ReleaseMutex();
            }
            catch (ApplicationException)
            {
                // The mutex was not acquired by this process.
            }

            _singleInstanceMutex.Dispose();
        }

        base.OnExit(e);
    }
}
