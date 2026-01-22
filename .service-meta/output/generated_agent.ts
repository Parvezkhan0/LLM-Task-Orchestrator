// Generated Agent: TestAgent
// Model: openai/o3-mini-high
// Generated: ${new Date().toISOString()}

// ===================
// TYPE DECLARATIONS
// ===================

declare interface ImportMeta {
  main: boolean;
  url: string;
}

declare const Deno: {
  args: string[];
  env: {
    get(key: string): string | undefined;
  };
  writeTextFile(path: string, data: string): Promise<void>;
  readTextFile(path: string): Promise<string>;
  run(options: {
    cmd: string[];
    stdout?: "piped";
    stderr?: "piped";
  }): {
    output(): Promise<Uint8Array>;
    stderrOutput(): Promise<Uint8Array>;
    close(): void;
  };
  serve(options: { port: number; hostname?: string }, handler: (req: Request) => Promise<Response>): Promise<void>;
  exit(code: number): never;
};

// ===================
// ENVIRONMENT SETUP
// ===================

const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
if (!API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY environment variable");
}

const MODEL = "openai/o3-mini-high";
const MAX_ITERATIONS = 10;
const PORT = Number(Deno.env.get("PORT")) || 8000;

// ===================
// TOOL IMPLEMENTATIONS
// ===================

interface Tool {
  name: string;
  description: string;
  func: (input: string) => Promise<string> | string;
}

// Tool: Calculator
function tool_Calculator(input: string): string {
  if (!/^[0-9+\-*/().\s]+$/.test(input)) {
    throw new Error("Invalid expression. Only numbers and basic math operators allowed.");
  }
  try {
    const result = Function(`"use strict"; return (${input});`)();
    return String(result);
  } catch (err) {
    throw new Error("Calculation error: " + (err instanceof Error ? err.message : String(err)));
  }
}

// Tool: DateTime
function tool_DateTime(_input: string): string {
  return new Date().toISOString();
}

// Tool: AlgebraSolver
function tool_AlgebraSolver(input: string): string {
  let match = input.match(/^x\s*\+\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    return "x = " + (b - a);
  }
  match = input.match(/^x\s*-\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    return "x = " + (b + a);
  }
  match = input.match(/^(\d+(?:\.\d+)?)\s*\*\s*x\s*=\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    if (a === 0) throw new Error("Coefficient cannot be zero.");
    return "x = " + (b / a);
  }
  match = input.match(/^x\s*\/\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    return "x = " + (b * a);
  }
  return "Unable to solve the equation.";
}

// Tool: CodeExecutor
async function tool_CodeExecutor(input: string): Promise<string> {
  const process = Deno.run({
    cmd: ["deno", "eval", input],
    stdout: "piped",
    stderr: "piped"
  });
  const output = await process.output();
  const errorOutput = await process.stderrOutput();
  process.close();
  if (errorOutput.length > 0) {
    return "Error: " + new TextDecoder().decode(errorOutput);
  }
  return new TextDecoder().decode(output);
}

// Tools registry
const tools: { [key: string]: (input: string) => Promise<string> | string } = {
  "calculator": tool_Calculator,
  "datetime": tool_DateTime,
  "algebrasolver": tool_AlgebraSolver,
  "codeexecutor": tool_CodeExecutor
};

function findTool(toolName: string): Tool | undefined {
  const key = toolName.toLowerCase();
  if (tools[key]) {
    return { name: toolName, description: "", func: tools[key] };
  }
  return undefined;
}

// ===================
// OPENROUTER API INTEGRATION
// ===================

async function callOpenRouter(messages: Array<{ role: string; content: string }>): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("Invalid response from model (no content)");
  }

  return content.trim();
}

// ===================
// AGENT IMPLEMENTATION
// ===================

async function runAgent(userInput: string): Promise<string> {
  const messages = [
    { 
      role: "system", 
      content: `You are an AI agent that follows the ReACT methodology.
Available tools:
Calculator: Performs arithmetic calculations. Usage: Calculator|<expression>
DateTime: Returns the current date and time in ISO format. Usage: DateTime|
AlgebraSolver: Solves simple linear equations. Usage: AlgebraSolver|<equation>
CodeExecutor: Executes JavaScript/TypeScript code securely. Usage: CodeExecutor|<code>

Follow this format:
Thought: <reasoning>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <answer>`
    },
    { role: "user", content: userInput }
  ];

  let finalAnswer: string | null = null;

  for (let step = 1; step <= MAX_ITERATIONS; step++) {
    const assistantReply = await callOpenRouter(messages);
    
    const thoughtMatch = assistantReply.match(/Thought:\s*(.*?)(?=Action:|Final:|$)/is);
    const actionMatch = assistantReply.match(/Action:\s*([^\n]+)/i);
    const finalMatch = assistantReply.match(/Final:\s*(.+)/i);

    if (thoughtMatch) {
      console.log(`Thought: ${thoughtMatch[1].trim()}`);
    }

    if (finalMatch) {
      finalAnswer = finalMatch[1].trim();
      break;
    }

    if (actionMatch) {
      const [toolName, toolInput = ""] = actionMatch[1].trim().split("|", 2);
      console.log(`Action: ${toolName} with input "${toolInput}"`);

      const tool = findTool(toolName.trim());
      let observation: string;

      if (!tool) {
        observation = `Tool "${toolName}" not found`;
      } else {
        try {
          observation = await tool.func(toolInput.trim());
        } catch (error) {
          observation = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }

      console.log(`Observation: ${observation}`);
      messages.push(
        { role: "assistant", content: `Action: ${toolName}|${toolInput}` },
        { role: "system", content: `Observation: ${observation}` }
      );
      continue;
    }

    finalAnswer = assistantReply;
    break;
  }

  // Reflection step
  if (finalAnswer) {
    const reflectionPrompt = [
      { role: "system", content: "Review the agent's reasoning and final answer for correctness." },
      ...messages,
      { role: "assistant", content: "Final: " + finalAnswer },
      { role: "user", content: "Is this answer correct and complete?" }
    ];

    try {
      const reflection = await callOpenRouter(reflectionPrompt);
      if (!reflection.toLowerCase().includes("correct")) {
        console.log("[Reflection] Suggesting revision");
        finalAnswer = reflection;
      }
    } catch (error) {
      console.error("Reflection error:", error);
    }
  }

  return finalAnswer ?? "Unable to determine an answer within the step limit";
}

// ===================
// HTTP SERVER HANDLER
// ===================

async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }), 
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    let userInput: string | null = null;
    
    if (req.method === "GET") {
      const url = new URL(req.url);
      userInput = url.searchParams.get("input") || url.searchParams.get("q");
    } else {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await req.json();
        userInput = body.input || body.question;
      }
    }

    if (!userInput?.trim()) {
      return new Response(
        JSON.stringify({ error: "No input provided" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const answer = await runAgent(userInput.trim());
    return new Response(
      JSON.stringify({ answer }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ===================
// ENTRY POINT
// ===================

if (import.meta.main) {
  const input = Deno.args.filter(arg => !arg.startsWith("--")).join(" ");
  if (!input) {
    console.error("Please provide input for the agent");
    Deno.exit(1);
  }
  const answer = await runAgent(input);
  console.log("Answer:", answer);
}

export default handler;
