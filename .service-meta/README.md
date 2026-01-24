# 🧠 Meta Agent Generator for Deno

**Part of LLM Task Orchestrator**

---

## 📌 Overview

The **Meta Agent Generator** is an advanced **TypeScript-based automation engine built for Deno** that dynamically creates fully self-contained **single-file ReACT agents** based on user-defined configuration. Instead of manually writing agent logic, tools, prompts, and execution pipelines, this generator **programmatically builds production-ready AI agents** from command-line parameters or API requests.

Each generated agent follows the **ReACT (Reasoning + Acting)** methodology, interleaving step-by-step reasoning with real tool execution to solve complex tasks autonomously.

The system is optimized for:

* Fast cold starts
* Edge and serverless deployments
* CLI and HTTP server usage
* Secure sandboxed execution
* OpenRouter LLM integration

Default model configuration uses:

```
openai/o3-mini-high
```

but can be overridden with any OpenRouter-supported model.

---

## 🧩 Concept: What Is a Meta Agent?

A **Meta Agent** is an agent that **creates other agents**.

Instead of deploying one hardcoded AI assistant, the Meta Agent Generator allows you to:

* Programmatically generate task-specific agents
* Customize toolkits per agent
* Define system prompts dynamically
* Control deployment mode (CLI / HTTP)
* Enable or disable advanced features

The result is a **ready-to-run agent file** that can be deployed instantly.

---

## 🚀 What Can Generated Agents Do?

Generated agents can:

* Interpret and solve complex user queries
* Execute real tools (math, time, symbolic logic, code)
* Self-reflect and optimize answers
* Communicate with other agents
* Run as CLI tools or HTTP servers
* Deploy to edge platforms
* Integrate with Discord bots

---

## ✨ Core Features

---

### 🔧 Dynamic Agent Generation

The Meta Agent Generator automatically assembles:

* Tool implementations
* ReACT reasoning loop
* Execution engine
* Prompt templates
* Reflection logic
* Deployment handlers

All into **one optimized standalone TypeScript file**.

---

### 🛠 Built-in Tool Suite

Generated agents ship with production-ready tools:

#### Calculator Tool

Performs arithmetic safely.

Example:

```
2 + 2 → 4
```

---

#### DateTime Tool

Returns system time in ISO format.

Example:

```
2026-01-24T15:32:10.000Z
```

---

#### Algebra Solver Tool

Solves linear equations.

Supported formats:

```
x + a = b
x - a = b
a * x = b
x / a = b
```

Example:

```
3*x = 15 → x = 5
```

---

#### Code Executor Tool

Executes sandboxed JavaScript or TypeScript.

Supports:

* async / await
* stdout capture
* error isolation

Example:

```
console.log("Hello World")
```

---

### ⚙ User Customization Controls

The generator allows full customization of:

* Tool definitions
* System prompt behavior
* Output formatting
* Model selection
* Runtime settings
* Deployment mode

---

### 📦 Optional NPM Package Integration

Using Deno’s native npm support, generated agents can import packages dynamically.

Example:

```
mathjs, moment, lodash
```

These are auto-injected into the generated agent code.

---

### 🌐 Multi-Agent Communication Controls

Optional support for **robots.txt-based agent communication rules** allows:

* Controlled inter-agent access
* Permission-based agent federation
* Safe cross-agent querying

---

### 🧮 Neuro-Symbolic Reasoning Enhancement

The system prompt enforces usage of symbolic tools for:

* Arithmetic
* Date/time operations
* Algebraic reasoning

This improves accuracy and reduces hallucination risk.

---

### 🔁 Self-Reflection Loop

When enabled, generated agents perform a post-answer review step:

* Validates correctness
* Detects reasoning mistakes
* Improves final response quality

---

# 🧪 Command-Line Usage

The Meta Agent Generator is fully configurable using CLI flags.

---

## ⚡ Quick Start Examples

---

### Basic CLI Agent Generation

Creates a local terminal agent:

```bash
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --agentName="MathBot"
```

---

### Full HTTP Server Agent Generation

Creates an HTTP-deployed agent:

```bash
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --agentName="CalculatorAgent" \
  --model="openai/gpt-4" \
  --deployment=http \
  --port=3000 \
  --hostname="localhost" \
  --outputFile="./agents/calculator_agent.ts" \
  --enableReflection=true \
  --enableMultiAgentComm=true \
  --npmPackages="mathjs,moment" \
  --advancedArgs='{"logLevel":"debug","memoryLimit":256,"timeout":30000}'
```

---

# 🔐 Required Deno Permissions

| Permission    | Purpose               | Used For                |
| ------------- | --------------------- | ----------------------- |
| --allow-net   | Network access        | API calls, HTTP server  |
| --allow-env   | Environment variables | API keys, config        |
| --allow-run   | Process execution     | CodeExecutor tool       |
| --allow-write | File creation         | Agent generation output |

---

# ⚙ Core CLI Arguments

---

## Agent Identity

### --agentName

```
Default: HelloWorldAgent
```

Used for:

* Generated file naming
* Agent identification
* Runtime logs

Example:

```bash
--agentName="MathBot"
```

---

### --model

Defines the OpenRouter model.

Default:

```
openai/o3-mini-high
```

Example:

```bash
--model="openai/gpt-4"
```

---

## Deployment Configuration

---

### --deployment

Controls execution mode:

```
local → CLI execution
http  → HTTP API server
```

Example:

```bash
--deployment=http
```

---

### --outputFile

Defines generated file location.

Example:

```bash
--outputFile="./agents/math_agent.ts"
```

---

## Feature Controls

---

### --enableReflection

Enables post-response self-check loop.

Default:

```
true
```

---

### --enableMultiAgentComm

Enables robots.txt communication system.

Default:

```
false
```

---

## External Dependencies

---

### --npmPackages

Comma-separated list of packages.

Example:

```bash
--npmPackages="mathjs,moment,lodash"
```

---

# ⚡ Advanced Performance Configuration

---

### --advancedArgs

Accepts JSON configuration:

```json
{
  "logLevel": "debug",
  "memoryLimit": 256,
  "timeout": 30000,
  "maxIterations": 10,
  "temperature": 0.7,
  "streamResponse": true,
  "retryAttempts": 3,
  "cacheSize": 1000,
  "contextWindow": 4096,
  "batchSize": 32
}
```

---

## Parameter Breakdown

| Setting        | Purpose                       |
| -------------- | ----------------------------- |
| logLevel       | Debug verbosity               |
| memoryLimit    | Runtime RAM cap (MB)          |
| timeout        | Request timeout (ms)          |
| maxIterations  | Max ReACT steps               |
| temperature    | Model creativity              |
| streamResponse | Enable streaming output       |
| retryAttempts  | API retry attempts            |
| cacheSize      | Response caching              |
| contextWindow  | Token window limit            |
| batchSize      | Parallel execution batch size |

---

# 🌐 HTTP Server Options

When using `--deployment=http`:

---

### Server Settings

```bash
--port=3000
--hostname=localhost
```

---

### Security & Performance

```bash
--cors=true
--rateLimit=60
--timeout=30000
```

---

### TLS / HTTPS

```bash
--cert=./cert.pem
--key=./key.pem
```

---

# 🌍 Environment Variables

These override CLI defaults:

```env
OPENROUTER_API_KEY   # Required
OPENROUTER_MODEL     # Optional
PORT                 # HTTP port
HOST                 # Host address
LOG_LEVEL            # Logging verbosity
MEMORY_LIMIT         # Memory cap
```

---

# 🧠 Tool Specifications

---

## Calculator Tool

Supports:

* * * * /
* Parentheses
* Floating-point values

Example:

```
Calculator|2 + 2 * (3 - 1)
```

---

## DateTime Tool

Returns system time:

```
DateTime|
```

---

## Algebra Solver Tool

Solves linear equations.

Example:

```
AlgebraSolver|3*x = 15
```

---

## Code Executor Tool

Runs sandboxed code.

Example:

```
CodeExecutor|console.log("Hello World")
```

Supports:

* async functions
* stdout capture
* error handling

---

# 🔐 Security Design

---

### Sandboxed Execution

* No file system access by default
* Controlled network permissions
* Restricted runtime environment

---

### API Key Management

* Environment variable only
* Never hardcoded
* Secure injection at runtime

---

### Input Validation

* Strict calculator regex validation
* Algebra solver format enforcement
* Tool parameter sanitization

---

# 🚀 Deployment Scenarios

---

## Meta-Agent Server Mode

Run generator as an HTTP API:

```bash
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --server=true \
  --port=3000
```

---

### Create Agent via API

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "TestAgent",
    "model": "openai/gpt-4",
    "deployment": "http",
    "enableReflection": true,
    "tools": [],
    "systemPrompt": "...",
    "npmPackages": ["mathjs"],
    "advancedArgs": {
      "logLevel": "debug",
      "memoryLimit": 256
    }
  }'
```

---

### Response Format

```json
{
  "message": "Agent generated successfully",
  "outputPath": "./generated_agent.ts",
  "code": "... generated TypeScript code ..."
}
```

---

# 📦 Generated Agent Deployment

---

## CLI Execution

```bash
deno run --allow-net --allow-env --allow-run generated_agent.ts "What is 2+2?"
```

---

## HTTP Server Deployment

```bash
deno run --allow-net --allow-env --allow-run generated_agent.ts \
  --deployment=http \
  --hostname=0.0.0.0 \
  --port=3000
```

---

## Edge & Serverless

Optimized for:

* Supabase Edge
* Deno Deploy
* Fly.io
* Cloudflare Workers (via compatibility layer)

---

# 🤖 Discord Bot Deployment

---

## Step 1 — Generate Discord Agent

```bash
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --agentName="DiscordBot" \
  --deployment=http \
  --outputFile="./discord_bot/agent.ts"
```

---

## Step 2 — Create Supabase Function

```bash
supabase functions new discord-agent-bot
```

---

## Step 3 — Copy Generated Agent

```bash
cp discord_bot/agent.ts .supabase/functions/discord-agent-bot/index.ts
```

---

## Step 4 — Set API Key

```bash
supabase secrets set OPENROUTER_API_KEY=your_key
```

---

## Step 5 — Deploy

```bash
supabase functions deploy discord-agent-bot --no-verify-jwt
```

---

## Step 6 — Discord Configuration

* Create application
* Add bot
* Enable Message Content Intent
* Add slash commands
* Set interaction endpoint URL
* Invite bot to server

---

# ⚠ Error Handling System

Generated agents include:

* Tool execution error catching
* API error reporting
* Input validation errors
* Timeout handling
* Automatic retry logic

---

# ⚡ Performance Optimization

---

## Cold Start

* Single-file output
* Minimal imports
* Fast Deno startup

---

## Memory Efficiency

* Runtime memory caps
* Garbage cleanup
* Efficient prompt buffering

---

## Response Speed

* Streaming support
* Parallel tool execution
* Optimized parsing patterns

---

# 🏁 Final Notes

The **Meta Agent Generator inside LLM Task Orchestrator** provides a production-grade foundation for building autonomous AI agents without manually writing boilerplate logic.

With a single command you can generate:

* CLI tools
* HTTP APIs
* Discord bots
* Edge functions
* Multi-agent systems

This approach dramatically reduces development time while preserving full control over agent behavior, performance, and security.

