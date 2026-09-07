#!/usr/bin/env node

import {access, readFile} from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith("--") && !["production", "legacy"].includes(arg));
const modeIndex = args.indexOf("--mode");
const mode = modeIndex >= 0 ? args[modeIndex + 1] : "legacy";
const [episodeArg, captionsArg, wordsArg] = positional;
if (!episodeArg || !captionsArg) {
  console.error("Usage: node validate-episode.mjs <episode.json> <captions.json> [words.json] [--mode production|legacy]");
  process.exit(2);
}

const episodePath = path.resolve(episodeArg);
const projectRoot = path.resolve(path.dirname(episodePath), "..", "..");
const episode = JSON.parse(await readFile(episodePath, "utf8"));
const captions = JSON.parse(await readFile(path.resolve(captionsArg), "utf8"));
const words = wordsArg ? JSON.parse(await readFile(path.resolve(wordsArg), "utf8")) : [];
const errors = [];
const warnings = [];
const frameMs = 1000 / 30;
const clean = (value) => String(value || "").toLocaleLowerCase("vi").replace(/[^\p{L}\p{N}]+/gu, "");
const nearWord = (ms) => words.some((word) => Math.abs(word.startMs - ms) <= frameMs + 0.001);

if (![1, 2].includes(episode.schemaVersion)) errors.push("schemaVersion must be 1 or 2");
if (mode === "production" && episode.schemaVersion !== 2) errors.push("new production requires schemaVersion 2");
for (const key of ["id", "slug", "title"]) if (!episode[key]) errors.push(`${key} is required`);
if (!Number.isInteger(episode.durationMs) || episode.durationMs <= 0) errors.push("durationMs must be a positive integer");

if (!Array.isArray(episode.beats) || episode.beats.length < 3) errors.push("at least three macro beats are required");
else episode.beats.forEach((beat, index) => {
  if (index === 0 && beat.startMs !== 0) errors.push("first macro beat must start at 0");
  if (index > 0 && beat.startMs !== episode.beats[index - 1].endMs) errors.push(`macro beat ${beat.id || index} is not contiguous`);
  if (!Number.isInteger(beat.startMs) || !Number.isInteger(beat.endMs) || beat.endMs <= beat.startMs) errors.push(`macro beat ${beat.id || index} has invalid timing`);
  if (!beat.headline) errors.push(`macro beat ${beat.id || index} needs a headline`);
});
if (episode.beats?.at(-1)?.endMs !== episode.durationMs) errors.push("final macro beat must end at durationMs");

const assetIds = new Set();
for (const asset of episode.assets || []) {
  if (!asset.id || assetIds.has(asset.id)) errors.push(`asset id is missing or duplicated: ${asset.id}`);
  assetIds.add(asset.id);
  if (/^https?:/i.test(asset.src)) errors.push(`remote asset is forbidden at render time: ${asset.src}`);
  if (asset.src) {
    try { await access(path.join(projectRoot, "public", asset.src)); } catch { errors.push(`asset does not exist: public/${asset.src}`); }
  }
}
for (const beat of episode.beats || []) for (const id of beat.assetIds || []) if (!assetIds.has(id)) errors.push(`macro beat references missing asset: ${id}`);

if (!Array.isArray(captions)) errors.push("captions must be an array");
else captions.forEach((caption, index) => {
  if (!caption.text?.trim()) errors.push(`caption ${index} has no text`);
  if (caption.text?.trim().split(/\s+/).length > 8) (mode === "production" ? errors : warnings).push(`caption ${index} exceeds 8 words`);
  if (!Number.isFinite(caption.startMs) || !Number.isFinite(caption.endMs) || caption.endMs <= caption.startMs) errors.push(`caption ${index} has invalid timing`);
  if (index > 0 && caption.startMs < captions[index - 1].startMs) errors.push(`caption ${index} is not monotonic`);
  if (caption.endMs > episode.durationMs) errors.push(`caption ${index} exceeds durationMs`);
  if (!("timestampMs" in caption) || !("confidence" in caption)) errors.push(`caption ${index} must use the Remotion Caption shape`);
});

if (episode.schemaVersion === 2) {
  const continuousStage = episode.motionGrammar === "continuous-stage-v1";
  if (!wordsArg || !Array.isArray(words) || words.length === 0) errors.push("schema v2 production requires non-empty words.json");
  else words.forEach((word, index) => {
    if (!clean(word.text)) errors.push(`word ${index} has no token text`);
    if (!Number.isFinite(word.startMs) || !Number.isFinite(word.endMs) || word.endMs <= word.startMs) errors.push(`word ${index} has invalid timing`);
    if (index > 0 && word.startMs < words[index - 1].startMs) errors.push(`word ${index} is not monotonic`);
    if (!("timestampMs" in word) || !("confidence" in word)) errors.push(`word ${index} must use the Remotion Caption shape`);
  });

  const cues = episode.visualCues;
  if (!Array.isArray(cues) || cues.length < Math.ceil(episode.durationMs / 2200)) errors.push("visualCues are missing or too sparse for the runtime");
  else {
    const cueIds = new Set();
    const firstSeen = new Map();
    cues.forEach((cue, index) => {
      const previous = cues[index - 1];
      const next = cues[index + 1];
      if (!/^C\d{2}$/i.test(cue.id || "")) errors.push(`visual cue ${index} needs a C01-style ID`);
      if (cueIds.has(cue.id)) errors.push(`duplicate visual cue ID ${cue.id}`);
      cueIds.add(cue.id);
      if (index === 0 && cue.startMs !== 0) errors.push("first visual cue must start at 0");
      if (previous && cue.startMs !== previous.endMs) errors.push(`visual cue ${cue.id} is not contiguous`);
      if (!Number.isInteger(cue.startMs) || !Number.isInteger(cue.endMs) || cue.endMs <= cue.startMs) errors.push(`visual cue ${cue.id} has invalid timing`);
      if (cue.endMs - cue.startMs > 3000) errors.push(`visual cue ${cue.id} holds one state longer than 3 seconds`);
      if (!nearWord(cue.startMs)) errors.push(`visual cue ${cue.id} does not start on a word boundary within one frame`);
      const anchor = clean(cue.spokenAnchor?.split(/\s+/)[0]);
      const word = words.find((item) => Math.abs(item.startMs - cue.startMs) <= frameMs + 0.001);
      if (!anchor || clean(word?.text) !== anchor) errors.push(`visual cue ${cue.id} spokenAnchor does not match words.json at startMs`);
      if (!cue.semanticIntent || cue.semanticIntent.length < 8) errors.push(`visual cue ${cue.id} needs semanticIntent`);
      if (!["solo", "compare", "sequence", "process", "code", "transform"].includes(cue.composition)) errors.push(`visual cue ${cue.id} has invalid composition`);
      if (!["replace", "carry", "transform"].includes(cue.exit)) errors.push(`visual cue ${cue.id} has invalid exit`);
      if (continuousStage && (!["static", "push-in", "pull-out", "pan", "follow"].includes(cue.camera?.mode) || !["subtle", "medium"].includes(cue.camera?.intensity))) errors.push(`visual cue ${cue.id} needs valid continuous-stage camera`);
      if (continuousStage && !["cut", "match-move", "zoom-through", "mask-reveal", "reframe"].includes(cue.transition)) errors.push(`visual cue ${cue.id} needs valid continuous-stage transition`);
      if (!Array.isArray(cue.items) || cue.items.length < 1 || cue.items.length > 3) errors.push(`visual cue ${cue.id} must contain 1–3 items`);
      if (cue.composition === "solo" && cue.items.length !== 1) errors.push(`solo cue ${cue.id} must contain exactly one item`);
      if (cue.composition === "compare" && cue.items.length !== 2) errors.push(`compare cue ${cue.id} must contain exactly two items`);
      if (["sequence", "process"].includes(cue.composition) && ![2, 3].includes(cue.items.length)) errors.push(`${cue.composition} cue ${cue.id} must contain two or three items`);
      if (cue.items.length === 3 && !["sequence", "process"].includes(cue.composition)) errors.push(`three-item cue ${cue.id} requires sequence or process composition`);
      const previousIds = new Set(previous?.items?.map((item) => item.id) || []);
      cue.items?.forEach((item) => {
        const carried = previousIds.has(item.id);
        const original = firstSeen.get(item.id);
        if (!item.id || !item.role) errors.push(`visual cue ${cue.id} has an item without stable ID or role`);
        if (!Number.isInteger(item.enterMs)) errors.push(`item ${item.id} enterMs must be an integer`);
        if (original && original.enterMs !== item.enterMs) errors.push(`carried item ${item.id} changed enterMs`);
        if (carried && item.sfx) errors.push(`carried item ${item.id} must not repeat SFX`);
        if (!carried) {
          if (item.enterMs < cue.startMs || item.enterMs >= cue.endMs) errors.push(`new item ${item.id} must enter inside cue ${cue.id}`);
          if (!nearWord(item.enterMs)) errors.push(`new item ${item.id} does not enter on a word boundary within one frame`);
          if (original) errors.push(`item ${item.id} reappears after leaving; use a new stable ID`);
          firstSeen.set(item.id, {enterMs: item.enterMs});
        }
        if (item.kind === "asset" && (!item.assetId || !assetIds.has(item.assetId))) errors.push(`item ${item.id} references a missing asset`);
        if (item.kind === "code" && !item.codeTemplate) errors.push(`code item ${item.id} needs codeTemplate`);
        if (!["pop", "slide", "stamp", "reveal", "scale", "arc", "track", "none"].includes(item.motion)) errors.push(`item ${item.id} has invalid motion`);
        if (continuousStage) {
          for (const endpoint of ["from", "to"]) for (const key of ["x", "y", "scale", "rotation", "opacity"]) if (!Number.isFinite(item.transform?.[endpoint]?.[key])) errors.push(`item ${item.id} transform.${endpoint}.${key} must be numeric`);
          if (!["linear", "ease-out", "spring"].includes(item.transform?.easing)) errors.push(`item ${item.id} needs valid transform easing`);
          if (["menu", "price-board", "checklist", "chart", "interface"].includes(item.codeTemplate) && item.semanticRole !== "evidence") errors.push(`semantic code item ${item.id} must use semanticRole evidence`);
          if (item.codeTemplate === "card") errors.push(`decorative card ${item.id} is forbidden in continuous-stage-v1`);
        }
      });
      if (["carry", "transform"].includes(cue.exit) && next && !cue.items.some((item) => next.items.some((nextItem) => nextItem.id === item.id))) errors.push(`cue ${cue.id} says ${cue.exit} but no stable item continues`);
      if (cue.composition === "transform" && previous && !cue.items.some((item) => previous.items.some((previousItem) => previousItem.id === item.id))) errors.push(`transform cue ${cue.id} must reuse a preceding item ID`);
    });
    if (cues.at(-1)?.endMs !== episode.durationMs) errors.push("final visual cue must end at durationMs");
    if (continuousStage) {
      const appearances = new Map();
      cues.forEach((cue) => cue.items.forEach((item) => appearances.set(item.id, (appearances.get(item.id) || 0) + 1)));
      if (![...appearances.values()].some((count) => count >= 4)) errors.push("continuous-stage-v1 requires one stable narrative object across at least four cues");
      if (!cues.some((cue) => cue.exit === "carry") || !cues.some((cue) => cue.exit === "transform")) errors.push("continuous-stage-v1 requires carry and transform continuity");
    }
  }
} else if (mode === "legacy") warnings.push("schema v1 uses the legacy visual fallback; new production must migrate to schema v2");

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log(`PASS: ${episode.id}, schema v${episode.schemaVersion}, ${episode.beats.length} macro beats, ${episode.schemaVersion === 2 ? episode.visualCues.length : 0} visual cues, ${(episode.durationMs / 1000).toFixed(1)}s`);
