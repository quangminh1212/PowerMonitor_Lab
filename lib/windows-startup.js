import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const runKey = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
const runValueName = "PowerMonitorLab";

const hiddenHelperSource = [
  "using System.Diagnostics;",
  "using System.Management;",
  "using System.Text;",
  "static class Program {",
  "  static int Main(string[] args) {",
  "    if (args.Length > 0 && args[0] == \"direct\") return StartNode(args);",
  "    return Schedule(args);",
  "  }",
  "  static int Schedule(string[] args) {",
  "    var command = new StringBuilder();",
  "    var exe = Process.GetCurrentProcess().MainModule.FileName;",
  "    command.Append('\"').Append(exe).Append('\"').Append(\" direct\");",
  "    foreach (var arg in args) command.Append(' ').Append('\"').Append(arg).Append('\"');",
  "    var processClass = new ManagementClass(\"Win32_Process\");",
  "    var input = processClass.GetMethodParameters(\"Create\");",
  "    input[\"CommandLine\"] = command.ToString();",
  "    var output = processClass.InvokeMethod(\"Create\", input, null);",
  "    return (uint)output[\"ReturnValue\"] == 0 ? 0 : 1;",
  "  }",
  "  static int StartNode(string[] args) {",
  "    if (args.Length < 4) return 2;",
  "    var start = new ProcessStartInfo();",
  "    start.FileName = args[2];",
  "    start.WorkingDirectory = args[1];",
  "    start.UseShellExecute = false;",
  "    start.CreateNoWindow = true;",
  "    start.WindowStyle = ProcessWindowStyle.Hidden;",
  "    start.RedirectStandardInput = true;",
  "    start.RedirectStandardOutput = true;",
  "    start.RedirectStandardError = true;",
  "    start.EnvironmentVariables[\"POWER_MONITOR_DETACHED\"] = \"1\";",
  "    var command = new StringBuilder();",
  "    for (int index = 3; index < args.Length; index++) {",
  "      if (index > 3) command.Append(' ');",
  "      command.Append('\"').Append(args[index]).Append('\"');",
  "    }",
  "    start.Arguments = command.ToString();",
  "    var process = Process.Start(start);",
  "    if (process == null) return 1;",
  "    process.StandardInput.Close();",
  "    process.OutputDataReceived += (sender, eventArgs) => { };",
  "    process.ErrorDataReceived += (sender, eventArgs) => { };",
  "    process.BeginOutputReadLine();",
  "    process.BeginErrorReadLine();",
  "    return 0;",
  "  }",
  "}",
  ""
].join("\n");

export async function ensureWindowsLauncherHelper(persistent = false) {
  const directory = persistent
    ? path.join(localAppDataPath(), "PowerMonitorLab", "launcher")
    : process.env.TEMP || ".";
  const helperPath = path.join(directory, "power-monitor-hidden.exe");
  const sourcePath = path.join(directory, "power-monitor-hidden.cs");
  try {
    const source = await fs.readFile(sourcePath, "utf8");
    await fs.access(helperPath);
    if (source === hiddenHelperSource) return helperPath;
  } catch {
    // Compile the user-scoped helper on first launch or when its source changes.
  }

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(sourcePath, hiddenHelperSource, "utf8");
  const compiler = path.join(
    process.env.WINDIR || "C:\\Windows",
    "Microsoft.NET",
    "Framework64",
    "v4.0.30319",
    "csc.exe"
  );
  await runExecutable(compiler, [
    "/nologo",
    "/target:winexe",
    "/r:System.Management.dll",
    `/out:${helperPath}`,
    sourcePath
  ]);
  return helperPath;
}

export async function getAutoStartStatus() {
  if (process.platform !== "win32") {
    return { supported: false, enabled: false };
  }
  const entry = await queryRunEntry();
  return { supported: true, enabled: entry !== null };
}

export async function setAutoStart({
  enabled,
  entryPoint,
  nodeExecutable,
  openDashboard = true,
  port,
  workingDirectory
}) {
  if (process.platform !== "win32") {
    return { supported: false, enabled: false };
  }
  if (typeof enabled !== "boolean") throw new TypeError("enabled must be a boolean.");
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new TypeError("port must be a valid listening port.");
  }

  if (!enabled) {
    if (await queryRunEntry()) {
      await runExecutable("reg.exe", ["delete", runKey, "/v", runValueName, "/f"]);
    }
    return { supported: true, enabled: false };
  }

  const helperPath = await ensureWindowsLauncherHelper(true);
  const args = [
    "direct",
    workingDirectory,
    nodeExecutable,
    entryPoint,
    "--port",
    String(port)
  ];
  if (!openDashboard) args.push("--no-open");
  const command = [quoteWindowsArgument(helperPath), ...args.map(quoteWindowsArgument)].join(" ");
  await runExecutable("reg.exe", [
    "add",
    runKey,
    "/v",
    runValueName,
    "/t",
    "REG_SZ",
    "/d",
    command,
    "/f"
  ]);
  return { supported: true, enabled: true };
}

function localAppDataPath() {
  return process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
}

async function queryRunEntry() {
  try {
    const result = await runExecutable("reg.exe", ["query", runKey, "/v", runValueName]);
    return result.stdout;
  } catch (error) {
    const detail = `${error.stderr || ""} ${error.message || ""}`;
    if (error.code === 1 && /unable to find|cannot find|specified registry key or value/i.test(detail)) {
      return null;
    }
    throw error;
  }
}

function runExecutable(executable, args) {
  return new Promise((resolve, reject) => {
    execFile(executable, args, {
      windowsHide: true,
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 64 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function quoteWindowsArgument(value) {
  const text = String(value);
  let quoted = '"';
  let backslashes = 0;
  for (const character of text) {
    if (character === "\\") {
      backslashes += 1;
    } else if (character === '"') {
      quoted += "\\".repeat(backslashes * 2 + 1) + '"';
      backslashes = 0;
    } else {
      quoted += "\\".repeat(backslashes) + character;
      backslashes = 0;
    }
  }
  quoted += "\\".repeat(backslashes * 2) + '"';
  return quoted;
}
