#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}          Creating Federation Agent${NC}"
echo -e "${BLUE}================================================${NC}"

# Get script directory and create output directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXAMPLE_DIR="$SCRIPT_DIR/examples/federation_agent"
mkdir -p "$EXAMPLE_DIR"

echo -e "\n${YELLOW}[1/6]${NC} Configuring agent parameters..."
echo -e "${GREEN}• Setting up multi-agent communication${NC}"
echo -e "${GREEN}• Enabling robots.txt protocol${NC}"
echo -e "${GREEN}• Configuring agent discovery${NC}"
echo -e "${GREEN}• Setting up task coordination${NC}"
echo -e "${GREEN}• Enabling secure communication${NC}"
echo -e "${GREEN}• Configuring load balancing${NC}"

echo -e "\n${YELLOW}[2/6]${NC} Generating agent..."
deno run --allow-net --allow-env --allow-run --allow-write "$SCRIPT_DIR/../agent.ts" \
  --agentName="FederationAgent" \
  --model="openai/gpt-4" \
  --deployment=http \
  --outputFile="$EXAMPLE_DIR/federation_agent.ts" \
  --enableReflection=true \
  --enableMultiAgentComm=true \
  --npmPackages="axios,robotstxt-parser" \
  --advancedArgs='{
    "logLevel": "debug",
    "memoryLimit": 1024,
    "maxIterations": 20,
    "temperature": 0.4,
    "streamResponse": true,
    "contextWindow": 8192,
    "retryAttempts": 3
  }' \
  --systemPrompt="You are a Federation Agent that coordinates and manages communication between multiple specialized AI agents.

Your expertise includes:
- Multi-agent coordination
- Task delegation and routing
- Agent discovery and capabilities assessment
- Load balancing and optimization
- Secure communication protocols
- Error handling and recovery
- Results aggregation and synthesis

Federation Protocols:
1. Agent Discovery (via robots.txt)
2. Capability Assessment
3. Task Distribution
4. Communication Management
5. Result Aggregation
6. Error Recovery

Available tools:
{TOOL_LIST}

Follow this format:
Thought: <coordination strategy>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <coordinated response with:
- Task Distribution Summary
- Agent Participation
- Communication Flow
- Aggregated Results
- Error Handling Report
- Performance Metrics>"

echo -e "\n${YELLOW}[3/6]${NC} Creating robots.txt..."
cat > "$EXAMPLE_DIR/robots.txt" << EOL
User-agent: *
Allow: /api/federation/
Allow: /api/discovery/
Allow: /.well-known/ai-capabilities
Disallow: /api/internal/
Disallow: /api/system/
Disallow: /api/private/

# Federation Agent Capabilities
# Version: 1.0
# Protocol: ReACT
# Coordination: Enabled
# Multi-Agent: Enabled
# Task Types: All
# Max Concurrent: 10
# Response Time: 2000ms
# Availability: 99.9%

# Available Endpoints
# GET  /api/federation/discover   - Agent discovery
# POST /api/federation/delegate   - Task delegation
# POST /api/federation/coordinate - Multi-agent coordination
# GET  /api/federation/status     - Task status
# GET  /.well-known/ai-capabilities - Capability description
EOL

echo -e "\n${YELLOW}[4/6]${NC} Creating example task scenarios..."
cat > "$EXAMPLE_DIR/task_scenarios.md" << EOL
# Federation Task Scenarios

## 1. Multi-Agent Research Project
- Research Assistant: Gather information
- Code Reviewer: Analyze code samples
- Math Tutor: Validate calculations
- Federation Agent: Coordinate and synthesize

## 2. Code Analysis Pipeline
- Code Reviewer 1: Security analysis
- Code Reviewer 2: Performance analysis
- Code Reviewer 3: Best practices
- Federation Agent: Aggregate findings

## 3. Educational Support System
- Math Tutor: Mathematical concepts
- Research Assistant: Background information
- Code Reviewer: Programming examples
- Federation Agent: Integrate responses

## 4. Technical Documentation
- Research Assistant: Gather specifications
- Code Reviewer: Code documentation
- Math Tutor: Technical calculations
- Federation Agent: Create final document
EOL

echo -e "\n${YELLOW}[5/6]${NC} Creating example queries file..."
cat > "$EXAMPLE_DIR/example_queries.txt" << EOL
# Example Federation Queries

1. Multi-Agent Task Coordination
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Coordinate a comprehensive analysis of a machine learning project, including code review, mathematical validation, and research aspects."
  }'

2. Agent Discovery
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Discover available agents in the network and list their capabilities."
  }'

3. Task Distribution
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Distribute the analysis of a large codebase among multiple code reviewer agents for parallel processing."
  }'

4. Result Aggregation
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Aggregate and synthesize results from multiple agents working on different aspects of a technical documentation task."
  }'

5. Load Balancing
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Optimize task distribution among available agents based on their current load and capabilities."
  }'
EOL

echo -e "\n${YELLOW}[6/6]${NC} Creating startup script..."
cat > "$EXAMPLE_DIR/start_server.sh" << EOL
#!/bin/bash
echo -e "${PURPLE}Starting Federation Agent Server...${NC}"
echo -e "${PURPLE}Federation Capabilities:${NC}"
echo -e "${GREEN}• Multi-agent coordination${NC}"
echo -e "${GREEN}• Task delegation and routing${NC}"
echo -e "${GREEN}• Agent discovery (robots.txt)${NC}"
echo -e "${GREEN}• Load balancing${NC}"
echo -e "${GREEN}• Result aggregation${NC}"
echo -e "${GREEN}• Error recovery${NC}"

echo -e "\n${CYAN}Available Endpoints:${NC}"
echo -e "${BLUE}GET  /api/federation/discover   ${NC}- Agent discovery"
echo -e "${BLUE}POST /api/federation/delegate   ${NC}- Task delegation"
echo -e "${BLUE}POST /api/federation/coordinate ${NC}- Multi-agent coordination"
echo -e "${BLUE}GET  /api/federation/status     ${NC}- Task status"

deno run --allow-net --allow-env --allow-run federation_agent.ts
EOL

chmod +x "$EXAMPLE_DIR/start_server.sh"

echo -e "\n${GREEN}✓ Federation Agent created successfully!${NC}"
echo -e "${GREEN}✓ robots.txt protocol configured${NC}"
echo -e "${GREEN}✓ Task scenarios documented${NC}"
echo -e "${GREEN}✓ Example queries saved${NC}"
echo -e "${GREEN}✓ Startup script created${NC}"

echo -e "\n${BLUE}Location:${NC} $EXAMPLE_DIR"
echo -e "${BLUE}Files created:${NC}"
echo -e "  • federation_agent.ts (Main agent)"
echo -e "  • robots.txt (Agent protocol)"
echo -e "  • task_scenarios.md (Example scenarios)"
echo -e "  • example_queries.txt (Sample API requests)"
echo -e "  • start_server.sh (Startup script)"

echo -e "\n${CYAN}Federation Capabilities:${NC}"
echo -e "  • Multi-agent coordination"
echo -e "  • Task delegation and routing"
echo -e "  • Agent discovery"
echo -e "  • Load balancing"
echo -e "  • Result aggregation"
echo -e "  • Error recovery"

echo -e "\n${BLUE}To start the server:${NC}"
echo -e "  cd $EXAMPLE_DIR"
echo -e "  ./start_server.sh"

echo -e "\n${BLUE}To test the agent:${NC}"
echo -e "  See example_queries.txt for sample federation requests"
echo -e "  Each query demonstrates different coordination capabilities"
