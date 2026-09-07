#!/usr/bin/env node

import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node render-script-review.mjs <brief.json> [output.md]");
  process.exit(2);
}

const source = path.resolve(input);
const brief = JSON.parse(await readFile(source, "utf8"));
const output = path.resolve(process.argv[3] || source.replace(/\.json$/i, ".review.md"));
const section = brief.voiceover.sections;
const rows = brief.visualCues.map((cue) => `| ${cue.id} | ${(cue.startMs / 1000).toFixed(1)}–${(cue.endMs / 1000).toFixed(1)}s | ${cue.spokenAnchor} | ${cue.spokenSubject || "legacy"} | ${cue.visualSubject || cue.semanticIntent} | ${cue.visualReason || "legacy"} | ${cue.sceneFamily || "legacy"} | ${cue.continuityRole || "legacy"} | ${cue.retentionRole || "legacy"} | ${cue.composition} | ${cue.items.map((item) => item.id).join(", ")} |`).join("\n");
const arcOrder = ["familiarHook", "curiosityBuild", "perspectiveFlip", "marketingDecode", "proof", "lesson", "application"];
const arcRows = arcOrder.map((name) => {
  const stage = brief.creativeContract.storyArc?.[name];
  return stage ? `| ${name} | ${(stage.startMs / 1000).toFixed(1)}–${(stage.endMs / 1000).toFixed(1)}s | ${stage.voiceAnchor} | ${stage.purpose} | ${stage.visualProgression} |` : "";
}).filter(Boolean).join("\n");
const sources = brief.sources.length ? brief.sources.map((item) => `- [${item.title}](${item.url}) — ${item.supports} (truy cập ${item.accessedAt})`).join("\n") : "- Không có claim cần nguồn bên ngoài.";
const retentionPlan = brief.creativeContract.retentionPlan;
const retention = retentionPlan ? `## RETENTION PLAN\n\n- Người xem tự đoán: ${retentionPlan.viewerPrediction}\n- Câu trả lời giữ lại: ${retentionPlan.withheldAnswer}\n- Cơ chế nói đời thường: ${retentionPlan.plainLanguageMechanism}\n- Lý thuyết: ${retentionPlan.theoryReveal.technicalLabel || "Không cần gọi tên"} · sớm nhất ${(retentionPlan.theoryReveal.earliestMs / 1000).toFixed(1)}s\n- Reset: ${retentionPlan.resets.map((reset) => `${(reset.atMs / 1000).toFixed(1)}s ${reset.trigger} → ${reset.informationGain}`).join(" | ")}\n\n` : "";
const markdown = `# ${brief.metadata.episodeId.toUpperCase()} — ${brief.creativeContract.title}\n\n> Bản đọc tự động từ \`${path.basename(source)}\`. Chỉ sửa file JSON nguồn.\n\n## CREATIVE CONTRACT\n\n- Khán giả: ${brief.creativeContract.audience}\n- Premise: ${brief.creativeContract.premise}\n- Payoff: ${brief.creativeContract.payoff}\n- Motif quay lại: ${brief.creativeContract.narrativeObject || "Legacy package"}\n- Motion grammar: ${brief.editBlueprint.motionGrammar || "legacy"}\n- Visual grammar: ${brief.editBlueprint.visualGrammar || "legacy"}\n- Scene families: ${(brief.creativeContract.visualStrategy?.sceneFamilies || []).join(", ") || "Legacy package"}\n- Human/action moments: ${(brief.creativeContract.visualStrategy?.humanMoments || []).join("; ") || "Legacy package"}\n- Từ khóa: ${brief.topicKeywords.join(", ")}\n\n${retention}## STORY ARC\n\n${arcRows ? `| Stage | Range | Voice anchor | Purpose | Visual progression |\n|---|---:|---|---|---|\n${arcRows}` : "Legacy package không có storyArc."}\n\n## FINAL VOICEOVER\n\n${brief.voiceover.displayText}\n\n## TTS VOICE TEXT\n\n${brief.voiceover.voiceText}\n\n## HOOK · BODY · CLOSE\n\n- Hook: ${section.hook.displayText}\n- Story: ${section.body.story}\n- Lesson: ${section.body.lesson}\n- Actions: ${section.body.actions.join("; ")}\n- Close (${section.close.cta}): ${section.close.displayText}\n\n## VOICE-TO-VISUAL CUES\n\n| Cue | Range | Spoken anchor | Voice subject | Visual subject | Why it fits | Scene family | Continuity | Retention | Composition | Items |\n|---|---:|---|---|---|---|---|---|---|---|---|\n${rows}\n\n## SOURCES\n\n${sources}\n\n## APPROVAL\n\nStatus: **${brief.approval.status}** · Version: **${brief.metadata.version}**\n`;
await writeFile(output, markdown);
console.log(`PASS: review generated → ${output}`);
