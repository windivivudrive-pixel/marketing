#!/usr/bin/env node

import {mkdir, writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {spawnSync} from "node:child_process";

export const checkFlowAgent = ({timeoutMs = 15000} = {}) => {
  const result = spawnSync("flow", ["status"], {encoding: "utf8", timeout: timeoutMs});
  const raw = `${result.stdout || ""}\n${result.stderr || ""}`.replace(/\u001b\[[0-9;]*m/g, "").trim();
  const timedOut = result.error?.code === "ETIMEDOUT";
  const cliFound = result.error?.code !== "ENOENT";
  const backendHealthy = /Backend:\s*up\b/i.test(raw) && /status:\s*healthy\b/i.test(raw);
  const extensionConnected = /extension_connected:\s*True\b/i.test(raw);
  const hasFlowKey = /has_flow_key:\s*True\b/i.test(raw);
  const ready = result.status === 0 && backendHealthy && extensionConnected && hasFlowKey;
  return {
    checkedAt: new Date().toISOString(),
    provider: "flow-agent",
    command: "flow status",
    timeoutMs,
    cliFound,
    timedOut,
    backendHealthy,
    extensionConnected,
    hasFlowKey,
    ready
  };
};

export const writeFlowStatus = async (outputPath, normalized) => {
  if (!outputPath) return;
  await mkdir(path.dirname(outputPath), {recursive: true});
  await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
};

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const outIndex = process.argv.indexOf("--out");
  const timeoutIndex = process.argv.indexOf("--timeout-ms");
  const outputPath = outIndex >= 0 ? path.resolve(process.argv[outIndex + 1]) : "";
  const timeoutMs = timeoutIndex >= 0 ? Number(process.argv[timeoutIndex + 1]) : 15000;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) {
    console.error("ERROR: --timeout-ms must be between 1000 and 60000");
    process.exit(2);
  }
  const normalized = checkFlowAgent({timeoutMs});
  await writeFlowStatus(outputPath, normalized);
  if (!normalized.ready) {
    console.error(`ERROR: Flow Agent is not ready: ${JSON.stringify(normalized)}`);
    console.error("ERROR: stop image generation; no alternate image provider is allowed");
    process.exit(1);
  }
  console.log(`PASS: Flow Agent ready → ${JSON.stringify(normalized)}`);
}
