const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("\x1b[36m%s\x1b[0m", `
==================================================
   🛡️  CRIMS UNIFIED RUNTIME SERVICES LAUNCHER 🛡️
==================================================
`);

const backendDir = path.join(__dirname, "DAY24", "crms_backand");
const frontendDir = path.join(__dirname, "DAY24", "forentend");

// Detect best backend command (nodemon for development reloading, node as fallback)
const hasNodemon = fs.existsSync(path.join(__dirname, "node_modules", "nodemon")) ||
                  fs.existsSync(path.join(backendDir, "node_modules", "nodemon"));
const backendCmd = hasNodemon ? "nodemon" : "node";

console.log(`\x1b[32m[Launcher] Starting Backend Server (${backendCmd})...\x1b[0m`);
const backend = spawn("npx", [backendCmd, "server.js"], {
  cwd: backendDir,
  shell: true,
  stdio: "inherit",
  env: { ...process.env, PORT: 5000 }
});

console.log("\x1b[32m[Launcher] Starting Frontend Dev Server (Parcel)...\x1b[0m");
const frontend = spawn("npx", ["parcel", "index.html", "--port", "1234", "--no-cache"], {
  cwd: frontendDir,
  shell: true,
  stdio: "inherit"
});

backend.on("error", (err) => {
  console.error("\x1b[31m[Launcher] Backend failed to start:\x1b[0m", err);
});

frontend.on("error", (err) => {
  console.error("\x1b[31m[Launcher] Frontend failed to start:\x1b[0m", err);
});

// Setup clean exit and kill child processes
const cleanup = () => {
  console.log("\x1b[33m\n[Launcher] Shutting down services...\x1b[0m");
  try { backend.kill("SIGINT"); } catch(e) {}
  try { frontend.kill("SIGINT"); } catch(e) {}
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
