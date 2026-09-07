#!/usr/bin/env node

import readline from "node:readline";
import {getProviderStatus, synthesizeCartesia} from "./provider-runtime.mjs";

const tools = [
  {
    name: "creatorflow_provider_status",
    description: "Check the shared Flow Agent and Cartesia readiness for a CreatorFlow project without generating media or spending quota.",
    inputSchema: {type: "object", properties: {project: {type: "string"}, capability: {type: "string", enum: ["all", "images", "voice"]}}, required: ["project"]},
  },
  {
    name: "creatorflow_synthesize_cartesia_voice",
    description: "Create a versioned Cartesia WAV only after the specified CreatorFlow brief is approved. The Cartesia key stays in macOS Keychain and is never returned.",
    inputSchema: {type: "object", properties: {project: {type: "string"}, brief: {type: "string"}, textFile: {type: "string"}, output: {type: "string"}, idempotencyKey: {type: "string"}, language: {type: "string"}}, required: ["project", "brief", "textFile", "output", "idempotencyKey"]},
  },
];

const reply = (id, result, error) => process.stdout.write(`${JSON.stringify(error ? {jsonrpc: "2.0", id, error} : {jsonrpc: "2.0", id, result})}\n`);
const asToolResult = (value, isError = false) => ({content: [{type: "text", text: JSON.stringify(value, null, 2)}], isError});

const server = readline.createInterface({input: process.stdin, crlfDelay: Infinity});
server.on("line", async (line) => {
  let request;
  try {
    request = JSON.parse(line);
    if (request.method === "notifications/initialized") return;
    if (request.method === "initialize") return reply(request.id, {protocolVersion: request.params?.protocolVersion || "2024-11-05", capabilities: {tools: {}}, serverInfo: {name: "creatorflow-media", version: "1.4.1"}});
    if (request.method === "tools/list") return reply(request.id, {tools});
    if (request.method === "tools/call") {
      const input = request.params?.arguments || {};
      if (request.params?.name === "creatorflow_provider_status") return reply(request.id, asToolResult(await getProviderStatus({project: input.project, capability: input.capability || "all"})));
      if (request.params?.name === "creatorflow_synthesize_cartesia_voice") return reply(request.id, asToolResult(await synthesizeCartesia(input)));
      return reply(request.id, asToolResult({ok: false, message: `Unknown tool: ${request.params?.name}`}, true));
    }
    if (request.id !== undefined) reply(request.id, undefined, {code: -32601, message: `Method not found: ${request.method}`});
  } catch (error) {
    if (request?.id !== undefined) reply(request.id, asToolResult({ok: false, code: error.code || "ERROR", message: error.message}, true));
  }
});
