#!/usr/bin/env node

import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "dist");
const skillNames = ["creatorflow-run", "creatorflow-ideate", "creatorflow-script", "creatorflow-edit", "creatorflow-providers"];

await rm(outputRoot, {recursive: true, force: true});
await mkdir(path.join(outputRoot, "antigravity"), {recursive: true});
await mkdir(path.join(outputRoot, "cherry-studio"), {recursive: true});
await mkdir(path.join(outputRoot, "generic"), {recursive: true});

const read = (relative) => readFile(path.join(root, relative), "utf8");
const sections = [];
sections.push(`# CreatorFlow Studio portable agent contract

Use CreatorFlow for approval-gated short-video work. Treat the workspace files as the source of truth, keep approved artifacts immutable, never expose credentials, and never spend image or TTS quota before the matching approval.

The active reasoning model may be OpenAI, Gemini, DeepSeek, or another capable model. Model identity does not alter the workflow contract. Use available filesystem, browsing, MCP, and terminal capabilities; when one is unavailable, stop at the affected gate and export a precise handoff instead of pretending an action succeeded.

Package root for this local build: ${root}

Resolve every package-relative script and reference from that root. Project content belongs in the user's content project, not in the package source.`);

for (const skillName of skillNames) {
  sections.push(await read(`skills/${skillName}/SKILL.md`));
}
sections.push(await read("references/provider-contract.md"));
sections.push(await read("references/phenomenon-led-retention.md"));
sections.push(await read("skills/creatorflow-providers/references/shared-provider-contract.md"));
sections.push(await read("skills/creatorflow-run/references/workflow-contract.md"));
sections.push(await read("skills/creatorflow-run/references/resource-gates.md"));
sections.push(await read("skills/creatorflow-ideate/references/idea-output-contract.md"));
sections.push(await read("skills/creatorflow-script/references/brief-contract.md"));
sections.push(await read("skills/creatorflow-script/references/voice-visual-cue-contract.md"));
sections.push(await read("skills/creatorflow-script/references/visual-prompt-contract.md"));
sections.push(await read("skills/creatorflow-script/references/opening-frame-contract.md"));
sections.push(await read("skills/creatorflow-edit/references/production-contract.md"));
sections.push(await read("skills/creatorflow-edit/references/style-presets.md"));
sections.push(await read("skills/creatorflow-edit/references/visual-cue-schema.md"));
sections.push(await read("skills/creatorflow-edit/references/remotion-qa.md"));

const prompt = `${sections.join("\n\n---\n\n")}\n`;
await writeFile(path.join(outputRoot, "cherry-studio", "CREATORFLOW_SYSTEM_PROMPT.md"), prompt);
await writeFile(path.join(outputRoot, "generic", "CREATORFLOW_SYSTEM_PROMPT.md"), prompt);

const flowMcp = {
  mcpServers: {
    "creatorflow-images": {
      command: "flow",
      args: ["mcp"]
    }
  }
};
const mediaMcp = {
  mcpServers: {
    "creatorflow-media": {
      command: "node",
      args: [path.join(root, "scripts", "creatorflow-media-mcp.mjs")]
    }
  }
};
const fullMcp = {mcpServers: {...flowMcp.mcpServers, ...mediaMcp.mcpServers}};
await writeFile(path.join(outputRoot, "antigravity", "INSTALL.json"), `${JSON.stringify({
  sourcePlugin: root,
  workspaceDestination: ".agents/plugins/creatorflow-studio",
  globalDestination: "~/.gemini/config/plugins/creatorflow-studio",
  strategy: "symlink-source-to-destination"
}, null, 2)}\n`);
await writeFile(path.join(outputRoot, "cherry-studio", "mcp-flow.json"), `${JSON.stringify(flowMcp, null, 2)}\n`);
await writeFile(path.join(outputRoot, "generic", "mcp-flow.json"), `${JSON.stringify(flowMcp, null, 2)}\n`);
for (const host of ["antigravity", "cherry-studio", "generic", "codex"]) {
  await mkdir(path.join(outputRoot, host), {recursive: true});
  await writeFile(path.join(outputRoot, host, "mcp-creatorflow-media.json"), `${JSON.stringify(mediaMcp, null, 2)}\n`);
  await writeFile(path.join(outputRoot, host, "mcp-creatorflow.json"), `${JSON.stringify(fullMcp, null, 2)}\n`);
}
await writeFile(path.join(outputRoot, "manifest.json"), `${JSON.stringify({
  schemaVersion: 1,
  source: root,
  skills: skillNames,
  adapters: {
    antigravity: "Native plugin plus absolute media MCP configuration",
    codex: "Native adapter plus absolute media MCP configuration",
    cherryStudio: "Generated system prompt + STDIO MCP configuration",
    generic: "Generated system prompt + standard MCP configuration"
  }
}, null, 2)}\n`);

console.log(JSON.stringify({ok: true, outputRoot, promptCharacters: prompt.length}, null, 2));
