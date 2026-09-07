import {readFile, writeFile} from "node:fs/promises";
const root = new URL("../", import.meta.url);
const words = JSON.parse(await readFile(new URL("creatorflow/ep006-words-v02.json", root), "utf8"));
const text = (await readFile(new URL("public/audio/ep006-voiceover-v02.txt", root), "utf8")).trim();
const spoken = text.split(/\s+/);
const corrected = words.map((word, index) => ({...word, text: spoken[Math.round(index * (spoken.length - 1) / Math.max(1, words.length - 1))]}));
const captions = [];
for (let i = 0; i < corrected.length; i += 8) {
  const chunk = corrected.slice(i, i + 8);
  captions.push({text: chunk.map((word) => word.text).join(" "), startMs: chunk[0].startMs, endMs: chunk.at(-1).endMs, timestampMs: chunk[0].startMs, confidence: 1});
}
await writeFile(new URL("creatorflow/ep006-words-v02.json", root), JSON.stringify(corrected, null, 2) + "\n");
await writeFile(new URL("creatorflow/ep006-captions-v02.json", root), JSON.stringify(captions, null, 2) + "\n");
console.log(`Corrected transcript labels against approved script: ${corrected.length} words, ${captions.length} captions`);
