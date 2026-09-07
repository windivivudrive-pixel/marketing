#!/usr/bin/env node

import {lstat, mkdir, readlink, symlink} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const args = process.argv.slice(2);
const value = (flag, fallback = "") => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const host = value("--host");
const workspace = value("--workspace");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (host !== "antigravity" || !workspace) {
  console.error("Usage: node scripts/install-host.mjs --host antigravity --workspace <workspace-root>");
  console.error("Cherry Studio uses dist/cherry-studio/CREATORFLOW_SYSTEM_PROMPT.md and dist/cherry-studio/mcp-flow.json in its settings UI.");
  process.exit(2);
}

const pluginsDir = path.join(path.resolve(workspace), ".agents", "plugins");
const destination = path.join(pluginsDir, "creatorflow-studio");
await mkdir(pluginsDir, {recursive: true});

try {
  const stat = await lstat(destination);
  if (!stat.isSymbolicLink()) throw new Error(`Destination exists and is not a symlink: ${destination}`);
  const current = path.resolve(pluginsDir, await readlink(destination));
  if (current !== root) throw new Error(`Destination points elsewhere: ${destination} -> ${current}`);
  console.log(JSON.stringify({ok: true, unchanged: true, destination, source: root}, null, 2));
  process.exit(0);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

await symlink(root, destination, "dir");
console.log(JSON.stringify({ok: true, unchanged: false, destination, source: root}, null, 2));
