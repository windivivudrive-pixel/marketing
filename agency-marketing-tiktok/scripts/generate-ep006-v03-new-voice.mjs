import {readFile, writeFile} from "node:fs/promises";

const apiKey = "sk_car_7HcUaLjxhHYEN7X6hfxbqU";
const voiceId = "c629112c-818d-489b-9db3-df43879d33e8";

const transcriptPath = new URL("../public/audio/ep006-voiceover-v03.txt", import.meta.url);
const outputPath = new URL("../public/audio/ep006-voice-cartesia-v03.wav", import.meta.url);
const transcript = (await readFile(transcriptPath, "utf8")).trim();

console.log(`Calling Cartesia TTS API with voice ${voiceId} (${transcript.length} chars)...`);

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
  throw new Error(`Cartesia TTS failed (${response.status}): ${detail}`);
}

await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
console.log(`Saved new voice to ${outputPath.pathname}`);
