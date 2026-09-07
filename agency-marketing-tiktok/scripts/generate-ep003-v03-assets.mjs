import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "public", "ep003", "v03", "generated");
const manifestPath = path.join(projectRoot, "creatorflow", "ep003-v03-generation.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const dryRun = process.argv.includes("--dry-run");
const flowAgentUrl = process.env.FLOW_AGENT_URL || "http://127.0.0.1:8001/v1/images/generations";
const flowClientId = process.env.FLOW_CLIENT_ID || "client-i4cgie";

if (!Array.isArray(manifest.jobs) || manifest.jobs.length !== 9) {
  throw new Error("EP003 v03 manifest must contain exactly nine approved image jobs.");
}

const seenIds = new Set();
const validateJob = (job) => {
  if (!job.id || !job.prompt || !job.output || !job.idempotencyKey || !job.aspectRatio || !Array.isArray(job.assetIds)) {
    throw new Error(`Incomplete job: ${job.id || "unknown"}`);
  }
  if (seenIds.has(job.id)) throw new Error(`Duplicate job ID: ${job.id}`);
  seenIds.add(job.id);
  if (job.kind === "three-object-sheet" && job.assetIds.length !== 3) throw new Error(`${job.id} must contain exactly three simple assets.`);
  if (job.kind !== "three-object-sheet" && job.assetIds.length !== 1) throw new Error(`${job.id} must contain one standalone asset.`);
  const outPath = path.resolve(projectRoot, job.output);
  if (!outPath.startsWith(`${outputRoot}${path.sep}`)) throw new Error(`Unsafe output path: ${job.output}`);
  return outPath;
};

console.log(`${dryRun ? "Validating" : "Generating"} ${manifest.jobs.length} approved EP003 v03 jobs${dryRun ? "" : ` via Flow Agent (${flowAgentUrl})`}...`);

for (const [index, job] of manifest.jobs.entries()) {
  const outPath = validateJob(job);
  if (dryRun) {
    console.log(`[${index + 1}/9] ${job.id}: ${job.kind} → ${job.assetIds.join(", ")}`);
    continue;
  }
  if (fs.existsSync(outPath)) {
    console.log(`[${index + 1}/9] Already exists: ${path.basename(outPath)}`);
    continue;
  }

  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  const response = await fetch(flowAgentUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": flowClientId,
      "Idempotency-Key": job.idempotencyKey
    },
    body: JSON.stringify({
      prompt: `${manifest.identityLock}\n\n${job.prompt}`,
      aspect_ratio: job.aspectRatio,
      num_outputs: 1
    })
  });
  if (!response.ok) throw new Error(`Job ${job.id} failed: HTTP ${response.status}: ${await response.text()}`);

  const data = await response.json();
  const imageUrl = data.images?.[0]?.url || data.output?.[0] || data.data?.[0]?.url || data.url;
  if (!imageUrl) throw new Error(`Job ${job.id} returned no image URL.`);
  const imageResponse = imageUrl.startsWith("data:") ? null : await fetch(imageUrl);
  if (imageResponse && !imageResponse.ok) throw new Error(`Job ${job.id} image download failed: HTTP ${imageResponse.status}`);
  const imageBuffer = imageUrl.startsWith("data:")
    ? Buffer.from(imageUrl.split(",")[1], "base64")
    : Buffer.from(await imageResponse.arrayBuffer());
  fs.writeFileSync(outPath, imageBuffer);
  console.log(`[${index + 1}/9] Saved: ${path.basename(outPath)}`);
}

console.log(dryRun ? "EP003 v03 manifest is ready; no provider call was made." : "EP003 v03 asset generation complete.");
