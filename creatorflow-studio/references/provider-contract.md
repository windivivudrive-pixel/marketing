# Provider contract

CreatorFlow owns workflow state, approval gates, artifact schemas, prompts, output paths, and QA. A provider only performs one bounded capability.

## Capability routes

- `images`: `flow-agent` is the only generation route. `provided-media` means an existing buyer-supplied or licensed asset and is not a generation fallback.
- `voice`: `provided-audio`, `cartesia`, or another buyer-configured TTS adapter.
- `research`: any browsing or retrieval capability available to the host.
- `render`: local Remotion by default, or another renderer that satisfies the same output and QA contract.

The image provider is fixed policy: never change the idea, prompt, or output route to accommodate another image generator. Voice, research, and render remain independently configurable.

## Shared local credential model

For Cartesia on macOS, store the API key once in Keychain service `creatorflow-cartesia`. Store only a project voice ID, model settings, and provider route in `creatorflow/profile.json`. Any local host—Antigravity, Codex, Cherry Agent, or a terminal—must run the same readiness command and call the same guarded media adapter. Never copy a secret from one host configuration into another project's files.

## Minimum adapter behavior

Before a paid call, an adapter must accept or resolve:

- an approved artifact version and output ID;
- an exact prompt or exact voiceover text;
- model/voice settings and required references;
- a versioned destination path;
- a stable idempotency key;
- a readiness check that exposes a clear pass or blocker;
- actual usage metadata without logging secrets.

Reuse an existing destination only when its recorded idempotency key and semantic purpose match. Never overwrite an approved asset.

## Host capability fallback

If the host cannot discover `SKILL.md`, load the generated CreatorFlow system prompt. If it cannot access local files, connect a filesystem MCP scoped to the project. If it cannot call Flow Agent, stop at the relevant approval gate and export the exact Flow request manifest; do not execute it with another image provider.
