---
name: creatorflow-script
description: "Turn one explicitly approved CreatorFlow idea into a JSON-first, production-ready short-video package and a derived Markdown review. Use for new scripts, script revisions, phenomenon-led business or branding explainers, or CreatorFlow state ready-for-script. Enforce a prediction-driven hook, delayed theory, semantic retention resets, separate display and TTS text, voice-to-visual cues, credible research notes, and approval gates; do not generate media before script approval."
---

# CreatorFlow Script

Create one observable puzzle, one credible explanation, one marketing lesson, and one action. JSON is the only editable source of truth.

## Preflight

1. Read the profile, state, approved idea JSON, and inventory.
2. Require `ready-for-script`, or create a new version while revising `script-review`.
3. Resolve current or sensitive claims with direct sources and access dates.
4. Read [references/brief-contract.md](references/brief-contract.md), [references/voice-visual-cue-contract.md](references/voice-visual-cue-contract.md), [references/visual-prompt-contract.md](references/visual-prompt-contract.md), [references/opening-frame-contract.md](references/opening-frame-contract.md), and [subject-led visual grammar](../../references/subject-led-visual-grammar.md). If the profile sets `contentStrategy.mode: business-phenomenon-decode-v1`, also read [phenomenon-led retention grammar](../../references/phenomenon-led-retention.md) and create schema version 3.

## Write

- Use three top-level sections: hook 1–3 seconds, body, and close 3–5 seconds. Default to 45–60 seconds.
- Inside those compatible sections, use the seven-stage `storyArc`: `familiarHook`, `curiosityBuild`, `perspectiveFlip`, `marketingDecode`, `proof`, `lesson`, and `application`. For a 58-second default, target 0–3, 3–10, 10–18, 18–31, 31–42, 42–51, and 51–58 seconds; adjust to natural speech without changing the order.
- Start intelligible speech at frame zero. Never use a greeting.
- Hook with a concrete prediction puzzle, honest negation, paradox, or visible contrast. Give the viewer enough information to guess before the reveal. Do not invent scarcity, urgency, statistics, or guaranteed results.
- Keep hook **mode** separate from hook **delivery**. Preserve the approved idea's `hookDesign.delivery` and record the chosen delivery in the brief: `aphoristic-contrast`, `micro-story`, `observational-line`, or `direct-question`. A direct question is a tool, not the default: use it only when the viewer must actively make a prediction. For a planned series, do not use direct-question in adjacent episodes or repeat the same delivery shape when an equally truthful alternative fits.
- For an aphoristic contrast, make both sides concrete and causally honest. For a micro-story, open on one literal action before decoding it. For an observational line, let the image complete the thought. Never add a question just because the hook otherwise feels quiet.
- Design the hook as a thumbnail-quality opening frame: one dominant visual contradiction in the first 0.6–1.2 seconds, with brief readable copy built in Remotion. Store its tension, hero subject, contrast, and copy in `creativeContract.openingFrame`; never open with a generic title card or a three-card grid.
- In the body, tell the case, decode the branding lesson, then give one to three actions. Do not force a list when the story does not support it.
- For `business-phenomenon-decode-v1`, explain the mechanism in ordinary Vietnamese before naming any theory. Store 5–7 semantic curiosity resets in `creativeContract.retentionPlan`; place them 6–10 seconds apart and make each add a question, consequence, flip, proof, mechanism, or application.
- Use one `narrativeObject` as a recurring motif across the arc. Keep it through adjacent cues only while it is still the spoken subject; remove it when the voice shifts to a person, action, place, consequence, or evidence. Return it later through a match move, shared color/shape, or a new `motifKey` instance.
- Delay marketing terminology until `marketingDecode`, after the viewer can already explain the mechanism in ordinary language. A theory label is optional and must never be the payoff.
- Close with exactly one CTA: save or follow. Do not combine both.
- Keep the mascot voice friendly, playful, practical, and easy to understand. Write `voiceText` as spoken Vietnamese, as if telling one smart friend: short breaths, everyday verbs, occasional natural interjections or observations, and one thought per sentence. Avoid guru language, dense marketing jargon, written-style transitions, long explanatory clauses, and a chain of rhetorical questions.
- Plan contextual mascot emotions mapped to the voiceover narrative progression using the 8 standardized mascot states:
  * `thinking`: Hook questions, paradoxes, curiosity build, open dilemmas.
  * `research`: Looking closely, inspecting details, case study analysis, uncovering secrets.
  * `pointing`: Highlighting key lessons, brand examples, important callouts, CTA.
  * `confuse`: Pain points, friction, obstacles, frustrations, complicated setups.
  * `scare`: Urgent risks, warnings, damage, fear of loss, destructive habits.
  * `happy`: Delight, relief, dopamine activation, smooth experience, satisfaction.
  * `thumbup`: Best practices, winning solutions, validation, praise, success.
  * `working`: Hands-on action, testing, implementation, execution, step-by-step audits.
- Store natural viewer copy in `displayText`. Store TTS-safe copy in `voiceText`: spell numbers as Vietnamese words, use clear punctuation, translate meaning before phonetic spelling, and use a pronunciation override only when the configured voice needs it. `sales` means `bán hàng`, never `seo`.
- Do not place phonetic spellings such as `bran-đing` or `mác-két-tinh` in display text or captions.
- Separate macro beats from voice-led visual cues. For 45–60 seconds, plan 20–32 meaningful states: 0.6–1.2 seconds in the hook and normally 0.9–2.0 seconds in the body.
- Use one visual for one concept, two for an explicit comparison, and sequential entrances for narrated lists. Build readable copy and UI in Remotion.
- Every cue must declare `spokenSubject`, `visualSubject`, `visualReason`, `sceneFamily`, and `continuityRole`. The dominant visual must literally describe the current spoken subject. If the voice says customer, friend, staff, delivery, opening, choosing, carrying, asking, or testing, show that person or action rather than leaving the recurring motif on screen with explanatory text.
- Schema version 3 cues also declare `retentionRole`: `hook-puzzle`, `viewer-prediction`, `story-progress`, `perspective-flip`, `mechanism-decode`, `proof-evidence`, `application-audit`, or `cta`. Cover the full set; a camera move or label change cannot satisfy a missing role.
- New briefs use `editBlueprint.visualGrammar: "subject-led-v1"`. Plan at least five distinct scene families and two human/action moments. The recurring motif normally occupies 25–55 percent of cues, may be absent for several cues, and cannot be the only dominant visual for more than two consecutive cues unless the voice is explicitly describing its transformation.
- A camera move or object translation does not count as a new visual state unless it reveals new evidence, a new action, or a changed relationship.
- New scripts default `editBlueprint.motionGrammar` to `continuous-stage-v1`. Cards are forbidden as decoration; a menu, price board, checklist, or interface may use a semantic code template only when that object is evidence in the story.
- Preserve the profile's current mood, Vox style, palette, mascot identity, typography, paper treatment, and safe zones. Strategy changes must not restyle the channel.
- Treat new image assets as clean Flow Agent source cutouts and record `provider: "flow-agent"`. Require an exact, flat, single-color `#00FF00` background with no gradient, texture, vignette, shadow, green rim, or decorative marks; preserve twelve percent empty margin. Final pink paper, torn contour, shadow, and offset belong to Remotion, not the generated image. Never plan another image-generation provider as fallback.
- Use real sourced evidence for real brands, products, public people, research, interfaces, menus, or claims. Never ask Flow Agent to fabricate branded evidence, logos, study screenshots, dashboards, or outcome charts. Batch exactly three only for simple compatible props; generate people, hands, hook heroes, complex products, and evidence individually.

## Save and validate

1. Save `briefs/epNNN-slug-vNN.json` with `approval.status: "script-review"`.
2. Run `node <skill-dir>/scripts/validate-brief.mjs <brief.json>`.
3. Run `node <skill-dir>/scripts/render-script-review.mjs <brief.json>` to create the sibling `.review.md`.
4. Set state to `script-review` and return both paths plus the smallest approval choices.

Legacy `.md` briefs may be validated with `--legacy`; never create a new Markdown-first brief. Generate no image, voice, transcription, or render before explicit approval.
