/**
 * Kills whatever process is listening on a port (default 4000), so the API can
 * start cleanly. Used by `npm run api:fresh`. Cross-platform (Windows/macOS/Linux).
 *
 * Usage: node scripts/free-port.mjs [port]
 */
import { execSync } from "node:child_process";

const port = process.argv[2] || "4000";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

let killed = 0;
if (process.platform === "win32") {
  // Find PIDs listening on the port via netstat, then taskkill them.
  const out = run(`netstat -ano -p tcp | findstr LISTENING | findstr :${port}`);
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const m = line.trim().match(/\s(\d+)$/);
    if (m) pids.add(m[1]);
  }
  for (const pid of pids) {
    run(`taskkill /F /PID ${pid}`);
    killed++;
  }
} else {
  const out = run(`lsof -ti tcp:${port}`);
  for (const pid of out.split(/\s+/).filter(Boolean)) {
    run(`kill -9 ${pid}`);
    killed++;
  }
}

console.log(
  killed > 0
    ? `[free-port] freed port ${port} (stopped ${killed} process${killed === 1 ? "" : "es"})`
    : `[free-port] port ${port} was already free`,
);
