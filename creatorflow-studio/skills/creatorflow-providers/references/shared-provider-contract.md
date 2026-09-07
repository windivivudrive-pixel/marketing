# Shared provider contract

- Flow readiness is live machine state: query `flow status` in the active task; do not copy a previous chat's claim.
- Flow Agent is the only image-generation provider. Reusing buyer-supplied/licensed media is allowed, but another image generator is not a fallback.
- Require backend healthy, extension connected, and Flow key present before every image call. A timeout or missing signal blocks generation.
- When the user-approved profile enables `providers.flowAgent.autoStart`, `ensure-flow-agent.mjs` may run the exact configured `npm run bridge:all`, wait, and recheck. If readiness still fails, stop.
- Cartesia credential lives only in the current macOS user's Keychain service `creatorflow-cartesia`. The project stores a voice ID and non-secret settings only.
- A host with the API key imports it once with `configure-cartesia --from-env`; every local host can then check and use the same provider.
- Provider status is safe to share. It may include provider name, configured voice ID, bridge flags, and timestamp; it must never contain API keys, tokens, cookies, or headers.
- Voice synthesis requires the exact approved brief recorded in `creatorflow/state.json`, a source text file, a new versioned output, and one idempotency key.
- Image-provider selection is not variable. Voice-provider selection never changes the approved voiceover, visual plan, timing contract, or quota gate.
