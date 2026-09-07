#!/usr/bin/env node

import {spawnSync} from "node:child_process";
import {writeFile} from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const [inputArg, outputArg, metadataArg] = process.argv.slice(2);
if (!inputArg || !outputArg) {
  console.error("Usage: node trim-voice-silence.mjs <input-audio> <output-wav> [trim-map.json]");
  process.exit(2);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);
const metadata = path.resolve(metadataArg || `${output}.trim.json`);
const detect = spawnSync(ffmpegPath, ["-hide_banner", "-i", input, "-af", "silencedetect=noise=-45dB:d=0.08", "-f", "null", "-"], {encoding: "utf8"});
const log = `${detect.stdout || ""}\n${detect.stderr || ""}`;
const durationMatch = log.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
if (!durationMatch) {
  console.error("ERROR: could not read audio duration");
  process.exit(1);
}
const duration = Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]);
const starts = [...log.matchAll(/silence_start:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
const ends = [...log.matchAll(/silence_end:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
const leading = starts[0] <= 0.05 && Number.isFinite(ends[0]) ? ends[0] : 0;
let trailing = duration;
if (starts.length) {
  const finalStart = starts.at(-1);
  const finalEnd = ends.at(-1);
  if (Number.isFinite(finalStart) && (!Number.isFinite(finalEnd) || Math.abs(finalEnd - duration) <= 0.15)) trailing = finalStart;
}
if (trailing <= leading + 0.1) {
  console.error("ERROR: silence analysis would remove the complete voice");
  process.exit(1);
}
const trim = spawnSync(ffmpegPath, ["-hide_banner", "-y", "-ss", leading.toFixed(3), "-to", trailing.toFixed(3), "-i", input, "-vn", "-c:a", "pcm_s16le", "-ar", "48000", output], {encoding: "utf8"});
if (trim.status !== 0) {
  console.error(trim.stderr || "ERROR: voice trim failed");
  process.exit(trim.status || 1);
}
const map = {
  method: "leading-trailing-silencedetect",
  thresholdDb: -45,
  minimumSilenceMs: 80,
  inputDurationMs: Math.round(duration * 1000),
  removedLeadingMs: Math.round(leading * 1000),
  removedTrailingMs: Math.round((duration - trailing) * 1000),
  outputDurationMs: Math.round((trailing - leading) * 1000),
  internalPausesPreserved: true
};
await writeFile(metadata, `${JSON.stringify(map, null, 2)}\n`);
console.log(`PASS: trimmed leading/trailing silence only → ${output}`);
