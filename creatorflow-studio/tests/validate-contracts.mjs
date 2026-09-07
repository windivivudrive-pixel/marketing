#!/usr/bin/env node

import {mkdir, mkdtemp, readFile, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const briefValidator = path.join(root, "skills/creatorflow-script/scripts/validate-brief.mjs");
const reviewRenderer = path.join(root, "skills/creatorflow-script/scripts/render-script-review.mjs");
const ideaValidator = path.join(root, "skills/creatorflow-ideate/scripts/validate-ideas.mjs");
const ideaRenderer = path.join(root, "skills/creatorflow-ideate/scripts/render-ideas-review.mjs");
const episodeValidator = path.join(root, "assets/remotion-starter/scripts/validate-episode.mjs");
const profileValidator = path.join(root, "scripts/validate-profile.mjs");
const flowCheckScript = path.join(root, "scripts/check-flow-agent.mjs");
const flowEnsureScript = path.join(root, "scripts/ensure-flow-agent.mjs");
const watermarkScript = path.join(root, "scripts/remove-gemini-visible-watermark.mjs");
const watermarkCli = path.join(root, "node_modules/.bin/gwr");
const fixture = path.join(root, "tests/fixtures/valid-script.json");
const legacyFixture = path.join(root, "tests/fixtures/valid-brief.md");
const episodePath = path.join(root, "assets/remotion-starter/src/data/episode.json");
const captionsPath = path.join(root, "assets/remotion-starter/src/data/captions.json");
const wordsPath = path.join(root, "assets/remotion-starter/src/data/words.json");
const captionsComponent = path.join(root, "assets/remotion-starter/src/components/Captions.tsx");
const trimScript = path.join(root, "assets/remotion-starter/scripts/trim-voice-silence.mjs");
const temp = await mkdtemp(path.join(os.tmpdir(), "creatorflow-contracts-"));
let failures = 0;

const run = (args) => spawnSync(process.execPath, args, {encoding: "utf8"});
const expect = (name, result, shouldPass, marker = "") => {
  const output = `${result.stdout}\n${result.stderr}`;
  const ok = shouldPass ? result.status === 0 && (!marker || output.includes(marker)) : result.status !== 0 && (!marker || output.includes(marker));
  if (!ok) {
    failures += 1;
    console.error(`FAIL: ${name}\n${output}`);
  } else console.log(`PASS: ${name}`);
};

const fileExists = async (target) => {
  try { await readFile(target); return true; } catch { return false; }
};

expect("valid JSON script", run([briefValidator, fixture]), true, "voice-led cues");
expect("legacy Markdown remains readable", run([briefValidator, legacyFixture, "--legacy"]), true, "read-only");
const validScript = JSON.parse(await readFile(fixture, "utf8"));
const scriptCases = [
  ["missing topic keywords", (copy) => { copy.topicKeywords = []; }, "topicKeywords"],
  ["missing opening thumbnail contract", (copy) => { delete copy.creativeContract.openingFrame; }, "openingFrame missing"],
  ["missing source", (copy) => { copy.sources = []; }, "source is required"],
  ["missing body section", (copy) => { delete copy.voiceover.sections.body; }, "missing voiceover.sections.body"],
  ["wrong approval", (copy) => { copy.approval.status = "approved"; }, "approval.status must be script-review"],
  ["digits in voice text", (copy) => { copy.voiceover.voiceText = copy.voiceover.voiceText.replace("ba", "3"); }, "voiceText must spell numbers"],
  ["phonetic display spelling", (copy) => { copy.voiceover.displayText = copy.voiceover.displayText.replace("branding", "bran-đing"); }, "TTS pronunciation"],
  ["cue gap", (copy) => { copy.visualCues[1].startMs = 2600; }, "is not contiguous"],
  ["four cue items", (copy) => { copy.visualCues[0].items.push({id:"x1",kind:"code",role:"x"},{id:"x2",kind:"code",role:"x"},{id:"x3",kind:"code",role:"x"}); }, "must contain 1–3 items"],
  ["long cue", (copy) => { copy.visualCues[0].endMs = 3500; copy.visualCues[1].startMs = 3500; }, "holds longer than 3 seconds"],
  ["opening thumbnail too long", (copy) => { copy.visualCues[0].endMs = 1400; copy.visualCues[1].startMs = 1400; }, "opening thumbnail cue"],
  ["opening thumbnail grid", (copy) => { copy.visualCues[0].items.push({id:"hook-b",kind:"code",role:"b"},{id:"hook-c",kind:"code",role:"c"}); }, "opening thumbnail cue cannot use"],
  ["generated prompt is not flat green", (copy) => { copy.assets[0].mediaPrompt = "paper scene on green background"; }, "must require uniform chroma green"],
  ["double sticker backing", (copy) => { copy.assets[0].hasBakedContour = true; }, "double backing"],
  ["non-Flow generated asset", (copy) => { copy.assets[0].provider = "another-platform"; }, "must use provider flow-agent"],
  ["hard-coded series label", (copy) => { copy.creativeContract.title = "AGENCY MARKETING SERIES"; }, "series labels must come from profile"]
];
for (const [name, mutate, marker] of scriptCases) {
  const copy = structuredClone(validScript);
  mutate(copy);
  const file = path.join(temp, `${name.replace(/\s+/g, "-")}.json`);
  await writeFile(file, JSON.stringify(copy, null, 2));
  expect(name, run([briefValidator, file]), false, marker);
}

const reviewPath = path.join(temp, "valid-script.review.md");
expect("script review generation", run([reviewRenderer, fixture, reviewPath]), true, "review generated");
const review = await readFile(reviewPath, "utf8");
if (!review.includes("FINAL VOICEOVER") || !review.includes("Chỉ sửa file JSON nguồn")) {
  failures += 1;
  console.error("FAIL: generated review does not identify JSON as source of truth");
} else console.log("PASS: generated review is JSON-derived");

const continuousScript = structuredClone(validScript);
continuousScript.creativeContract.narrativeObject = "Chai nước";
continuousScript.creativeContract.storyArc = {
  familiarHook: {startMs:0,endMs:3000,purpose:"Mở bằng chai nước quen thuộc",voiceAnchor:"Một chai nước",visualProgression:"Chai nước và giá xuất hiện"},
  curiosityBuild: {startMs:3000,endMs:10000,purpose:"Tạo câu hỏi về giá",voiceAnchor:"Khách không mua",visualProgression:"Chai nước di chuyển khỏi tủ lạnh"},
  perspectiveFlip: {startMs:10000,endMs:18000,purpose:"Lật sang cảm giác quà tặng",voiceAnchor:"họ mua cảm giác",visualProgression:"Chai nước ghép với bó hoa"},
  marketingDecode: {startMs:18000,endMs:31000,purpose:"Giải mã bối cảnh",voiceAnchor:"Cách trưng bày",visualProgression:"Máy quay reframe hai bối cảnh"},
  proof: {startMs:31000,endMs:42000,purpose:"Chứng minh bằng đối chiếu",voiceAnchor:"trong món đồ",visualProgression:"Chai nước tách khỏi rồi quay lại bối cảnh"},
  lesson: {startMs:42000,endMs:46000,purpose:"Chốt một bài học",voiceAnchor:"khách cần sản phẩm",visualProgression:"Khoanh bối cảnh sử dụng"},
  application: {startMs:46000,endMs:50000,purpose:"Cho hành động và CTA",voiceAnchor:"Lưu video này",visualProgression:"Chai nước dẫn tới nút lưu"}
};
continuousScript.editBlueprint.motionGrammar = "continuous-stage-v1";
continuousScript.visualCues.forEach((cue, index) => {
  cue.camera = {mode: index % 5 === 0 ? "push-in" : "static", intensity: "subtle"};
  cue.transition = index === 0 ? "cut" : "match-move";
  cue.items.forEach((item) => {
    item.transform = {from:{x:0,y:0,scale:1,rotation:0,opacity:1},to:{x:index % 2 ? 24 : -24,y:0,scale:1.04,rotation:0,opacity:1},easing:"ease-out"};
    if (["checklist", "chart"].includes(item.codeTemplate)) item.semanticRole = "evidence";
  });
});
for (const index of [0, 5, 10, 15]) continuousScript.visualCues[index].items[0].id = "narrative-object";
continuousScript.visualCues[0].exit = "carry";
continuousScript.visualCues[5].exit = "transform";
const continuousPath = path.join(temp, "continuous-script.json");
await writeFile(continuousPath, JSON.stringify(continuousScript, null, 2));
expect("continuous-stage script", run([briefValidator, continuousPath]), true, "voice-led cues");
const noCamera = structuredClone(continuousScript);
delete noCamera.visualCues[0].camera;
const noCameraPath = path.join(temp, "continuous-no-camera.json");
await writeFile(noCameraPath, JSON.stringify(noCamera, null, 2));
expect("continuous stage requires camera", run([briefValidator, noCameraPath]), false, "continuous-stage camera");

const phenomenonScript = structuredClone(continuousScript);
phenomenonScript.schemaVersion = 3;
phenomenonScript.editBlueprint.visualGrammar = "subject-led-v1";
phenomenonScript.creativeContract.visualStrategy = {
  version: "subject-led-v1",
  recurringMotif: "Chai nước",
  motifRule: "Chỉ quay lại khi chai nước còn giúp giải thích voice",
  sceneFamilies: ["hook-product", "human-choice", "context-contrast", "mechanism", "application"],
  humanMoments: ["Khách chọn chai nước", "Chủ shop sửa cách trưng bày"]
};
phenomenonScript.creativeContract.retentionPlan = {
  mode: "business-phenomenon-decode-v1",
  viewerPrediction: "Chai nước đắt hơn vì có nhiều nước hơn",
  withheldAnswer: "Bối cảnh quà tặng làm đổi cách khách hiểu giá trị",
  plainLanguageMechanism: "Khách dùng những thứ xung quanh món đồ để đoán nó đáng giá bao nhiêu",
  theoryReveal: {technicalLabel:"Context effect",earliestMs:18000,plainLanguageAnchor:"họ mua cảm giác"},
  resets: [
    {id:"R01",atMs:0,trigger:"Giá cao nhưng bán hết",informationGain:"Có một nghịch lý cần giải",visualReset:"Chai nước và giá đối lập",sceneFamily:"hook-product"},
    {id:"R02",atMs:7500,trigger:"Khách mua cảm giác",informationGain:"Giả định dung tích bị bác bỏ",visualReset:"Khách nhận quà",sceneFamily:"human-choice"},
    {id:"R03",atMs:15000,trigger:"Chai chuyển cạnh bó hoa",informationGain:"Bối cảnh mới xuất hiện",visualReset:"Tủ lạnh đổi thành bàn quà",sceneFamily:"context-contrast"},
    {id:"R04",atMs:22500,trigger:"Cách hiểu thay đổi",informationGain:"Cơ chế được giải mã",visualReset:"Sơ đồ bối cảnh tới giá trị",sceneFamily:"mechanism"},
    {id:"R05",atMs:32500,trigger:"Giá trị nằm trong hoàn cảnh",informationGain:"Bài học được chứng minh",visualReset:"Hai bối cảnh đối chiếu",sceneFamily:"context-contrast"},
    {id:"R06",atMs:42500,trigger:"Viết một tình huống",informationGain:"Người xem có bài kiểm tra",visualReset:"Chủ shop viết lại tình huống",sceneFamily:"application"}
  ]
};
const retentionRoleByIndex = new Map([[0,"hook-puzzle"],[1,"viewer-prediction"],[4,"perspective-flip"],[8,"mechanism-decode"],[12,"proof-evidence"],[17,"application-audit"],[20,"cta"]]);
const subjectFamilies = ["hook-product", "human-choice", "context-contrast", "mechanism", "application"];
phenomenonScript.visualCues.forEach((cue, index) => {
  cue.spokenSubject = cue.semanticIntent;
  cue.visualSubject = cue.items.map((item) => item.role).join(" và ");
  cue.visualReason = `Minh họa trực tiếp ${cue.semanticIntent.toLocaleLowerCase("vi")}`;
  cue.sceneFamily = subjectFamilies[index % subjectFamilies.length];
  cue.continuityRole = [3, 13].includes(index) ? "human-action" : index >= 17 ? "application" : "literal-evidence";
  cue.retentionRole = retentionRoleByIndex.get(index) || "story-progress";
  if ([0, 3, 6, 9, 12, 15, 18, 20].includes(index)) cue.items[0].motifKey = "water-bottle";
});
const phenomenonPath = path.join(temp, "phenomenon-script.json");
await writeFile(phenomenonPath, JSON.stringify(phenomenonScript, null, 2));
expect("phenomenon-led script", run([briefValidator, phenomenonPath]), true, "voice-led cues");
const missingRetentionRole = structuredClone(phenomenonScript);
delete missingRetentionRole.visualCues[8].retentionRole;
const missingRetentionRolePath = path.join(temp, "phenomenon-missing-retention-role.json");
await writeFile(missingRetentionRolePath, JSON.stringify(missingRetentionRole, null, 2));
expect("phenomenon script requires retention roles", run([briefValidator, missingRetentionRolePath]), false, "retentionRole");

const ideaBase = (index) => ({
  id: `I${String(index + 1).padStart(2, "0")}`,
  rank: index + 1,
  title: index === 0 ? "Evergreen: chai nước bên bó hoa" : index === 1 ? "Current: bao bì đang được chia sẻ" : `Brand story ${index + 1}`,
  lane: index === 1 ? "CURRENT" : "EVERGREEN",
  status: "NEW",
  painPoint: "Khách chưa hiểu giá trị",
  viewerQuestion: "Vì sao cùng sản phẩm lại được hiểu khác nhau?",
  caseStory: "Một cách trưng bày cụ thể làm đổi bối cảnh sử dụng.",
  curiosityParadox: "Giá cao hơn nhưng khách vẫn chọn.",
  brandingLesson: "Bối cảnh định hình giá trị cảm nhận.",
  actionablePayoff: "Viết lại một tình huống sử dụng.",
  storyPattern: "everyday-object-reveal",
  familiarOpening: "Một chai nước đứng cạnh bó hoa",
  narrativeObject: "Chai nước",
  curiosityGap: "Vì sao cùng chai nước lại được hiểu khác?",
  hiddenMechanism: "Bối cảnh làm đổi cách người mua diễn giải món đồ.",
  marketingBridge: "Trong marketing, đó là thiết kế bối cảnh giá trị.",
  proofMove: "Di chuyển chai nước từ tủ lạnh sang bó hoa.",
  singleLesson: "Bối cảnh định hình giá trị cảm nhận.",
  immediateApplication: "Viết một tình huống khách cần sản phẩm.",
  motionPotential: ["Chai nước trượt khỏi tủ lạnh", "Chai nước ghép với bó hoa"],
  sceneOpportunities: [
    {voiceSubject:"chai nước",literalVisual:"chai nước trong tủ lạnh",action:"đứng giữa các chai khác",sceneFamily:"product-context",humanAction:false,motifPresent:true},
    {voiceSubject:"khách",literalVisual:"bàn tay khách lấy chai",action:"mở cửa tủ và chọn",sceneFamily:"human-choice",humanAction:true,motifPresent:true},
    {voiceSubject:"món quà",literalVisual:"người bán gói bó hoa",action:"buộc nơ quanh bó hoa",sceneFamily:"service-action",humanAction:true,motifPresent:false},
    {voiceSubject:"bối cảnh",literalVisual:"tủ lạnh đối chiếu bàn quà",action:"khung hình tách hai nơi",sceneFamily:"location-contrast",humanAction:false,motifPresent:true},
    {voiceSubject:"cách khách hiểu",literalVisual:"người nhận mở quà",action:"mỉm cười và đặt hoa lên bàn",sceneFamily:"human-reaction",humanAction:true,motifPresent:false}
  ],
  motifUsage: {returnPoints:["hook","proof","lesson"],maxConsecutiveMotifOnlyScenes:2,targetCueShare:0.4},
  topicKeywords: ["định vị", "bối cảnh", "giá trị"],
  evidence: [{title:"Example",url:"https://example.com/story",accessedAt:"2026-08-17",supports:"Case fixture"}],
  viralEvidence: index === 1 ? {status:"VIRAL",signal:"public share count",observedAt:"2026-08-17"} : {status:"NOT_CLAIMED",signal:"",observedAt:""},
  visualSeed: "Sản phẩm và bối cảnh đặt cạnh nhau",
  rightsStatus: "RESEARCH_REQUIRED",
  estimatedImageCalls: 2,
  productionCost: "MEDIUM",
  scores: {story:5,evidence:4,openingFamiliarity:5,curiosityGap:5,narrativeObjectStrength:5,semanticVisualCoverage:5,sceneVariety:5,motionPotential:4,singleLessonClarity:5,immediateApplicability:5},
  totalScore: 42
});
const ideas = {schemaVersion:2,generatedAt:"2026-08-17T00:00:00.000Z",profile:"creatorflow/profile.json",ideas:Array.from({length:6},(_, index) => ideaBase(index))};
const ideasPath = path.join(temp, "ideas.json");
await writeFile(ideasPath, JSON.stringify(ideas, null, 2));
expect("evergreen and current idea package", run([ideaValidator, ideasPath]), true, "6 ranked");
expect("idea review generation", run([ideaRenderer, ideasPath]), true, "idea review generated");
const invalidIdeas = structuredClone(ideas);
invalidIdeas.ideas[1].viralEvidence.observedAt = "";
const invalidIdeasPath = path.join(temp, "ideas-invalid.json");
await writeFile(invalidIdeasPath, JSON.stringify(invalidIdeas, null, 2));
expect("viral idea needs dated evidence", run([ideaValidator, invalidIdeasPath]), false, "lacks dated evidence");

const phenomenonIdeas = structuredClone(ideas);
phenomenonIdeas.schemaVersion = 3;
phenomenonIdeas.ideas.forEach((idea) => {
  idea.phenomenon = {
    observableMoment: "Một chai nước đổi giá khi được đặt cạnh bó hoa",
    businessStake: "Chủ shop có thể đang trình bày sai bối cảnh giá trị",
    viewerPrediction: "Chai đắt hơn vì có nhiều nước hơn",
    visibleContradiction: "Dung tích không đổi nhưng mức giá và cách khách phản ứng thay đổi"
  };
  idea.hookDesign = {
    mode: "price-context-contrast",
    spokenHook: "Cùng chai nước này, sao đặt cạnh bó hoa lại đắt gấp ba?",
    withheldAnswer: "Bối cảnh làm đổi cách khách hiểu món đồ",
    broadAudienceBridge: "Người mua nhận ra tình huống, chủ shop nhận ra vấn đề trưng bày"
  };
  idea.theoryBridge = {plainLanguageMechanism:"Khách nhìn bối cảnh để đoán giá trị",technicalLabel:"Context effect",earliestRevealSecond:12};
  idea.proofPlan = {primaryClaim:"Bối cảnh làm thay đổi giá trị cảm nhận",evidenceType:"documented-case",sourceNeeded:true,visualProof:"Đối chiếu cùng sản phẩm trong hai bối cảnh"};
  idea.retentionResets = [
    {atSecond:0,trigger:"Giá đối lập",informationGain:"Mở câu hỏi",visualReset:"Chai và giá",sceneFamily:"product-context"},
    {atSecond:8,trigger:"Khách tự đoán",informationGain:"Giả định dung tích",visualReset:"Bàn tay chọn",sceneFamily:"human-choice"},
    {atSecond:16,trigger:"Đổi bối cảnh",informationGain:"Lật giả định",visualReset:"Tủ lạnh sang bó hoa",sceneFamily:"location-contrast"},
    {atSecond:24,trigger:"Giải mã",informationGain:"Hiện cơ chế",visualReset:"Sơ đồ bối cảnh",sceneFamily:"framework"},
    {atSecond:32,trigger:"Chứng minh",informationGain:"Đối chiếu thứ hai",visualReset:"Hai mức giá",sceneFamily:"proof"},
    {atSecond:42,trigger:"Áp dụng",informationGain:"Cho bài kiểm tra",visualReset:"Chủ shop sửa trưng bày",sceneFamily:"application"}
  ];
  const layers = ["hook-puzzle", "story-action", "proof-evidence", "mechanism-decode", "application-audit"];
  idea.sceneOpportunities.forEach((scene, index) => { scene.retentionLayer = layers[index]; });
  Object.assign(idea.scores, {viewerParticipation:5,broadAudienceReach:5,proofReadiness:4,retentionResetStrength:5});
});
const phenomenonIdeasPath = path.join(temp, "phenomenon-ideas.json");
await writeFile(phenomenonIdeasPath, JSON.stringify(phenomenonIdeas, null, 2));
expect("phenomenon-led idea package", run([ideaValidator, phenomenonIdeasPath]), true, "ranked");
const missingVisualLayer = structuredClone(phenomenonIdeas);
missingVisualLayer.ideas[0].sceneOpportunities[4].retentionLayer = "story-action";
const missingVisualLayerPath = path.join(temp, "phenomenon-ideas-missing-layer.json");
await writeFile(missingVisualLayerPath, JSON.stringify(missingVisualLayer, null, 2));
expect("phenomenon ideas require all visual layers", run([ideaValidator, missingVisualLayerPath]), false, "five retention layers");

const profileProject = path.join(temp, "flow-profile");
await mkdir(path.join(profileProject, "creatorflow"), {recursive: true});
const validProfile = {
  schemaVersion: 1,
  projectName: "Flow-only fixture",
  topicSpace: "branding",
  audience: "shop owners",
  language: "vi",
  platform: "TikTok",
  seriesLabel: "CHUYỆN BRANDING MỖI NGÀY",
  style: {preset:"branding-story-paper-pink",vibe:"paper pink"},
  production: {width:1080,height:1920,fps:30,captionTop:1110},
  providers: {images:"flow-agent",voice:"provided-audio"},
  resources: {logo:"",character:"",referenceImages:[]}
};
const validState = {approvals:{script:{status:"approved"}}};
await writeFile(path.join(profileProject, "creatorflow/profile.json"), JSON.stringify(validProfile, null, 2));
await writeFile(path.join(profileProject, "creatorflow/state.json"), JSON.stringify(validState, null, 2));
expect("Flow-only production profile", run([profileValidator, profileProject, "production"]), true, "ready for production");
validProfile.providers.images = "another-platform";
await writeFile(path.join(profileProject, "creatorflow/profile.json"), JSON.stringify(validProfile, null, 2));
expect("alternate image provider rejected", run([profileValidator, profileProject, "production"]), false, "must be flow-agent");
validProfile.providers.images = "flow-agent";
validProfile.providers.flowAgent = {autoStart:true,startCwd:"",startCommand:["npm","run","bridge:all"]};
await writeFile(path.join(profileProject, "creatorflow/profile.json"), JSON.stringify(validProfile, null, 2));
expect("auto-start needs configured directory", run([profileValidator, profileProject, "production"]), false, "auto-start requires");

expect("locally pinned Gemini watermark CLI", run([watermarkCli, "--help"]), true, "Usage: gwr remove");
expect("CreatorFlow watermark wrapper help", run([watermarkScript, "--help"]), true, "--watermark gemini-visible");
const watermarkInput = path.join(temp, "owned-blank.png");
await sharp({create: {width: 160, height: 100, channels: 4, background: {r: 240, g: 220, b: 210, alpha: 1}}}).png().toFile(watermarkInput);
const watermarkOutput = path.join(temp, "ep999", "v01", "clean", "A01-v01.png");
expect("watermark cleanup requires owned or licensed rights", run([watermarkScript, "--input", watermarkInput, "--output", watermarkOutput, "--asset-id", "A01", "--rights", "unverified", "--watermark", "gemini-visible"]), false, "--rights must be owned or licensed");
expect("watermark cleanup requires Gemini visible scope", run([watermarkScript, "--input", watermarkInput, "--output", watermarkOutput, "--asset-id", "A01", "--rights", "owned", "--watermark", "synthid"]), false, "Only --watermark gemini-visible");
const unversionedOutput = path.join(temp, "ep999", "clean", "A01.png");
expect("watermark cleanup requires versioned clean output", run([watermarkScript, "--input", watermarkInput, "--output", unversionedOutput, "--asset-id", "A01", "--rights", "owned", "--watermark", "gemini-visible"]), false, "must include an explicit version");
expect("watermark cleanup blocks a non-Gemini source", run([watermarkScript, "--input", watermarkInput, "--output", watermarkOutput, "--asset-id", "A01", "--rights", "owned", "--watermark", "gemini-visible"]), false, "did not confirm a removable visible Gemini watermark");
if (await fileExists(watermarkOutput)) { failures += 1; console.error("FAIL: blocked watermark cleanup created a clean output"); }
else console.log("PASS: blocked watermark cleanup keeps clean output absent");
const blockedProvenance = `${watermarkOutput}.watermark.json`;
if (!await fileExists(blockedProvenance)) { failures += 1; console.error("FAIL: blocked watermark cleanup did not record provenance"); }
else {
  const record = JSON.parse(await readFile(blockedProvenance, "utf8"));
  if (record.status !== "blocked" || record.detection?.applied !== false) { failures += 1; console.error("FAIL: blocked watermark provenance is incomplete"); }
  else console.log("PASS: blocked watermark cleanup records provenance");
}

expect("valid episode v2", run([episodeValidator, episodePath, captionsPath, wordsPath, "--mode", "production"]), true);
const episode = JSON.parse(await readFile(episodePath, "utf8"));
const episodeCases = [
  ["cue anchor mismatch", (copy) => { copy.visualCues[1].spokenAnchor = "wrong anchor"; }, "spokenAnchor does not match"],
  ["episode cue gap", (copy) => { copy.visualCues[1].startMs = 1300; }, "is not contiguous"],
  ["three-item solo", (copy) => { copy.visualCues[0].items.push({...copy.visualCues[0].items[0], id: "extra-1"}, {...copy.visualCues[0].items[0], id: "extra-2"}); }, "solo cue C01 must contain exactly one item"],
  ["missing asset", (copy) => { copy.visualCues[0].items[0] = {id:"missing",kind:"asset",assetId:"Z99",role:"Missing",enterMs:0,motion:"pop"}; }, "references a missing asset"],
  ["repeated carry sfx", (copy) => { copy.visualCues[4].items[0].sfx = "click"; }, "must not repeat SFX"]
];
for (const [name, mutate, marker] of episodeCases) {
  const copy = structuredClone(episode);
  mutate(copy);
  const file = path.join(temp, `${name.replace(/\s+/g, "-")}.json`);
  await writeFile(file, JSON.stringify(copy, null, 2));
  expect(name, run([episodeValidator, file, captionsPath, wordsPath, "--mode", "production"]), false, marker);
}

const watermarkEpisodeProject = path.join(temp, "watermark-episode-project");
const watermarkEpisodePath = path.join(watermarkEpisodeProject, "src", "data", "episode.json");
const watermarkEpisode = structuredClone(episode);
watermarkEpisode.assets = [{
  id: "A01",
  src: "ep999/v01/clean/A01-v01.png",
  alt: "Authorized Gemini source after local cleanup",
  kind: "image",
  stickerTreatment: "remotion-paper",
  hasBakedContour: false
}];
const watermarkAsset = watermarkEpisode.assets[0];
const watermarkAssetPath = path.join(watermarkEpisodeProject, "public", watermarkAsset.src);
await mkdir(path.dirname(watermarkAssetPath), {recursive: true});
await writeFile(watermarkAssetPath, "fixture");
const watermarkProvenanceSrc = `${watermarkAsset.src}.watermark.json`;
watermarkAsset.watermarkRemoval = {
  watermark: "gemini-visible",
  authorization: "owned",
  originalSrc: "ep999/v01/original/A01.png",
  provenanceSrc: watermarkProvenanceSrc,
  tool: {package: "@pilio/gemini-watermark-remover", version: "1.0.41"}
};
await writeFile(path.join(watermarkEpisodeProject, "public", watermarkProvenanceSrc), JSON.stringify({
  schemaVersion: 1,
  assetId: watermarkAsset.id,
  status: "removed",
  detection: {applied: true},
  cleaned: {path: watermarkAssetPath}
}, null, 2));
await mkdir(path.dirname(watermarkEpisodePath), {recursive: true});
await writeFile(watermarkEpisodePath, JSON.stringify(watermarkEpisode, null, 2));
expect("episode accepts confirmed watermark provenance", run([episodeValidator, watermarkEpisodePath, captionsPath, wordsPath, "--mode", "production"]), true, "schema v2");
const blockedWatermarkRecord = JSON.parse(await readFile(path.join(watermarkEpisodeProject, "public", watermarkProvenanceSrc), "utf8"));
blockedWatermarkRecord.status = "blocked";
await writeFile(path.join(watermarkEpisodeProject, "public", watermarkProvenanceSrc), JSON.stringify(blockedWatermarkRecord, null, 2));
const blockedWatermarkEpisodePath = path.join(watermarkEpisodeProject, "src", "data", "blocked-watermark-episode.json");
await writeFile(blockedWatermarkEpisodePath, JSON.stringify(watermarkEpisode, null, 2));
expect("episode rejects blocked watermark provenance", run([episodeValidator, blockedWatermarkEpisodePath, captionsPath, wordsPath, "--mode", "production"]), false, "provenance is not a confirmed removal");

const phenomenonEpisode = structuredClone(episode);
phenomenonEpisode.retentionMode = "business-phenomenon-decode-v1";
const episodeRetentionRoles = ["hook-puzzle", "viewer-prediction", "story-progress", "perspective-flip", "mechanism-decode", "proof-evidence", "application-audit", "cta"];
phenomenonEpisode.visualCues.forEach((cue, index) => { cue.retentionRole = episodeRetentionRoles[index]; });
phenomenonEpisode.retentionResets = [0, 2500, 5600, 9000, 10500].map((atMs, index) => ({
  id: `R${String(index + 1).padStart(2, "0")}`,
  atMs,
  trigger: `Trigger ${index + 1}`,
  informationGain: `New information ${index + 1}`,
  visualReset: `Visual reset ${index + 1}`,
  sceneFamily: `scene-${index + 1}`
}));
const phenomenonEpisodePath = path.join(temp, "phenomenon-episode.json");
await writeFile(phenomenonEpisodePath, JSON.stringify(phenomenonEpisode, null, 2));
expect("phenomenon-led production episode", run([episodeValidator, phenomenonEpisodePath, captionsPath, wordsPath, "--mode", "production"]), true, "schema v2");
const missingEpisodeRetentionRole = structuredClone(phenomenonEpisode);
delete missingEpisodeRetentionRole.visualCues[4].retentionRole;
const missingEpisodeRetentionRolePath = path.join(temp, "phenomenon-episode-missing-role.json");
await writeFile(missingEpisodeRetentionRolePath, JSON.stringify(missingEpisodeRetentionRole, null, 2));
expect("phenomenon episode retains roles", run([episodeValidator, missingEpisodeRetentionRolePath, captionsPath, wordsPath, "--mode", "production"]), false, "retentionRole");
const motionOnlyEpisodeReset = structuredClone(phenomenonEpisode);
motionOnlyEpisodeReset.retentionResets[2].atMs = 4700;
const motionOnlyEpisodeResetPath = path.join(temp, "phenomenon-episode-off-boundary-reset.json");
await writeFile(motionOnlyEpisodeResetPath, JSON.stringify(motionOnlyEpisodeReset, null, 2));
expect("phenomenon reset requires semantic cue boundary", run([episodeValidator, motionOnlyEpisodeResetPath, captionsPath, wordsPath, "--mode", "production"]), false, "must begin on a visual cue");

const captionCode = await readFile(captionsComponent, "utf8");
for (const marker of ["whiteSpace: \"pre-wrap\"", "Math.min(1.15", "wordsData", "top = 1110"]) {
  if (!captionCode.includes(marker)) { failures += 1; console.error(`FAIL: caption contract missing ${marker}`); }
  else console.log(`PASS: caption contract ${marker}`);
}
const trimCode = await readFile(trimScript, "utf8");
for (const marker of ["silencedetect", "internalPausesPreserved: true", "removedLeadingMs", "removedTrailingMs"]) {
  if (!trimCode.includes(marker)) { failures += 1; console.error(`FAIL: trim contract missing ${marker}`); }
  else console.log(`PASS: trim contract ${marker}`);
}
const flowCheckCode = await readFile(flowCheckScript, "utf8");
for (const marker of ["flow\", [\"status\"]", "backendHealthy", "extensionConnected", "hasFlowKey", "no alternate image provider is allowed"]) {
  if (!flowCheckCode.includes(marker)) { failures += 1; console.error(`FAIL: Flow gate missing ${marker}`); }
  else console.log(`PASS: Flow gate ${marker}`);
}
const flowEnsureCode = await readFile(flowEnsureScript, "utf8");
for (const marker of ["providers?.flowAgent", "npm\", [\"run\", \"bridge:all\"]", "startupTimeoutMs", "Flow Agent auto-started and ready"]) {
  if (!flowEnsureCode.includes(marker)) { failures += 1; console.error(`FAIL: Flow ensure missing ${marker}`); }
  else console.log(`PASS: Flow ensure ${marker}`);
}
const editSkillCode = await readFile(path.join(root, "skills/creatorflow-edit/SKILL.md"), "utf8");
if (!editSkillCode.includes("FLOW_CLIENT_ID") || !editSkillCode.includes("flow status` alone is not proof")) {
  failures += 1;
  console.error("FAIL: Flow adapter narrowed preflight contract is missing");
} else console.log("PASS: Flow adapter narrowed preflight contract");
for (const marker of ["flat, single-color `#00FF00`", "0.35s / frame", "thumbnail-quality hook", "retentionMode", "Batch exactly three", "Do not run the retired Gemini watermark-cleanup step", "lower-right source area"]) {
  if (!editSkillCode.includes(marker)) { failures += 1; console.error(`FAIL: edit retention and keying contract missing ${marker}`); }
  else console.log(`PASS: edit retention and keying contract ${marker}`);
}

if (failures) process.exit(1);
console.log("PASS: all CreatorFlow contract fixtures behaved as expected");
