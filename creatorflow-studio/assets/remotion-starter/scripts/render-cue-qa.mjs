#!/usr/bin/env node

import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {spawnSync} from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const args = process.argv.slice(2);
const episodeArg = args.find((arg) => !arg.startsWith("--"));
const outputArg = args.filter((arg) => !arg.startsWith("--"))[1] || "out/cue-qa";
const dryRun = args.includes("--dry-run");
const withOpening = args.includes("--with-opening");
const compositionIndex = args.indexOf("--composition");
const composition = compositionIndex >= 0 ? args[compositionIndex + 1] : "CreatorFlowVideo";
if (!episodeArg) {
  console.error("Usage: node scripts/render-cue-qa.mjs <episode.json> [output-dir] [--dry-run] [--with-opening] [--composition ID]");
  process.exit(2);
}

const episodePath = path.resolve(episodeArg);
const episode = JSON.parse(await readFile(episodePath, "utf8"));
if (episode.schemaVersion !== 2 || !Array.isArray(episode.visualCues)) throw new Error("Cue QA requires a schema v2 episode");
const outputDir = path.resolve(outputArg);
const fps = 30;
const entries = episode.visualCues.flatMap((cue) => [
  {cueId: cue.id, sample: "entry", ms: Math.min(cue.endMs - 1, cue.startMs + 200), frame: Math.round(Math.min(cue.endMs - 1, cue.startMs + 200) / 1000 * fps), anchor: cue.spokenAnchor, retentionRole: cue.retentionRole || "—", visualSubject: cue.visualSubject || "—", sceneFamily: cue.sceneFamily || "—", intent: cue.semanticIntent},
  {cueId: cue.id, sample: "mid", ms: Math.round((cue.startMs + cue.endMs) / 2), frame: Math.round(((cue.startMs + cue.endMs) / 2) / 1000 * fps), anchor: cue.spokenAnchor, retentionRole: cue.retentionRole || "—", visualSubject: cue.visualSubject || "—", sceneFamily: cue.sceneFamily || "—", intent: cue.semanticIntent}
]);

if (dryRun) {
  console.log(JSON.stringify({ok: true, composition, outputDir, stillCount: entries.length, openingFrames: withOpening ? [0, Math.round(3.2 * fps)] : null, entries}, null, 2));
  process.exit(0);
}

await mkdir(outputDir, {recursive: true});
const remotionBin = path.resolve("node_modules", ".bin", "remotion");
const run = (command, commandArgs) => {
  const result = spawnSync(command, commandArgs, {stdio: "inherit"});
  if (result.status !== 0) throw new Error(`${path.basename(command)} failed with status ${result.status}`);
};

for (const [index, entry] of entries.entries()) {
  const filename = `${String(index + 1).padStart(3, "0")}-${entry.cueId}-${entry.sample}.png`;
  run(remotionBin, ["still", composition, path.join(outputDir, filename), `--frame=${entry.frame}`, "--scale=0.5", "--overwrite"]);
  entry.file = filename;
}

const columns = 4;
const rows = Math.ceil(entries.length / columns);
run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-pattern_type", "glob", "-i", path.join(outputDir, "*-[em]*.png"), "-vf", `scale=270:480,tile=${columns}x${rows}:padding=6:margin=6`, "-frames:v", "1", path.join(outputDir, "contact-sheet.png")]);

if (withOpening) run(remotionBin, ["render", composition, path.join(outputDir, "opening-0-3.2s.mp4"), "--frames=0-96", "--codec=h264", "--crf=18"]);

const resetByMs = new Map((episode.retentionResets || []).map((reset) => [reset.atMs, reset]));
const rowsMd = entries.map((entry) => {
  const reset = resetByMs.get(episode.visualCues.find((cue) => cue.id === entry.cueId)?.startMs);
  return `| ${entry.cueId} | ${entry.sample} | ${entry.ms} | ${entry.anchor} | ${entry.retentionRole} | ${reset?.informationGain || "—"} | ${entry.visualSubject} | ${entry.sceneFamily} | pending | pending | pending | pending |`;
}).join("\n");
await writeFile(path.join(outputDir, "cue-qa-matrix.md"), `# Cue QA matrix\n\n![Contact sheet](contact-sheet.png)\n\n| Cue | Sample | Time ms | Spoken anchor | Retention role | Information gain | Expected visual subject | Scene family | Timing | Semantic change | Evidence | Safe zone |\n|---|---|---:|---|---|---|---|---|---|---|---|---|\n${rowsMd}\n`);
await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify({episode: episode.id, composition, entries, opening: withOpening ? "opening-0-3.2s.mp4" : null}, null, 2)}\n`);
console.log(JSON.stringify({ok: true, outputDir, stillCount: entries.length, contactSheet: path.join(outputDir, "contact-sheet.png")}, null, 2));
