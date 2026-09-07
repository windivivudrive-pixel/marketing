import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep006-gia-cao-khong-tu-tao-cao-cap-v02.json", root), "utf8"));
const words = JSON.parse(await readFile(new URL("creatorflow/ep006-words-v02.json", root), "utf8"));
const captions = JSON.parse(await readFile(new URL("creatorflow/ep006-captions-v02.json", root), "utf8"));
const normalize = (value) => value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const tokens = words.map((word) => normalize(word.text));
const fallbackDuration = words.at(-1)?.endMs + 450 || 49000;
const cues = brief.visualCues.map((cue) => ({...cue, items: cue.items.map((item) => ({...item}))}));
let cursor = 0;
for (const [index, cue] of cues.entries()) {
  const target = Math.round(cue.startMs * fallbackDuration / 58000);
  let found = words.findIndex((word, wordIndex) => wordIndex >= cursor && word.startMs >= target);
  if (found < 0) found = words.length - 1;
  cue.startMs = words[found].startMs;
  cue.spokenAnchor = words[found].text;
  cursor = Math.min(words.length - 1, found + 1);
  if (index === 0) cue.startMs = 0;
}
for (let i = 0; i < cues.length; i++) cues[i].endMs = i + 1 < cues.length ? cues[i + 1].startMs : fallbackDuration;
const firstItemCue = new Map();
for (const cue of cues) for (const item of cue.items) {
  if (!firstItemCue.has(item.id)) firstItemCue.set(item.id, cue.startMs);
  item.enterMs = firstItemCue.get(item.id);
}
const assets = [
  ["A03", "ep006/v02/generated/a03-cup-basic-alpha-v02.png", "Ly cà phê cơ bản"],
  ["A04", "ep006/v02/generated/a04-cup-signature-alpha-v02.png", "Ly cà phê đặc trưng"],
  ["A05", "ep006/v02/generated/a05-cup-limited-alpha-v02.png", "Ly cà phê giới hạn"]
].map(([id, src, alt]) => ({id, src, alt, kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false}));
const arcStages = Object.entries(brief.creativeContract.storyArc);
const arcScale = fallbackDuration / 58000;
const beats = arcStages.map(([name, stage], index) => ({
  id: `B0${index + 1}`, startMs: Math.round(stage.startMs * arcScale), endMs: index + 1 < arcStages.length ? Math.round(arcStages[index + 1][1].startMs * arcScale) : fallbackDuration,
  purpose: ["hook", "answer", "compare", "example", "example", "payoff", "cta"][index], focus: "both",
  headline: name, body: stage.purpose, assetIds: ["A03"], transition: "push"
}));
const episode = {
  schemaVersion: 2, id: "EP006", slug: "gia-cao-khong-tu-tao-cao-cap-v02", title: brief.creativeContract.title, durationMs: fallbackDuration,
  cardA: {label: "49K", sublabel: "Hôm qua", assetId: "A03"}, cardB: {label: "69K", sublabel: "Hôm nay", assetId: "A04"}, assets, beats,
  audio: {voiceSrc: "audio/ep006-voice-cartesia-v02.wav", voiceVolume: 1, musicSrc: "audio/background-music-v01.mp3", musicVolume: 0.08},
  wordsSrc: "src/data/ep006-v02-words.json", motionGrammar: "continuous-stage-v1", visualCues: cues
};
await writeFile(new URL("src/data/ep006-v02-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep006-v02-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("src/data/ep006-v02-captions.json", root), JSON.stringify(captions, null, 2) + "\n");
console.log(`Built EP006 v02: ${fallbackDuration}ms, ${words.length} words, ${cues.length} cues`);
