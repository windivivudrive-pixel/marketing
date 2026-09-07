#!/usr/bin/env node

import {commandValue, getProviderStatus} from "./provider-runtime.mjs";

const args = process.argv.slice(2);
const capability = commandValue(args, "--capability", "all");
const provider = commandValue(args, "--provider");
const project = commandValue(args, "--project");
const json = args.includes("--json");

if (!project && !(capability === "images" && provider === "flow-agent")) {
  console.error("Usage: node check-provider.mjs --project <project> [--capability images|voice|all] [--provider name] [--json]");
  process.exit(2);
}
const result = await getProviderStatus({project, capability, provider});
if (json) console.log(JSON.stringify(result, null, 2));
else for (const item of result.providers) console.log(`${item.ready ? "PASS" : "BLOCKED"}: ${item.capability}:${item.provider} — ${item.reason}`);
if (!result.ok) process.exit(1);
