#!/usr/bin/env node

import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const [command = "status", projectArg = ".", value = ""] = process.argv.slice(2);
const projectRoot = path.resolve(projectArg);
const statePath = path.join(projectRoot, "creatorflow", "state.json");
const state = JSON.parse(await readFile(statePath, "utf8"));

const allowedStages = new Set([
  "needs-setup",
  "ready-for-ideas",
  "idea-review",
  "ready-for-script",
  "script-review",
  "production-ready",
  "assets-ready",
  "rendered",
  "qa-passed"
]);

const save = async () => {
  state.updatedAt = new Date().toISOString();
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
};

if (command === "status") {
  console.log(JSON.stringify(state, null, 2));
} else if (command === "set-stage") {
  if (!allowedStages.has(value)) throw new Error(`Invalid stage: ${value}`);
  state.stage = value;
  await save();
  console.log(`PASS: stage=${value}`);
} else if (command === "approve-idea") {
  if (state.stage !== "idea-review") throw new Error(`Idea approval requires stage idea-review, got ${state.stage}`);
  state.approvals.idea = {status: "approved", artifact: value, approvedAt: new Date().toISOString()};
  state.stage = "ready-for-script";
  await save();
  console.log("PASS: idea approved");
} else if (command === "approve-script") {
  if (state.stage !== "script-review") throw new Error(`Script approval requires stage script-review, got ${state.stage}`);
  state.approvals.script = {status: "approved", artifact: value, approvedAt: new Date().toISOString()};
  state.stage = "production-ready";
  await save();
  console.log("PASS: script approved");
} else if (command === "set-artifact") {
  const separator = value.indexOf("=");
  if (separator < 1) throw new Error("set-artifact value must be key=path");
  state.artifacts[value.slice(0, separator)] = value.slice(separator + 1);
  await save();
  console.log("PASS: artifact saved");
} else {
  throw new Error(`Unknown command: ${command}`);
}

