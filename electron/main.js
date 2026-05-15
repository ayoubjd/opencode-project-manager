const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;
const userDataDir = app.getPath("userData");
const dbPath = path.join(userDataDir, "dev.db");
const logPath = path.join(userDataDir, "app.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(logPath, line + "\n");
  } catch {}
}

function ensureDatabase() {
  if (fs.existsSync(dbPath)) {
    log("Database found in user data dir, reusing");
    return;
  }

  const appDir = isDev ? process.cwd() : path.join(process.resourcesPath, "app");
  const templateDb = path.join(appDir, "dev.db");
  log(`Looking for template DB at: ${templateDb}`);

  if (!fs.existsSync(templateDb)) {
    log("No template database found – Prisma will create on first connect");
    return;
  }

  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  fs.copyFileSync(templateDb, dbPath);
  log(`Copied template database to ${dbPath}`);
}

function startServer() {
  return new Promise((resolve, reject) => {
    let serverPath;
    let args;
    let cwd;

    if (isDev) {
      serverPath = require.resolve("next/dist/bin/next");
      args = ["dev", "-p", "3000"];
      cwd = process.cwd();
    } else {
      const appDir = path.join(process.resourcesPath, "app");
      serverPath = path.join(appDir, "node_modules", "next", "dist", "bin", "next");
      args = ["start", "-p", "3000"];
      cwd = appDir;

      // Path sanity checks – log what's available so we can diagnose failures
      log(`resourcesPath: ${process.resourcesPath}`);
      log(`appDir: ${appDir}`);
      log(`serverPath: ${serverPath}`);
      log(`cwd exists: ${fs.existsSync(cwd)}`);
      log(`serverPath exists: ${fs.existsSync(serverPath)}`);
      log(`nextDir exists: ${fs.existsSync(path.join(cwd, ".next"))}`);
      log(`node_modules exists: ${fs.existsSync(path.join(cwd, "node_modules"))}`);

      if (!fs.existsSync(serverPath)) {
        const alt = path.join(cwd, "node_modules", ".bin", "next.cmd");
        log(`primary serverPath missing, checking alt: ${alt} exists=${fs.existsSync(alt)}`);
      }
    }

    const env = {
      ...process.env,
      NODE_ENV: isDev ? "development" : "production",
      PORT: "3000",
      PROJECT_MANAGER_DATA_DIR: userDataDir,
    };

    // Use spawn instead of fork for better stderr capture
    serverProcess = spawn(process.execPath, [serverPath, ...args], {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stderrBuf = "";
    serverProcess.stdout.on("data", (d) => log(`[next] ${d.toString().trim()}`));
    serverProcess.stderr.on("data", (d) => {
      const text = d.toString();
      stderrBuf += text;
      log(`[next:err] ${text.trim()}`);
    });

    serverProcess.on("error", (err) => {
      log(`Fork error: ${err.message}`);
      reject(err);
    });

    serverProcess.on("exit", (code, signal) => {
      if (code !== 0 && code !== null) {
        log(`Server exited prematurely code=${code} signal=${signal}`);
        log(`stderr snapshot: ${stderrBuf.slice(-500)}`);
        reject(new Error(`Server exited with code ${code}.\n${stderrBuf.slice(-300)}`));
      }
    });

    // Poll until server is ready
    let attempts = 0;
    const maxAttempts = 30; // ~30 seconds total
    const poll = () => {
      attempts++;
      const http = require("http");
      const req = http.get("http://localhost:3000", (res) => {
        res.resume();
        log("Server ready");
        resolve();
      });
      req.on("error", () => {
        if (attempts >= maxAttempts) {
          log("Server start timed out");
          reject(new Error("Server did not start within 30 seconds"));
          return;
        }
        setTimeout(poll, 1000);
      });
      req.setTimeout(5000, () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          log("Server start timed out (request timeout)");
          reject(new Error("Server did not start within 30 seconds"));
          return;
        }
        setTimeout(poll, 1000);
      });
    };
    log("Waiting for server to start…");
    setTimeout(poll, 2000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  log("App starting…");
  ensureDatabase();
  try {
    await startServer();
    createWindow();
  } catch (err) {
    log(`FATAL: ${err.message}`);
    dialog.showErrorBox(
      "App Error",
      `Failed to start server:\n${err.message}\n\nLog: ${logPath}`
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
