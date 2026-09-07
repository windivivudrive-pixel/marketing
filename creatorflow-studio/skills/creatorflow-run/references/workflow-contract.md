# Workflow contract

## State path

`needs-setup → ready-for-ideas → idea-review → ready-for-script → script-review → production-ready → assets-ready → rendered → qa-passed`

Only the user can move `idea-review` to `ready-for-script` and `script-review` to `production-ready`. Deterministic validators move the remaining stages after their evidence exists.

## Artifact contract

| Stage | Required artifact | Paid calls allowed |
|---|---|---|
| Setup | `creatorflow/profile.json` | No |
| Ideas | canonical `ideas/YYYYMMDD-ideas-vNN.json` plus derived `.review.md` | No |
| Script | canonical `briefs/epNNN-slug-vNN.json` plus derived `.review.md` | No |
| Production | episode JSON, voice, captions, local visuals | Yes, after estimate |
| Render | versioned MP4 and QA report | No new calls unless QA requires regeneration |

Keep voice sections, display/TTS text, on-screen copy, visual cues, sources, quota, and edit blueprint as separate JSON fields. Review Markdown is derived and read-only. Never use chat text or review Markdown as the production source of truth.

## Resume behavior

Read state and paths from disk before asking the buyer what happened. If an artifact exists but state is stale, validate the artifact and repair state without repeating a paid action. Never infer that a generated file is approved merely because it exists.
