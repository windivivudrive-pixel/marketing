import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";

const clientId = process.env.FLOW_CLIENT_ID;
if (!clientId) throw new Error("FLOW_CLIENT_ID is required");

const manifestPath = new URL("../creatorflow/ep001-flow-generation-v01.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const referencePath = new URL("../../reference style/scene.png", import.meta.url);
const referenceDataUri = `data:image/png;base64,${(await readFile(referencePath)).toString("base64")}`;

for (const sheet of manifest.sheets) {
  const outputPath = resolve(sheet.output);
  try {
    await readFile(outputPath);
    console.log(`SKIP existing ${outputPath}`);
    continue;
  } catch {}

  const response = await fetch("http://127.0.0.1:8001/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": sheet.idempotencyKey,
      "X-Client-Id": clientId,
    },
    body: JSON.stringify({
      prompt: sheet.prompt,
      model: manifest.model,
      n: 1,
      size: "1024x1792",
      response_format: "url",
      image_base64: referenceDataUri,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${sheet.id} failed (${response.status}): ${JSON.stringify(payload)}`);
  }
  const url = payload?.data?.[0]?.url;
  if (!url) throw new Error(`${sheet.id} returned no image URL`);
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) throw new Error(`${sheet.id} download failed (${imageResponse.status})`);
  await mkdir(dirname(outputPath), {recursive: true});
  await writeFile(outputPath, Buffer.from(await imageResponse.arrayBuffer()), {flag: "wx"});
  console.log(`SAVED ${sheet.id} ${outputPath}`);
}
