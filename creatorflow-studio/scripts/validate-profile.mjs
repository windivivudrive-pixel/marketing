#!/usr/bin/env node

import {access, readFile} from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(process.argv[2] || ".");
const mode = process.argv[3] || "ideas";
const profile = JSON.parse(await readFile(path.join(projectRoot, "creatorflow", "profile.json"), "utf8"));
const state = JSON.parse(await readFile(path.join(projectRoot, "creatorflow", "state.json"), "utf8"));
const errors = [];
const warnings = [];

for (const key of ["projectName", "topicSpace", "audience", "language", "platform"]) {
  if (!profile[key] || typeof profile[key] !== "string") errors.push(`profile.${key} is required`);
}
if (!profile.style?.vibe) errors.push("profile.style.vibe is required");
if (!profile.production?.width || !profile.production?.height || !profile.production?.fps) errors.push("production dimensions and fps are required");
if (profile.style?.preset === "branding-story-paper-pink") {
  if (!profile.seriesLabel) errors.push("branding-story-paper-pink requires profile.seriesLabel");
  if (!Number.isFinite(profile.production?.captionTop)) errors.push("branding-story-paper-pink requires production.captionTop");
  else if (profile.production.captionTop < 950 || profile.production.captionTop > 1160) errors.push("production.captionTop must keep captions above the mascot safe zone");
}
if (profile.contentStrategy?.mode === "business-phenomenon-decode-v1") {
  for (const key of ["positioning", "episodePromise", "defaultHookModes", "topicRules", "retention", "theoryRule", "evidenceRule"]) if (!(key in profile.contentStrategy) || profile.contentStrategy[key] === "") errors.push(`contentStrategy missing ${key}`);
  if (!Array.isArray(profile.contentStrategy.defaultHookModes) || profile.contentStrategy.defaultHookModes.length < 2) errors.push("contentStrategy.defaultHookModes needs at least two modes");
  if (!Array.isArray(profile.contentStrategy.retention?.requiredVisualLayers) || profile.contentStrategy.retention.requiredVisualLayers.length !== 5) errors.push("contentStrategy.retention must declare all five visual layers");
}

const checkLocal = async (label, candidate, required = false) => {
  if (!candidate) {
    if (required) errors.push(`${label} is required`);
    return;
  }
  try {
    await access(path.resolve(projectRoot, candidate));
  } catch {
    errors.push(`${label} does not exist: ${candidate}`);
  }
};

if (mode === "production") {
  if (state.approvals?.script?.status !== "approved") errors.push("script approval is required before production");
  if (profile.providers?.images !== "flow-agent") errors.push("profile.providers.images must be flow-agent; image generation cannot fall back to another platform");
  if (profile.providers?.flowAgent?.autoStart === true) {
    if (!profile.providers.flowAgent.startCwd) errors.push("Flow Agent auto-start requires providers.flowAgent.startCwd");
    if (profile.providers.flowAgent.startCommand?.join(" ") !== "npm run bridge:all") errors.push("Flow Agent auto-start command must be npm run bridge:all");
  }
  if (!profile.providers?.voice) errors.push("a voice route is required");
  if (profile.providers?.voice === "provided-audio") warnings.push("the episode voice file must exist before caption timing and render");
  await checkLocal("resources.logo", profile.resources?.logo, false);
  await checkLocal("resources.character", profile.resources?.character, false);
  for (const [index, ref] of (profile.resources?.referenceImages || []).entries()) {
    await checkLocal(`resources.referenceImages[${index}]`, ref, false);
  }
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log(`PASS: profile is ready for ${mode} (${warnings.length} warning(s))`);
