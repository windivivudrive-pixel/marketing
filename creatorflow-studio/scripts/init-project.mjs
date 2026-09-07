#!/usr/bin/env node

import {access, cp, mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const args = process.argv.slice(2);
const value = (flag, fallback = "") => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

const destinationArg = value("--path");
if (!destinationArg) {
  console.error("Usage: node init-project.mjs --path <directory> --topic <topic> --vibe <vibe> [--audience <audience>] [--language <code>]");
  process.exit(2);
}

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const starter = path.join(pluginRoot, "assets", "remotion-starter");
const destination = path.resolve(destinationArg);

try {
  await access(path.join(destination, "creatorflow", "profile.json"));
  console.error(`Refusing to overwrite an existing CreatorFlow project: ${destination}`);
  process.exit(1);
} catch {}

await mkdir(destination, {recursive: true});
await cp(starter, destination, {recursive: true, errorOnExist: true, force: false});
await mkdir(path.join(destination, "creatorflow"), {recursive: true});
await mkdir(path.join(destination, "ideas"), {recursive: true});
await mkdir(path.join(destination, "briefs"), {recursive: true});
await mkdir(path.join(destination, "out"), {recursive: true});

const profileTemplate = JSON.parse(await readFile(path.join(pluginRoot, "templates", "project-profile.template.json"), "utf8"));
profileTemplate.projectName = path.basename(destination);
profileTemplate.topicSpace = value("--topic");
profileTemplate.audience = value("--audience");
profileTemplate.language = value("--language", "en");
profileTemplate.style.vibe = value("--vibe", "clean editorial");

const stateTemplate = JSON.parse(await readFile(path.join(pluginRoot, "templates", "workflow-state.template.json"), "utf8"));
stateTemplate.stage = profileTemplate.topicSpace && profileTemplate.audience ? "ready-for-ideas" : "needs-setup";
stateTemplate.updatedAt = new Date().toISOString();

const inventoryTemplate = await readFile(path.join(pluginRoot, "templates", "content-inventory.template.json"), "utf8");
await writeFile(path.join(destination, "creatorflow", "profile.json"), `${JSON.stringify(profileTemplate, null, 2)}\n`);
await writeFile(path.join(destination, "creatorflow", "state.json"), `${JSON.stringify(stateTemplate, null, 2)}\n`);
await writeFile(path.join(destination, "creatorflow", "content-inventory.json"), inventoryTemplate);

console.log(JSON.stringify({ok: true, destination, stage: stateTemplate.stage}, null, 2));

