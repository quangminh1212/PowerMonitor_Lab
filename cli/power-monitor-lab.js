#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import { Console } from "node:console";
import fs from "node:fs";
import path from "node:path";
import { startLocalApp } from "../lib/server.js";

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (process.env.POWER_MONITOR_DETACHED === "1") bindDetachedLog();
  else if (await relaunchHidden(process.argv.slice(2))) return;

  const app = await startLocalApp({ port: options.port });
  console.log("Power Monitor Lab is running locally.");
  console.log(`Open: ${app.origin}`);
  console.log("Data stays on this device. Press Ctrl+C to stop the local server.");

  if (!options.noOpen) {
    try {
      await openDefaultBrowser(app.origin);
      console.log("Opened your default browser.");
    } catch (error) {
      console.warn(`Could not open the browser automatically: ${error.message}`);
      console.warn(`Open this address manually: ${app.origin}`);
    }
  }

  let closing;
  const shutdown = () => {
    if (!closing) {
      closing = app.close().then(() => {
        console.log("Power Monitor Lab stopped.");
      }).catch((error) => {
        console.error(`Could not close the local server cleanly: ${error.message}`);
        process.exitCode = 1;
      });
    }
    return closing;
  };

  process.on("SIGINT", () => { void shutdown(); });
  process.on("SIGTERM", () => { void shutdown(); });
}

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
  "    start.EnvironmentVariables[\"POWER_MONITOR_DETACHED\"] = \"1\";",
  "    var command = new StringBuilder();",
  "    for (int index = 3; index < args.Length; index++) {",
  "      if (index > 3) command.Append(' ');",
  "      command.Append('\"').Append(args[index]).Append('\"');",
  "    }",
  "    start.Arguments = command.ToString();",
  "    var process = Process.Start(start);",
  "    return process == null ? 1 : 0;",
  "  }",
  "}",
  ""
].join("\n");

function bindDetachedLog() {
  const logDir = path.join(process.env.LOCALAPPDATA || process.env.TEMP || ".", "dev-run-logs");
  fs.mkdirSync(logDir, { recursive: true });
  const stream = fs.createWriteStream(path.join(logDir, "power-monitor-lab.log"), { flags: "a" });
  globalThis.console = new Console({ stdout: stream, stderr: stream });
}

function relaunchHidden(args) {
  if (process.platform !== "win32") return Promise.resolve(false);
  const helper = path.join(process.env.TEMP || ".", "power-monitor-hidden.exe");
  const sourcePath = path.join(process.env.TEMP || ".", "power-monitor-hidden.cs");
  const compile = fs.existsSync(helper) && fs.existsSync(sourcePath) && fs.readFileSync(sourcePath, "utf8") === hiddenHelperSource
    ? Promise.resolve()
    : new Promise((resolve, reject) => {
      fs.mkdirSync(path.dirname(helper), { recursive: true });
      fs.writeFileSync(sourcePath, hiddenHelperSource);
      const compiler = path.join(process.env.WINDIR || "C:\\Windows", "Microsoft.NET", "Framework64", "v4.0.30319", "csc.exe");
      execFile(compiler, ["/nologo", "/target:winexe", "/r:System.Management.dll", `/out:${helper}`, sourcePath], { windowsHide: true }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  return compile.then(() => new Promise((resolve, reject) => {
    // Windows-subsystem helper starts the server with CREATE_NO_WINDOW, so Windows Terminal never opens a console.
    const child = spawn(helper, [process.cwd(), process.execPath, process.argv[1], ...args], {
      windowsHide: true,
      stdio: "ignore"
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Could not detach the Power Monitor process."));
    }, 15_000);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(true);
      else reject(new Error("Could not detach the Power Monitor process."));
    });
  }));
}

function parseArguments(args) {
  const options = { port: 0, noOpen: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    if (argument === "--no-open") {
      options.noOpen = true;
      continue;
    }

    let value;
    if (argument === "--port") {
      value = args[++index];
    } else if (argument.startsWith("--port=")) {
      value = argument.slice("--port=".length);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }

    if (value === undefined || !/^\d+$/.test(value)) {
      throw new Error("--port must be an integer from 0 to 65535.");
    }
    options.port = Number(value);
    if (!Number.isSafeInteger(options.port) || options.port > 65_535) {
      throw new Error("--port must be an integer from 0 to 65535.");
    }
  }
  return options;
}

function openDefaultBrowser(url) {
  const command = process.platform === "win32"
    ? "rundll32.exe"
    : process.platform === "darwin"
      ? "open"
      : "xdg-open";
  const args = process.platform === "win32"
    ? ["url.dll,FileProtocolHandler", url]
    : [url];

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      shell: false,
      stdio: "ignore",
      windowsHide: true
    });
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

function printHelp() {
  console.log(`Power Monitor Lab - local power readings and energy estimates

Usage:
  npx power-monitor-lab [options]

Options:
  --port <0-65535>  Listen on this loopback port (default: choose an available port)
  --no-open         Print the local URL without opening a browser
  -h, --help        Show this help

Environment:
  POWER_MONITOR_DATA_DIR  Override the folder used for local readings
  POWER_MONITOR_PC_METER_HOST  Optional private IPv4 override for a Shelly PC meter
  POWER_MONITOR_PC_METER_PASSWORD  Optional password for the explicit host override
  POWER_MONITOR_PC_METER_COMPONENT  Optional pm1:N or switch:N channel override
`);
}

main().catch((error) => {
  console.error(`Power Monitor Lab could not start: ${error.message}`);
  process.exitCode = 1;
});
