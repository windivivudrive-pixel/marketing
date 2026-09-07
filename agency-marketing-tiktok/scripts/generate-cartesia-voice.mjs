import {readFile, writeFile} from "node:fs/promises";
import process from "node:process";

const apiKey = process.env.CARTESIA_API_KEY;
if (!apiKey) {
  throw new Error("CARTESIA_API_KEY is required");
}

const transcriptPath = process.argv[2] ? new URL(`../${process.argv[2]}`, import.meta.url) : new URL("../public/audio/ep001-voiceover-v03.txt", import.meta.url);
const outputPath = process.argv[3] ? new URL(`../${process.argv[3]}`, import.meta.url) : new URL("../public/audio/ep001-voice-cartesia-v01.wav", import.meta.url);
const transcript = (await readFile(transcriptPath, "utf8")).trim();

const response = await fetch("https://api.cartesia.ai/tts/bytes", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Cartesia-Version": "2026-03-01",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model_id: "sonic-3.5-2026-05-04",
    transcript,
    voice: {id: "b143fdf3-029f-4f00-aa3f-0c171fb170bd"},
    language: "vi",
    output_format: {
      container: "wav",
      encoding: "pcm_s16le",
      sample_rate: 48000,
    },
  }),
});

if (!response.ok) {
  const detail = await response.text();
  throw new Error(`Cartesia TTS failed (${response.status}): ${detail.slice(0, 500)}`);
}

await writeFile(outputPath, Buffer.from(await response.arrayBuffer()), {flag: "wx"});
console.log(`Saved ${outputPath.pathname}`);
console.log(`Characters ${transcript.length}`);
