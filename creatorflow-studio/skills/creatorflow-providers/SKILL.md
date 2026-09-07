---
name: creatorflow-providers
description: "Check, connect, and use the shared CreatorFlow image and voice providers across Antigravity, Codex, Cherry Studio, and local command hosts. Use when a user asks whether Flow Agent or Cartesia is connected, says another host already has the bridge/API configured, wants to make a Cartesia voice, or encounters a missing provider while editing or rendering. Keep credentials in Keychain, preserve approval gates, and return portable readiness evidence."
---

# CreatorFlow Providers

Treat providers as shared machine capabilities, not host-specific chat settings. Read [references/shared-provider-contract.md](references/shared-provider-contract.md).

## Readiness

Run this before the first provider call in a task and whenever the user switches hosts:

`node <creatorflow-root>/scripts/creatorflow-media.mjs status --project <project>`

Report the result from the command. Do not rely on an earlier host saying that a bridge was connected.

Before every image-generation call, run `node <creatorflow-root>/scripts/ensure-flow-agent.mjs --project <project>`. Require all three Flow signals. The command may run the profile-approved `npm run bridge:all`; if readiness still fails, stop and never use another image provider.

## Configure Cartesia once on macOS

If Antigravity already has `CARTESIA_API_KEY` in its secure environment, run there:

`node <creatorflow-root>/scripts/creatorflow-media.mjs configure-cartesia --from-env`

This copies the key into the current macOS user's Keychain under `creatorflow-cartesia`. Never put the key in `profile.json`, `.mcp.json`, prompts, commits, logs, or an artifact. Codex and other local hosts read the same Keychain item automatically.

## Generate a voice

Require an explicitly approved script. Use the voice ID in `creatorflow/profile.json`, a versioned output path, and a unique idempotency key:

`node <creatorflow-root>/scripts/creatorflow-media.mjs tts --project <project> --brief <approved-brief> --text-file <voiceover.txt> --output public/audio/epNNN-voice-cartesia-vNN.wav --idempotency-key <project>-epNNN-vNN-cartesia`

The command refuses an unapproved/mismatched brief, an existing output, a reused key with a different path, or a missing credential. It records non-secret usage metadata in `creatorflow/provider-usage.jsonl` and updates only the voice artifact path.

## Host adapters

When the host supports MCP, use `creatorflow_provider_status` before paid media and `creatorflow_synthesize_cartesia_voice` after script approval. If the host cannot resolve the plugin-relative MCP script, use the generated host file in `dist/<host>/mcp-creatorflow-media.json`. The commands remain the portable fallback.
