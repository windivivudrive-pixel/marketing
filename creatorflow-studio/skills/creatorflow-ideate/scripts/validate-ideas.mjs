#!/usr/bin/env node

import {readFile} from "node:fs/promises";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node validate-ideas.mjs <ideas.json>");
  process.exit(2);
}
const file = path.resolve(input);
const data = JSON.parse(await readFile(file, "utf8"));
const errors = [];
if (![2, 3].includes(data.schemaVersion)) errors.push("schemaVersion must be 2 or 3");
const phenomenonLed = data.schemaVersion === 3;
const single = process.argv.includes("--single");
if (!Array.isArray(data.ideas) || (single ? data.ideas?.length !== 1 : data.ideas?.length < 6 || data.ideas?.length > 10)) errors.push(single ? "ideas must contain exactly one entry in --single mode" : "ideas must contain 6–10 entries");
const ids = new Set();
for (const [index, idea] of (data.ideas || []).entries()) {
  for (const key of ["id", "rank", "title", "lane", "status", "painPoint", "viewerQuestion", "caseStory", "curiosityParadox", "brandingLesson", "actionablePayoff", "visualSeed", "rightsStatus", "estimatedImageCalls", "productionCost", "totalScore", "storyPattern", "familiarOpening", "narrativeObject", "curiosityGap", "hiddenMechanism", "marketingBridge", "proofMove", "singleLesson", "immediateApplication"]) {
    if (!(key in idea) || idea[key] === "") errors.push(`idea ${index + 1} missing ${key}`);
  }
  if (ids.has(idea.id)) errors.push(`duplicate idea id ${idea.id}`);
  ids.add(idea.id);
  if (!Array.isArray(idea.topicKeywords) || idea.topicKeywords.length < 3 || idea.topicKeywords.length > 8) errors.push(`idea ${idea.id || index + 1} needs 3–8 topicKeywords`);
  if (!Array.isArray(idea.evidence)) errors.push(`idea ${idea.id || index + 1} evidence must be an array`);
  if (idea.storyPattern !== "everyday-object-reveal" && !idea.patternReason) errors.push(`idea ${idea.id || index + 1} non-default storyPattern needs patternReason`);
  if (!Array.isArray(idea.motionPotential) || idea.motionPotential.length < 2) errors.push(`idea ${idea.id || index + 1} needs at least two motionPotential transformations`);
  if (!Array.isArray(idea.sceneOpportunities) || idea.sceneOpportunities.length < 5 || idea.sceneOpportunities.length > 8) errors.push(`idea ${idea.id || index + 1} needs 5–8 sceneOpportunities`);
  const sceneFamilies = new Set();
  const retentionLayers = new Set();
  let humanActions = 0;
  let motifAbsent = 0;
  for (const scene of idea.sceneOpportunities || []) {
    for (const key of ["voiceSubject", "literalVisual", "action", "sceneFamily", "humanAction", "motifPresent"]) if (!(key in scene) || scene[key] === "") errors.push(`idea ${idea.id || index + 1} sceneOpportunity missing ${key}`);
    if (scene.sceneFamily) sceneFamilies.add(scene.sceneFamily);
    if (phenomenonLed) {
      if (!["hook-puzzle", "story-action", "proof-evidence", "mechanism-decode", "application-audit"].includes(scene.retentionLayer)) errors.push(`idea ${idea.id || index + 1} sceneOpportunity needs a valid retentionLayer`);
      else retentionLayers.add(scene.retentionLayer);
    }
    if (scene.humanAction === true) humanActions += 1;
    if (scene.motifPresent === false) motifAbsent += 1;
  }
  if (sceneFamilies.size < 5) errors.push(`idea ${idea.id || index + 1} needs at least five scene families`);
  if (humanActions < 2) errors.push(`idea ${idea.id || index + 1} needs at least two human/action scenes`);
  if (motifAbsent < 2) errors.push(`idea ${idea.id || index + 1} must let the recurring motif leave in at least two scenes`);
  if (phenomenonLed && retentionLayers.size < 5) errors.push(`idea ${idea.id || index + 1} must cover all five retention layers`);
  if (!idea.motifUsage || !Array.isArray(idea.motifUsage.returnPoints) || idea.motifUsage.returnPoints.length < 2) errors.push(`idea ${idea.id || index + 1} needs motifUsage returnPoints`);
  if (!Number.isInteger(idea.motifUsage?.maxConsecutiveMotifOnlyScenes) || idea.motifUsage.maxConsecutiveMotifOnlyScenes > 2) errors.push(`idea ${idea.id || index + 1} motif-only run must be two scenes or fewer`);
  if (!Number.isFinite(idea.motifUsage?.targetCueShare) || idea.motifUsage.targetCueShare < 0.25 || idea.motifUsage.targetCueShare > 0.55) errors.push(`idea ${idea.id || index + 1} motif targetCueShare must be 0.25–0.55`);
  for (const score of ["openingFamiliarity", "curiosityGap", "narrativeObjectStrength", "semanticVisualCoverage", "sceneVariety", "motionPotential", "singleLessonClarity", "immediateApplicability"]) {
    if (!Number.isInteger(idea.scores?.[score]) || idea.scores[score] < 1 || idea.scores[score] > 5) errors.push(`idea ${idea.id || index + 1} scores.${score} must be 1–5`);
  }
  if ((idea.scores?.semanticVisualCoverage || 0) < 4 || (idea.scores?.sceneVariety || 0) < 4) errors.push(`idea ${idea.id || index + 1} must score at least four for semantic visual coverage and scene variety`);
  if (phenomenonLed) {
    for (const [group, keys] of Object.entries({
      phenomenon: ["observableMoment", "businessStake", "viewerPrediction", "visibleContradiction"],
      hookDesign: ["mode", "spokenHook", "withheldAnswer", "broadAudienceBridge"],
      theoryBridge: ["plainLanguageMechanism", "technicalLabel", "earliestRevealSecond"],
      proofPlan: ["primaryClaim", "evidenceType", "sourceNeeded", "visualProof"]
    })) {
      for (const key of keys) if (!(key in (idea[group] || {})) || (idea[group]?.[key] === "" && !(group === "theoryBridge" && key === "technicalLabel"))) errors.push(`idea ${idea.id || index + 1} ${group} missing ${key}`);
    }
    if (!["prediction-puzzle", "visible-paradox", "price-context-contrast", "identity-boundary"].includes(idea.hookDesign?.mode)) errors.push(`idea ${idea.id || index + 1} has invalid hookDesign.mode`);
    const hookWords = String(idea.hookDesign?.spokenHook || "").trim().split(/\s+/).filter(Boolean).length;
    if (hookWords < 4 || hookWords > 22) errors.push(`idea ${idea.id || index + 1} spokenHook must contain 4–22 words`);
    if (/\b(?:branding|marketing|positioning|signal theory|prototype heuristic|decoy effect|social proof|reference price|perceived value)\b/i.test(idea.hookDesign?.spokenHook || "")) errors.push(`idea ${idea.id || index + 1} spokenHook must be jargon-free`);
    if (/\b(?:nguyên tắc|các bước|cách xây dựng)\b/i.test(idea.title || "")) errors.push(`idea ${idea.id || index + 1} title is a generic knowledge headline`);
    if (!Number.isFinite(idea.theoryBridge?.earliestRevealSecond) || idea.theoryBridge.earliestRevealSecond < 10) errors.push(`idea ${idea.id || index + 1} theory label cannot appear before 10 seconds`);
    if (!Array.isArray(idea.retentionResets) || idea.retentionResets.length < 5 || idea.retentionResets.length > 7) errors.push(`idea ${idea.id || index + 1} needs 5–7 retentionResets`);
    let previousReset = -1;
    for (const [resetIndex, reset] of (idea.retentionResets || []).entries()) {
      for (const key of ["atSecond", "trigger", "informationGain", "visualReset", "sceneFamily"]) if (!(key in reset) || reset[key] === "") errors.push(`idea ${idea.id || index + 1} retentionReset ${resetIndex + 1} missing ${key}`);
      if (!Number.isFinite(reset.atSecond) || reset.atSecond <= previousReset) errors.push(`idea ${idea.id || index + 1} retentionResets must increase`);
      if (previousReset >= 0 && reset.atSecond - previousReset > 10) errors.push(`idea ${idea.id || index + 1} retention reset gap exceeds 10 seconds`);
      previousReset = reset.atSecond;
    }
    if (idea.retentionResets?.[0]?.atSecond < 0 || idea.retentionResets?.[0]?.atSecond > 3) errors.push(`idea ${idea.id || index + 1} first retention reset must be within 0–3 seconds`);
    if ((idea.retentionResets?.at(-1)?.atSecond || 0) < 40) errors.push(`idea ${idea.id || index + 1} needs a late proof, lesson, or application reset`);
    for (const score of ["viewerParticipation", "broadAudienceReach", "proofReadiness", "retentionResetStrength"]) {
      if (!Number.isInteger(idea.scores?.[score]) || idea.scores[score] < 4 || idea.scores[score] > 5) errors.push(`idea ${idea.id || index + 1} scores.${score} must be 4–5`);
    }
    if (idea.proofPlan?.sourceNeeded === true && !(idea.evidence || []).length) errors.push(`idea ${idea.id || index + 1} proofPlan requires evidence`);
  }
  for (const source of idea.evidence || []) for (const key of ["title", "url", "accessedAt", "supports"]) if (!source?.[key]) errors.push(`idea ${idea.id || index + 1} evidence missing ${key}`);
  if (idea.viralEvidence?.status === "VIRAL" && (!idea.viralEvidence.signal || !idea.viralEvidence.observedAt)) errors.push(`idea ${idea.id || index + 1} viral claim lacks dated evidence`);
  if (!["NEW", "ADJACENT"].includes(idea.status)) errors.push(`idea ${idea.id || index + 1} has invalid status`);
}
if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}
console.log(`PASS: ${data.ideas.length} ranked story-led ideas → ${file}`);
