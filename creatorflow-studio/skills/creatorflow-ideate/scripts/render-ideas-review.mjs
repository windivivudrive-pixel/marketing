#!/usr/bin/env node

import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node render-ideas-review.mjs <ideas.json> [output.md]");
  process.exit(2);
}
const source = path.resolve(input);
const data = JSON.parse(await readFile(source, "utf8"));
const output = path.resolve(process.argv[3] || source.replace(/\.json$/i, ".review.md"));
const ranked = [...data.ideas].sort((a, b) => a.rank - b.rank);
const blocks = ranked.map((idea) => {
  const scenes = (idea.sceneOpportunities || []).map((scene, index) => `| ${index + 1} | ${scene.voiceSubject} | ${scene.literalVisual} | ${scene.action} | ${scene.sceneFamily} | ${scene.retentionLayer || "legacy"} | ${scene.motifPresent ? "có" : "không"} |`).join("\n");
  const phenomenon = idea.phenomenon ? `- Hiện tượng: ${idea.phenomenon.observableMoment}\n- Người xem tự đoán: ${idea.phenomenon.viewerPrediction}\n- Mâu thuẫn nhìn thấy: ${idea.phenomenon.visibleContradiction}\n- Hệ quả kinh doanh: ${idea.phenomenon.businessStake}\n- Hook (${idea.hookDesign.mode}): ${idea.hookDesign.spokenHook}\n- Câu trả lời đang giữ lại: ${idea.hookDesign.withheldAnswer}\n- Cơ chế nói đời thường: ${idea.theoryBridge.plainLanguageMechanism}\n- Tên lý thuyết: ${idea.theoryBridge.technicalLabel || "Không cần gọi tên"}\n- Bằng chứng dự kiến: ${idea.proofPlan.visualProof}\n- Nhịp tò mò: ${(idea.retentionResets || []).map((reset) => `${reset.atSecond}s ${reset.trigger}`).join(" → ")}\n` : "";
  return `## ${idea.rank}. ${idea.title}\n\n- Lane/status: ${idea.lane} · ${idea.status}\n- Mô típ: ${idea.storyPattern}${idea.patternReason ? ` — ${idea.patternReason}` : ""}\n${phenomenon}- Mở đầu gần gũi: ${idea.familiarOpening}\n- Motif quay lại: ${idea.narrativeObject}\n- Khoảng trống tò mò: ${idea.curiosityGap}\n- Cơ chế ẩn: ${idea.hiddenMechanism}\n- Cầu nối marketing: ${idea.marketingBridge}\n- Chứng minh: ${idea.proofMove}\n- Motion: ${(idea.motionPotential || []).join("; ")}\n- Nỗi đau: ${idea.painPoint}\n- Câu chuyện: ${idea.caseStory}\n- Nghịch lý: ${idea.curiosityParadox}\n- Một bài học: ${idea.singleLesson}\n- Làm ngay: ${idea.immediateApplication}\n- Từ khóa: ${idea.topicKeywords.join(", ")}\n- Quyền hình ảnh / chi phí: ${idea.rightsStatus} · ${idea.productionCost}\n- Mức xuất hiện motif dự kiến: ${Math.round((idea.motifUsage?.targetCueShare || 0) * 100)}% cue · tối đa ${idea.motifUsage?.maxConsecutiveMotifOnlyScenes ?? "?"} cảnh chỉ có motif liên tiếp\n- Điểm semantic/đa dạng: ${idea.scores?.semanticVisualCoverage || "?"}/5 · ${idea.scores?.sceneVariety || "?"}/5\n- Tổng điểm: ${idea.totalScore}\n\n### Cơ hội hình ảnh theo voice\n\n| # | Voice nói về | Hình literal | Hành động | Scene family | Retention layer | Motif |\n|---:|---|---|---|---|---|---|\n${scenes}\n\n${idea.evidence.map((item) => `- Nguồn: [${item.title}](${item.url}) — ${item.supports} (${item.accessedAt})`).join("\n")}`;
}).join("\n\n");
const markdown = `# CreatorFlow idea review\n\n> Bản đọc tự động từ \`${path.basename(source)}\`. Chỉ sửa file JSON nguồn.\n\n**Đề xuất mạnh nhất:** ${ranked[0]?.title || "Không có"}\n\n${blocks}\n`;
await writeFile(output, markdown);
console.log(`PASS: idea review generated → ${output}`);
