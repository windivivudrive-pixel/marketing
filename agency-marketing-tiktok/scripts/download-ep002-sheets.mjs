import {mkdir, writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";

const sheets = [
  { id: "s01", url: "http://localhost:8001/download/flowagent_img_1786535812_8f0e34_1.jpg", output: "../public/ep002/generated/s01-seeding-kit-green.png" },
  { id: "s02", url: "http://localhost:8001/download/flowagent_img_1786535851_23cf39_1.jpg", output: "../public/ep002/generated/s02-ai-detection-green.png" },
  { id: "s03", url: "http://localhost:8001/download/flowagent_img_1786535888_e02861_1.jpg", output: "../public/ep002/generated/s03-customer-reactions-green.png" },
  { id: "s04", url: "http://localhost:8001/download/flowagent_img_1786535926_bc6ebd_1.jpg", output: "../public/ep002/generated/s04-chat-props-green.png" },
  { id: "s05", url: "http://localhost:8001/download/flowagent_img_1786535960_fd5e47_1.jpg", output: "../public/ep002/generated/s05-strategy-icons-green.png" },
];

const genDir = fileURLToPath(new URL("../public/ep002/generated/", import.meta.url));
await mkdir(genDir, {recursive: true});

for (const sheet of sheets) {
  const outputPath = fileURLToPath(new URL(sheet.output, import.meta.url));
  console.log(`Downloading ${sheet.id}...`);
  const response = await fetch(sheet.url);
  if (!response.ok) throw new Error(`Failed to download ${sheet.id}`);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()), {flag: "w"});
  console.log(`SAVED ${sheet.id} to ${outputPath}`);
}
