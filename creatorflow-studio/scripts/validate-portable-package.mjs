#!/usr/bin/env node

import {access, readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "plugin.json",
  "mcp_config.json",
  ".codex-plugin/plugin.json",
  ".mcp.json",
  "references/provider-contract.md",
  "references/phenomenon-led-retention.md",
  "skills/creatorflow-script/references/voice-visual-cue-contract.md",
  "skills/creatorflow-script/scripts/render-script-review.mjs",
  "skills/creatorflow-ideate/references/idea-output-contract.md",
  "skills/creatorflow-ideate/scripts/validate-ideas.mjs",
  "skills/creatorflow-edit/references/visual-cue-schema.md",
  "scripts/provider-runtime.mjs",
  "scripts/check-flow-agent.mjs",
  "scripts/ensure-flow-agent.mjs",
  "scripts/remove-gemini-visible-watermark.mjs",
  "scripts/creatorflow-media.mjs",
  "scripts/creatorflow-media-mcp.mjs",
  "dist/cherry-studio/CREATORFLOW_SYSTEM_PROMPT.md",
  "dist/cherry-studio/mcp-flow.json",
  "dist/antigravity/mcp-creatorflow-media.json",
  "dist/codex/mcp-creatorflow-media.json"
];
for (const skill of ["creatorflow-run", "creatorflow-ideate", "creatorflow-script", "creatorflow-edit", "creatorflow-providers"]) {
  required.push(`skills/${skill}/SKILL.md`);
}
for (const file of required) await access(path.join(root, file));

const antigravity = JSON.parse(await readFile(path.join(root, "plugin.json"), "utf8"));
const antigravityMcp = JSON.parse(await readFile(path.join(root, "mcp_config.json"), "utf8"));
const codexMcp = JSON.parse(await readFile(path.join(root, ".mcp.json"), "utf8"));
const prompt = await readFile(path.join(root, "dist/cherry-studio/CREATORFLOW_SYSTEM_PROMPT.md"), "utf8");

const errors = [];
if (antigravity.name !== "creatorflow-studio") errors.push("Antigravity plugin name is invalid");
if (!antigravityMcp.mcpServers?.["creatorflow-images"]) errors.push("Antigravity image MCP route is missing");
if (!antigravityMcp.mcpServers?.["creatorflow-media"]) errors.push("Antigravity media MCP route is missing");
if (!codexMcp.mcpServers?.["creatorflow-images"]) errors.push("Codex image MCP route is missing");
if (!codexMcp.mcpServers?.["creatorflow-media"]) errors.push("Codex media MCP route is missing");
for (const marker of ["CreatorFlow Run", "CreatorFlow Ideate", "CreatorFlow Script", "CreatorFlow Edit", "CreatorFlow Providers", "Provider contract", "Phenomenon-led retention grammar", "business-phenomenon-decode-v1", "Idea output contract", "JSON script package contract", "Voice-to-visual cue contract", "Visual cue schema v2", "branding-story-paper-pink"]) {
  if (!prompt.includes(marker)) errors.push(`Cherry Studio prompt is missing ${marker}`);
}
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log(`PASS: portable package and ${required.length} required artifacts are valid`);
