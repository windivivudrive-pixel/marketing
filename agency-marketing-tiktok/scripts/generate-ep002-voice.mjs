import {readFile, writeFile} from "node:fs/promises";
import process from "node:process";

const apiKey = process.env.CARTESIA_API_KEY;
if (!apiKey) throw new Error("CARTESIA_API_KEY is required; use with-cartesia-keychain.sh and never place it in source.");
const voiceId = "b143fdf3-029f-4f00-aa3f-0c171fb170bd";

const transcriptPath = new URL("../public/audio/ep002-voiceover-v03.txt", import.meta.url);
const outputPath = new URL("../public/audio/ep002-voice-cartesia-v03.wav", import.meta.url);
const transcript = (await readFile(transcriptPath, "utf8")).trim();

console.log("Generating Cartesia TTS voice for EP002...");

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
    voice: {id: voiceId},
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

await writeFile(outputPath, Buffer.from(await response.arrayBuffer()), {flag: "w"});
console.log(`SUCCESS: Saved voice to ${outputPath.pathname}`);
console.log(`Transcript length: ${transcript.length} characters.`);
