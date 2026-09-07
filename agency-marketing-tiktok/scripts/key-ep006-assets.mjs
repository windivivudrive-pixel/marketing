import {mkdir} from "node:fs/promises";
import {spawn} from "node:child_process";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ffmpeg = resolve(root, "node_modules/ffmpeg-static/ffmpeg");
const inDir = resolve(root, "public/ep006/v01/generated");
await mkdir(inDir, {recursive:true});
const files = ["a01-cafe-owner-green-v01","a02-menu-board-green-v01","a03-cup-basic-green-v01","a04-cup-signature-green-v01","a05-cup-limited-green-v01","a06-customer-compare-green-v01","a07-service-hand-green-v01","a08-proof-sheet-green-v01"];
for (const name of files) await new Promise((ok, fail) => {
  const out = resolve(inDir, `${name.replace(/-green-v01$/, "")}-alpha-v01.png`);
  const p = spawn(ffmpeg, ["-y","-i",resolve(inDir,`${name}.png`),"-vf","colorkey=0x0bb030:0.08:0.02,despill=green:mix=0.65:expand=0.08",out], {stdio:["ignore","ignore","pipe"]});
  let err=""; p.stderr.on("data", d => err += d);
  p.on("close", code => code === 0 ? (console.log(`KEYED ${name}`), ok()) : fail(new Error(err.slice(-500))));
});
