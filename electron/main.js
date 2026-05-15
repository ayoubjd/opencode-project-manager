const { app, BrowserWindow, dialog } = require("electron");
const { fork } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;

// Database lives in the user's app data folder so data survives updates
const userDataDir = app.getPath("userData");
const dbPath = path.join(userDataDir, "dev.db");

function ensureDatabase() {
  if (fs.existsSync(dbPath)) {
    console.log("Database found in user data dir, reusing");
    return;
  }

  const templateDir = isDev ? process.cwd() : process.resourcesPath;
  const templateDb = path.join(templateDir, "dev.db");

  if (!fs.existsSync(templateDb)) {
    console.log("No template database found – Prisma will create on first connect");
    return;
  }

  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  fs.copyFileSync(templateDb, dbPath);
  console.log(`Copied template database to ${dbPath}`);
}

function startServer() {
  return new Promise((resolve, reject) => {
    let serverPath;
    let args;
    let cwd;

    if (isDev) {
      // Development — run next dev via the project's next CLI
      serverPath = require.resolve("next/dist/bin/next");
      args = ["dev", "-p", "3000"];
      cwd = process.cwd();
    } else {
      // Production — run next start from the bundled resources
      const resources = process.resourcesPath;
      serverPath = path.join(resources, "node_modules", "next", "dist", "bin", "next");
      args = ["start", "-p", "3000"];
      cwd = resources;
    }

    const env = {
      ...process.env,
      NODE_ENV: isDev ? "development" : "production",
      PORT: "3000",
      PROJECT_MANAGER_DATA_DIR: userDataDir,
    };

    serverProcess = fork(serverPath, args, { cwd, env, execPath: process.execPath });

    serverProcess.on("error", (err) => {
      console.error("Server process error:", err);
      reject(err);
    });

    // Poll until server is ready
    const poll = () => {
      const http = require("http");
      const req = http.get("http://localhost:3000", (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => setTimeout(poll, 600));
      req.setTimeout(4000, () => {
        req.destroy();
        setTimeout(poll, 600);
      });
    };
    setTimeout(poll, 1500);
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
  ensureDatabase();
  try {
    await startServer();
    createWindow();
  } catch (err) {
    dialog.showErrorBox("App Error", `Failed to start server:\n${err.message}`);
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
