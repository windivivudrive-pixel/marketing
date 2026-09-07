import {readFile, writeFile} from "node:fs/promises";

const apiKey = "sk_car_Jw5nx2zUTYVWGxYnp82JVL";
const voiceId = "c629112c-818d-489b-9db3-df43879d33e8";

const transcriptPath = new URL("../public/audio/ep003-v04-voiceover.txt", import.meta.url);
const outputPath = new URL("../public/audio/ep003-v04-voice-raw.wav", import.meta.url);
const transcript = (await readFile(transcriptPath, "utf8")).trim();

console.log(`Generating Cartesia TTS with voice ${voiceId}...`);

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

await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
console.log(`Saved raw voice to ${outputPath.pathname}`);
console.log(`Characters: ${transcript.length}`);
