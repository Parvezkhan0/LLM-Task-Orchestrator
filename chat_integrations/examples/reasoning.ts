/**
 * Agentic ReAct Agent Template (Deno)
 * 
 * This agent follows the ReAct (Reasoning + Acting) logic pattern, integrates with the OpenRouter API for LLM interactions,
 * and supports tool usage within a structured agent framework. It now also includes an agentic reasoning engine
 * that combines deductive and inductive reasoning for multi-domain decision making.
 * 
 * ## Setup
 * - Ensure you have a Deno runtime available (e.g., in your serverless environment).
 * - Set the environment variable `OPENROUTER_API_KEY` with your OpenRouter API key.
 * - (Optional) Set `OPENROUTER_MODEL` to specify the model (default is "openai/o3-mini-high").
 * - This script requires network access to call the OpenRouter API. When running with Deno, use `--allow-net` (and `--allow-env` to read env variables).
 * 
 * ## Deployment (Fly.io)
 * 1. Create a Dockerfile using a Deno base image (e.g. `denoland/deno:alpine`).
 *    - In the Dockerfile, copy this script into the image and use `CMD ["run", "--allow-net", "--allow-env", "agent.ts"]`.
 * 2. Set the `OPENROUTER_API_KEY` as a secret on Fly.io (e.g., `fly secrets set OPENROUTER_API_KEY=your_key`).
 * 3. Deploy with `fly deploy`. The app will start an HTTP server on port 8000 by default.
 * 
 * ## Deployment (Supabase Edge Functions)
 * 1. Install the Supabase CLI and login to your project.
 * 2. Create a new Edge Function: `supabase functions new myagent`.
 * 3. Replace the content of the generated `index.ts` with this entire script.
 * 4. Ensure to add your OpenRouter API key: run `supabase secrets set OPENROUTER_API_KEY=your_key` for the function's environment.
 * 5. Deploy the function: `supabase functions deploy myagent --no-verify-jwt`.
 * 6. The function will be accessible at the URL provided by Supabase.
 * 
 * ## Usage
 * Send an HTTP POST request to the deployed endpoint with a JSON body: { "query": "your question", ... }.
 * The response will be a JSON object: { "answer": "the answer from the agent" }.
 * 
 * ## Customization
 * - **Deductive Reasoning:** Edit or add rules in the `applyDeductive` method of the Agent class.
 * - **Inductive Reasoning:** Extend the case databases (e.g., `medicalCases`, `legalCases`) or modify the matching logic in `applyInductive`.
 * - **Domain Support:** The agent currently supports "financial", "medical", and "legal". Add additional domains by updating both reasoning methods.
 * - **Prompt Engineering:** Modify `systemPrompt` to instruct the LLM regarding the use of tools and the desired ReAct format.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// --- Environment Setup ---
const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL   = Deno.env.get("OPENROUTER_MODEL") || "openai/o3-mini-high";
const PORT    = parseInt(Deno.env.get("PORT") || "8000");

if (!API_KEY) {
  console.error("Error: OPENROUTER_API_KEY is not set in environment.");
  Deno.exit(1);
}

// --- Interfaces for Chat and Tools ---
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
interface Tool {
  name: string;
  description: string;
  run: (input: string) => Promise<string> | string;
}

// --- Define Tools ---
const tools: Tool[] = [
  {
    name: "Calculator",
    description: "Performs arithmetic calculations. Usage: Calculator[expression]",
    run: (input: string) => {
      try {
        if (!/^[0-9.+\-*\/()\s]+$/.test(input)) {
          return "Invalid expression";
        }
        const result = Function("return (" + input + ")")();
        return String(result);
      } catch (err) {
        return "Error: " + (err as Error).message;
      }
    }
  },
  // Additional tools can be added here.
];

// --- System Prompt for ReAct ---
const toolDescriptions = tools.map(t => `${t.name}: ${t.description}`).join("\n");
const systemPrompt = 
`You are a smart assistant with access to the following tools:
${toolDescriptions}

When answering the user, you may use the tools to gather information or calculate results.
Follow this format strictly:
Thought: <your reasoning here>
Action: <ToolName>[<tool input>]
Observation: <result of the tool action>
... (repeat Thought/Action/Observation as needed) ...
Thought: <final reasoning>
Answer: <your final answer>

Only provide one action at a time, and wait for the observation before continuing.
If the answer is directly known or once enough information is gathered, output the final Answer.
`;

// --- Agentic Reasoning Engine ---
/*
  The Agent class integrates deductive (rule-based) and inductive (data-driven) reasoning.
  Customize the deductive and inductive methods per domain as required.
*/

const medicalCases = [
  { symptoms: ["fever", "cough", "headache"], diagnosis: "Flu" },
  { symptoms: ["fever", "cough"], diagnosis: "Common Cold" },
  { symptoms: ["fever", "rash"], diagnosis: "Measles" },
  { symptoms: ["cough", "shortness of breath"], diagnosis: "Asthma" }
];

const legalCases = [
  { caseType: "contract", signed: false, outcome: "Contract declared void (no signature)" },
  { caseType: "contract", signed: true, outcome: "Contract enforced by court" },
  { caseType: "criminal", evidence: "weak", outcome: "Not guilty verdict" },
  { caseType: "criminal", evidence: "strong", outcome: "Guilty verdict" },
  { caseType: "civil", outcome: "Case settled out of court" }
];

class Agent {
  // Deductive reasoning: apply domain-specific rules.
  applyDeductive(domain: string, input: any): string | null {
    if (domain === "financial") {
      const data = input.data || {};
      const expReturn = data.expectedReturn;
      const riskLevel = data.riskLevel;
      if (expReturn !== undefined && riskLevel !== undefined) {
        if (expReturn > 0.05 && riskLevel === "low") {
          return "Decision: Invest (high return, low risk)";
        }
        if (expReturn < 0 || riskLevel === "high") {
          return "Decision: Do Not Invest (insufficient return or high risk)";
        }
        return "Decision: Hold (moderate return/risk)";
      }
      return null;
    }
    if (domain === "medical") {
      const symptoms: string[] = input.symptoms || [];
      const tests = input.testResults || {};
      if (symptoms.includes("fever") && symptoms.includes("rash")) {
        return "Diagnosis: Measles (deduced from fever + rash)";
      }
      if (symptoms.includes("fever") && symptoms.includes("cough") && tests.chestXRay === "patchy") {
        return "Diagnosis: Pneumonia (deduced from fever, cough, and x-ray)";
      }
      if (symptoms.includes("chest pain") && symptoms.includes("shortness of breath")) {
        return "Diagnosis: Possible Heart Attack (deduced from chest pain + breathing issues)";
      }
      return null;
    }
    if (domain === "legal") {
      const caseType = input.caseType;
      if (caseType === "contract") {
        if (input.signed === false) {
          return "Legal Outcome: Contract is invalid (no signature)";
        }
        if (input.signed === true && input.consideration !== false) {
          return "Legal Outcome: Contract is likely enforceable";
        }
      }
      if (caseType === "criminal") {
        if (input.evidence === "strong") {
          return "Legal Outcome: Likely conviction (strong evidence)";
        }
        if (input.evidence === "weak") {
          return "Legal Outcome: Likely acquittal (weak evidence)";
        }
      }
      return null;
    }
    return null;
  }

  // Inductive reasoning: use data or learned patterns.
  applyInductive(domain: string, input: any): string | Record<string, any> | null {
    if (domain === "financial") {
      const data = input.data || {};
      let expReturn = data.expectedReturn;
      let riskLevel = data.riskLevel;
      if (expReturn === undefined && Array.isArray(data.pastReturns)) {
        const returns: number[] = data.pastReturns;
        if (returns.length > 0) {
          expReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        }
      }
      if (riskLevel === undefined && Array.isArray(data.pastReturns)) {
        const returns: number[] = data.pastReturns;
        if (returns.length > 1) {
          const mean = expReturn !== undefined ? expReturn : (returns.reduce((a,b)=>a+b,0) / returns.length);
          const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
          const stdDev = Math.sqrt(variance);
          riskLevel = stdDev > 0.1 ? "high" : (stdDev < 0.05 ? "low" : "medium");
        }
      }
      if (expReturn !== undefined && riskLevel !== undefined) {
        const decision = this.applyDeductive(domain, { data: { expectedReturn: expReturn, riskLevel: riskLevel } });
        if (decision) return decision;
      }
      return { estimatedReturn: expReturn, estimatedRisk: riskLevel, note: "Inductive estimates (no rule applied)" };
    }
    if (domain === "medical") {
      const symptoms: string[] = input.symptoms || [];
      let bestMatch: {diagnosis: string, matchCount: number} | null = null;
      for (const caseData of medicalCases) {
        const matchCount = caseData.symptoms.filter(s => symptoms.includes(s)).length;
        if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.matchCount)) {
          bestMatch = { diagnosis: caseData.diagnosis, matchCount };
        }
      }
      return bestMatch ? `Possible Diagnosis: ${bestMatch.diagnosis} (inductively inferred from similar cases)` 
                       : "Diagnosis unclear (no similar cases found)";
    }
    if (domain === "legal") {
      const caseType = input.caseType;
      for (const caseRecord of legalCases) {
        if (caseRecord.caseType === caseType) {
          if (("signed" in caseRecord && caseRecord.signed === input.signed) ||
              ("evidence" in caseRecord && caseRecord.evidence === input.evidence) ||
              (!("signed" in caseRecord) && !("evidence" in caseRecord))) {
            return `Likely Outcome: ${caseRecord.outcome} (based on similar past case)`;
          }
        }
      }
      return "Outcome unclear (no similar cases in knowledge base)";
    }
    return null;
  }

  // Process query based on reasoning type
  processQuery(domain: string, input: any): any {
    const reasoningType = input.reasoningType || "both";
    
    if (reasoningType === "deductive") {
      const deductiveResult = this.applyDeductive(domain, input);
      return { result: deductiveResult || "No deductive conclusion possible with the given information." };
    } 
    else if (reasoningType === "inductive") {
      const inductiveResult = this.applyInductive(domain, input);
      return { result: inductiveResult || "No inductive conclusion possible with the given information." };
    }
    else {
      // Default: "both" - first deductive, then inductive if needed
      const deductiveResult = this.applyDeductive(domain, input);
      if (deductiveResult) return { result: deductiveResult, reasoningUsed: "deductive" };
      const inductiveResult = this.applyInductive(domain, input);
      return { result: inductiveResult, reasoningUsed: "inductive" };
    }
  }
}

// --- LLM Interaction with OpenRouter ---
async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stop: ["Observation:"],
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

// --- ReAct Agent Loop ---
async function runAgent(query: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query }
  ];

  // If the query is a JSON string with a "domain" field, run our agentic reasoning module first.
  let domain: string | undefined;
  try {
    const parsed = JSON.parse(query);
    if (parsed.domain) domain = parsed.domain;
  } catch { /* not JSON; plain text query */ }

  if (domain) {
    const input = JSON.parse(query);
    const agent = new Agent();
    const preliminary = agent.processQuery(domain, input);
    messages.push({ role: "system", content: `Preliminary agentic reasoning result: ${JSON.stringify(preliminary)}` });
  }

  // Run the ReAct loop (up to 10 iterations)
  for (let step = 0; step < 10; step++) {
    const assistantReply = await callOpenRouter(messages);
    messages.push({ role: "assistant", content: assistantReply });
    const answerMatch = assistantReply.match(/Answer:\s*(.*)$/);
    if (answerMatch) return answerMatch[1].trim();
    const actionMatch = assistantReply.match(/Action:\s*([^\[]+)\[([^\]]+)\]/);
    if (actionMatch) {
      const toolName = actionMatch[1].trim();
      const toolInput = actionMatch[2].trim();
      const tool = tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
      let observation: string;
      if (!tool) {
        observation = `Tool "${toolName}" not found`;
      } else {
        try {
          observation = String(await tool.run(toolInput));
        } catch (err) {
          observation = `Error: ${(err as Error).message}`;
        }
      }
      messages.push({ role: "system", content: `Observation: ${observation}` });
      continue;
    }
    return assistantReply.trim();
  }
  throw new Error("Agent did not produce a final answer within the step limit.");
}

// --- HTTP Server for Edge Deployment ---
console.log(`Starting server on port ${PORT}...`);
serve(async (req: Request) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({
      message: "Welcome to the Agentic ReAct Agent!",
      usage: "Send a POST request with JSON body: { \"query\": \"your question\", ... }"
    }), { headers: { "Content-Type": "application/json" } });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  let query: string;
  try {
    const data = await req.json();
    query = data.query ?? data.question;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  if (!query || typeof query !== "string") {
    return new Response(`Bad Request: Missing "query" string.`, { status: 400 });
  }
  try {
    const answer = await runAgent(query);
    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Agent error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
