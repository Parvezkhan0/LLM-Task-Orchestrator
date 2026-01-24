# 🤖 LLM Task Orchestrator — Discord Bot Deployment Guide

**Serverless Discord Integration Using Supabase Edge Functions**

---

## 📌 Overview

This guide explains how to deploy your **LLM Task Orchestrator ReACT Agent** as a **fully serverless Discord bot** using **Supabase Edge Functions**.

By following this setup, your autonomous agent becomes accessible directly from Discord via **slash commands**, allowing real-time user interaction while maintaining:

* Secure request verification
* Low-latency edge execution
* Stateless cloud deployment
* Automatic scaling
* Minimal infrastructure overhead

The Discord bot communicates with your agent using Discord’s **Interactions API** and Supabase’s globally distributed Deno runtime.

---

## 🧠 Architecture Flow

```
Discord Slash Command
        ↓
Discord Interactions API
        ↓
Supabase Edge Function
        ↓
ReACT Agent Execution
        ↓
Tool Calls + Reasoning
        ↓
Agent Response
        ↓
Discord Chat Output
```

---

## 🧩 Prerequisites

Before starting, ensure you have:

* A Discord account
* A Supabase account
* Supabase CLI installed
* An OpenRouter API key
* Your ReACT agent ready (single file or generated agent)
* Node.js installed (for Supabase CLI)

---

# ⚙ Step-by-Step Deployment Guide

---

## 1️⃣ Create Discord Application

1. Open the Discord Developer Portal:

```
https://discord.com/developers/applications
```

2. Click **New Application**

3. Name your application:

```
LLM Task Orchestrator Bot
```

(or any name you prefer)

4. Save changes

---

## 2️⃣ Create Bot User

1. Open your application
2. Click **Bot** from sidebar
3. Click **Add Bot**
4. Confirm creation

---

## Enable Required Gateway Intents

Under **Privileged Gateway Intents** enable:

* ✅ Message Content Intent
* ✅ Server Members Intent (optional but recommended)

Click **Save Changes**

---

## 3️⃣ Prepare Supabase Project

---

### Install Supabase CLI

```bash
npm install -g supabase
```

---

### Login to Supabase

```bash
supabase login
```

---

### Link Your Project

```bash
supabase link --project-ref your-project-id
```

⚠ Important:

Do NOT use:

```
--anon-key
```

Supabase CLI does not support it for edge deployment.

---

## 4️⃣ Create Supabase Edge Function

Create a new function for your Discord bot:

```bash
supabase functions new llm-discord-bot
```

This generates:

```
supabase/functions/llm-discord-bot/
```

---

## 5️⃣ Configure Discord Interaction Handler

Discord sends interaction payloads that must be handled explicitly.

Modify your Edge Function `index.ts`:

---

### Example Interaction Handler Template

```ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Discord public key for request verification
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

serve(async (req) => {
  const body = await req.json();

  // Discord Ping Verification
  if (body.type === 1) {
    return Response.json({ type: 1 });
  }

  // Slash Command Invocation
  if (body.type === 2) {
    const query = body.data.options?.[0]?.value;

    if (!query) {
      return Response.json({
        type: 4,
        data: { content: "Please provide a query." }
      });
    }

    const answer = await runAgent(query);

    return Response.json({
      type: 4,
      data: { content: answer }
    });
  }

  return new Response("Unhandled interaction type", { status: 400 });
});
```

---

### ⚠ Important Security Recommendation

Always verify incoming Discord requests using:

* Signature headers
* Timestamp validation

Recommended library:

```
discord-interactions
```

This prevents spoofed requests.

---

## 6️⃣ Set Environment Secrets

Supabase Edge Functions use encrypted secrets.

---

### Set OpenRouter API Key

```bash
supabase secrets set OPENROUTER_API_KEY=your_key_here \
--env-file ./supabase/functions/llm-discord-bot/.env
```

---

### Set Discord Public Key

Retrieve from:

Discord Developer Portal → General Information → Public Key

Then set:

```bash
supabase secrets set DISCORD_PUBLIC_KEY=your_discord_public_key \
--env-file ./supabase/functions/llm-discord-bot/.env
```

---

## 7️⃣ Deploy Supabase Function

Deploy your Discord bot backend:

```bash
supabase functions deploy llm-discord-bot --no-verify-jwt
```

After deployment you’ll receive:

```
Function URL:
https://PROJECT_ID.functions.supabase.co/llm-discord-bot
```

Save this URL — it will be used in Discord.

---

## 8️⃣ Configure Discord Interaction Endpoint

---

### Set Interaction URL

1. Open Discord Developer Portal
2. Go to your application
3. Click **General Information**
4. Paste your Supabase Function URL:

```
https://PROJECT_ID.functions.supabase.co/llm-discord-bot
```

5. Click **Save Changes**

Discord will automatically send a verification request.

If your handler responds correctly with:

```json
{ "type": 1 }
```

Verification succeeds.

---

## 9️⃣ Create Slash Commands

---

1. Go to **Slash Commands** tab
2. Click **New Command**

Example:

```
Name: ask
Description: Ask the AI agent a question
```

Add parameter:

```
Name: query
Type: String
Required: true
```

Save command.

---

## 🔗 Example Usage

In Discord:

```
/ask query: What is 15 * 4?
```

Bot responds:

```
The result is 60
```

---

## 🔑 10️⃣ Invite Bot To Server

---

### Generate Invite URL

1. Go to **OAuth2 → URL Generator**
2. Select Scopes:

* bot
* applications.commands

3. Bot Permissions:

* Send Messages
* Read Message History

4. Copy generated URL
5. Open in browser
6. Select server
7. Authorize

---

## 11️⃣ Testing & Verification

---

### Test Slash Commands

Inside Discord:

```
/ask query: Explain ReACT agents
```

---

### Verify Supabase Logs

Check deployment logs:

```bash
supabase functions logs llm-discord-bot
```

Confirm:

* No runtime errors
* Successful request handling
* OpenRouter calls succeed

---

# ✅ Deployment Checklist

Before going live, confirm:

✔ Discord application created
✔ Bot user created
✔ Privileged intents enabled
✔ Supabase project linked
✔ Edge function created
✔ Environment secrets configured
✔ Function deployed successfully
✔ Interaction URL verified
✔ Slash commands created
✔ Bot invited to server
✔ Live test completed

---

# 🔐 Security Best Practices

---

### Request Verification

Always validate:

* Discord signature header
* Timestamp freshness

Prevents replay and spoof attacks.

---

### Secret Management

* Never hardcode keys
* Always use Supabase secrets
* Rotate API keys periodically

---

### Rate Limiting

Recommended:

* Apply per-IP rate limiting
* Implement cooldowns on commands

---

# ⚡ Performance Optimization

---

## Cold Start Performance

Supabase Edge Functions provide:

* Global edge execution
* Sub-second cold starts
* Automatic scaling

---

## Response Speed

Optimize by:

* Limiting ReACT loop iterations
* Using streaming output (if enabled)
* Using smaller LLM models when possible

---

# 🌍 Production Deployment Tips

* Use custom domains for bot backend
* Enable CORS only when needed
* Monitor logs regularly
* Add uptime monitoring
* Enable error alerting

---

# 🏁 Final Notes

With this setup, your **LLM Task Orchestrator agent becomes a production-grade Discord bot** capable of:

* Autonomous reasoning
* Real-time tool execution
* Global low-latency responses
* Secure cloud deployment

This architecture avoids traditional servers, reduces infrastructure cost, and enables scalable AI-driven Discord automation.

