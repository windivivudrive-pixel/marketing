# Voice-to-visual cue contract

## Two timelines

- Use 7–9 macro beats for story structure, headline changes, and emotional progression.
- Use visual cues for meaningful screen states. A macro beat may contain several cues.
- Map one cue to one exact spoken anchor and cover the full provisional runtime without gaps.
- Store cues as JSON objects. Provisional `startMs` and `endMs` come from the script package; production replaces them from the final trimmed voice and `words.json`.
- Treat the edit as one continuous story world, not one permanently occupied stage. A new cue may reframe the same object while the thought continues, or cut to the literal new subject when the voice changes meaning.

## Choose the visual count

| Spoken meaning | Composition | Rule |
|---|---|---|
| One subject, action, cause, or result | `solo` | One dominant visual. |
| Comparison, before/after, or cause/effect that must be seen together | `compare` | Two visuals; introduce the second at its own spoken anchor. |
| Explicit three-part list or process | `sequence` or `process` | Up to three visuals, introduced one by one. Split into multiple cues if any item becomes too small. |
| Number, exact label, chart, button, warning, or interface state | `code` | Draw it in Remotion; do not generate readable text in an image. |
| Same concept changes state | `transform` | Reuse the stable item and visibly change its state. |

## Semantic selection

For each cue, write the spoken claim in plain language, then choose the most concrete observable evidence. Prefer literal people, products, actions, orders, documents, and controls. Use a metaphor only when the literal action cannot be shown clearly. Do not use generic arrows, stars, marketing icons, or decorative stickers as the dominant proof.

Every row must state why the chosen state helps a viewer understand that exact line. If the reason could fit an unrelated marketing sentence, the visual is too generic.

Each cue stores `spokenSubject`, `visualSubject`, `visualReason`, `sceneFamily`, and `continuityRole` (`motif-anchor`, `literal-evidence`, `human-action`, `context`, `proof`, or `application`). `visualSubject` must be concrete enough to draw or source. A label is supporting copy, not a substitute for a missing person, action, place, or object.

Schema version 3 also stores `retentionRole`: `hook-puzzle`, `viewer-prediction`, `story-progress`, `perspective-flip`, `mechanism-decode`, `proof-evidence`, `application-audit`, or `cta`. `retentionRole` describes the information job, while `continuityRole` describes how the visual participates in the scene.

Every retention reset must begin on a cue with a new information job and a concrete visual change. Changing only camera, scale, position, label, or accent is not a valid reset. Across each 6–10 second interval, change at least one of subject, action, evidence type, point of view, or scene family.

## Recurring motif versus current subject

- `continuous-stage-v1` describes motion continuity, not permanent motif visibility.
- Keep the motif only while it remains semantically useful. Let it leave completely when another subject becomes dominant.
- Return the same motif with `motifKey` on a later item instance; adjacent carries keep the same stable item ID, non-adjacent returns use a new item ID plus the shared `motifKey`.
- Default motif share is 25–55 percent of cues. Require at least five scene families and two human/action cues in a 45–60 second story-led video.
- No motif-only run may exceed two cues unless those cues show a real multi-step transformation named by the voice.

## Timing and exits

- In the script brief, timings are provisional but contiguous.
- In production, retime cue starts and every new item entrance from token-level timestamps of the final processed voice.
- The first normalized word of `spokenAnchor` must occur in `voiceover.voiceText`; display-only copy is not a timing anchor.
- Use `replace` when the spoken idea changes, `carry` only when the previous item is required to understand the next line, and `transform` when the same concept visibly changes.
- Assign SFX to new item entrances only. A carried item keeps its stable ID and does not replay.

## Continuous-stage motion

- New briefs set `editBlueprint.motionGrammar: "continuous-stage-v1"`.
- Cue `camera.mode` is one of `static`, `push-in`, `pull-out`, `pan`, or `follow`; cue `transition` is one of `cut`, `match-move`, `zoom-through`, `mask-reveal`, or `reframe`.
- Each item stores a normalized `transform` with `from` and `to` values for `x`, `y`, `scale`, `rotation`, and `opacity`, plus `easing` (`linear`, `ease-out`, or `spring`). Coordinates are offsets from the stage center, not absolute safe-zone positions.
- Prefer `match-move`, `reframe`, and stable-ID transforms while the thought continues. Use `cut` only when the spoken meaning genuinely changes.
- A code-drawn card is allowed only with `semanticRole: "evidence"` and a concrete template such as menu, price board, checklist, chart, or interface. Never wrap ordinary labels or illustrations in a decorative card.

## Proof and source mode

- Use `proof-evidence` for a sourced artifact, documented experiment, honest comparison, or visible demonstration.
- Use sourced media for real brands, products, public figures, menus, interfaces, research, and public claims. Do not use an AI-generated approximation as evidence.
- Use `mechanism-decode` for a simple Remotion relationship or causal diagram after the story has made the mechanism understandable in ordinary language.
- Use `application-audit` to show the viewer performing the one recommended check or change.
