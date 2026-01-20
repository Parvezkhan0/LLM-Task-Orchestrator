# Meta Agent Generator for Deno
**Created by rUv**

## Overview

The Meta Agent Generator is an advanced TypeScript script designed for Deno that dynamically creates a complete, single-file ReACT agent based on user-defined configuration. The generated agent interleaves chain-of-thought reasoning with actionable steps to solve tasks step by step. It leverages the OpenRouter API (default model: `openai/o3-mini-high`) and utilizes Deno's secure sandboxing, fast cold start times, and built-in support for both CLI and HTTP deployments.

## Concept

A **Meta Agent** is an agent that creates agents. This generator automates the creation of fully self-contained AI agents which can:
- Interpret and execute complex user queries.
- Use a variety of custom tools (e.g., arithmetic calculator, date/time, algebra solver, code executor).
- Reflect on its chain-of-thought to self–optimize its final answer.
- Communicate with other agents using multi–agent communication controls based on robots.txt (optional).

## Features

- **Dynamic Agent Creation:**  
  Automatically assembles a complete agent from your configuration, including tool implementations, a robust ReACT loop, and self–reflection.

- **Built-in Tools:**
  - **Calculator:** Performs arithmetic calculations (e.g., "2 + 2" → "4")
  - **DateTime:** Returns current time in ISO format
  - **AlgebraSolver:** Solves linear equations (e.g., "3*x = 15" → "x = 5")
  - **CodeExecutor:** Runs JavaScript/TypeScript code securely (e.g., factorial calculations)

- **User-Defined Customization:**  
  Configure:
  - **Tools:** Add or modify tool implementations with custom functions
  - **System Prompts:** Customize role instructions and formatting guidelines
  - **Model Selection:** Choose any OpenRouter-compatible model (default: `openai/o3-mini-high`)
  - **Deployment Settings:** Generate agents for local CLI use or as an HTTP server

- **Optional NPM Package Integration:**  
  Import and integrate npm packages via Deno's npm support by providing a comma-separated list of packages.

- **Multi-Agent Communication Controls:**  
  Optionally check a target agent's robots.txt to control inter-agent communication.

- **Neuro–Symbolic Reasoning Enhancements:**  
  The system prompt instructs the agent to use specialized tools for arithmetic, time, and symbolic tasks, enabling exact computations and improved reasoning.

- **Self–Reflection:**  
  An optional reflection step reviews the chain-of-thought and final answer, allowing the agent to catch and correct errors.

## Command-Line Arguments

The meta-agent supports extensive configuration through command-line arguments. Here's a comprehensive guide to all available options:

### Quick Start Examples

```sh
# Basic usage - Create a local CLI agent
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --agentName="MathBot"

# Full configuration - Create an HTTP server agent
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

### Required Deno Permissions

| Permission | Description | Usage |
|------------|-------------|-------|
| `--allow-net` | Network access | API calls, HTTP server |
| `--allow-env` | Environment variables | API keys, configuration |
| `--allow-run` | Execute commands | CodeExecutor tool |
| `--allow-write` | File system writes | Generate agent files |

### Core Arguments

#### Agent Identity
```sh
--agentName=<string>       # Agent identifier (default: "HelloWorldAgent")
                          # Used in file naming and agent identification
                          # Example: --agentName="MathBot"

--model=<string>          # OpenRouter model (default: "openai/o3-mini-high")
                          # Supported: gpt-4, claude-2, llama-2, etc.
                          # Example: --model="openai/gpt-4"
```

#### Deployment Configuration
```sh
--deployment=<mode>       # Deployment mode (default: "local")
                          # Options:
                          #   local: Run as CLI tool
                          #   http: Run as HTTP server
                          # Example: --deployment=http

--outputFile=<path>       # Generated file path (default: "./generated_agent.ts")
                          # Supports relative/absolute paths
                          # Example: --outputFile="./agents/math_bot.ts"
```

### Feature Controls

#### Agent Capabilities
```sh
--enableReflection=<bool> # Enable self-optimization (default: true)
                          # Adds post-response reflection step
                          # Helps catch and correct errors
                          # Example: --enableReflection=true

--enableMultiAgentComm=<bool> # Multi-agent support (default: false)
                              # Implements robots.txt protocol
                              # Enables agent discovery
                              # Example: --enableMultiAgentComm=true
```

#### External Dependencies
```sh
--npmPackages=<string>    # Comma-separated npm packages
                          # Auto-imports via Deno's npm support
                          # Example: --npmPackages="mathjs,moment,lodash"
```

### Advanced Configuration

#### Performance Tuning
```sh
--advancedArgs=<json>     # Fine-tuning options as JSON
{
  "logLevel": "debug",     // Logging level (debug|info|warn|error)
  "memoryLimit": 256,      // Memory cap in MB
  "timeout": 30000,        // Request timeout (ms)
  "maxIterations": 10,     // Max reasoning steps
  "temperature": 0.7,      // Model temperature
  "streamResponse": true,  // Enable streaming
  "retryAttempts": 3,     // API retry count
  "cacheSize": 1000,      // Response cache size
  "contextWindow": 4096,   // Token context window
  "batchSize": 32         // Batch processing size
}
```

### HTTP Server Options

When using `--deployment=http`, additional options are available:

#### Server Configuration
```sh
--port=<number>          # Server port (default: 8000)
                         # Example: --port=3000

--hostname=<string>      # Server hostname (default: "0.0.0.0")
                         # Example: --hostname="localhost"
```

#### Security & Performance
```sh
--cors=<boolean>         # Enable CORS headers
                         # Example: --cors=true

--rateLimit=<number>     # Max requests per IP/minute
                         # Example: --rateLimit=60

--timeout=<number>       # Request timeout (ms)
                         # Example: --timeout=30000
```

#### TLS/SSL Support
```sh
--cert=<path>           # TLS certificate file
                         # Example: --cert=./cert.pem

--key=<path>            # TLS private key file
                         # Example: --key=./key.pem
```

### Environment Variables

The following environment variables can be used to override defaults:

```sh
OPENROUTER_API_KEY      # Required: OpenRouter API key
OPENROUTER_MODEL        # Optional: Default model
PORT                    # Optional: Server port
HOST                    # Optional: Server hostname
LOG_LEVEL              # Optional: Logging verbosity
MEMORY_LIMIT           # Optional: Memory cap (MB)
```

### Examples

1. **Basic Local Agent**
```sh
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --agentName="MathBot"
```

2. **Advanced HTTP Server**
```sh
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --deployment=http \
  --port=3000 \
  --hostname="localhost" \
  --cors=true \
  --rateLimit=60 \
  --cert=./cert.pem \
  --key=./key.pem \
  --advancedArgs='{"logLevel":"debug","timeout":30000}'
```

3. **Full-Featured Agent**
```sh
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --agentName="SuperBot" \
  --model="openai/gpt-4" \
  --deployment=http \
  --outputFile="./agents/super_bot.ts" \
  --enableReflection=true \
  --enableMultiAgentComm=true \
  --npmPackages="mathjs,moment,lodash" \
  --advancedArgs='{
    "logLevel": "debug",
    "memoryLimit": 512,
    "timeout": 30000,
    "maxIterations": 15,
    "temperature": 0.8,
    "streamResponse": true,
    "retryAttempts": 3,
    "cacheSize": 2000,
    "contextWindow": 8192,
    "batchSize": 64
  }'
```

## Tool Specifications

### Calculator Tool
- Supports basic arithmetic operations: +, -, *, /
- Handles parentheses and floating-point numbers
- Input validation prevents code injection
- Example: `Calculator|2 + 2 * (3 - 1)`

### DateTime Tool
- Returns current system time in ISO format
- No input required
- Example: `DateTime|`

### AlgebraSolver Tool
- Solves linear equations in the form:
  - x + a = b
  - x - a = b
  - a * x = b
  - x / a = b
- Returns solution in the form "x = value"
- Example: `AlgebraSolver|3*x = 15`

### CodeExecutor Tool
- Executes JavaScript/TypeScript code in a sandboxed environment
- Supports async/await
- Captures stdout and stderr
- Example: `CodeExecutor|console.log("Hello, World!")`

## Security Considerations

1. **Sandboxed Execution:**
   - CodeExecutor tool runs in a restricted Deno environment
   - No file system access by default
   - Network access can be controlled via permissions

2. **API Key Management:**
   - OpenRouter API key should be set via environment variable
   - Never hardcode API keys in the agent code

3. **Input Validation:**
   - All tool inputs are validated before execution
   - Calculator prevents arbitrary code execution
   - AlgebraSolver enforces strict equation format

## Deployment

The meta-agent and generated agents support multiple deployment scenarios:

### Meta-Agent Server Mode

Run the meta-agent as an HTTP server to create agents via REST API:

```sh
# Start meta-agent server with custom port (default: 8000)
deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
  --server=true \
  --port=3000

# Create agent via POST request
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "TestAgent",
    "model": "openai/gpt-4",
    "deployment": "http",
    "enableReflection": true,
    "tools": [...],
    "systemPrompt": "...",
    "npmPackages": ["mathjs"],
    "advancedArgs": {
      "logLevel": "debug",
      "memoryLimit": 256
    }
  }'

# Response includes:
{
  "message": "Agent generated successfully",
  "outputPath": "./generated_agent.ts",
  "code": "... generated TypeScript code ..."
}
```

### Generated Agent Deployment

Generated agents can be deployed in various scenarios:

- **Local CLI Execution:**  
  Quickly test and iterate on your agent using Deno's CLI.
  ```sh
  deno run --allow-net --allow-env --allow-run generated_agent.ts "What is 2+2?"
  ```

- **HTTP Server Deployment:**  
  Deploy as an HTTP server with customizable options:
  ```sh
  # Start with custom host/port
  deno run --allow-net --allow-env --allow-run generated_agent.ts \
    --deployment=http \
    --hostname=0.0.0.0 \
    --port=3000 \
    --cert=./cert.pem \
    --key=./key.pem

  # Available Deno server arguments:
  # --port=<number>       Port to listen on (default: 8000)
  # --hostname=<string>   Hostname to listen on (default: 0.0.0.0)
  # --cert=<path>        Path to TLS certificate file
  # --key=<path>         Path to TLS private key file
  # --cors               Enable CORS headers
  # --rateLimit=<number> Max requests per IP per minute
  # --timeout=<number>   Request timeout in milliseconds
  ```

- **Edge & Serverless:**  
  Leverage Deno's low cold start times and secure sandboxing to run the agent in global serverless environments (compatible with Deno Deploy, Supabase Edge, Fly.io, etc.).

- **Discord Bot Integration:**  
  Deploy the agent as a Discord bot using Supabase Edge Functions:
  ```sh
  # 1. Create a Supabase Edge Function
  supabase functions new discord-agent-bot
  
  # 2. Copy the agent code to the function
  cp generated_agent.ts .supabase/functions/discord-agent-bot/index.ts
  
  # 3. Modify the HTTP handler to handle Discord interactions
  # (See discord_bot/plans/discord_bot_deployment_plan.md for details)
  
  # 4. Set the OpenRouter API key
  supabase secrets set OPENROUTER_API_KEY=your_key
  
  # 5. Deploy the function
  supabase functions deploy discord-agent-bot --no-verify-jwt
  
  # 6. Configure your Discord bot in the Discord Developer Portal
  # - Set the Interactions Endpoint URL to your Supabase function URL
  # - Create slash commands for your bot
  # - Invite the bot to your server
  ```
  
- **Optional Multi-Agent Communication:**  
  Enable communication between agents by checking robots.txt of target agents.

## Error Handling

The agent includes comprehensive error handling:
- Tool execution errors are caught and returned as readable messages
- API communication errors include detailed status codes
- Invalid input formats trigger helpful validation messages
- Network timeouts and retries are handled gracefully

## Performance Optimization

1. **Cold Start Time:**
   - Single file design minimizes initialization
   - No external dependencies required
   - Efficient tool implementation

2. **Memory Usage:**
   - Configurable memory limits via advancedArgs
   - Automatic cleanup of completed operations
   - Efficient string handling for large inputs

3. **Response Time:**
   - Streaming responses for real-time feedback
   - Parallel tool execution where possible
   - Optimized regex patterns for parsing

## Conclusion

The Meta Agent Generator empowers developers to create custom, flexible, and secure AI agents without extensive manual coding. By simply adjusting configuration options and using command-line arguments, you can generate an agent that meets your domain-specific requirements and deployment environment. Enjoy building and deploying your own autonomous agents with this next-generation tool – created by rUv.


---

## Discord Bot Integration

The Meta Agent Generator can be used to create agents that are deployed as Discord bots using Supabase Edge Functions. This integration allows users to interact with your agent directly through Discord's slash commands.

### Discord Bot Deployment Process

1. **Generate the Agent:**
   ```sh
   deno run --allow-net --allow-env --allow-run --allow-write agent.ts \
     --agentName="DiscordBot" \
     --model="openai/o3-mini-high" \
     --deployment=http \
     --outputFile="./discord_bot/agent.ts"
   ```

2. **Modify the HTTP Handler:**
   Update the HTTP handler in the generated agent to handle Discord's interaction format. Discord sends payloads differently, so you must adjust your HTTP handler to parse and reply according to Discord's webhook format.

3. **Deploy to Supabase:**
   ```sh
   # Create a new Edge Function
   supabase functions new discord-agent-bot
   
   # Copy the agent code to the function
   cp discord_bot/agent.ts .supabase/functions/discord-agent-bot/index.ts
   
   # Set the OpenRouter API key
   supabase secrets set OPENROUTER_API_KEY=your_key
   
   # Deploy the function
   supabase functions deploy discord-agent-bot --no-verify-jwt
   ```

4. **Configure Discord Bot:**
   - Create a new application in the [Discord Developer Portal](https://discord.com/developers/applications)
   - Add a bot to the application
   - Enable the Message Content Intent
   - Create slash commands for the bot
   - Set the Interactions Endpoint URL to your Supabase function URL
   - Generate an invite link and add the bot to your server

For a detailed deployment plan, see [discord_bot/plans/discord_bot_deployment_plan.md](../discord_bot/plans/discord_bot_deployment_plan.md).
---

*For further questions or contributions, please contact rUv or visit the project repository.*
