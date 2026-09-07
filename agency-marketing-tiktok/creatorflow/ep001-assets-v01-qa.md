# EP001 generated assets v01 — review QA

## Delivered for review

- Five Flow Agent sheets, one generated image per sheet, three semantic zones per sheet.
- Model: `gem_pix_2` (Nano Banana Pro).
- Actual Flow output: portrait 768x1376. Google Flow rejected the bridge's 3:4 enum before generation, so the approved three-zone sheet plan was preserved in 9:16 portrait.
- Cartesia voice: `Voice Tiktok`, Vietnamese, voice ID `b143fdf3-029f-4f00-aa3f-0c171fb170bd`.
- Voice model: `sonic-3.5-2026-05-04`.
- Transcript: exact approved FINAL VOICEOVER v03, 858 characters.
- Processed voice duration: 48.56 seconds; PCM 16-bit mono 48 kHz; mean -22.7 dB, peak -2.2 dB.

## Visual review

- S01: bottle, box and blank-screen phone are distinct and cleanly separated.
- S02: the same fictional Vietnamese office worker and pink bottle remain consistent across all three moments; the cold-drink reaction reads clearly.
- S03: three distinct young Vietnamese professionals; unsure, frustrated and comparing expressions are readable.
- S04: speech bubbles, funnel and target read immediately; no embedded writing.
- S05: swipe, replace and merge actions are distinguishable; hands are acceptable with no obvious extra fingers.
- All sheets use a flat chroma-green field and contain no text, logo, watermark or fake interface.
- A small decorative sparkle appears at the lower-right edge of each sheet. It is outside the semantic crops and will be excluded locally; no regeneration is recommended.

## Production status

- Actual successful Flow image calls: 5.
- Failed pre-generation submissions: three S01 requests failed before media creation due to wrong-client reference revalidation, a rejected 3:4 enum and stale reference history. No output was returned from those attempts.
- Actual Cartesia generations: 1.
- No automatic semantic regeneration was made.
- Transparent crops, transcription-derived captions, beat retiming and video render intentionally remain pending until user asset approval.
