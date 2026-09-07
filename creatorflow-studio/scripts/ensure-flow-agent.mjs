#!/usr/bin/env node

import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {checkFlowAgent, writeFlowStatus} from "./check-flow-agent.mjs";

const projectIndex = process.argv.indexOf("--project");
const projectRoot = projectIndex >= 0 ? path.resolve(process.argv[projectIndex + 1]) : "";
if (!projectRoot) {
  console.error("Usage: node ensure-flow-agent.mjs --project <project>");
  process.exit(2);
}

const profile = JSON.parse(await readFile(path.join(projectRoot, "creatorflow", "profile.json"), "utf8"));
const settings = profile.providers?.flowAgent || {};
const statusPath = path.join(projectRoot, "creatorflow", "flow-agent-status.json");
const checkTimeoutMs = Number(settings.checkTimeoutMs || 5000);
const startupTimeoutMs = Number(settings.startupTimeoutMs || 45000);
const pollIntervalMs = Number(settings.pollIntervalMs || 2000);
let status = checkFlowAgent({timeoutMs: checkTimeoutMs});
await writeFlowStatus(statusPath, status);
if (status.ready) {
  console.log(`PASS: Flow Agent already ready → ${statusPath}`);
  process.exit(0);
}

if (settings.autoStart !== true) {
  console.error("ERROR: Flow Agent is not ready and providers.flowAgent.autoStart is not enabled");
  process.exit(1);
}
const startCwd = path.resolve(settings.startCwd || "");
const startCommand = settings.startCommand;
if (!startCwd || !Array.isArray(startCommand) || startCommand.join(" ") !== "npm run bridge:all") {
  console.error("ERROR: auto-start requires startCwd and exact startCommand [\"npm\", \"run\", \"bridge:all\"]");
  process.exit(1);
}
await access(path.join(startCwd, "package.json"));
const packageJson = JSON.parse(await readFile(path.join(startCwd, "package.json"), "utf8"));
if (!packageJson.scripts?.["bridge:all"]) {
  console.error("ERROR: configured package does not expose bridge:all");
  process.exit(1);
}

const started = spawnSync("npm", ["run", "bridge:all"], {cwd: startCwd, encoding: "utf8", timeout: 30000});
if (started.status !== 0) {
  console.error(started.stderr || started.stdout || "ERROR: Flow Agent auto-start failed");
  process.exit(started.status || 1);
}

const deadline = Date.now() + startupTimeoutMs;
while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  status = checkFlowAgent({timeoutMs: checkTimeoutMs});
  await writeFlowStatus(statusPath, status);
  if (status.ready) {
    console.log(`PASS: Flow Agent auto-started and ready → ${statusPath}`);
    process.exit(0);
  }
}
console.error(`ERROR: Flow Agent auto-started but did not become ready within ${startupTimeoutMs}ms`);
console.error("ERROR: stop image generation; no alternate image provider is allowed");
process.exit(1);
