# Agentics Foundation Discord Bot Deployment Guide

This guide provides detailed, step-by-step instructions for deploying your Agentic ReAct agent script as a Discord bot via Supabase Edge Functions.

## Step 1: Set Up the Discord Application

- Navigate to the [Discord Developer Portal](https://discord.com/developers/applications)
- Create a new application named **Agentics Foundation** (or use an existing one)

## Step 2: Configure the Bot

- Click **"Bot"** in the sidebar
- Select **"Add Bot"** if you haven't created one yet
- Enable the following permissions under **"Privileged Gateway Intents"**:
  - **Message Content Intent**
  - **Server Members Intent** (if needed)
- Click **"Save Changes"**

## Step 3: Set Up Interaction Endpoint

- Click **"General Information"** in the sidebar
- Under the **Interactions Endpoint URL** input box, you'll provide your Supabase Edge Function URL:
  ```
  https://your-supabase-project.functions.supabase.co/agentics-bot
  ```
- Note: You must verify the interaction endpoint with Discord by responding to Discord's verification request

## Step 4: Supabase Edge Functions Setup

1. **Install Supabase CLI** (if not installed):
   ```bash
   npm install -g supabase
   ```

2. **Login and link your project**:
   ```bash
   supabase login
   supabase link --project-ref your-supabase-project-ref
   ```
   Note: Do not use the `--anon-key` flag as it's not supported by the Supabase CLI.

3. **Create a new Edge Function**:
   ```bash
   supabase functions new agentics-bot
   ```

## Step 5: Modify the Supabase Function for Discord Interactions

Discord interactions require specific handling. Your Edge Function (`index.ts`) needs to respond to Discord's interaction ping events:

```typescript
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Discord Public Key for verifying interactions
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

serve(async (req) => {
  const { type, data } = await req.json();

  // Discord Ping request type verification
  if (type === 1) {
    return Response.json({ type: 1 });
  }

  if (type === 2) {
    const query = data.options?.[0]?.value;

    if (!query) {
      return Response.json({
        type: 4,
        data: { content: "Please provide a query." },
      });
    }

    const answer = await runAgent(query);

    return Response.json({
      type: 4,
      data: { content: answer },
    });
  }

  return new Response("Unhandled request type", { status: 400 });
});
```

**Important:** Discord interaction verification is recommended for security. You can use a library such as [discord-interactions](https://deno.land/x/discordeno/mod.ts) to verify requests.

## Step 6: Set Environment Variables

Use Supabase CLI to set secrets:

1. **Your OpenRouter API Key**:
   ```bash
   supabase secrets set OPENROUTER_API_KEY=your_key --env-file ./supabase/functions/agentics-bot/.env
   ```

2. **Discord Public Key** (from Discord Developer Portal):
   ```bash
   supabase secrets set DISCORD_PUBLIC_KEY=your_discord_public_key --env-file ./supabase/functions/agentics-bot/.env
   ```

## Step 7: Deploy Your Supabase Function

```bash
supabase functions deploy agentics-bot --no-verify-jwt
```

## Step 8: Complete Discord Configuration

1. Back in Discord Developer Portal:
   - Paste your Supabase function URL into **"Interactions Endpoint URL"**
   - Save changes. Discord will verify your endpoint

2. Create slash commands for your bot:
   - Go to **"Slash Commands"** in the sidebar
   - Click **"New Command"**
   - Create a command (e.g., `/ask`) with appropriate description and parameters

## Step 9: Invite Your Bot to Your Discord Server

1. Go to **OAuth2** → **URL Generator**:
   - Select scope: **bot** and **applications.commands**
   - Choose appropriate permissions (e.g., Send Messages)
2. Copy the URL at the bottom and open it in your browser
3. Select the Discord server to invite the bot

## Step 10: Testing & Verification

- Test your Discord bot by invoking your configured Slash Command (e.g., `/ask your query`) in Discord
- Confirm correct responses from your Supabase Edge Function

## Deployment Checklist

- [ ] Bot created on Discord
- [ ] Interaction URL added
- [ ] Edge function created in Supabase
- [ ] Secrets configured (OpenRouter & Discord keys)
- [ ] Function deployed
- [ ] Bot invited and tested

For a more detailed deployment plan, see [discord_bot/plans/discord_bot_deployment_plan.md](plans/discord_bot_deployment_plan.md).
