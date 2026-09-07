#!/usr/bin/env node

import {commandValue, getProviderStatus, importCartesiaEnvironment, synthesizeCartesia} from "./provider-runtime.mjs";

const args = process.argv.slice(2);
const command = args[0] || "status";
const required = (flag) => {
  const value = commandValue(args, flag);
  if (!value) throw new Error(`Missing ${flag}`);
  return value;
};

try {
  if (command === "status") {
    const result = await getProviderStatus({project: required("--project"), capability: commandValue(args, "--capability", "all"), provider: commandValue(args, "--provider")});
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } else if (command === "configure-cartesia") {
    if (!args.includes("--from-env")) throw new Error("For safety, configure-cartesia requires --from-env and never accepts an API key argument.");
    console.log(JSON.stringify(importCartesiaEnvironment(commandValue(args, "--keychain-service") || undefined), null, 2));
  } else if (command === "tts") {
    const result = await synthesizeCartesia({
      project: required("--project"),
      brief: required("--brief"),
      textFile: required("--text-file"),
      output: required("--output"),
      idempotencyKey: required("--idempotency-key"),
      language: commandValue(args, "--language"),
    });
    console.log(JSON.stringify(result, null, 2));
  } else {
    throw new Error("Usage: creatorflow-media.mjs status --project <project> | configure-cartesia --from-env | tts --project <project> --brief <approved-brief> --text-file <voiceover.txt> --output <versioned.wav> --idempotency-key <key>");
  }
} catch (error) {
  console.error(JSON.stringify({ok: false, code: error.code || "ERROR", message: error.message}, null, 2));
  process.exitCode = 1;
}
