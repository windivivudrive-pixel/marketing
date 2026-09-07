import {access, mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifestPath = process.argv[2] || "creatorflow/ep006-v03-generation.json";
const manifest = JSON.parse(await readFile(resolve(root, manifestPath), "utf8"));
const clientId = process.env.FLOW_CLIENT_ID || "client-i4cgie";

if (!clientId) throw new Error("FLOW_CLIENT_ID is required");
console.log(`Flow Agent: ${manifest.episode} ${manifest.version} (${manifest.jobs.length} assets)`);

let generatedCount = 0;
let skippedCount = 0;

for (const job of manifest.jobs) {
  const output = resolve(root, job.output);
  try {
    await access(output);
    console.log(`SKIP existing ${job.id}: ${job.output}`);
    skippedCount++;
    continue;
  } catch {}

  const ensure = spawnSync(process.execPath, [resolve(root, "../creatorflow-studio/scripts/ensure-flow-agent.mjs"), "--project", root], {stdio: "inherit"});
  if (ensure.status !== 0) throw new Error(`Flow Agent is not ready before ${job.id}`);

  console.log(`Generating ${job.id}...`);
  const response = await fetch("http://127.0.0.1:8001/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `${manifest.idempotencyPrefix}${job.id.toLowerCase()}`,
      "X-Client-Id": clientId
    },
    body: JSON.stringify({
      prompt: `${manifest.identityLock}\n\n${job.prompt}`,
      model: manifest.model,
      n: 1,
      size: job.size,
      response_format: "url"
    })
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(`${job.id} failed (${response.status}): ${JSON.stringify(payload)}`);
  const url = payload?.data?.[0]?.url;
  if (!url) throw new Error(`${job.id} returned no image URL: ${JSON.stringify(payload)}`);
  
  const image = await fetch(url);
  if (!image.ok) throw new Error(`${job.id} download failed (${image.status})`);
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, Buffer.from(await image.arrayBuffer()), {flag: "wx"});
  console.log(`SAVED ${job.id}: ${job.output}`);
  generatedCount++;
}

console.log(`Finished Flow Agent jobs: ${generatedCount} generated, ${skippedCount} skipped.`);
