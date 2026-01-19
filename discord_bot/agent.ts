/**
 * Discord Bot with ReAct Agent (Deno)
 *
 * This agent follows the ReACT (Reasoning + Acting) logic pattern, integrates with the OpenRouter API for LLM interactions,
 * and supports tool usage within a structured agent framework. It is designed as a single-file TypeScript script for Deno,
 * optimized for minimal latency in serverless environments like Fly.io and Supabase Edge Functions.
 * 
 * ## Setup
 * - Ensure you have a Deno runtime available (e.g., in your serverless environment).
 * - Set the environment variable `OPENROUTER_API_KEY` with your OpenRouter API key.
 * - Set the environment variable `DISCORD_PUBLIC_KEY` with your Discord application's public key.
 * - (Optional) Set `OPENROUTER_MODEL` to specify the model (default is "openai/o3-mini-high").
 * - This script requires network access to call the OpenRouter API. When running with Deno, use `--allow-net` (and `--allow-env` to read env variables).
 * 
 * ## Deployment (Fly.io)
 * 1. Create a Dockerfile using a Deno base image (e.g. `denoland/deno:alpine`).
 *    - In the Dockerfile, copy this script into the image and use `CMD ["run", \"--allow-net\", \"--allow-env\", \"agent.ts\"]`.
 * 2. Set the `OPENROUTER_API_KEY` as a secret on Fly.io (e.g., `fly secrets set OPENROUTER_API_KEY=your_key`).
 * 3. Deploy with `fly deploy`. The app will start an HTTP server on port 8000 by default (adjust Fly.io config for port if needed).
 * 
 * ## Deployment (Supabase Edge Functions)
 * 1. Install the Supabase CLI and login to your project.
 * 2. Create a new Edge Function: `supabase functions new myagent`.
 * 3. Replace the content of the generated `index.ts` with this entire script.
 * 4. Ensure to add your OpenRouter API key: run `supabase secrets set OPENROUTER_API_KEY=your_key` for the function's environment.
 * 5. Deploy the function: `supabase functions deploy myagent --no-verify-jwt` (the `--no-verify-jwt` flag disables authentication if you want the function public).
 * 6. The function will be accessible at the URL provided by Supabase (e.g., `https://<project>.functions.supabase.co/myagent`).
 * 
 * ## Usage
 * - As a Discord bot: Register slash commands and set the interaction endpoint URL to this deployed function.
 * - As a direct API: Send an HTTP POST request to the deployed endpoint with a JSON body: `{ "query": "your question" }`.
 *   The response will be a JSON object: `{ "answer": "the answer from the agent" }`.
 * 
 * ## Notes
 * - The agent uses a ReACT loop: it will reason and decide on actions (tool uses) before giving the final answer.
 * - Tools are defined in the code (see the `tools` array). The model is instructed on how to use them.
 * - The OpenRouter API is used similarly to OpenAI's Chat Completion API. Make sure your model supports the desired functionality.
 * - This template is optimized for clarity and minimal dependencies. It avoids large libraries for faster cold starts.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Environment variables
const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL = Deno.env.get("OPENROUTER_MODEL") || "openai/o3-mini-high";
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

// Ensure API key is provided
if (!API_KEY) {
  console.error("Error: OPENROUTER_API_KEY is not set in environment.");
  Deno.exit(1);
}

// Define the structure for a chat message and tool
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Discord interaction types and structures
interface DiscordInteraction {
  id: string;
  type: number; // 1: Ping, 2: ApplicationCommand, etc.
  data?: {
    name: string;
    options?: Array<{name: string, value: any, type?: number}>;
  };
  user?: {
    id: string;
  };
  guild_id?: string;
  channel_id?: string;
}

interface AgentContext {
  commandType: string;
  userId?: string;
  guildId?: string;
  channelId?: string;
}

interface Tool {
  name: string;
  description: string;
  run: (input: string) => Promise<string> | string;
}

/**
 * Convert a hex string to a Uint8Array.
 * @param hex - The hex string to convert
 * @returns The resulting Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\dA-F]{2}/gi) || [];
  const integers = pairs.map(s => parseInt(s, 16));
  return new Uint8Array(integers);
}

/**
 * Verify a Discord request using Ed25519.
 * @param publicKey - The Discord application public key
 * @param signature - The signature from the 'X-Signature-Ed25519' header
 * @param timestamp - The timestamp from the 'X-Signature-Timestamp' header
 * @param body - The raw request body
 * @returns Whether the request is valid
 */
async function verifyDiscordRequest(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  try {
    // Convert the hex strings to Uint8Arrays
    const publicKeyBytes = hexToUint8Array(publicKey);
    const signatureBytes = hexToUint8Array(signature);
    
    // Create the message to verify (timestamp + body)
    const message = new TextEncoder().encode(timestamp + body);
    
    // Verify the signature
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify']
    );
    
    return await crypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signatureBytes,
      message
    );
  } catch (err) {
    console.error('Error verifying Discord request:', err);
    return false;
  }
}

// Define available tools
const tools: Tool[] = [
  {
    name: "Calculator",
    description: "Performs arithmetic calculations. Usage: Calculator[expression]",
    run: (input: string) => {
      // Simple safe evaluation for arithmetic expressions
      try {
        // Allow only numbers and basic math symbols in input for safety
        if (!/^[0-9.+\-*\/()\s]+$/.test(input)) {
          return "Invalid expression";
        }
        // Evaluate the expression
        const result = Function("return (" + input + ")")();
        return String(result);
      } catch (err) {
        return "Error: " + (err as Error).message;
      }
    }
  }
  // Additional tools can be added here
];

// Define domain-specific reasoning types
const domains = [
  {
    name: "financial",
    description: "Financial analysis and investment advice"
  },
  {
    name: "medical",
    description: "Medical information and health advice (for educational purposes only)"
  },
  {
    name: "legal",
    description: "Legal information and guidance (for educational purposes only)"
  }
];

// Create a system prompt that instructs the model on how to use tools and follow ReACT format
const toolDescriptions = tools.map(t => `${t.name}: ${t.description}`).join("\n");
const systemPrompt = 
`You are a smart assistant with access to the following tools:
${toolDescriptions}

When answering the user, you may use the tools to gather information or calculate results.
Follow this format strictly:
Thought: <your reasoning here>
Action: <ToolName>[<tool input>]
Observation: <result of the tool action>
... (you can repeat Thought/Action/Observation as needed) ...
Thought: <final reasoning>
Answer: <your final answer to the user's query>

Only provide one action at a time, and wait for the observation before continuing. 
If the answer is directly known or once you have gathered enough information, output the final Answer.
`;

async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      stop: ["Observation:"],  // Stop generation before the model writes an observation
      temperature: 0.0
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: HTTP ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from LLM (no content)");
  }
  return content;
}

/**
 * Runs the ReACT agent loop for a given user query.
 * @param query - The user's question or command for the agent.
 * @param context - Optional context information about the command source.
 * @returns The final answer from the agent.
 */
async function runAgent(query: string, context?: AgentContext): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query }
  ];

  // If this is a domain-specific query, try to parse it
  let domainInfo = "";
  try {
    const domainData = JSON.parse(query);
    if (domainData.domain && domains.some(d => d.name === domainData.domain)) {
      domainInfo = `\nThis query is for the ${domainData.domain} domain using ${domainData.reasoningType || "both"} reasoning.`;
      messages[0].content += domainInfo;
    }
  } catch {
    // Not a JSON query, continue normally
  }

  // The agent will iterate, allowing up to 10 reasoning loops (to avoid infinite loops).
  for (let step = 0; step < 10; step++) {
    // Call the LLM via OpenRouter
    const assistantReply = await callOpenRouter(messages);
    // Append the assistant's reply to the message history
    messages.push({ role: "assistant", content: assistantReply });
    // Check if the assistant's reply contains a final answer
    const answerMatch = assistantReply.match(/Answer:\s*(.*)$/s);
    if (answerMatch) {
      // Return the text after "Answer:" as the final answer
      return answerMatch[1].trim();
    }
    // Otherwise, look for an action to perform
    const actionMatch = assistantReply.match(/Action:\s*([^\[]+)\[([^\]]+)\]/);
    if (actionMatch) {
      const toolName = actionMatch[1].trim();
      const toolInput = actionMatch[2].trim();
      // Find the tool by name (case-insensitive match)
      const tool = tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
      let observation: string;
      if (!tool) {
        observation = `Tool "${toolName}" not found`;
      } else {
        try {
          const result = await tool.run(toolInput);
          observation = String(result);
        } catch (err) {
          observation = `Error: ${(err as Error).message}`;
        }
      }
      // Append the observation as a system message for the next LLM call
      messages.push({ role: "system", content: `Observation: ${observation}` });
      // Continue loop for next reasoning step with the new observation in context
      continue;
    }
    // If no Action or Answer was found in the assistant's reply, break to avoid an endless loop.
    // (This could happen if the model didn't follow the format. In such case, treat the whole reply as answer.)
    return assistantReply.trim();
  }
  throw new Error("Agent did not produce a final answer within the step limit.");
}

/**
 * Creates a Discord response with the given content.
 * @param content - The content of the response.
 * @param isError - Whether this is an error response.
 * @returns A Response object formatted for Discord.
 */
function createDiscordResponse(content: string, isError = false): Response {
  // Truncate content if it exceeds Discord's limit
  if (content.length > 2000) {
    content = content.substring(0, 1997) + "...";
  }
  
  return new Response(
    JSON.stringify({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: isError ? `⚠️ ${content}` : content,
      }
    }),
    { 
      headers: { "Content-Type": "application/json" },
      status: 200
    }
  );
}

/**
 * Handles the /ask command.
 * @param interaction - The Discord interaction.
 * @returns A Response object with the agent's answer.
 */
async function handleAskCommand(interaction: DiscordInteraction): Promise<Response> {
  const query = interaction.data?.options?.find(opt => opt.name === "query")?.value;
  
  if (!query) {
    return createDiscordResponse("Please provide a query.", true);
  }
  
  try {
    const context: AgentContext = {
      commandType: "ask",
      userId: interaction.user?.id,
      guildId: interaction.guild_id,
      channelId: interaction.channel_id
    };
    
    const answer = await runAgent(query, context);
    return createDiscordResponse(answer);
  } catch (err) {
    console.error("Error in ask command:", err);
    return createDiscordResponse(`Error: ${(err as Error).message}`, true);
  }
}

/**
 * Handles the /calc command.
 * @param interaction - The Discord interaction.
 * @returns A Response object with the calculation result.
 */
async function handleCalcCommand(interaction: DiscordInteraction): Promise<Response> {
  const expression = interaction.data?.options?.find(opt => opt.name === "expression")?.value;
  
  if (!expression) {
    return createDiscordResponse("Please provide an expression to calculate.", true);
  }
  
  try {
    const calculator = tools.find(t => t.name.toLowerCase() === "calculator");
    if (!calculator) {
      return createDiscordResponse("Calculator tool not found.", true);
    }
    
    const result = await calculator.run(expression);
    return createDiscordResponse(`Calculation: ${expression}\nResult: ${result}`);
  } catch (err) {
    console.error("Error in calc command:", err);
    return createDiscordResponse(`Error: ${(err as Error).message}`, true);
  }
}

/**
 * Handles the /domain command.
 * @param interaction - The Discord interaction.
 * @returns A Response object with the domain-specific reasoning result.
 */
async function handleDomainCommand(interaction: DiscordInteraction): Promise<Response> {
  const domain = interaction.data?.options?.find(opt => opt.name === "domain")?.value;
  const query = interaction.data?.options?.find(opt => opt.name === "query")?.value;
  const reasoningType = interaction.data?.options?.find(opt => opt.name === "reasoning_type")?.value || "both";
  
  if (!domain || !query) {
    return createDiscordResponse("Please provide both domain and query parameters.", true);
  }
  
  // Validate domain and reasoning type
  if (!domains.some(d => d.name === domain)) {
    return createDiscordResponse(`Invalid domain. Supported domains: ${domains.map(d => d.name).join(", ")}`, true);
  }
  
  if (!["deductive", "inductive", "both"].includes(reasoningType)) {
    return createDiscordResponse("Invalid reasoning type. Supported types: deductive, inductive, both", true);
  }
  
  try {
    // Create a domain-specific query object
    const domainQuery = JSON.stringify({
      domain,
      query,
      reasoningType
    });
    
    const context: AgentContext = {
      commandType: "domain",
      userId: interaction.user?.id,
      guildId: interaction.guild_id,
      channelId: interaction.channel_id
    };
    
    const answer = await runAgent(domainQuery, context);
    return createDiscordResponse(answer);
  } catch (err) {
    console.error("Error in domain command:", err);
    return createDiscordResponse(`Error: ${(err as Error).message}`, true);
  }
}

/**
 * Handles the /info command.
 * @returns A Response object with information about the bot.
 */
function handleInfoCommand(): Response {
  const info = `
**Agentics Foundation Bot**

This bot uses a ReAct (Reasoning + Acting) agent powered by OpenRouter API.

**Available Commands:**
• \`/ask [query]\` - Ask the agent any question
• \`/calc [expression]\` - Perform a calculation
• \`/domain [domain] [query] [reasoning_type]\` - Use domain-specific reasoning
• \`/info\` - Show this information
• \`/help [command]\` - Get help on how to use commands

**Available Tools:**
${tools.map(t => `• ${t.name}: ${t.description}`).join("\n")}

**Available Domains:**
${domains.map(d => `• ${d.name}: ${d.description}`).join("\n")}

**Model:** ${MODEL}
`;
  
  return createDiscordResponse(info);
}

/**
 * Handles the /help command.
 * @param interaction - The Discord interaction.
 * @returns A Response object with help information.
 */
function handleHelpCommand(interaction: DiscordInteraction): Response {
  const command = interaction.data?.options?.find(opt => opt.name === "command")?.value;
  
  if (!command) {
    // General help
    return createDiscordResponse(`
**Bot Help**

Use the following commands:

• \`/ask [query]\` - Ask the agent any question or give it a task
• \`/calc [expression]\` - Perform a calculation using the calculator tool
• \`/domain [domain] [query] [reasoning_type]\` - Use domain-specific reasoning
• \`/info\` - Get information about the bot and its capabilities
• \`/help [command]\` - Get help on how to use a specific command

For more detailed help on a specific command, use \`/help [command]\`
`);
  }
  
  // Command-specific help
  switch (command) {
    case "ask":
      return createDiscordResponse(`
**Help: /ask**

Usage: \`/ask [query]\`

Ask the agent any question or give it a task. The agent will use its reasoning capabilities and available tools to provide an answer.

Example: \`/ask What is the capital of France?\`
Example: \`/ask Calculate the area of a circle with radius 5\`
`);
    
    case "calc":
      return createDiscordResponse(`
**Help: /calc**

Usage: \`/calc [expression]\`

Perform a calculation using the calculator tool. This is a direct way to use the calculator without going through the agent's reasoning process.

Example: \`/calc 2 + 2 * 3\`
Example: \`/calc (15 * 4) / 2 + 10\`
`);
    
    case "domain":
      return createDiscordResponse(`
**Help: /domain**

Usage: \`/domain [domain] [query] [reasoning_type]\`

Use domain-specific reasoning for specialized queries. The agent will apply domain-specific knowledge and reasoning patterns.

Parameters:
• domain: The domain for reasoning (${domains.map(d => d.name).join(", ")})
• query: The question to answer
• reasoning_type: Type of reasoning to use (deductive, inductive, both)

Example: \`/domain financial What should I invest in? deductive\`
Example: \`/domain medical What are symptoms of the flu? inductive\`
`);
    
    case "info":
      return createDiscordResponse(`
**Help: /info**

Usage: \`/info\`

Get information about the bot, its capabilities, available tools, and domains.
`);
    
    case "help":
      return createDiscordResponse(`
**Help: /help**

Usage: \`/help [command]\`

Get help on how to use the bot or a specific command.

Example: \`/help\` - Get general help
Example: \`/help domain\` - Get help on the domain command
`);
    
    default:
      return createDiscordResponse(`Unknown command: ${command}. Use \`/help\` to see available commands.`, true);
  }
}

/**
 * Routes the Discord interaction to the appropriate handler.
 * @param interaction - The Discord interaction.
 * @returns A Response object with the result.
 */
async function routeCommand(interaction: DiscordInteraction): Promise<Response> {
  const commandName = interaction.data?.name;
  
  if (!commandName) {
    return createDiscordResponse("Invalid command data", true);
  }
  
  console.log(`Handling command: ${commandName}`);
  
  switch (commandName) {
    case "ask":
      return await handleAskCommand(interaction);
    case "calc":
      return await handleCalcCommand(interaction);
    case "domain":
      return await handleDomainCommand(interaction);
    case "info":
      return handleInfoCommand();
    case "help":
      return handleHelpCommand(interaction);
    default:
      return createDiscordResponse(`Unknown command: ${commandName}`, true);
  }
}

// Start an HTTP server that handles both direct API requests and Discord interactions
serve(async (req: Request) => {
  // Handle GET requests with a welcome message
  if (req.method === "GET") {
    return new Response(JSON.stringify({
      message: "Welcome to the Discord Bot with ReAct Agent!",
      usage: "This endpoint handles Discord interactions and direct API requests."
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Only handle POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  
  try {
    // Check if this is a Discord interaction by looking for signature headers
    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    
    // Get the raw request body as text
    const bodyText = await req.text();
    
    // Check if this is a Discord interaction (has signature headers)
    let isDiscordInteraction = signature !== null || timestamp !== null;
    
    // If this is a Discord interaction and we have a public key, verify the signature
    if (signature && timestamp && DISCORD_PUBLIC_KEY) {
      try {
        const isValidRequest = await verifyDiscordRequest(
          DISCORD_PUBLIC_KEY, 
          signature || "",
          timestamp || "",
          bodyText
        );
        
        if (!isValidRequest) {
          console.error("Invalid Discord signature");
          return new Response("Invalid request signature", { status: 401 });
        }
        
        console.log("Discord signature verification passed");
      } catch (error) {
        console.error("Error during Discord signature verification:", error);
        return new Response("Error verifying request", { status: 401 });
      }
    } else if (isDiscordInteraction) {
      console.warn("Discord interaction received but DISCORD_PUBLIC_KEY is not set");
    }
    
    // Parse the request body
    let body;
    try {
      console.log("Parsing body:", bodyText);
      body = JSON.parse(bodyText);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return new Response("Invalid JSON body", { status: 400 });
    }
    
    // Check if this is a Discord interaction based on the body structure
    isDiscordInteraction = isDiscordInteraction || body.type === 1 || body.type === 2;
    if (!isDiscordInteraction && !body.query && !body.question) {
      return new Response("Invalid JSON body", { status: 400 });
    }
    
    // Handle Discord interactions
    if (isDiscordInteraction) {
      // Handle Discord ping (verification) request
      console.log("Handling Discord interaction, type:", body.type);
      if (body.type === 1) {
        console.log("Received Discord ping - responding with pong");
        return new Response(
          JSON.stringify({ type: 1 }),
          { 
            headers: { "Content-Type": "application/json" },
            status: 200
          }
        );
      }
      
      // Handle Discord slash command interactions (type 2)
      if (body.type === 2) {
        console.log("Handling slash command:", body.data?.name);
        return await routeCommand(body);
      }
      
      // Unhandled interaction type
      return new Response(
        JSON.stringify({ error: "Unhandled interaction type" }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Handle direct API requests (non-Discord)
    console.log("Handling direct API request");
    let query: string = body.query ?? body.question;
    
    if (!query || typeof query !== "string") {
      return new Response(`Bad Request: Missing "query" string.`, { status: 400 });
    }
    
    try {
      const answer = await runAgent(query);
      const responseData = { answer };
      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error("Agent error:", err);
      const errorMsg = (err as Error).message || String(err);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
}, {
  port: PORT
});

console.log(`Listening on http://localhost:${PORT}/`);
