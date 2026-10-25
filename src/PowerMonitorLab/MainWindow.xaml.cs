using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace PowerMonitorLab;

public partial class MainWindow : Window
{
    private readonly LocalWebHost _webHost;
    private bool _closeCanContinue;
    private bool _shutdownStarted;

    public MainWindow(LocalWebHost webHost)
    {
        InitializeComponent();
        _webHost = webHost;
        Loaded += InitializeBrowserAsync;
        Closing += WindowClosingAsync;
    }

    private async void InitializeBrowserAsync(object sender, RoutedEventArgs e)
    {
        try
        {
            var userDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "PowerMonitorLab",
                "WebView2");
            Directory.CreateDirectory(userDataPath);

            var environment = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataPath);
            await Browser.EnsureCoreWebView2Async(environment);
            Browser.CoreWebView2.Settings.AreDevToolsEnabled = false;
            Browser.CoreWebView2.Settings.IsStatusBarEnabled = false;
            Browser.CoreWebView2.Settings.IsZoomControlEnabled = true;
            Browser.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            Browser.CoreWebView2.NewWindowRequested += (_, args) => args.Handled = true;
            Browser.CoreWebView2.NavigationStarting += (_, args) =>
            {
                if (!Uri.TryCreate(args.Uri, UriKind.Absolute, out var target) ||
                    !string.Equals(target.GetLeftPart(UriPartial.Authority), _webHost.Origin, StringComparison.OrdinalIgnoreCase))
                {
                    args.Cancel = true;
                }
            };
            Browser.CoreWebView2.NavigationCompleted += (_, args) =>
            {
                if (args.IsSuccess)
                {
                    return;
                }

                MessageBox.Show(
                    $"The local interface failed to load ({args.WebErrorStatus}). Restart Power Monitor Lab and try again.",
                    "Power Monitor Lab",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
                Close();
            };
            Browser.Source = new Uri(_webHost.Origin);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            MessageBox.Show(
                "Microsoft Edge WebView2 Runtime is required. Install the Evergreen Runtime from https://developer.microsoft.com/microsoft-edge/webview2/ and restart this app.",
                "WebView2 Runtime required",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Close();
        }
        catch (Exception exception)
        {
            MessageBox.Show(
                $"The app window could not load.\n\n{exception.Message}",
                "Power Monitor Lab",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Close();
        }
    }

    private async void WindowClosingAsync(object? sender, CancelEventArgs e)
    {
        if (_closeCanContinue)
        {
            return;
        }

        e.Cancel = true;
        if (_shutdownStarted)
        {
            return;
        }

        _shutdownStarted = true;
        try
        {
            await _webHost.StopAsync();
        }
        catch (Exception exception)
        {
            Debug.WriteLine($"Error stopping the local web host: {exception}");
        }

        _closeCanContinue = true;
        Close();
    }
}
