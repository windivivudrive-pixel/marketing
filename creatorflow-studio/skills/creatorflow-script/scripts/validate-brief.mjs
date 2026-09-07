#!/usr/bin/env node

import {readFile} from "node:fs/promises";
import path from "node:path";

const input = process.argv[2];
const legacy = process.argv.includes("--legacy") || input?.endsWith(".md");
if (!input) {
  console.error("Usage: node validate-brief.mjs <brief.json> [--legacy]");
  process.exit(2);
}

const file = path.resolve(input);
const raw = await readFile(file, "utf8");

if (legacy) {
  const errors = [];
  for (const heading of ["FINAL VOICEOVER", "BEAT MAP", "VOICE-TO-VISUAL CUE SHEET", "APPROVAL CHECKLIST"]) {
    if (!new RegExp(`^##\\s+${heading}\\s*$`, "mi").test(raw)) errors.push(`legacy brief missing section ${heading}`);
  }
  if (!/^status:\s*script-review\s*$/m.test(raw)) errors.push("legacy brief status must be script-review");
  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    process.exit(1);
  }
  console.log(`PASS: legacy Markdown brief accepted read-only → ${file}`);
  process.exit(0);
}

let brief;
try { brief = JSON.parse(raw); } catch (error) {
  console.error(`ERROR: invalid JSON: ${error.message}`);
  process.exit(1);
}

const errors = [];
const requiredTop = ["metadata", "creativeContract", "topicKeywords", "voiceover", "onScreenCopy", "beats", "visualCues", "assets", "editBlueprint", "sources", "quotaPlan", "approval"];
for (const key of requiredTop) if (!(key in brief)) errors.push(`missing top-level ${key}`);
if (![2, 3].includes(brief.schemaVersion)) errors.push("schemaVersion must be 2 or 3");
const phenomenonLed = brief.schemaVersion === 3;

const metadata = brief.metadata || {};
for (const key of ["episodeId", "slug", "version", "status", "approvedIdea", "language", "stylePreset", "targetSeconds", "researchRequired"]) {
  if (!(key in metadata) || metadata[key] === "") errors.push(`missing metadata.${key}`);
}
if (metadata.status !== "script-review") errors.push("metadata.status must be script-review");
if (!Number.isFinite(metadata.targetSeconds) || metadata.targetSeconds < 45 || metadata.targetSeconds > 60) errors.push("metadata.targetSeconds must be 45–60");
if (!Array.isArray(brief.topicKeywords) || brief.topicKeywords.length < 3 || brief.topicKeywords.length > 8) errors.push("topicKeywords must contain 3–8 entries");
const openingFrame = brief.creativeContract?.openingFrame;
for (const key of ["visualTension", "heroSubject", "contrast", "firstFrameCopy"]) {
  if (!openingFrame?.[key]) errors.push(`creativeContract.openingFrame missing ${key}`);
}

const voiceover = brief.voiceover || {};
const sections = voiceover.sections || {};
for (const name of ["hook", "body", "close"]) {
  const section = sections[name];
  if (!section) { errors.push(`missing voiceover.sections.${name}`); continue; }
  for (const key of ["displayText", "voiceText", "estimatedStartMs", "estimatedEndMs"]) if (!(key in section) || section[key] === "") errors.push(`missing ${name}.${key}`);
  if (!Number.isFinite(section.estimatedStartMs) || !Number.isFinite(section.estimatedEndMs) || section.estimatedEndMs <= section.estimatedStartMs) errors.push(`${name} has invalid timing`);
}
if (sections.hook && sections.hook.estimatedStartMs !== 0) errors.push("hook must start at zero");
if (sections.hook) {
  const duration = sections.hook.estimatedEndMs - sections.hook.estimatedStartMs;
  if (duration < 1000 || duration > 3000) errors.push("hook duration must be 1–3 seconds");
}
if (sections.close) {
  const duration = sections.close.estimatedEndMs - sections.close.estimatedStartMs;
  if (duration < 3000 || duration > 5000) errors.push("close duration must be 3–5 seconds");
}
if (sections.hook && sections.body && sections.hook.estimatedEndMs !== sections.body.estimatedStartMs) errors.push("hook and body are not contiguous");
if (sections.body && sections.close && sections.body.estimatedEndMs !== sections.close.estimatedStartMs) errors.push("body and close are not contiguous");
if (sections.close && Number.isFinite(metadata.targetSeconds) && sections.close.estimatedEndMs !== metadata.targetSeconds * 1000) errors.push("close must end at targetSeconds");
if (!sections.body?.story || !sections.body?.lesson) errors.push("body requires story and lesson");
if (!Array.isArray(sections.body?.actions) || sections.body.actions.length < 1 || sections.body.actions.length > 3) errors.push("body.actions must contain 1–3 actions");
if (!sections.close || !["save", "follow"].includes(sections.close.cta)) errors.push("close.cta must be save or follow");

const expectedDisplay = [sections.hook?.displayText, sections.body?.displayText, sections.close?.displayText].filter(Boolean).join(" ");
const expectedVoice = [sections.hook?.voiceText, sections.body?.voiceText, sections.close?.voiceText].filter(Boolean).join(" ");
if (voiceover.displayText !== expectedDisplay) errors.push("voiceover.displayText must equal the three display sections");
if (voiceover.voiceText !== expectedVoice) errors.push("voiceover.voiceText must equal the three voice sections");
if (/\d/.test(voiceover.voiceText || "")) errors.push("voiceText must spell numbers as words");
const displayCorpus = JSON.stringify({displayText: voiceover.displayText, onScreenCopy: brief.onScreenCopy});
if (/\b(?:bran-đing|mác-két-tinh|seo)\b/iu.test(displayCorpus)) errors.push("displayText contains a TTS pronunciation spelling");
if (/AGENCY MARKETING SERIES/i.test(raw)) errors.push("series labels must come from profile, not the script package");
if (phenomenonLed && /\b(?:branding|marketing|positioning|signal theory|prototype heuristic|decoy effect|social proof|reference price|perceived value)\b/i.test(sections.hook?.displayText || "")) errors.push("phenomenon-led hook must be jargon-free");

const continuousStage = brief.editBlueprint?.motionGrammar === "continuous-stage-v1";
const subjectLed = brief.editBlueprint?.visualGrammar === "subject-led-v1";
if (phenomenonLed && !continuousStage) errors.push("schemaVersion 3 requires continuous-stage-v1");
if (phenomenonLed && !subjectLed) errors.push("schemaVersion 3 requires subject-led-v1");
if (phenomenonLed && /\b(?:nguyên tắc|các bước|cách xây dựng)\b/i.test(brief.creativeContract?.title || "")) errors.push("phenomenon-led title is a generic knowledge headline");
const arcOrder = ["familiarHook", "curiosityBuild", "perspectiveFlip", "marketingDecode", "proof", "lesson", "application"];
const storyArc = brief.creativeContract?.storyArc;
const retentionPlan = brief.creativeContract?.retentionPlan;
if (phenomenonLed) {
  for (const key of ["mode", "viewerPrediction", "withheldAnswer", "plainLanguageMechanism", "theoryReveal", "resets"]) if (!(key in (retentionPlan || {})) || retentionPlan[key] === "") errors.push(`creativeContract.retentionPlan missing ${key}`);
  if (retentionPlan?.mode !== "business-phenomenon-decode-v1") errors.push("retentionPlan.mode must be business-phenomenon-decode-v1");
  for (const key of ["technicalLabel", "earliestMs", "plainLanguageAnchor"]) if (!(key in (retentionPlan?.theoryReveal || {})) || (retentionPlan.theoryReveal[key] === "" && key !== "technicalLabel")) errors.push(`retentionPlan.theoryReveal missing ${key}`);
  if (!Number.isInteger(retentionPlan?.theoryReveal?.earliestMs) || retentionPlan.theoryReveal.earliestMs < 10000) errors.push("theoryReveal.earliestMs must be at least 10000");
  if (retentionPlan?.theoryReveal?.plainLanguageAnchor && !expectedVoice.toLocaleLowerCase("vi").includes(String(retentionPlan.theoryReveal.plainLanguageAnchor).toLocaleLowerCase("vi"))) errors.push("theoryReveal.plainLanguageAnchor is not in voiceText");
  if (!Array.isArray(retentionPlan?.resets) || retentionPlan.resets.length < 5 || retentionPlan.resets.length > 7) errors.push("retentionPlan.resets must contain 5–7 entries");
  let previousResetMs = -1;
  for (const [index, reset] of (retentionPlan?.resets || []).entries()) {
    for (const key of ["id", "atMs", "trigger", "informationGain", "visualReset", "sceneFamily"]) if (!(key in reset) || reset[key] === "") errors.push(`retentionPlan reset ${index + 1} missing ${key}`);
    if (!/^R\d{2}$/i.test(reset.id || "")) errors.push(`retentionPlan reset ${index + 1} needs an R01-style ID`);
    if (!Number.isInteger(reset.atMs) || reset.atMs <= previousResetMs) errors.push("retentionPlan resets must increase");
    if (previousResetMs >= 0 && reset.atMs - previousResetMs > 10000) errors.push("retentionPlan reset gap exceeds 10 seconds");
    previousResetMs = reset.atMs;
  }
  if ((retentionPlan?.resets?.[0]?.atMs ?? -1) < 0 || retentionPlan?.resets?.[0]?.atMs > 3000) errors.push("first retention reset must be within 0–3 seconds");
  if ((retentionPlan?.resets?.at(-1)?.atMs || 0) < 40000) errors.push("retentionPlan needs a late proof, lesson, or application reset");
}
if (subjectLed) {
  const strategy = brief.creativeContract?.visualStrategy;
  for (const key of ["version", "recurringMotif", "motifRule", "sceneFamilies", "humanMoments"]) if (!(key in (strategy || {})) || strategy[key] === "") errors.push(`creativeContract.visualStrategy missing ${key}`);
  if (strategy?.version !== "subject-led-v1") errors.push("visualStrategy.version must be subject-led-v1");
  if (!Array.isArray(strategy?.sceneFamilies) || strategy.sceneFamilies.length < 5) errors.push("subject-led-v1 requires at least five planned scene families");
  if (!Array.isArray(strategy?.humanMoments) || strategy.humanMoments.length < 2) errors.push("subject-led-v1 requires at least two planned human/action moments");
}
if (continuousStage) {
  if (!brief.creativeContract?.narrativeObject) errors.push("continuous-stage-v1 requires creativeContract.narrativeObject");
  if (!storyArc || typeof storyArc !== "object") errors.push("continuous-stage-v1 requires creativeContract.storyArc");
  let arcEnd = 0;
  for (const name of arcOrder) {
    const stage = storyArc?.[name];
    if (!stage) { errors.push(`storyArc missing ${name}`); continue; }
    for (const key of ["startMs", "endMs", "purpose", "voiceAnchor", "visualProgression"]) if (!(key in stage) || stage[key] === "") errors.push(`storyArc.${name} missing ${key}`);
    if (!Number.isInteger(stage.startMs) || !Number.isInteger(stage.endMs) || stage.endMs <= stage.startMs) errors.push(`storyArc.${name} has invalid timing`);
    if (stage.startMs !== arcEnd) errors.push(`storyArc.${name} is not contiguous`);
    if (stage.voiceAnchor && !expectedVoice.toLocaleLowerCase("vi").includes(String(stage.voiceAnchor).toLocaleLowerCase("vi"))) errors.push(`storyArc.${name}.voiceAnchor is not in voiceText`);
    arcEnd = stage.endMs;
  }
  if (arcEnd !== metadata.targetSeconds * 1000) errors.push("storyArc must end at targetSeconds");
  if (phenomenonLed && retentionPlan?.theoryReveal?.technicalLabel && retentionPlan.theoryReveal.earliestMs < (storyArc?.marketingDecode?.startMs || 0)) errors.push("technical theory label cannot precede marketingDecode");
}

if (!Array.isArray(brief.sources)) errors.push("sources must be an array");
const needsSources = metadata.researchRequired || ["real", "current", "viral"].includes(brief.creativeContract?.caseType);
if (needsSources && brief.sources?.length === 0) errors.push("source is required for this case");
for (const [index, source] of (brief.sources || []).entries()) {
  for (const key of ["title", "url", "accessedAt", "supports"]) if (!source?.[key]) errors.push(`source ${index + 1} missing ${key}`);
  if (source?.url && !/^https?:\/\//i.test(source.url)) errors.push(`source ${index + 1} must use a direct http(s) URL`);
}

const cues = brief.visualCues;
if (!Array.isArray(cues)) errors.push("visualCues must be an array");
else {
  if (metadata.targetSeconds >= 45 && (cues.length < 20 || cues.length > 32)) errors.push("visualCues must contain 20–32 states for a 45–60 second video");
  let previousEnd = 0;
  const allowedCompositions = new Set(["solo", "compare", "sequence", "process", "code", "transform"]);
  const allowedCamera = new Set(["static", "push-in", "pull-out", "pan", "follow"]);
  const allowedTransitions = new Set(["cut", "match-move", "zoom-through", "mask-reveal", "reframe"]);
  const allowedEasing = new Set(["linear", "ease-out", "spring"]);
  const narrativeStagesByItem = new Map();
  const sceneFamilies = new Set();
  const retentionRoles = new Set();
  let humanActionCues = 0;
  let motifCues = 0;
  let motifOnlyRun = 0;
  let maxMotifOnlyRun = 0;
  cues.forEach((cue, index) => {
    if (!/^C\d{2}$/i.test(cue.id || "")) errors.push(`visual cue ${index + 1} needs a C01-style ID`);
    if (cue.startMs !== previousEnd) errors.push(`cue ${cue.id || index + 1} is not contiguous`);
    if (!Number.isInteger(cue.startMs) || !Number.isInteger(cue.endMs) || cue.endMs <= cue.startMs) errors.push(`cue ${cue.id || index + 1} has invalid timing`);
    if (cue.endMs - cue.startMs > 3000) errors.push(`cue ${cue.id || index + 1} holds longer than 3 seconds`);
    previousEnd = cue.endMs;
    if (!cue.spokenAnchor || !expectedVoice.toLocaleLowerCase("vi").includes(String(cue.spokenAnchor).toLocaleLowerCase("vi"))) errors.push(`cue ${cue.id || index + 1} spokenAnchor is not in voiceText`);
    if (!cue.semanticIntent) errors.push(`cue ${cue.id || index + 1} needs semanticIntent`);
    if (subjectLed) {
      for (const key of ["spokenSubject", "visualSubject", "visualReason", "sceneFamily", "continuityRole"]) if (!cue[key]) errors.push(`cue ${cue.id || index + 1} missing subject-led ${key}`);
      if (!["motif-anchor", "literal-evidence", "human-action", "context", "proof", "application"].includes(cue.continuityRole)) errors.push(`cue ${cue.id || index + 1} has invalid continuityRole`);
      if (cue.sceneFamily) sceneFamilies.add(cue.sceneFamily);
      if (cue.continuityRole === "human-action") humanActionCues += 1;
    }
    if (phenomenonLed) {
      const allowedRetentionRoles = ["hook-puzzle", "viewer-prediction", "story-progress", "perspective-flip", "mechanism-decode", "proof-evidence", "application-audit", "cta"];
      if (!allowedRetentionRoles.includes(cue.retentionRole)) errors.push(`cue ${cue.id || index + 1} needs a valid retentionRole`);
      else retentionRoles.add(cue.retentionRole);
    }
    if (!allowedCompositions.has(cue.composition)) errors.push(`cue ${cue.id || index + 1} has invalid composition`);
    if (continuousStage) {
      if (!allowedCamera.has(cue.camera?.mode) || !["subtle", "medium"].includes(cue.camera?.intensity)) errors.push(`cue ${cue.id || index + 1} needs valid continuous-stage camera`);
      if (!allowedTransitions.has(cue.transition)) errors.push(`cue ${cue.id || index + 1} needs valid continuous-stage transition`);
    }
    if (!Array.isArray(cue.items) || cue.items.length < 1 || cue.items.length > 3) errors.push(`cue ${cue.id || index + 1} must contain 1–3 items`);
    if (cue.composition === "solo" && cue.items?.length !== 1) errors.push(`solo cue ${cue.id} must contain exactly one item`);
    if (cue.composition === "compare" && cue.items?.length !== 2) errors.push(`compare cue ${cue.id} must contain exactly two items`);
    if (["sequence", "process"].includes(cue.composition) && ![2, 3].includes(cue.items?.length)) errors.push(`${cue.composition} cue ${cue.id} must contain two or three items`);
    for (const item of cue.items || []) {
      if (!continuousStage) continue;
      const transform = item.transform;
      for (const endpoint of ["from", "to"]) for (const key of ["x", "y", "scale", "rotation", "opacity"]) {
        if (!Number.isFinite(transform?.[endpoint]?.[key])) errors.push(`item ${item.id || "unknown"} transform.${endpoint}.${key} must be numeric`);
      }
      if (!allowedEasing.has(transform?.easing)) errors.push(`item ${item.id || "unknown"} needs valid transform easing`);
      if (["menu", "price-board", "checklist", "chart", "interface"].includes(item.codeTemplate) && item.semanticRole !== "evidence") errors.push(`semantic code item ${item.id || "unknown"} must use semanticRole evidence`);
      if (item.codeTemplate === "card") errors.push(`decorative card ${item.id || "unknown"} is forbidden in continuous-stage-v1`);
      const stageName = arcOrder.find((name) => cue.startMs >= (storyArc?.[name]?.startMs ?? Infinity) && cue.startMs < (storyArc?.[name]?.endMs ?? -Infinity));
      if (stageName) {
        const stages = narrativeStagesByItem.get(item.id) || new Set();
        stages.add(stageName);
        narrativeStagesByItem.set(item.id, stages);
      }
    }
    if (subjectLed) {
      const hasMotif = cue.items?.some((item) => item.motifKey);
      const motifOnly = hasMotif && cue.items.every((item) => item.motifKey || item.semanticRole === "accent");
      if (hasMotif) motifCues += 1;
      motifOnlyRun = motifOnly ? motifOnlyRun + 1 : 0;
      maxMotifOnlyRun = Math.max(maxMotifOnlyRun, motifOnlyRun);
    }
  });
  if (Number.isFinite(metadata.targetSeconds) && previousEnd !== metadata.targetSeconds * 1000) errors.push("visualCues must end at targetSeconds");
  const openingCue = cues[0];
  if (openingCue) {
    const openingDuration = openingCue.endMs - openingCue.startMs;
    if (openingCue.startMs !== 0 || openingDuration < 600 || openingDuration > 1200) errors.push("opening thumbnail cue must run 0.6–1.2 seconds from zero");
    if (openingCue.items?.length > 2) errors.push("opening thumbnail cue cannot use a three-item grid");
    if (phenomenonLed && openingCue.retentionRole !== "hook-puzzle") errors.push("phenomenon-led opening cue must use retentionRole hook-puzzle");
  }
  if (continuousStage) {
    if (!subjectLed && ![...narrativeStagesByItem.values()].some((stages) => stages.size >= 4)) errors.push("continuous-stage-v1 requires one stable narrative object across at least four storyArc stages");
    if (!cues.some((cue) => cue.exit === "carry")) errors.push("continuous-stage-v1 requires at least one carry cue");
    if (!cues.some((cue) => cue.exit === "transform")) errors.push("continuous-stage-v1 requires at least one transform cue");
  }
  if (subjectLed) {
    const motifShare = cues.length ? motifCues / cues.length : 0;
    if (sceneFamilies.size < 5) errors.push("subject-led-v1 requires at least five scene families in visualCues");
    if (humanActionCues < 2) errors.push("subject-led-v1 requires at least two human-action cues");
    if (motifShare < 0.25 || motifShare > 0.55) errors.push("subject-led-v1 recurring motif must occupy 25–55 percent of cues");
    if (maxMotifOnlyRun > 2) errors.push("subject-led-v1 forbids more than two consecutive motif-only cues");
  }
  if (phenomenonLed) {
    for (const role of ["hook-puzzle", "viewer-prediction", "story-progress", "perspective-flip", "mechanism-decode", "proof-evidence", "application-audit", "cta"]) if (!retentionRoles.has(role)) errors.push(`phenomenon-led visualCues missing retentionRole ${role}`);
    if (cues.at(-1)?.retentionRole !== "cta") errors.push("phenomenon-led final cue must use retentionRole cta");
    const cueStarts = new Set(cues.map((cue) => cue.startMs));
    for (const reset of retentionPlan?.resets || []) if (!cueStarts.has(reset.atMs)) errors.push(`retention reset ${reset.id || "unknown"} must begin on a visual cue`);
    if ((retentionPlan?.resets?.at(-1)?.atMs || 0) >= (sections.close?.estimatedEndMs || Infinity)) errors.push("final retention reset must occur before the close ends");
  }
}

for (const [index, asset] of (brief.assets || []).entries()) {
  if (asset.sourceType === "generated" && asset.provider !== "flow-agent") errors.push(`generated asset ${asset.id || index + 1} must use provider flow-agent`);
  if (asset.sourceType === "generated" && asset.stickerTreatment !== "remotion-paper") errors.push(`generated asset ${asset.id || index + 1} must use remotion-paper`);
  if (asset.sourceType === "generated" && !/uniform chroma green\s*#00ff00/i.test(asset.mediaPrompt || "")) errors.push(`generated asset ${asset.id || index + 1} must require uniform chroma green #00FF00`);
  if (asset.sourceType === "generated" && !/no (?:gradient|texture|vignette|shadow)/i.test(asset.mediaPrompt || "")) errors.push(`generated asset ${asset.id || index + 1} must exclude non-flat background treatment`);
  if (asset.stickerTreatment === "remotion-paper" && asset.hasBakedContour) errors.push(`asset ${asset.id || index + 1} would receive double backing`);
}
if (brief.approval?.status !== "script-review") errors.push("approval.status must be script-review");
if (!brief.quotaPlan?.idempotencyPrefix) errors.push("quotaPlan.idempotencyPrefix is required");

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}
console.log(`PASS: JSON script package contract satisfied with ${cues.length} voice-led cues → ${file}`);
