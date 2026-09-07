import {mkdir} from "node:fs/promises";
import {spawn} from "node:child_process";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ffmpeg = resolve(root, "node_modules/ffmpeg-static/ffmpeg");
const dir = resolve(root, "public/ep006/v02/generated");
await mkdir(dir, {recursive:true});
const files = {
  "a01-cafe-owner":"03F803", "a02-menu-board":"06F504", "a03-cup-basic":"16DA16", "a04-cup-signature":"0AC320",
  "a05-cup-limited":"51A253", "a06-customer-compare":"06F305", "a07-service-hand":"03FB04", "a08-proof-sheet":"04EE03"
};
for (const [name, matte] of Object.entries(files)) await new Promise((ok, fail) => {
  const input = resolve(dir, `${name}-green-v02.png`);
  const output = resolve(dir, `${name}-alpha-v02.png`);
  const p = spawn(ffmpeg, ["-y","-i",input,"-vf",`colorkey=0x${matte}:0.05:0.02,despill=green:mix=0.55:expand=0.06`,output], {stdio:["ignore","ignore","pipe"]});
  let err=""; p.stderr.on("data", d => err += d);
  p.on("close", code => code === 0 ? (console.log(`KEYED ${name}`), ok()) : fail(new Error(err.slice(-600))));
});
