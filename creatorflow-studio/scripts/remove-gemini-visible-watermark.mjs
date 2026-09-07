#!/usr/bin/env node

import {access, lstat, mkdir, readFile, rename, rm, writeFile} from "node:fs/promises";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(path.join(root, "node_modules/@pilio/gemini-watermark-remover/package.json"), "utf8"));
const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const fail = (message, code = 1) => {
  console.error(`ERROR: ${message}`);
  process.exit(code);
};

const usageText = [
  "Usage: node scripts/remove-gemini-visible-watermark.mjs",
  "--input <original-image> --output <versioned-clean-image>",
  "--asset-id <id> --rights <owned|licensed> --watermark gemini-visible"
].join(" ");
const usage = () => fail(usageText, 2);

const readArgs = (argv) => {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) usage();
    const key = token.slice(2);
    if (!["input", "output", "asset-id", "rights", "watermark"].includes(key) || values.has(key)) usage();
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) usage();
    values.set(key, value);
    index += 1;
  }
  for (const key of ["input", "output", "asset-id", "rights", "watermark"]) if (!values.get(key)) usage();
  return Object.fromEntries(values);
};

const exists = async (target) => {
  try { await access(target); return true; } catch { return false; }
};

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {cwd: root, shell: false});
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => resolve({code, stdout, stderr}));
});

const parseJson = (value) => {
  try { return JSON.parse(value.trim()); } catch { return null; }
};

const relativeCleanPath = (absolutePath) => path.relative(root, absolutePath).split(path.sep).join("/");

const main = async () => {
  if (process.argv.slice(2).some((value) => value === "--help" || value === "-h")) {
    console.log(usageText);
    return;
  }
  const args = readArgs(process.argv.slice(2));
  if (!["owned", "licensed"].includes(args.rights)) fail("--rights must be owned or licensed.", 2);
  if (args.watermark !== "gemini-visible") fail("Only --watermark gemini-visible is supported. Invisible/SynthID and other watermarks are out of scope.", 2);

  const input = path.resolve(args.input);
  const output = path.resolve(args.output);
  const extension = path.extname(input).toLowerCase();
  const outputExtension = path.extname(output).toLowerCase();
  if (!allowedExtensions.has(extension) || !allowedExtensions.has(outputExtension)) fail("Only PNG, JPEG, and WebP image files are supported. Video and other watermark types are not supported.", 2);
  if (input === output) fail("Output must be a new clean file; this command never overwrites the original.", 2);
  if (!output.split(path.sep).includes("clean")) fail("Output path must contain a clean directory segment.", 2);
  if (!/(^|[\\/_-])v\d+(?:[\\/_-]|$)/i.test(output)) fail("Output path must include an explicit version such as v01 or -v01.", 2);
  if (!await exists(input)) fail(`Input not found: ${input}`, 2);
  if (await exists(output)) fail(`Clean output already exists and is immutable: ${output}`, 2);

  const provenance = `${output}.watermark.json`;
  if (await exists(provenance)) fail(`Watermark provenance already exists and is immutable: ${provenance}`, 2);
  const inputStats = await lstat(input);
  if (!inputStats.isFile()) fail("Input must be a regular image file.", 2);

  let original;
  try { original = await sharp(input).metadata(); }
  catch { fail("Input cannot be decoded as a supported image.", 2); }
  if (!original.width || !original.height) fail("Input image is missing readable dimensions.", 2);

  const outputDirectory = path.dirname(output);
  const tempOutput = path.join(outputDirectory, `.${path.basename(output, outputExtension)}.watermark-pending-${process.pid}${outputExtension}`);
  const tempProvenance = `${provenance}.pending-${process.pid}`;
  const cli = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "gwr.cmd" : "gwr");
  if (!await exists(cli)) fail("The locally pinned gwr CLI is unavailable. Run npm install in CreatorFlow before editing.");

  await mkdir(outputDirectory, {recursive: true});
  const baseRecord = {
    schemaVersion: 1,
    assetId: args["asset-id"],
    watermark: "gemini-visible",
    authorization: args.rights,
    tool: {package: "@pilio/gemini-watermark-remover", version: packageJson.version, cli: "gwr"},
    original: {path: input, relativeToCreatorFlow: relativeCleanPath(input), width: original.width, height: original.height, format: original.format || null},
    cleaned: {path: output, relativeToCreatorFlow: relativeCleanPath(output)},
    processedAt: new Date().toISOString()
  };

  let cliResult;
  try {
    cliResult = await run(cli, ["remove", input, "--output", tempOutput, "--json"]);
  } catch (error) {
    fail(`Unable to start the local gwr CLI: ${error.message}`);
  }
  const result = parseJson(cliResult.stdout);
  const meta = result?.meta || null;
  const blocked = async (reason, code) => {
    await rm(tempOutput, {force: true});
    await writeFile(provenance, `${JSON.stringify({...baseRecord, status: "blocked", detection: {applied: meta?.applied === true, meta}, failure: {reason, code, cliExitCode: cliResult.code, stderr: cliResult.stderr.trim() || null}}, null, 2)}\n`);
    fail(`${reason} Review the original asset manually; crop/key/Remotion must not continue from it.`, code);
  };

  if (cliResult.code !== 0) await blocked(`gwr failed${cliResult.stderr.trim() ? `: ${cliResult.stderr.trim()}` : "."}`, 3);
  if (result?.kind !== "image") await blocked("gwr did not return an image result.", 3);
  if (meta?.applied !== true) await blocked("gwr did not confirm a removable visible Gemini watermark.", 4);
  if (!await exists(tempOutput)) await blocked("gwr reported success but did not create a clean output file.", 3);

  let cleaned;
  try { cleaned = await sharp(tempOutput).metadata(); }
  catch { await blocked("gwr output cannot be decoded as an image.", 3); return; }
  if (cleaned.width !== original.width || cleaned.height !== original.height) await blocked("Clean output dimensions changed; cleanup must preserve source dimensions before crop.", 3);

  const record = {
    ...baseRecord,
    status: "removed",
    detection: {applied: true, meta},
    cleaned: {...baseRecord.cleaned, width: cleaned.width, height: cleaned.height, format: cleaned.format || null}
  };
  try {
    await writeFile(tempProvenance, `${JSON.stringify(record, null, 2)}\n`);
    await rename(tempOutput, output);
    await rename(tempProvenance, provenance);
  } catch (error) {
    await rm(tempOutput, {force: true});
    await rm(tempProvenance, {force: true});
    await rm(output, {force: true});
    fail(`Could not finalize the clean asset and provenance together: ${error.message}`);
  }

  console.log(JSON.stringify({ok: true, assetId: args["asset-id"], output, provenance, applied: true, tool: record.tool}, null, 2));
};

await main();
