# Single File ReACT Agent

A minimalist, self-contained autonomous agent implementation in TypeScript for Deno that follows the ReACT (Reasoning + Acting) pattern.

## Core Features

### ReACT Pattern Implementation
The agent implements a ReACT loop that:
1. Receives a user query
2. Reasons about the next action
3. Executes tools when needed
4. Observes results
5. Continues until reaching an answer

### Tool System
```typescript
interface Tool {
  name: string;
  description: string;
  run: (input: string) => Promise<string> | string;
}
```
Built-in Calculator tool with safe expression evaluation:
```typescript
{
  name: "Calculator",
  description: "Performs arithmetic calculations",
  run: (input: string) => {
    // Safe evaluation with regex validation
    if (!/^[0-9.+\-*\/()\s]+$/.test(input)) {
      return "Invalid expression";
    }
    return String(Function("return (" + input + ")")());
  }
}
```

### HTTP API Endpoints

#### GET /
Returns welcome message and usage instructions.
```json
{
  "message": "Welcome to the Single File ReAct Agent!",
  "usage": "Send a POST request with JSON body: { \"query\": \"your question\" }"
}
```

#### POST /
Accepts queries and returns agent responses.
```json
// Request
{
  "query": "Calculate 25 * 4"
}

// Response
{
  "answer": "The result is 100"
}
```

## Installation & Setup

1. **Install Deno**
   ```sh
   curl -fsSL https://deno.land/install.sh | sh
   ```
   Or via package managers:
   - macOS: `brew install deno`
   - Windows: `scoop install deno`

2. **Set Environment Variables**
   ```sh
   export OPENROUTER_API_KEY="your_key"
   export OPENROUTER_MODEL="openai/o3-mini-high"  # Optional
   ```

## Running Locally

```sh
deno run --watch --allow-net --allow-env agent.ts
```

Available Flags:

Basic Flags:
- `--watch`: Automatically restarts on file changes
- `--allow-net`: Grants network access for API calls
- `--allow-env`: Allows reading environment variables
- `--allow-read`: Allows file system read access
- `--allow-write`: Allows file system write access
- `--allow-all` or `-A`: Enables all permissions

Development Flags:
- `--inspect`: Enables debugger
- `--inspect-brk`: Enables debugger and breaks on start
- `--no-check`: Skips TypeScript type checking
- `--watch`: Watches for file changes and restarts
- `--trace-ops`: Logs all ops (useful for debugging)

Performance Flags:
- `--v8-flags`: Passes V8 flags for optimization
- `--no-prompt`: Disables terminal prompts
- `--cached-only`: Uses only cached dependencies
- `--no-remote`: Disables downloading remote modules

Network & Security:
- `--port`: Specifies HTTP server port (e.g., --port=3000)
- `--cert`: Provides TLS certificate for HTTPS
- `--unsafely-ignore-certificate-errors`: Ignores TLS errors
- `--allow-net=<allow-list>`: Restricts network access

Advanced Features:
- `--unstable`: Enables unstable APIs
- `--reload`: Forces reload of all cached dependencies
- `--location`: Sets document location for web APIs
- `--seed`: Sets random number generator seed
- `--log-level`: Sets log level (debug, info, warn, error)
- `--config`: Specifies config file (e.g., deno.json)

## Deployment Options

### Fly.io
```dockerfile
FROM denoland/deno:alpine
COPY agent.ts .
CMD ["run", "--allow-net", "--allow-env", "agent.ts"]
```

Deploy with:
```sh
fly launch --name my-agent
fly secrets set OPENROUTER_API_KEY=your_key
fly deploy
```

### Supabase Edge Functions
```sh
supabase functions new myagent
# Copy agent.ts to the new function
supabase secrets set OPENROUTER_API_KEY=your_key
supabase functions deploy myagent --no-verify-jwt
```

## Implementation Details

### Message Structure
```typescript
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### ReACT Loop
The agent uses a 10-step maximum reasoning loop that:
- Calls OpenRouter API for LLM responses
- Parses responses for Actions or Answers
- Executes tools and observes results
- Maintains conversation context

### Error Handling
- Tool execution errors
- LLM API errors
- Input validation
- Request format validation
- Step limit protection

### Security Features
- Input sanitization for calculator
- Environment variable validation
- Safe tool execution patterns
- HTTP response headers

## Example Usage

Using curl:
```sh
# GET endpoint
curl http://localhost:8000

# POST endpoint with query
curl -X POST "http://localhost:8000" \
     -H "Content-Type: application/json" \
     -d '{"query": "Calculate (15 + 5) * 2"}'
```

Using TypeScript:
```typescript
const response = await fetch("http://localhost:8000", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "Calculate 25 * 4" })
});
const data = await response.json();
console.log(data.answer);
```

## Adding Custom Tools

Extend the agent by adding tools to the `tools` array:
```typescript
const tools: Tool[] = [
  {
    name: "TimeConverter",
    description: "Converts between time zones",
    run: (input: string) => {
      // Implement time zone conversion
    }
  }
];
```

## Performance Notes

- Minimal dependencies for fast cold starts
- Efficient message handling
- Configurable reasoning loop limits
- Optimized for edge deployment
