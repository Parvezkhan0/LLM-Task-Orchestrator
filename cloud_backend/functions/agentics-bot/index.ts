/**
 * Agentics Foundation Discord Bot (Supabase Edge Function)
 * 
 * This agent follows the ReACT (Reasoning + Acting) logic pattern, integrates with the OpenRouter API for LLM interactions,
 * and supports tool usage within a structured agent framework. It is designed as a Discord bot deployed as a Supabase Edge Function.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Environment variables
const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL = Deno.env.get("OPENROUTER_MODEL") || "openai/o3-mini-high";
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

// Ensure API key is provided
if (!API_KEY) {
  console.error("Error: OPENROUTER_API_KEY is not set in environment.");
}

if (!DISCORD_PUBLIC_KEY) {
  console.error("Error: DISCORD_PUBLIC_KEY is not set in environment.");
}

// Define the structure for a chat message and tool
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
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
  },
  // Additional tools can be added here
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
 * @returns The final answer from the agent.
 */
async function runAgent(query: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query }
  ];

  // The agent will iterate, allowing up to 10 reasoning loops (to avoid infinite loops).
  for (let step = 0; step < 10; step++) {
    // Call the LLM via OpenRouter
    const assistantReply = await callOpenRouter(messages);
    // Append the assistant's reply to the message history
    messages.push({ role: "assistant", content: assistantReply });
    // Check if the assistant's reply contains a final answer
    const answerMatch = assistantReply.match(/Answer:\s*(.*)$/);
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

// Discord interaction handler
Deno.serve(async (req) => {
  // Only handle POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Get the signature and timestamp headers
    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    
    // Get the raw request body as text
    const bodyText = await req.text();
    
    console.log("Headers:", {
      signature,
      timestamp
    });
    
    console.log("Body:", bodyText);
    
    // Verify the request signature if we have all required data
    if (signature && timestamp && DISCORD_PUBLIC_KEY) {
      try {
        const isValidRequest = await verifyDiscordRequest(
          DISCORD_PUBLIC_KEY,
          signature,
          timestamp,
          bodyText
        );
        
        if (!isValidRequest) {
          console.error("Invalid request signature");
          return new Response("Invalid request signature", { status: 401 });
        }
        
        console.log("Signature verification passed");
      } catch (error) {
        console.error("Error during signature verification:", error);
        // Continue processing even if verification fails (for testing)
      }
    } else {
      console.warn("Missing signature, timestamp, or public key - skipping verification");
    }
    
    // Parse the request body as JSON
    const body = JSON.parse(bodyText);
    console.log("Parsed body:", JSON.stringify(body));
    
    // Handle Discord ping (verification) request
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
    
    // Handle Slash command invocation (type 2)
    if (body.type === 2) {
      // Extract the query from the slash command options
      const query = body.data?.options?.[0]?.value;
      
      if (!query) {
        return new Response(
          JSON.stringify({
            type: 4,
            data: { content: "Please provide a query." }
          }),
          { 
            headers: { "Content-Type": "application/json" },
            status: 200
          }
        );
      }
      
      try {
        console.log("Running agent with query:", query);
        // Run the agent with the query
        const answer = await runAgent(query);
        
        // Respond with the answer
        return new Response(
          JSON.stringify({
            type: 4,
            data: { content: answer }
          }),
          { 
            headers: { "Content-Type": "application/json" },
            status: 200
          }
        );
      } catch (err) {
        console.error("Agent error:", err);
        
        // Respond with the error message
        return new Response(
          JSON.stringify({
            type: 4,
            data: { content: `Error: ${(err as Error).message}` }
          }),
          { 
            headers: { "Content-Type": "application/json" },
            status: 200
          }
        );
      }
    }
    
    // Unhandled interaction type
    console.log("Unhandled interaction type:", body.type);
    return new Response(
      JSON.stringify({ message: "Unhandled interaction type" }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 400
      }
    );
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
});
