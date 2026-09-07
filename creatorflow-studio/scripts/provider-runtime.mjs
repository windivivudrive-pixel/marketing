import {appendFile, access, readFile, writeFile} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {userInfo} from "node:os";
import path from "node:path";

export const CARTESIA_KEYCHAIN_SERVICE = "creatorflow-cartesia";
const defaultCartesia = {
  apiVersion: "2026-03-01",
  modelId: "sonic-3.5-2026-05-04",
  outputFormat: {container: "wav", encoding: "pcm_s16le", sample_rate: 48000},
};

const fail = (message, code = "PROVIDER_BLOCKED") => Object.assign(new Error(message), {code});
const flagValue = (args, flag, fallback = "") => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

export const resolveProjectPath = (projectRoot, candidate, label = "path") => {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, candidate);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw fail(`${label} must remain inside the project`, "UNSAFE_PATH");
  return resolved;
};

export const readProject = async (projectArg) => {
  const root = path.resolve(projectArg || ".");
  const profilePath = path.join(root, "creatorflow", "profile.json");
  const statePath = path.join(root, "creatorflow", "state.json");
  const [profile, state] = await Promise.all([
    readFile(profilePath, "utf8").then(JSON.parse),
    readFile(statePath, "utf8").then(JSON.parse),
  ]);
  return {root, profilePath, statePath, profile, state};
};

const currentAccount = () => userInfo().username;
export const keychainHas = (service = CARTESIA_KEYCHAIN_SERVICE) => {
  const result = spawnSync("/usr/bin/security", ["find-generic-password", "-a", currentAccount(), "-s", service], {encoding: "utf8"});
  return result.status === 0;
};
const readKeychain = (service = CARTESIA_KEYCHAIN_SERVICE) => {
  const result = spawnSync("/usr/bin/security", ["find-generic-password", "-a", currentAccount(), "-s", service, "-w"], {encoding: "utf8"});
  if (result.status !== 0 || !result.stdout.trim()) throw fail(`Cartesia credential is missing from macOS Keychain service: ${service}`, "CREDENTIAL_MISSING");
  return result.stdout.trim();
};

export const importCartesiaEnvironment = (service = CARTESIA_KEYCHAIN_SERVICE) => {
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) throw fail("CARTESIA_API_KEY is not available in this host process. Add it in Antigravity once, then run configure-cartesia --from-env there.", "CREDENTIAL_MISSING");
  const result = spawnSync("/usr/bin/security", ["add-generic-password", "-U", "-a", currentAccount(), "-s", service, "-w", apiKey], {encoding: "utf8"});
  if (result.status !== 0) throw fail(`Could not store Cartesia credential in Keychain: ${(result.stderr || "unknown error").trim()}`, "KEYCHAIN_WRITE_FAILED");
  return {ok: true, keychainService: service, account: currentAccount()};
};

const statusForFlow = () => {
  const result = spawnSync("flow", ["status"], {encoding: "utf8", timeout: 15000});
  if (result.error?.code === "ENOENT") return {provider: "flow-agent", ready: false, checked: true, reason: "Flow Agent CLI is not installed on PATH."};
  if (result.error?.code === "ETIMEDOUT") return {provider: "flow-agent", ready: false, checked: true, timedOut: true, reason: "Flow Agent status timed out. Stop image generation; no alternate provider is allowed."};
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.replace(/\u001b\[[0-9;]*m/g, "");
  const backendHealthy = /Backend:\s*up\b/i.test(output) && /status:\s*healthy\b/i.test(output);
  const extensionConnected = /extension_connected:\s*True/i.test(output);
  const hasFlowKey = /has_flow_key:\s*True/i.test(output);
  return {
    provider: "flow-agent",
    ready: result.status === 0 && backendHealthy && extensionConnected && hasFlowKey,
    checked: true,
    backendHealthy,
    extensionConnected,
    hasFlowKey,
    reason: result.status === 0 && backendHealthy && extensionConnected && hasFlowKey ? "Flow Agent backend and browser bridge are healthy." : "Flow Agent is not ready. Stop image generation; do not use another provider.",
  };
};

const statusForCartesia = (profile) => {
  const settings = profile.providers?.cartesia || {};
  const voiceId = settings.voiceId || "";
  const service = settings.keychainService || CARTESIA_KEYCHAIN_SERVICE;
  const credentialPresent = keychainHas(service);
  return {
    provider: "cartesia",
    ready: Boolean(credentialPresent && voiceId),
    checked: true,
    credentialPresent,
    voiceConfigured: Boolean(voiceId),
    voiceId: voiceId || null,
    keychainService: service,
    reason: credentialPresent && voiceId ? "Cartesia credential and project voice ID are available to every local host." : !credentialPresent ? "Run configure-cartesia --from-env in the host that currently has CARTESIA_API_KEY." : "Add providers.cartesia.voiceId to creatorflow/profile.json.",
  };
};

export const getProviderStatus = async ({project, capability = "all", provider = ""}) => {
  const needsProject = capability !== "images" || !provider;
  const projectData = needsProject ? await readProject(project) : {root: project ? path.resolve(project) : null, profile: {providers: {}}};
  const {root, profile} = projectData;
  const selected = {
    images: provider || profile.providers?.images || "provided-media",
    voice: provider || profile.providers?.voice || "provided-audio",
  };
  const results = [];
  const add = (item) => results.push(item);
  if (capability === "all" || capability === "images") {
    if (selected.images === "flow-agent") add({...statusForFlow(), capability: "images"});
    else if (selected.images === "provided-media") add({provider: "provided-media", capability: "images", ready: true, checked: true, reason: "Local approved media route."});
    else add({provider: selected.images, capability: "images", ready: false, checked: true, reason: "Unsupported image provider. CreatorFlow image generation is Flow-Agent-only."});
  }
  if (capability === "all" || capability === "voice") {
    if (selected.voice === "cartesia") add({...statusForCartesia(profile), capability: "voice"});
    else if (selected.voice === "provided-audio") add({provider: "provided-audio", capability: "voice", ready: true, checked: true, reason: "Final supplied audio is still required before timing."});
    else add({provider: selected.voice, capability: "voice", ready: false, checked: false, reason: "No bundled readiness adapter for this voice provider."});
  }
  return {ok: results.every((item) => item.ready), project: root, providers: results, checkedAt: new Date().toISOString()};
};

const readUsage = async (pathName) => {
  try {
    return (await readFile(pathName, "utf8")).trim().split("\n").filter(Boolean).map(JSON.parse);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
};

const readApprovedBrief = async ({root, state, briefArg}) => {
  if (state.approvals?.script?.status !== "approved") throw fail("Cartesia TTS requires explicit script approval.", "APPROVAL_REQUIRED");
  const approved = state.approvals.script.artifact;
  if (!approved) throw fail("Approved script artifact is missing from state.", "APPROVAL_REQUIRED");
  const requested = briefArg || approved;
  if (path.normalize(requested) !== path.normalize(approved)) throw fail(`Requested brief does not match the approved script artifact: ${approved}`, "APPROVAL_REQUIRED");
  const briefPath = resolveProjectPath(root, requested, "approved brief");
  await access(briefPath);
  return {briefPath, brief: requested};
};

export const synthesizeCartesia = async ({project, brief, textFile, output, idempotencyKey, language = ""}) => {
  if (!textFile || !output || !idempotencyKey) throw fail("TTS requires textFile, output, and idempotencyKey.", "INVALID_REQUEST");
  const {root, profile, state, statePath} = await readProject(project);
  const provider = statusForCartesia(profile);
  if (!provider.ready) throw fail(provider.reason, "PROVIDER_BLOCKED");
  const approved = await readApprovedBrief({root, state, briefArg: brief});
  const textPath = resolveProjectPath(root, textFile, "voiceover text");
  const outputPath = resolveProjectPath(root, output, "voice output");
  const transcript = (await readFile(textPath, "utf8")).trim();
  if (!transcript) throw fail("Voiceover text is empty.", "INVALID_REQUEST");
  const usagePath = path.join(root, "creatorflow", "provider-usage.jsonl");
  const prior = await readUsage(usagePath);
  const duplicate = prior.find((item) => item.provider === "cartesia" && item.idempotencyKey === idempotencyKey);
  if (duplicate) {
    if (duplicate.output !== output) throw fail(`Idempotency key already belongs to a different output: ${duplicate.output}`, "IDEMPOTENCY_CONFLICT");
    await access(outputPath);
    return {ok: true, reused: true, output, chars: duplicate.characters, idempotencyKey};
  }
  try { await access(outputPath); throw fail(`Voice output already exists: ${output}. Use a new versioned output path.`, "OUTPUT_EXISTS"); } catch (error) { if (error?.code !== "ENOENT") throw error; }

  const settings = {...defaultCartesia, ...(profile.providers?.cartesia || {})};
  const apiKey = readKeychain(settings.keychainService || CARTESIA_KEYCHAIN_SERVICE);
  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {Authorization: `Bearer ${apiKey}`, "Cartesia-Version": settings.apiVersion, "Content-Type": "application/json"},
    body: JSON.stringify({
      model_id: settings.modelId,
      transcript,
      voice: {id: settings.voiceId},
      language: language || profile.language || "vi",
      output_format: settings.outputFormat,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw fail(`Cartesia TTS failed (${response.status}): ${detail.slice(0, 300)}`, "TTS_FAILED");
  }
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()), {flag: "wx"});
  const usage = {
    schemaVersion: 1,
    provider: "cartesia",
    capability: "voice",
    approvedBrief: approved.brief,
    output,
    idempotencyKey,
    characters: transcript.length,
    voiceId: settings.voiceId,
    modelId: settings.modelId,
    createdAt: new Date().toISOString(),
  };
  await appendFile(usagePath, `${JSON.stringify(usage)}\n`);
  state.artifacts = {...state.artifacts, voice: output};
  state.updatedAt = new Date().toISOString();
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  return {ok: true, reused: false, output, chars: transcript.length, idempotencyKey, usageArtifact: path.relative(root, usagePath)};
};

export const commandValue = flagValue;
