---
name: creatorflow-ideate
description: "Research, de-duplicate, score, and package short-video ideas around a concrete viewer-facing phenomenon, hidden mechanism, credible proof, and one practical lesson. Use when the user asks what to publish next, wants business or branding phenomena decoded, requests real or current cases, or CreatorFlow state is ready-for-ideas. Save machine-readable JSON plus a derived Markdown review; do not write a production script or generate media."
---

# CreatorFlow Ideate

Find a concrete phenomenon that creates a prediction, earns a credible explanation, and ends in one useful action. Do not copy another creator's wording, cases, thumbnails, visuals, or identity.

Resolve `<skill-dir>` as this skill folder. Read `creatorflow/profile.json`, the workflow state, and the local content inventory before proposing ideas.

## Workflow

1. Run `node <skill-dir>/scripts/topic-inventory.mjs <project>` and reuse `creatorflow/content-inventory.json`.
2. Read [references/scoring-and-safety.md](references/scoring-and-safety.md), [references/idea-output-contract.md](references/idea-output-contract.md), and [subject-led visual grammar](../../references/subject-led-visual-grammar.md). If the profile sets `contentStrategy.mode: business-phenomenon-decode-v1`, also read [phenomenon-led retention grammar](../../references/phenomenon-led-retention.md) and use schema version 3.
3. Build a balanced candidate pool from observable SME situations, buying behavior, storefront or platform friction, pricing and packaging contrasts, service moments, and verified brand/product stories. The phenomenon is the entry point; a famous brand is optional proof, not the default premise.
4. Browse for current, viral, hot, or drift-prone claims. Store direct sources and access dates. Never label an idea `VIRAL` without dated evidence.
5. Reject vague theory, generic listicles, jargon-first titles, guru claims, invented outcomes, and ideas whose lesson cannot be shown on a phone. Reject any number or causal claim without a source that directly supports it.
6. Mark semantic duplicates when three of viewer pain, case, lesson, payoff, and target emotion match. Mark the same case with a genuinely different lesson as `ADJACENT`.
7. Score freshness, audience fit, hook clarity, story clarity, lesson usefulness, evidence, visual clarity, rights readiness, production cost, and shelf life from 1–5. Also score opening familiarity, viewer participation, broad-audience reach, curiosity gap, recurring-motif strength, semantic visual coverage, scene variety, motion potential, proof readiness, retention-reset strength, single-lesson clarity, and immediate applicability.
8. Save 6–10 ranked ideas to `ideas/YYYYMMDD-ideas-vNN.json`. Run `node <skill-dir>/scripts/validate-ideas.mjs <ideas.json>` and `node <skill-dir>/scripts/render-ideas-review.mjs <ideas.json>`. Set state to `idea-review`.

## Editorial contract

- Lead with an observable business puzzle and let the viewer form a prediction, not a marketing term or abstract pain point.
- Choose the **hook delivery** separately from the hook's informational mode, and save it in `hookDesign.delivery`. Rotate among: `aphoristic-contrast` (one image with two truthful opposing outcomes), `micro-story` (a small familiar action that changes meaning), `observational-line` (a compact everyday observation the viewer completes mentally), and `direct-question` (only when self-prediction is genuinely the quickest entry).
- Do not default every idea to a question. When the inventory or planned sequence is available, avoid `direct-question` for two adjacent episodes and avoid repeating the same delivery shape when another honest delivery fits the phenomenon. A metaphor or contrast must preserve the actual causal meaning; it cannot merely sound profound.
- Default to `everyday-object-reveal`: begin with one familiar object or situation, let it create a question, reveal the hidden mechanism, then translate that mechanism into marketing. Use another pattern only when the topic genuinely cannot support this spine, and record why.
- Give every idea a `narrativeObject` as a recurring motif, not a mandatory permanent subject. It may leave the frame whenever the voice changes to a person, action, place, interface, consequence, or proof, then return at meaningful anchor points.
- For `business-phenomenon-decode-v1`, require `phenomenon`, `hookDesign`, `theoryBridge`, `proofPlan`, and 5–7 `retentionResets`. The first reset is the hook puzzle; subsequent resets add a consequence, flip, evidence, mechanism, or application rather than decorative movement.
- Require a `sceneOpportunities` map with at least five distinct literal scenes. Each scene names the spoken subject, the concrete visual subject, the action being shown, and whether the recurring motif is present. Reject an idea that can only produce one object plus changing text.
- Prefer ideas with people doing things: choosing, comparing, carrying, opening, asking, hesitating, returning, sharing, or testing. A motion-ready idea changes information and point of view, not merely x/y/scale.
- Explain branding through a real behavior, decision, object, price, package, storefront, message, or interaction. Explain the mechanism in ordinary Vietnamese before optionally naming the theory.
- Write the proposed spoken hook as a line someone could say naturally to a friend: short clauses, ordinary vocabulary, and a clear image or action. Do not turn the hook, insight, or payoff into an essay sentence or stack rhetorical questions to manufacture energy.
- End with exactly one lesson and one action the viewer can try.
- Keep `topicKeywords` specific enough to feed the script workflow.
- Mix evergreen verified cases with current cases when evidence and image rights are viable.
- Source real brands, studies, interfaces, and public claims as evidence. Never plan AI-recreated logos, branded packages, public figures, research screenshots, or fake dashboards as proof.
- Prefer Vietnamese meaning over English jargon. If a term is necessary, explain it in one short sentence.

Do not create a script, voice, image, transcription, or render during ideation.
