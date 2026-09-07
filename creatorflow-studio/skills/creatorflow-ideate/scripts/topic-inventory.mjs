#!/usr/bin/env node

import {readdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || ".");
const output = path.join(root, "creatorflow", "content-inventory.json");
const candidates = [path.join(root, "briefs"), path.join(root, "ideas"), path.join(root, "src", "data", "episodes")];
const items = [];

const walk = async (directory) => {
  let entries = [];
  try { entries = await readdir(directory, {withFileTypes: true}); } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(md|json)$/i.test(entry.name)) {
      const text = await readFile(full, "utf8");
      const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
      const yaml = (key) => text.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "mi"))?.[1]?.trim() || "";
      let json = {};
      if (/\.json$/i.test(entry.name)) {
        try { json = JSON.parse(text); } catch {}
      }
      items.push({
        path: path.relative(root, full),
        id: yaml("episodeId") || json.id || "",
        title: title || json.title || "",
        slug: yaml("slug") || json.slug || entry.name.replace(/\.(md|json)$/i, ""),
        viewerQuestion: yaml("viewerQuestion") || json.viewerQuestion || "",
        sideA: yaml("sideA") || json.topicA?.label || "",
        sideB: yaml("sideB") || json.topicB?.label || "",
        payoff: yaml("payoff") || json.payoff || ""
      });
    }
  }
};

for (const directory of candidates) await walk(directory);
items.sort((a, b) => a.path.localeCompare(b.path, undefined, {numeric: true}));
await writeFile(output, `${JSON.stringify({schemaVersion: 1, generatedAt: new Date().toISOString(), items}, null, 2)}\n`);
console.log(`PASS: inventoried ${items.length} item(s) → ${output}`);

