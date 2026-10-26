#!/usr/bin/env node

import { spawn } from "node:child_process";
import { Console } from "node:console";
import fs from "node:fs";
import path from "node:path";
import { startLocalApp } from "../lib/server.js";
import { ensureWindowsLauncherHelper } from "../lib/windows-startup.js";

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (process.env.POWER_MONITOR_DETACHED === "1") bindDetachedLog();
  else if (await relaunchHidden(process.argv.slice(2))) return;

  const app = await startLocalApp({
    port: options.port,
    autoStart: {
      entryPoint: path.resolve(process.argv[1]),
      nodeExecutable: process.execPath,
      openDashboard: !options.noOpen,
      workingDirectory: process.cwd()
    }
  });
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

function bindDetachedLog() {
  const logDir = path.join(process.env.LOCALAPPDATA || process.env.TEMP || ".", "dev-run-logs");
  fs.mkdirSync(logDir, { recursive: true });
  const stream = fs.createWriteStream(path.join(logDir, "power-monitor-lab.log"), { flags: "a" });
  globalThis.console = new Console({ stdout: stream, stderr: stream });
}

function relaunchHidden(args) {
  if (process.platform !== "win32") return Promise.resolve(false);
  return ensureWindowsLauncherHelper().then((helper) => new Promise((resolve, reject) => {
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
  const options = { port: 62474, noOpen: false, help: false };
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
  --port <0-65535>  Listen on this loopback port (default: 62474)
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
