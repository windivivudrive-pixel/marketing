#!/usr/bin/env node

import {access, readFile} from "node:fs/promises";
import path from "node:path";

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const modeIndex = process.argv.indexOf("--mode");
const mode = modeIndex >= 0 ? process.argv[modeIndex + 1] : "legacy";
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
const fps = 30;
const frameMs = 1000 / fps;
const normalizeWord = (value) => String(value || "").toLocaleLowerCase("vi").replace(/[^\p{L}\p{N}]+/gu, "");
const nearWordStart = (ms) => words.some((word) => Math.abs(word.startMs - ms) <= frameMs + 0.001);

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
  if (asset.stickerTreatment && !["remotion-paper", "legacy-precut"].includes(asset.stickerTreatment)) errors.push(`asset ${asset.id} has invalid stickerTreatment`);
  if (asset.stickerTreatment === "remotion-paper" && asset.hasBakedContour) errors.push(`asset ${asset.id} would receive double backing`);
  if (asset.stickerTreatment === "legacy-precut" && asset.hasBakedContour === false) errors.push(`asset ${asset.id} is marked legacy-precut without a baked contour`);
  if (asset.kind === "image" && !asset.stickerTreatment) warnings.push(`asset ${asset.id} has no stickerTreatment; treating it as legacy-compatible input`);
  if (/^https?:/i.test(asset.src)) errors.push(`remote asset is forbidden at render time: ${asset.src}`);
  if (asset.src) {
    try { await access(path.join(projectRoot, "public", asset.src)); } catch { errors.push(`asset does not exist: public/${asset.src}`); }
  }
  if (asset.watermarkRemoval) {
    const removal = asset.watermarkRemoval;
    if (asset.kind !== "image") errors.push(`watermark removal asset ${asset.id} must be an image`);
    if (removal.watermark !== "gemini-visible") errors.push(`watermark removal asset ${asset.id} must be gemini-visible`);
    if (!["owned", "licensed"].includes(removal.authorization)) errors.push(`watermark removal asset ${asset.id} requires owned or licensed authorization`);
    if (!removal.originalSrc || /^https?:/i.test(removal.originalSrc)) errors.push(`watermark removal asset ${asset.id} needs a local immutable originalSrc`);
    if (!removal.provenanceSrc || /^https?:/i.test(removal.provenanceSrc)) errors.push(`watermark removal asset ${asset.id} needs a local provenanceSrc`);
    if (removal.tool?.package !== "@pilio/gemini-watermark-remover" || !removal.tool?.version) errors.push(`watermark removal asset ${asset.id} needs the pinned tool record`);
    if (!asset.src.split(/[\\/]/).includes("clean")) errors.push(`watermark removal asset ${asset.id} must render from a clean output path`);
    if (removal.provenanceSrc) {
      const provenancePath = path.join(projectRoot, "public", removal.provenanceSrc);
      try {
        const provenance = JSON.parse(await readFile(provenancePath, "utf8"));
        if (provenance.status !== "removed" || provenance.detection?.applied !== true) errors.push(`watermark removal asset ${asset.id} provenance is not a confirmed removal`);
        if (provenance.assetId !== asset.id) errors.push(`watermark removal asset ${asset.id} provenance assetId does not match`);
        if (path.resolve(provenance.cleaned?.path || "") !== path.join(projectRoot, "public", asset.src)) errors.push(`watermark removal asset ${asset.id} provenance clean path does not match asset src`);
      } catch { errors.push(`watermark removal asset ${asset.id} provenance is missing or invalid: public/${removal.provenanceSrc}`); }
    }
  }
}
for (const beat of episode.beats || []) for (const id of beat.assetIds || []) if (!assetIds.has(id)) errors.push(`macro beat references missing asset: ${id}`);

if (!Array.isArray(captions)) errors.push("captions must be an array");
else captions.forEach((caption, index) => {
  if (typeof caption.text !== "string" || !caption.text.trim()) errors.push(`caption ${index} has no text`);
  if (caption.text?.trim().split(/\s+/).length > 8) (mode === "production" ? errors : warnings).push(`caption ${index} exceeds 8 words`);
  if (!Number.isFinite(caption.startMs) || !Number.isFinite(caption.endMs) || caption.endMs <= caption.startMs) errors.push(`caption ${index} has invalid timing`);
  if (index > 0 && caption.startMs < captions[index - 1].startMs) errors.push(`caption ${index} is not monotonic`);
  if (caption.endMs > episode.durationMs) errors.push(`caption ${index} exceeds durationMs`);
  if (!("timestampMs" in caption) || !("confidence" in caption)) errors.push(`caption ${index} must use the Remotion Caption shape`);
});
if (episode.audio?.voiceSrc && captions.length === 0) errors.push("voice episodes require captions");

if (episode.schemaVersion === 2) {
  const continuousStage = episode.motionGrammar === "continuous-stage-v1";
  const phenomenonLed = episode.retentionMode === "business-phenomenon-decode-v1";
  const allowedRetentionRoles = ["hook-puzzle", "viewer-prediction", "story-progress", "perspective-flip", "mechanism-decode", "proof-evidence", "application-audit", "cta"];
  if (!wordsArg || !Array.isArray(words) || words.length === 0) errors.push("schema v2 production requires non-empty words.json");
  else words.forEach((word, index) => {
    if (!normalizeWord(word.text)) errors.push(`word ${index} has no token text`);
    if (!Number.isFinite(word.startMs) || !Number.isFinite(word.endMs) || word.endMs <= word.startMs) errors.push(`word ${index} has invalid timing`);
    if (index > 0 && word.startMs < words[index - 1].startMs) errors.push(`word ${index} is not monotonic`);
    if (!("timestampMs" in word) || !("confidence" in word)) errors.push(`word ${index} must use the Remotion Caption shape`);
  });

  const cues = episode.visualCues;
  if (!Array.isArray(cues) || cues.length < Math.ceil(episode.durationMs / 2200)) errors.push("visualCues are missing or too sparse for the runtime");
  else {
    const cueIds = new Set();
    const itemFirstSeen = new Map();
    const retentionRoles = new Set();
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
      if (!nearWordStart(cue.startMs)) errors.push(`visual cue ${cue.id} does not start on a word boundary within one frame`);
      const firstAnchorWord = normalizeWord(cue.spokenAnchor?.split(/\s+/)[0]);
      const matchingWord = words.find((word) => Math.abs(word.startMs - cue.startMs) <= frameMs + 0.001);
      if (!firstAnchorWord || normalizeWord(matchingWord?.text) !== firstAnchorWord) errors.push(`visual cue ${cue.id} spokenAnchor does not match words.json at startMs`);
      if (!cue.semanticIntent || cue.semanticIntent.length < 8) errors.push(`visual cue ${cue.id} needs semanticIntent`);
      if (phenomenonLed) {
        if (!allowedRetentionRoles.includes(cue.retentionRole)) errors.push(`visual cue ${cue.id} needs a valid retentionRole`);
        else retentionRoles.add(cue.retentionRole);
      }
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
        if (!item.id || !item.role) errors.push(`visual cue ${cue.id} has an item without stable ID or role`);
        if (!Number.isInteger(item.enterMs)) errors.push(`item ${item.id} enterMs must be an integer`);
        const firstSeen = itemFirstSeen.get(item.id);
        const carried = previousIds.has(item.id);
        if (firstSeen && firstSeen.enterMs !== item.enterMs) errors.push(`carried item ${item.id} changed enterMs`);
        if (carried && item.sfx) errors.push(`carried item ${item.id} must not repeat SFX`);
        if (!carried) {
          if (item.enterMs < cue.startMs || item.enterMs >= cue.endMs) errors.push(`new item ${item.id} must enter inside cue ${cue.id}`);
          if (!nearWordStart(item.enterMs)) errors.push(`new item ${item.id} does not enter on a word boundary within one frame`);
          if (firstSeen) errors.push(`item ${item.id} reappears after leaving; use a new stable ID`);
          itemFirstSeen.set(item.id, {enterMs: item.enterMs, cueId: cue.id});
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

      if (cue.exit === "carry" && next && !cue.items.some((item) => next.items.some((nextItem) => nextItem.id === item.id))) errors.push(`cue ${cue.id} says carry but no item continues`);
      if (cue.exit === "transform" && next && !cue.items.some((item) => next.items.some((nextItem) => nextItem.id === item.id))) errors.push(`cue ${cue.id} says transform but no stable item continues`);
      if (cue.composition === "transform" && previous && !cue.items.some((item) => previous.items.some((previousItem) => previousItem.id === item.id))) errors.push(`transform cue ${cue.id} must reuse a preceding item ID`);
    });
    if (cues.at(-1)?.endMs !== episode.durationMs) errors.push("final visual cue must end at durationMs");
    if (phenomenonLed) {
      if (cues[0]?.retentionRole !== "hook-puzzle") errors.push("phenomenon-led opening cue must use retentionRole hook-puzzle");
      if (cues.at(-1)?.retentionRole !== "cta") errors.push("phenomenon-led final cue must use retentionRole cta");
      for (const role of allowedRetentionRoles) if (!retentionRoles.has(role)) errors.push(`phenomenon-led visualCues missing retentionRole ${role}`);

      const resets = episode.retentionResets;
      if (!Array.isArray(resets) || resets.length < 5 || resets.length > 7) errors.push("phenomenon-led episode requires 5–7 retentionResets");
      else {
        const cueStarts = new Set(cues.map((cue) => cue.startMs));
        let previousResetMs = -1;
        resets.forEach((reset, index) => {
          for (const key of ["id", "atMs", "trigger", "informationGain", "visualReset", "sceneFamily"]) if (!(key in reset) || reset[key] === "") errors.push(`retention reset ${index + 1} missing ${key}`);
          if (!/^R\d{2}$/i.test(reset.id || "")) errors.push(`retention reset ${index + 1} needs an R01-style ID`);
          if (!Number.isInteger(reset.atMs) || reset.atMs <= previousResetMs) errors.push("retentionResets must increase");
          if (previousResetMs >= 0 && reset.atMs - previousResetMs > 10000) errors.push("retention reset gap exceeds 10 seconds");
          if (!cueStarts.has(reset.atMs)) errors.push(`retention reset ${reset.id || index + 1} must begin on a visual cue`);
          if (!nearWordStart(reset.atMs)) errors.push(`retention reset ${reset.id || index + 1} does not start on a word boundary within one frame`);
          previousResetMs = reset.atMs;
        });
        if ((resets[0]?.atMs ?? -1) < 0 || resets[0].atMs > 3000) errors.push("first retention reset must be within 0–3 seconds");
        if (resets.at(-1)?.atMs >= episode.durationMs) errors.push("final retention reset must occur before durationMs");
        if (episode.durationMs >= 45000 && (resets.at(-1)?.atMs || 0) < 40000) errors.push("45–60 second phenomenon-led episode needs a late reset at or after 40 seconds");
      }
    }
    if (continuousStage) {
      const appearances = new Map();
      cues.forEach((cue) => cue.items.forEach((item) => appearances.set(item.id, (appearances.get(item.id) || 0) + 1)));
      if (![...appearances.values()].some((count) => count >= 4)) errors.push("continuous-stage-v1 requires one stable narrative object across at least four cues");
      if (!cues.some((cue) => cue.exit === "carry") || !cues.some((cue) => cue.exit === "transform")) errors.push("continuous-stage-v1 requires carry and transform continuity");
    }
  }
} else if (mode === "legacy") {
  warnings.push("schema v1 uses macro beats as a legacy visual fallback; new production must migrate to schema v2");
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
const cueCount = episode.schemaVersion === 2 ? episode.visualCues.length : 0;
console.log(`PASS: ${episode.id}, schema v${episode.schemaVersion}, ${episode.beats.length} macro beats, ${cueCount} visual cues, ${(episode.durationMs / 1000).toFixed(1)}s`);
