# Remotion QA

## Technical

- lint and type-check pass;
- episode and captions validators pass;
- production validation includes word timestamps and schema v2 visual cues;
- every `staticFile()` target exists;
- final output is 1080x1920 or the saved profile size, 30 fps unless configured otherwise;
- final MP4 contains H.264 video and AAC audio when audio is expected;
- no clipping, missing fonts, remote requests, black frames, or silent tail.

## Semantic

- frame one communicates the premise;
- opening 0.6–1.2 seconds form a compelling thumbnail-quality hook with one dominant truthful conflict; no generic title card or three-card grid competes with the premise;
- speech begins immediately unless the approved style intentionally uses a sub-120 ms breath;
- the hook is understandable muted and clean audio-only;
- captions follow the actual voice;
- only leading and trailing silence was removed; meaningful internal pauses remain;
- active-word highlighting follows `words.json`, never exceeds `1.15` scale, uses `whiteSpace: "pre-wrap"`, and stays above the mascot in the TikTok safe zone;
- visuals support the spoken beat and do not swap A/B or imply unsupported claims;
- `continuous-stage-v1` preserves story continuity without forcing permanent motif visibility, and camera motion never hides the current semantic subject;
- for `business-phenomenon-decode-v1`, every cue retains a valid retention role; the opening is `hook-puzzle`, the close is `cta`, and all eight roles survive the approved-brief handoff;
- every stored retention reset begins on its re-timed spoken cue/word boundary, preserves the approved information gain, and changes knowledge or expectation rather than only motion, copy styling, zoom, wiggle, or SFX;
- each six-to-ten-second interval changes at least one of subject, action, evidence type, point of view, or scene family, and the finished contact sheet visibly covers hook puzzle, story action, proof evidence, mechanism decode, and application audit;
- each cue's dominant image literally matches the current person, object, action, place, interface, consequence, or proof named by the voice;
- the recurring motif leaves when it is no longer the current subject, returns only at meaningful anchors, occupies roughly 25–55 percent of cues by default, and never creates more than two consecutive motif-only cues without a narrated transformation;
- the final contact sheet contains at least five distinct scene families and two human/action moments; repeated x/y/scale changes of one object do not count as scene variety;
- match-move, zoom, transform, and reframe states visibly continue the prior idea instead of behaving like unrelated slides;
- ordinary labels and illustrations are not wrapped in decorative cards; semantic menus, price boards, checklists, charts, and interfaces are allowed only when used as evidence;
- every cue start and item entrance lands on its stored spoken anchor within one render frame;
- carried items do not replay entrance animation or SFX;
- one, two, and three-item layouts remain legible on a phone and never exceed three visible items;
- every generated subject is a clean, complete alpha sticker with a soft pastel-pink watercolor backing masked to its own silhouette, an irregular ripped-white contour, hot-pink offset and gentle paper shadow; no rectangular backing, clipped limb/object, baked shared paper card, green fringe, shifted-green residue, or merged batch neighbor is visible; confirm all four keyed source corners are transparent;
- inspect the lower-right source area of every supplied image before key/crop; a visible or unresolved watermark blocks that asset for manual review;
- do not create or require `watermarkRemoval` metadata in new runs. Historical cleanup sidecars are read-only evidence, and no original may be cropped or masked to conceal a watermark;
- mascot appearances are contextual punctuation only, use profile inventory, last no more than 0.35 seconds per shot, and never persist as a continuous lower-screen overlay;
- series label is a quiet identity mark; no fixed header/headline/card/mascot/footer grid dominates the stage;
- `remotion-paper` and `legacy-precut` are never applied to the same asset;
- references retain identity/product details where required;
- source notes, supported claims, provenance, and media rights/readiness are complete; real branded, research, interface, price, public-figure, or public-claim evidence is not an AI reconstruction;
- mobile-safe center crop and right-side UI gutter remain clear.

Render a start and midpoint still for every visual cue, plus the complete opening 0–3.2 seconds. Save a cue QA matrix with spoken anchor, retention role, expected information gain, expected visual subject, actual asset/state, timing result, semantic-change result, evidence result, and safe-zone result. Passing compilation is not evidence that the edit works.
