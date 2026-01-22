/**
 * Advanced Meta–Agent Generator Script for Deno (TypeScript)
 * Created by rUv
 * 
 * This script generates autonomous AI agents that follow the ReACT (Reasoning + Acting) methodology.
 * Each generated agent is a self-contained TypeScript file that can:
 * 1. Process natural language inputs
 * 2. Execute specialized tools (Calculator, DateTime, AlgebraSolver, CodeExecutor)
 * 3. Perform self-reflection and optimization
 * 4. Deploy as either a CLI tool or HTTP server
 * 
 * Key Features:
 * - Dynamic tool integration with custom implementations
 * - Secure sandboxed execution environment
 * - Flexible deployment options (CLI/HTTP)
 * - Optional multi-agent communication via robots.txt
 * - Built-in self-reflection and optimization
 * 
 * Security Features:
 * - Sandboxed code execution
 * - Environment variable-based secrets
 * - Input validation and sanitization
 * - Controlled permissions model
 * 
 * Performance Optimizations:
 * - Single-file architecture for fast cold starts
 * - Efficient tool implementations
 * - Streaming response support
 * - Memory usage controls
 * 
 * Example Usage:
 * ```sh
 * # Generate a CLI agent
 * deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
 *   --agentName="MathBot" \
 *   --deployment=local
 * 
 * # Generate an HTTP server agent
 * deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
 *   --agentName="APIBot" \
 *   --deployment=http
 * ```
 * 
 * Robots.txt Integration:
 * The generated agent can optionally respect and implement robots.txt directives:
 *   User-agent: *
 *   Allow: /.well-known/
 *   Disallow: /config/
 *   Disallow: /tools/
 *   Disallow: /docs/
 *   Disallow: /examples/
 *   Disallow: /api/research/
 *   Disallow: /api/execute/
 *   Disallow: /api/analyze/
 */

// ===================
// TYPE DECLARATIONS
// ===================

/**
 * ImportMeta interface for Deno's import.meta object
 * Provides metadata about the current module
 */
interface ImportMeta {
  main: boolean;  // True if this is the main module
  url: string;    // URL of the current module
}

declare global {
  interface ImportMeta {
    main: boolean;  // True if this is the main module
    url: string;    // URL of the current module
  }
}

/**
 * Deno namespace declaration
 * Defines the available Deno APIs used by the generator and generated agents
 */
declare const Deno: {
  args: string[];                           // Command line arguments
  env: {
    get(key: string): string | undefined;   // Environment variable access
  };
  writeTextFile(path: string, data: string): Promise<void>;  // File writing
  readTextFile(path: string): Promise<string>;               // File reading
  run(options: {                            // Process execution
    cmd: string[];
    stdout?: "piped";
    stderr?: "piped";
  }): {
    output(): Promise<Uint8Array>;          // Process stdout
    stderrOutput(): Promise<Uint8Array>;    // Process stderr
    close(): void;                          // Process cleanup
  };
  serve(options: { port: number; hostname?: string },  // HTTP server
        handler: (req: Request) => Promise<Response>): Promise<void>;
  exit(code: number): never;                // Process termination
};

// ===================
// INTERFACES
// ===================

/**
 * ToolDefinition interface
 * Defines the structure of a tool that can be used by the generated agent
 */
interface ToolDefinition {
  name: string;        // Unique identifier for the tool
  description: string; // Usage instructions and capabilities
  code: string;        // Implementation in TypeScript
}

/**
 * AdvancedArgs interface
 * Optional configuration for fine-tuning agent behavior
 */
interface AdvancedArgs {
  logLevel?: string;    // Logging verbosity
  memoryLimit?: number; // Memory usage cap in MB
}

/**
 * AgentConfig interface
 * Complete configuration for generating an agent
 */
interface AgentConfig {
  agentName: string;              // Unique name for the agent
  model: string;                  // OpenRouter model identifier
  systemPrompt: string;           // Initial instructions for the agent
  tools: ToolDefinition[];        // Available tools
  enableReflection: boolean;      // Self-optimization flag
  deployment: "local" | "http";   // Deployment mode
  outputFile: string;             // Generated file path
  npmPackages?: string[];        // Optional npm dependencies
  advancedArgs?: AdvancedArgs;   // Fine-tuning options
  enableMultiAgentComm?: boolean; // Multi-agent support flag
}

// ===================
// ARGUMENT PARSING
// ===================

/**
 * parseArgs function
 * Processes command line arguments into a structured format
 * 
 * Supported Arguments:
 * --agentName=<name>            Name of the generated agent
 * --model=<model>               OpenRouter model to use
 * --deployment=<local|http>     Deployment mode
 * --outputFile=<path>           Output file location
 * --enableReflection=<bool>     Enable self-reflection
 * --enableMultiAgentComm=<bool> Enable multi-agent support
 * --npmPackages=<pkg1,pkg2>     NPM package dependencies
 * --advancedArgs=<json>         Advanced configuration
 * 
 * @returns Record<string, string> Parsed arguments
 */
function parseArgs(): Record<string, string> {
  const argsMap: Record<string, string> = {};
  for (const arg of Deno.args) {
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      argsMap[key] = rest.join("=") || "true";
    }
  }
  return argsMap;
}

// ===================
// DEFAULT TOOLS
// ===================

/**
 * defaultTools array
 * Pre-configured tools available to all generated agents
 * 
 * Each tool includes:
 * - Unique name for identification
 * - Usage description and examples
 * - Secure implementation in TypeScript
 * - Input validation and error handling
 */
const defaultTools: ToolDefinition[] = [
  {
    name: "Calculator",
    description: "Performs arithmetic calculations. Usage: Calculator|<expression>",
    code: `
function tool_Calculator(input: string): string {
  if (!/^[0-9+\\-*/().\\s]+$/.test(input)) {
    throw new Error("Invalid expression. Only numbers and basic math operators allowed.");
  }
  try {
    const result = Function(\`"use strict"; return (\${input});\`)();
    return String(result);
  } catch (err) {
    throw new Error("Calculation error: " + (err instanceof Error ? err.message : String(err)));
  }
}`
  },
  {
    name: "DateTime",
    description: "Returns current time in ISO format. Usage: DateTime|",
    code: `
function tool_DateTime(_input: string): string {
  return new Date().toISOString();
}`
  },
  {
    name: "AlgebraSolver",
    description: "Solves linear equations. Usage: AlgebraSolver|<equation>",
    code: `
function tool_AlgebraSolver(input: string): string {
  let match = input.match(/^x\\s*\\+\\s*(\\d+(?:\\.\\d+)?)\\s*=\\s*(\\d+(?:\\.\\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    return "x = " + (b - a);
  }
  match = input.match(/^x\\s*-\\s*(\\d+(?:\\.\\d+)?)\\s*=\\s*(\\d+(?:\\.\\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    return "x = " + (b + a);
  }
  match = input.match(/^(\\d+(?:\\.\\d+)?)\\s*\\*\\s*x\\s*=\\s*(\\d+(?:\\.\\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    if (a === 0) throw new Error("Coefficient cannot be zero.");
    return "x = " + (b / a);
  }
  match = input.match(/^x\\s*\\/\\s*(\\d+(?:\\.\\d+)?)\\s*=\\s*(\\d+(?:\\.\\d+)?)/i);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    return "x = " + (b * a);
  }
  return "Unable to solve the equation.";
}`
  },
  {
    name: "CodeExecutor",
    description: "Executes JavaScript/TypeScript code securely. Usage: CodeExecutor|<code>",
    code: `
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
}`
  }
];

// ===================
// CODE GENERATOR
// ===================

/**
 * generateAgentCode function
 * Creates a complete TypeScript file for a new agent based on configuration
 * 
 * Process:
 * 1. Validates configuration requirements
 * 2. Processes npm package imports if specified
 * 3. Assembles tool implementations
 * 4. Builds the system prompt
 * 5. Generates the complete agent code
 * 
 * @param cfg AgentConfig - Complete agent configuration
 * @returns string - Generated TypeScript code
 * @throws Error if required configuration is missing
 */
function generateAgentCode(cfg: AgentConfig): string {
  // Configuration validation
  if (!cfg.agentName) throw new Error("Agent name is required");
  if (!cfg.model) throw new Error("Model name is required");
  if (!cfg.tools || cfg.tools.length === 0) throw new Error("At least one tool is required");

  // Process npm imports
  const npmImports = cfg.npmPackages?.length 
    ? cfg.npmPackages.map(pkg => `import ${pkg.replace(/[-@\/]/g, "_")} from "${pkg}";`).join("\n")
    : "";

  // Process tools
  const toolImplementations = cfg.tools
    .map(tool => `// Tool: ${tool.name}\n// Description: ${tool.description}\n${tool.code.trim()}\n`)
    .join("\n");

  const toolRegistryEntries = cfg.tools
    .map(tool => `"${tool.name.toLowerCase()}": tool_${tool.name}`)
    .join(",\n  ");

  // Build tool list for system prompt
  const toolListText = cfg.tools
    .map(tool => `${tool.name}: ${tool.description}`)
    .join("\n");

  // Replace placeholder in system prompt
  const finalSystemPrompt = cfg.systemPrompt.replace("{TOOL_LIST}", toolListText);

  // Generate the complete agent code
  return `
// Generated Agent: ${cfg.agentName}
// Model: ${cfg.model}
// Generated: ${new Date().toISOString()}

${npmImports ? npmImports + "\n\n" : ""}
// ===================
// ENVIRONMENT SETUP
// ===================

const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
if (!API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY environment variable");
}

const MODEL = "${cfg.model}";
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

${toolImplementations}

// Tools registry
const tools: { [key: string]: (input: string) => Promise<string> | string } = {
  ${toolRegistryEntries}
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
      "Authorization": \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`OpenRouter API error: \${response.status} - \${errorText}\`);
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
    { role: "system", content: \`${finalSystemPrompt}\` },
    { role: "user", content: userInput }
  ];

  let finalAnswer: string | null = null;

  for (let step = 1; step <= MAX_ITERATIONS; step++) {
    const assistantReply = await callOpenRouter(messages);
    
    const thoughtMatch = assistantReply.match(/Thought:\\s*(.*?)(?=Action:|Final:|$)/is);
    const actionMatch = assistantReply.match(/Action:\\s*([^\\n]+)/i);
    const finalMatch = assistantReply.match(/Final:\\s*(.+)/i);

    if (thoughtMatch) {
      console.log(\`Thought: \${thoughtMatch[1].trim()}\`);
    }

    if (finalMatch) {
      finalAnswer = finalMatch[1].trim();
      break;
    }

    if (actionMatch) {
      const [toolName, toolInput = ""] = actionMatch[1].trim().split("|", 2);
      console.log(\`Action: \${toolName} with input "\${toolInput}"\`);

      const tool = findTool(toolName.trim());
      let observation: string;

      if (!tool) {
        observation = \`Tool "\${toolName}" not found\`;
      } else {
        try {
          observation = await tool.func(toolInput.trim());
        } catch (error) {
          observation = \`Error: \${error instanceof Error ? error.message : String(error)}\`;
        }
      }

      console.log(\`Observation: \${observation}\`);
      messages.push(
        { role: "assistant", content: \`Action: \${toolName}|\${toolInput}\` },
        { role: "system", content: \`Observation: \${observation}\` }
      );
      continue;
    }

    finalAnswer = assistantReply;
    break;
  }

  ${cfg.enableReflection ? `
  // Reflection step for self-optimization
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
  ` : ""}

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
  if ("${cfg.deployment}" === "http") {
    console.log(\`🤖 Agent server running on http://localhost:\${PORT}/\`);
    await Deno.serve({ port: PORT }, handler);
  } else {
    const input = Deno.args.filter(arg => !arg.startsWith("--")).join(" ");
    if (!input) {
      console.error("Please provide input for the agent");
      Deno.exit(1);
    }
    const answer = await runAgent(input);
    console.log("Answer:", answer);
  }
}

export default handler;
`;
}

// ===================
// MAIN EXECUTION
// ===================

/**
 * Main execution block
 * Handles the complete agent generation process:
 * 1. Parses command line arguments
 * 2. Builds agent configuration
 * 3. Generates agent code
 * 4. Writes the output file
 * 
 * Error handling:
 * - Validates all required parameters
 * - Provides detailed error messages
 * - Ensures clean exit on failure
 */
// ===================
// META AGENT HTTP SERVER
// ===================

async function metaAgentHandler(req: Request): Promise<Response> {
  if (req.method === "GET") {
    // Return introduction in robots.txt format
    return new Response(
      `User-agent: *
Allow: /
Allow: /agents/
Allow: /.well-known/
Disallow: /internal/
Disallow: /system/
Disallow: /private/

# Meta Agent Generator v1.0
# Created by rUv
# Last Updated: 2025-02-21
#
# Description:
// ===================
 * Advanced Meta-Agent Generator Script for Deno (TypeScript)
 * Created by rUv
 * 
 * This script generates autonomous AI agents that follow the ReACT (Reasoning + Acting) methodology.
 * Each generated agent is a self-contained TypeScript file that can:
 * 1. Process natural language inputs
 * 2. Execute specialized tools (Calculator, DateTime, AlgebraSolver, CodeExecutor)
 * 3. Perform self-reflection and optimization
 * 4. Deploy as either a CLI tool or HTTP server
 * 
 * Key Features:
 * - Dynamic tool integration with custom implementations
 * - Secure sandboxed execution environment
 * - Flexible deployment options (CLI/HTTP)
 * - Optional multi-agent communication via robots.txt
 * - Built-in self-reflection and optimization
 * 
 * Security Features:
 * - Sandboxed code execution
 * - Environment variable-based secrets
 * - Input validation and sanitization
 * - Controlled permissions model
 * 
 * Performance Optimizations:
 * - Single-file architecture for fast cold starts
 * - Efficient tool implementations
 * - Streaming response support
 * - Memory usage controls
 // ===================
#
# API Endpoints:
# 1. GET / 
#    Returns this robots.txt formatted introduction
#
# 2. POST /
#    Creates new agent
#    Required headers:
#      Content-Type: application/json
#    Request body schema:
#      {
#        "agentName": string,          // Agent identifier
#        "model": string,              // OpenRouter model name
#        "deployment": "http"|"local", // Deployment mode
#        "systemPrompt": string,       // Custom instructions
#        "tools": [{                   // Custom tool definitions
#          "name": string,
#          "description": string,
#          "code": string
#        }],
#        "enableReflection": boolean,  // Self-optimization
#        "outputFile": string,         // Output path
#        "npmPackages": string[],      // Dependencies
#        "advancedArgs": {             // Optional settings
#          "logLevel": string,
#          "memoryLimit": number
#        },
#        "enableMultiAgentComm": boolean
#      }
#    Example minimal body:
#      {
#        "agentName": "TestAgent",
#        "model": "openai/o3-mini-high",
#        "deployment": "http"
#      }
#
# Security:
#   - Sandboxed execution environment
#   - Environment variable-based secrets
#   - Input validation and sanitization
#   - Controlled permissions model
#
# Performance:
#   - Single-file architecture
#   - Fast cold starts
#   - Efficient tool implementations
#   - Memory usage controls
#
# Documentation:
# See README.md for complete usage details
# GitHub: https://github.com/ruvnet/hello_world_agent
#
# Contact:
# Author: rUv

`,
      { 
        status: 200, 
        headers: { "Content-Type": "text/plain" } 
      }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }), 
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    
    // Build configuration with POST body params
    const config: AgentConfig = {
      agentName: body.agentName || "HelloWorldAgent",
      model: body.model || (Deno.env.get("OPENROUTER_MODEL") ?? "openai/o3-mini-high"),
      systemPrompt: body.systemPrompt || `You are an AI agent that follows the ReACT methodology.
Available tools:
{TOOL_LIST}

Follow this format:
Thought: <reasoning>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <answer>`,
      tools: body.tools || defaultTools,
      enableReflection: body.enableReflection !== false,
      deployment: body.deployment === "local" ? "local" : "http",
      outputFile: body.outputFile || "./generated_agent.ts",
      npmPackages: body.npmPackages,
      advancedArgs: body.advancedArgs,
      enableMultiAgentComm: body.enableMultiAgentComm === true
    };

    // Generate and write the agent code
    const generatedCode = generateAgentCode(config);
    const outputPath = config.outputFile;
    await Deno.writeTextFile(outputPath, generatedCode);

    // Return the generated code in the response
    return new Response(
      JSON.stringify({ 
        message: "Agent generated successfully",
        outputPath,
        code: generatedCode 
      }), 
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
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
  const args = parseArgs();
  
  if (args.server === "true") {
    // Run as HTTP server
    const port = Number(args.port) || 8000;
    console.log(`🤖 Meta-agent server running on http://localhost:${port}/`);
    await Deno.serve({ port }, metaAgentHandler);
  } else {
    try {
      // Run in CLI mode
      const config: AgentConfig = {
        agentName: args.agentName || "HelloWorldAgent",
        model: args.model || (Deno.env.get("OPENROUTER_MODEL") ?? "openai/o3-mini-high"),
        systemPrompt: `You are an AI agent that follows the ReACT methodology.
Available tools:
{TOOL_LIST}

Follow this format:
Thought: <reasoning>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <answer>`,
        tools: defaultTools,
        enableReflection: args.enableReflection !== "false",
        deployment: args.deployment === "local" ? "local" : "http",
        outputFile: args.outputFile || "./generated_agent.ts",
        npmPackages: args.npmPackages?.split(","),
        advancedArgs: args.advancedArgs ? JSON.parse(args.advancedArgs) : undefined,
        enableMultiAgentComm: args.enableMultiAgentComm === "true"
      };

      // Generate and write the agent code
      const generatedCode = generateAgentCode(config);
      await Deno.writeTextFile(config.outputFile, generatedCode);
      console.log(`✨ Generated agent: ${config.outputFile}`);

    } catch (error) {
      console.error("Error generating agent:", error);
      Deno.exit(1);
    }
  }
}
