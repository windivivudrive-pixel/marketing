# Buyer quick start

## Portable core

CreatorFlow's `skills/`, `references/`, `scripts/`, `templates/`, and Remotion starter are the source of truth. Codex, Antigravity, Cherry Studio, and other MCP-capable hosts are adapters around that same core. The reasoning model may be OpenAI, Gemini, DeepSeek, or another capable model with adequate instruction following and tool use.

Requirements: Node.js 20+ for the bundled validators and Remotion pipeline. Media providers are optional until production and must be configured by the buyer.

Build the generated host artifacts:

```bash
npm run build:adapters
npm run validate:portable
```

## Antigravity

Install this source directory into a workspace without copying it:

```bash
node scripts/install-host.mjs --host antigravity --workspace /absolute/path/to/workspace
```

This creates `.agents/plugins/creatorflow-studio` as a symlink to the portable source. Antigravity reads `plugin.json`, `mcp_config.json`, and `skills/` directly.

## Codex

From the folder that contains this marketplace:

```bash
codex plugin marketplace add /absolute/path/to/creatorflow-marketplace
codex plugin add creatorflow-studio@creatorflow-marketplace
```

Start a new Codex task after installation so the adapter is reloaded. Codex reads `.codex-plugin/plugin.json`, `.mcp.json`, and the same `skills/` source.

## Cherry Studio and other MCP clients

Cherry Studio does not use the Antigravity or Codex plugin manifests. Put the contents of `dist/cherry-studio/CREATORFLOW_SYSTEM_PROMPT.md` into the assistant/system prompt, then add the STDIO server described in `dist/cherry-studio/mcp-flow.json` under MCP Server settings. Give the assistant filesystem access only to the content project, and enable the MCP tools for the selected model.

For another host that cannot discover `SKILL.md`, use `dist/generic/CREATORFLOW_SYSTEM_PROMPT.md` plus the matching standard MCP configuration. A model API by itself is only the reasoning layer; it still needs filesystem/tool access and the selected provider adapters to create actual files, media, or renders.

## Required Flow Agent image provider

The package requires `flow-agent` for every newly generated image. `provided-media` may be reused as an existing buyer-supplied or licensed asset, but no other image generator is a fallback. Flow Agent is not redistributed in this package because no license file was present in the inspected upstream checkout.

Review the upstream repository and terms, then install the pinned tested version if your use is permitted:

```bash
git clone https://github.com/kodelyx/flow-agent.git
cd flow-agent
git checkout e7f64ae00e3ee9a8e3586d78a5d33ba7151ca7b7
cd flow-agent
uv tool install --force .
```

Load the upstream `flow-extension` folder as an unpacked Chrome extension, open Google Flow in the same browser, then run `flow status`. Both `extension_connected` and `has_flow_key` must be `True` before paid generation.

If the buyer explicitly enables `providers.flowAgent.autoStart`, configure `startCwd` and the exact `startCommand: ["npm", "run", "bridge:all"]`. CreatorFlow then checks first, starts the bridge only when needed, waits, and verifies all Flow signals again.

## First prompt

Use this compact format:

```text
Run CreatorFlow.
Topic: home coffee for busy beginners.
Audience: 22–35, English-speaking.
Vibe: warm editorial, calm, tactile, lightly humorous.
Platform: TikTok.
Resources: I have a logo and voice recording; use the configured image provider.
```

CreatorFlow initializes a project, finds ideas, and pauses for selection. It writes the approved idea into a production brief and pauses again before any paid media call. After script approval and voice readiness, it generates only missing assets and renders the Remotion project.

## Commands for support

```bash
node plugins/creatorflow-studio/scripts/workflow-state.mjs status /path/to/project
node plugins/creatorflow-studio/scripts/validate-profile.mjs /path/to/project production
node plugins/creatorflow-studio/scripts/creatorflow-media.mjs status --project /path/to/project
node plugins/creatorflow-studio/scripts/check-provider.mjs --project /path/to/project --capability images --provider flow-agent
```

## Dùng chung Flow và Cartesia giữa Antigravity với Codex

Flow Agent là bridge chạy trên máy, không thuộc riêng một chat. Hãy kiểm tra live bằng `creatorflow-media.mjs status` trước khi bắt đầu dựng ở host khác.

Với Cartesia, host đang có `CARTESIA_API_KEY` chỉ cần chạy một lần:

```bash
node plugins/creatorflow-studio/scripts/creatorflow-media.mjs configure-cartesia --from-env
```

Khóa được lưu trong macOS Keychain, còn `creatorflow/profile.json` chỉ chứa `providers.cartesia.voiceId`. Từ đó Antigravity và Codex gọi cùng một voice route; không cần dán API key lần hai.

Never send support staff API keys, cookies, browser profiles, session tokens, client reference photos, or the Flow `history.json` file.

Google's current labs.google/fx FAQ says interactions and outputs may be used to improve products and may be human reviewed when history is enabled. Do not enter confidential information; review the current Google privacy controls and terms before client work.
