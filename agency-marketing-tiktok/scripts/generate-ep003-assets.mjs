import {access, mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, "creatorflow/ep003-v02-generation.json"), "utf8"));
const clientId = process.env.FLOW_CLIENT_ID || "client-i4cgie";

console.log(`Starting Flow Agent Image Generation for ${manifest.episode} (${manifest.jobs.length} jobs)...`);

for (const job of manifest.jobs) {
  const output = resolve(root, job.output);
  try { 
    await access(output); 
    console.log(`SKIP existing ${job.id}`); 
    continue; 
  } catch {}

  console.log(`Generating ${job.id}...`);
  try {
    const response = await fetch("http://127.0.0.1:8001/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        "Idempotency-Key": `${manifest.idempotencyPrefix}${job.id}`, 
        "X-Client-Id": clientId
      },
      body: JSON.stringify({
        prompt: `${manifest.identityLock}\n\n${job.prompt}`, 
        model: manifest.model, 
        n: 1, 
        size: job.size, 
        response_format: "url"
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(`${job.id} failed (${response.status}): ${JSON.stringify(payload)}`);
    const url = payload?.data?.[0]?.url;
    if (!url) throw new Error(`${job.id} returned no image URL`);
    const image = await fetch(url);
    if (!image.ok) throw new Error(`${job.id} download failed (${image.status})`);
    await mkdir(dirname(output), {recursive: true});
    await writeFile(output, Buffer.from(await image.arrayBuffer()), {flag: "wx"});
    console.log(`SAVED ${job.id}`);
  } catch (err) {
    console.error(`ERROR generating ${job.id}:`, err.message);
  }
}
