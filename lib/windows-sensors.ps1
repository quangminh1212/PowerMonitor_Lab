param([switch]$IncludeInventory)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

$nativeSource = @"
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public static class PowerMonitorWindowsEmi
{
    private const uint DigcfPresent = 0x00000002;
    private const uint DigcfDeviceInterface = 0x00000010;
    private const uint GenericRead = 0x80000000;
    private const uint FileShareRead = 0x00000001;
    private const uint FileShareWrite = 0x00000002;
    private const uint OpenExisting = 3;
    private const uint FileAttributeNormal = 0x00000080;
    private const uint IoctlGetVersion = 2244608;
    private const uint IoctlGetMetadataSize = 2244612;
    private const uint IoctlGetMetadata = 2244616;
    private const uint IoctlGetMeasurement = 2244620;
    private const int ErrorInsufficientBuffer = 122;
    private static readonly Guid EnergyMeterGuid = new Guid("45BD8344-7ED6-49CF-A440-C276C933B053");

    [StructLayout(LayoutKind.Sequential)]
    private struct DeviceInterfaceData
    {
        public int Size;
        public Guid InterfaceClassGuid;
        public int Flags;
        public IntPtr Reserved;
    }

    [DllImport("setupapi.dll", SetLastError = true)]
    private static extern IntPtr SetupDiGetClassDevs(ref Guid classGuid, IntPtr enumerator, IntPtr parent, uint flags);

    [DllImport("setupapi.dll", SetLastError = true)]
    private static extern bool SetupDiEnumDeviceInterfaces(IntPtr deviceInfoSet, IntPtr deviceInfoData, ref Guid interfaceClassGuid, uint memberIndex, ref DeviceInterfaceData interfaceData);

    [DllImport("setupapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool SetupDiGetDeviceInterfaceDetail(IntPtr deviceInfoSet, ref DeviceInterfaceData interfaceData, IntPtr detailData, uint detailDataSize, out uint requiredSize, IntPtr deviceInfoData);

    [DllImport("setupapi.dll", SetLastError = true)]
    private static extern bool SetupDiDestroyDeviceInfoList(IntPtr deviceInfoSet);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateFile(string fileName, uint desiredAccess, uint shareMode, IntPtr securityAttributes, uint creationDisposition, uint flagsAndAttributes, IntPtr templateFile);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool DeviceIoControl(IntPtr device, uint controlCode, IntPtr input, uint inputSize, [Out] byte[] output, uint outputSize, out uint bytesReturned, IntPtr overlapped);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr handle);

    public static List<Dictionary<string, object>> ReadChannels()
    {
        var readings = new List<Dictionary<string, object>>();
        Guid interfaceGuid = EnergyMeterGuid;
        IntPtr deviceInfoSet = SetupDiGetClassDevs(ref interfaceGuid, IntPtr.Zero, IntPtr.Zero, DigcfPresent | DigcfDeviceInterface);
        if (deviceInfoSet == new IntPtr(-1)) return readings;

        try
        {
            for (uint index = 0; index < 64; index++)
            {
                var interfaceData = new DeviceInterfaceData { Size = Marshal.SizeOf(typeof(DeviceInterfaceData)) };
                if (!SetupDiEnumDeviceInterfaces(deviceInfoSet, IntPtr.Zero, ref interfaceGuid, index, ref interfaceData)) break;

                uint requiredSize;
                SetupDiGetDeviceInterfaceDetail(deviceInfoSet, ref interfaceData, IntPtr.Zero, 0, out requiredSize, IntPtr.Zero);
                if (requiredSize < 6 || Marshal.GetLastWin32Error() != ErrorInsufficientBuffer) continue;

                IntPtr detailData = Marshal.AllocHGlobal((int)requiredSize);
                IntPtr device = IntPtr.Zero;
                try
                {
                    Marshal.WriteInt32(detailData, IntPtr.Size == 8 ? 8 : 6);
                    if (!SetupDiGetDeviceInterfaceDetail(deviceInfoSet, ref interfaceData, detailData, requiredSize, out requiredSize, IntPtr.Zero)) continue;
                    string devicePath = Marshal.PtrToStringUni(IntPtr.Add(detailData, 4));
                    if (String.IsNullOrWhiteSpace(devicePath)) continue;

                    device = CreateFile(devicePath, GenericRead, FileShareRead | FileShareWrite, IntPtr.Zero, OpenExisting, FileAttributeNormal, IntPtr.Zero);
                    if (device == new IntPtr(-1)) continue;

                    byte[] versionBytes = new byte[2];
                    uint returned;
                    if (!DeviceIoControl(device, IoctlGetVersion, IntPtr.Zero, 0, versionBytes, (uint)versionBytes.Length, out returned, IntPtr.Zero) || returned < 2) continue;
                    ushort version = BitConverter.ToUInt16(versionBytes, 0);

                    byte[] metadataSizeBytes = new byte[4];
                    if (!DeviceIoControl(device, IoctlGetMetadataSize, IntPtr.Zero, 0, metadataSizeBytes, (uint)metadataSizeBytes.Length, out returned, IntPtr.Zero) || returned < 4) continue;
                    uint metadataSize = BitConverter.ToUInt32(metadataSizeBytes, 0);
                    if (metadataSize < 4 || metadataSize > 1024 * 1024) continue;

                    byte[] metadata = new byte[(int)metadataSize];
                    if (!DeviceIoControl(device, IoctlGetMetadata, IntPtr.Zero, 0, metadata, metadataSize, out returned, IntPtr.Zero) || returned < 4) continue;

                    string oem = String.Empty;
                    string model = String.Empty;
                    var channelNames = new List<string>();
                    if (version == 2 && returned >= 68)
                    {
                        oem = ReadFixedUnicode(metadata, 0, 32);
                        model = ReadFixedUnicode(metadata, 32, 32);
                        int count = BitConverter.ToUInt16(metadata, 66);
                        int offset = 68;
                        if (count > 256) continue;
                        for (int channel = 0; channel < count; channel++)
                        {
                            if (offset + 6 > returned) break;
                            int nameSize = BitConverter.ToUInt16(metadata, offset + 4);
                            if (nameSize < 2 || offset + 6 + nameSize > returned) break;
                            channelNames.Add(Encoding.Unicode.GetString(metadata, offset + 6, nameSize).TrimEnd('\0'));
                            offset += 6 + nameSize;
                        }
                    }
                    else if (version == 1 && returned >= 72)
                    {
                        oem = ReadFixedUnicode(metadata, 4, 32);
                        model = ReadFixedUnicode(metadata, 36, 32);
                        int nameSize = BitConverter.ToUInt16(metadata, 70);
                        if (nameSize >= 2 && 72 + nameSize <= returned)
                            channelNames.Add(Encoding.Unicode.GetString(metadata, 72, nameSize).TrimEnd('\0'));
                    }
                    if (channelNames.Count == 0) continue;

                    byte[] measurement = ReadMeasurement(device, channelNames.Count);
                    if (measurement == null) continue;
                    for (int channel = 0; channel < channelNames.Count; channel++)
                    {
                        int offset = channel * 16;
                        string channelName = channelNames[channel];
                        readings.Add(new Dictionary<string, object> {
                            { "id", "emi-" + index.ToString() + "-" + channel.ToString() },
                            { "name", channelName },
                            { "kind", Classify(channelName) },
                            { "device", String.Join(" ", new[] { oem, model }.Where(value => !String.IsNullOrWhiteSpace(value))) },
                            { "watts", null },
                            { "absoluteEnergyPwh", BitConverter.ToUInt64(measurement, offset).ToString(System.Globalization.CultureInfo.InvariantCulture) },
                            { "absoluteTime100ns", BitConverter.ToUInt64(measurement, offset + 8).ToString(System.Globalization.CultureInfo.InvariantCulture) },
                            { "source", "Windows Energy Metering Interface (EMI)" },
                            { "method", "Average from the cumulative energy counter between samples" }
                        });
                    }
                }
                catch
                {
                    // A device can disappear or deny a read while devices are being enumerated.
                }
                finally
                {
                    if (device != IntPtr.Zero && device != new IntPtr(-1)) CloseHandle(device);
                    Marshal.FreeHGlobal(detailData);
                }
            }
        }
        finally
        {
            SetupDiDestroyDeviceInfoList(deviceInfoSet);
        }
        return readings;
    }

    private static byte[] ReadMeasurement(IntPtr device, int channelCount)
    {
        byte[] buffer = new byte[channelCount * 16];
        uint returned;
        if (!DeviceIoControl(device, IoctlGetMeasurement, IntPtr.Zero, 0, buffer, (uint)buffer.Length, out returned, IntPtr.Zero) || returned < buffer.Length)
            return null;
        return buffer;
    }

    private static string ReadFixedUnicode(byte[] data, int offset, int length)
    {
        return Encoding.Unicode.GetString(data, offset, length).TrimEnd('\0');
    }

    private static string Classify(string name)
    {
        string value = (name ?? String.Empty).ToLowerInvariant();
        if (value.Contains("dram") || value.Contains("memory")) return "memory";
        if (value.Contains("pp1") || value.Contains("gpu") || value.Contains("graphics")) return "graphics";
        if (value.Contains("pp0") || value.Contains("cpu") || value.Contains("package") || value.Contains("socket") || value.Contains("apu") || value.Contains("vddcr")) return "processor";
        return "other";
    }
}
"@

Add-Type -TypeDefinition $nativeSource -Language CSharp

function Write-SensorDebug($message) {
    if ($env:POWER_MONITOR_SENSOR_DEBUG -eq "1") { [Console]::Error.WriteLine($message) }
}

function Add-InventoryClass($items, $className, $kind, $nameSelector) {
    try {
        $instances = @(Get-CimInstance -ClassName $className -ErrorAction Stop)
    } catch {
        return
    }
    $index = 0
    foreach ($item in $instances) {
        $name = [string](& $nameSelector $item)
        if ([string]::IsNullOrWhiteSpace($name)) { $name = $className }
        $items.Add([pscustomobject]@{
            id = "$kind-$index"
            kind = $kind
            name = $name.Trim()
            capability = "inventory-only"
        })
        $index++
    }
}

function Add-PhysicalStorage($items) {
    $disks = @()
    try {
        $disks = @(Get-PhysicalDisk -ErrorAction Stop | Where-Object {
            [string]$_.BusType -notin @("Spaces", "File Backed Virtual")
        })
    } catch {
        $disks = @()
    }
    if ($disks.Count -eq 0) {
        try {
            $disks = @(Get-CimInstance -ClassName Win32_DiskDrive -ErrorAction Stop | Where-Object {
                [string]$_.Model -notmatch "(?i)storage space device|virtual disk|vhd"
            })
        } catch {
            return
        }
    }
    $index = 0
    foreach ($disk in $disks) {
        $name = [string]$disk.FriendlyName
        if ([string]::IsNullOrWhiteSpace($name)) { $name = [string]$disk.Model }
        if ([string]::IsNullOrWhiteSpace($name)) { $name = "Physical disk" }
        $items.Add([pscustomobject]@{
            id = "storage-$index"
            kind = "storage"
            name = $name.Trim()
            busType = [string]$disk.BusType
            capability = "inventory-only"
        })
        $index++
    }
}

function Get-ComputerInventory {
    $items = [System.Collections.Generic.List[object]]::new()
    Add-InventoryClass $items "Win32_Processor" "processor" { param($item) $item.Name }
    Add-InventoryClass $items "Win32_VideoController" "graphics" { param($item) $item.Name }
    Add-InventoryClass $items "Win32_PhysicalMemory" "memory" {
        param($item)
        $sizeGb = [math]::Round([double]$item.Capacity / 1GB)
        if ($item.DeviceLocator) { "Memory module $($item.DeviceLocator) - $sizeGb GB" } else { "Memory module - $sizeGb GB" }
    }
    Add-InventoryClass $items "Win32_BaseBoard" "motherboard" { param($item) "$($item.Manufacturer) $($item.Product)" }
    Add-InventoryClass $items "Win32_Fan" "cooling" { param($item) $item.Name }
    Add-InventoryClass $items "Win32_PowerSupply" "power-supply" { param($item) $item.Name }
    Add-PhysicalStorage $items
    $pnpClassMap = @{ Keyboard = "keyboard"; Mouse = "mouse"; Monitor = "monitor"; Net = "network"; MEDIA = "audio" }
    $seenPnpEndpoints = @{}
    try {
        foreach ($device in (Get-PnpDevice -PresentOnly -ErrorAction Stop)) {
            $deviceClass = [string]$device.Class
            $friendlyName = [string]$device.FriendlyName
            $kind = $pnpClassMap[$deviceClass]
            if ($kind -eq "network" -and [string]$device.InstanceId -notmatch "(?i)^(PCI|USB)\\") { continue }
            if ($deviceClass -eq "USB") {
                if ($friendlyName -match "(?i)root hub|\bhub\b") { $kind = "usb-hub" }
                elseif ($friendlyName -match "(?i)controller") { $kind = "usb-controller" }
                else { $kind = "usb" }
            }
            if ($kind) {
                if ([string]::IsNullOrWhiteSpace($friendlyName)) { $friendlyName = "$($device.Class) device" }
                $containerId = $null
                if ($kind -in @("keyboard", "mouse", "usb")) {
                    try {
                        $containerId = [string](Get-PnpDeviceProperty -InstanceId $device.InstanceId -KeyName "DEVPKEY_Device_ContainerId" -ErrorAction Stop).Data
                        if ($containerId -match "(?i)^\{?0{8}-0{4}-0{4}-0{4}-0{12}\}?$") { $containerId = $null }
                    } catch {
                        $containerId = $null
                    }
                }
                if ($containerId) {
                    $endpointKey = "$containerId|$kind|$($friendlyName.Trim())".ToLowerInvariant()
                    if ($seenPnpEndpoints.ContainsKey($endpointKey)) { continue }
                    $seenPnpEndpoints[$endpointKey] = $true
                }
                $items.Add([pscustomobject]@{
                    id = "$kind-$($items.Count)"
                    kind = $kind
                    name = $friendlyName.Trim()
                    containerId = $containerId
                    capability = "inventory-only"
                })
            }
        }
    } catch {
        Add-InventoryClass $items "Win32_Keyboard" "keyboard" { param($item) $item.Name }
        Add-InventoryClass $items "Win32_PointingDevice" "mouse" { param($item) $item.Name }
        Add-InventoryClass $items "Win32_DesktopMonitor" "monitor" { param($item) $item.Name }
        Add-InventoryClass $items "Win32_USBHub" "usb" { param($item) $item.Name }
    }
    Add-InventoryClass $items "Win32_Battery" "battery" { param($item) $item.Name }
    return @($items.ToArray())
}

function Get-NvidiaPowerReadings {
    $command = Get-Command nvidia-smi.exe -ErrorAction SilentlyContinue
    $path = if ($command) { $command.Source } else { $null }
    if (-not $path) {
        $candidates = @("$env:SystemRoot\System32\nvidia-smi.exe", "$env:ProgramFiles\NVIDIA Corporation\NVSMI\nvidia-smi.exe")
        $path = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    }
    if (-not $path) { return @() }

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $path
    $startInfo.Arguments = "--query-gpu=index,name,power.draw,power.limit --format=csv,noheader,nounits"
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { return @() }
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit(5000)) {
            $process.Kill()
            return @()
        }
        $null = $process.WaitForExit()
        if ($process.ExitCode -ne 0) { return @() }
        $results = [System.Collections.Generic.List[object]]::new()
        foreach ($line in $stdoutTask.Result -split "`r?`n") {
            $parts = $line.Split(',') | ForEach-Object { $_.Trim() }
            if ($parts.Count -lt 4) { continue }
            $watts = $null
            $number = 0.0
            if ([double]::TryParse($parts[2], [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$number) -and $number -ge 0) {
                $watts = $number
            }
            $limit = $null
            if ([double]::TryParse($parts[3], [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$number) -and $number -ge 0) {
                $limit = $number
            }
            $results.Add([pscustomobject]@{
                id = "nvidia-$($parts[0])"
                name = $parts[1]
                kind = "graphics"
                device = $parts[1]
                watts = $watts
                powerLimitWatts = $limit
                energyWhInterval = $null
                source = "NVIDIA nvidia-smi"
                method = "Last measured GPU board power draw"
            })
        }
        return @($results.ToArray())
    } catch {
        return @()
    } finally {
        $process.Dispose()
    }
}

$inventory = if ($IncludeInventory) { Get-ComputerInventory } else { $null }
Write-SensorDebug "sensor helper ready"
while ($true) {
    try {
        $readings = [System.Collections.Generic.List[object]]::new()
        Write-SensorDebug "enumerating EMI"
        foreach ($reading in [PowerMonitorWindowsEmi]::ReadChannels()) { $readings.Add($reading) }
        Write-SensorDebug "reading vendor GPU sensors"
        foreach ($reading in (Get-NvidiaPowerReadings)) { $readings.Add($reading) }
        Write-SensorDebug "serializing hardware snapshot"
        $providers = @(
            [pscustomobject]@{ id = "windows-emi"; name = "Windows Energy Metering Interface"; available = @($readings | Where-Object { $_.id -like "emi-*" }).Count -gt 0 },
            [pscustomobject]@{ id = "nvidia-smi"; name = "NVIDIA nvidia-smi"; available = @($readings | Where-Object { $_.id -like "nvidia-*" -and $null -ne $_.watts }).Count -gt 0 }
        )
        $payload = [pscustomobject]@{
            capturedAtUtc = [DateTime]::UtcNow.ToString("o")
            providers = $providers
            readings = @($readings.ToArray())
            inventory = $inventory
        }
        [Console]::Out.WriteLine((ConvertTo-Json -InputObject $payload -Depth 6 -Compress))
        [Console]::Out.Flush()
    } catch {
        [Console]::Error.WriteLine("Hardware sensor sampling failed.")
    }
    Start-Sleep -Milliseconds 2000
}
