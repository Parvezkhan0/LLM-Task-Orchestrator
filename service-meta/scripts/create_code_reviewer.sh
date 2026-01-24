#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}          Creating Code Reviewer Agent${NC}"
echo -e "${BLUE}================================================${NC}"

# Get script directory and create output directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXAMPLE_DIR="$SCRIPT_DIR/examples/code_reviewer"
mkdir -p "$EXAMPLE_DIR"

echo -e "\n${YELLOW}[1/5]${NC} Configuring agent parameters..."
echo -e "${GREEN}• Setting up as an HTTP server${NC}"
echo -e "${GREEN}• Enabling advanced code analysis${NC}"
echo -e "${GREEN}• Configuring linting integration${NC}"
echo -e "${GREEN}• Setting up security scanning${NC}"
echo -e "${GREEN}• Enabling best practices checking${NC}"

echo -e "\n${YELLOW}[2/5]${NC} Generating agent..."
deno run --allow-net --allow-env --allow-run --allow-write "$SCRIPT_DIR/../agent.ts" \
  --agentName="CodeReviewerAgent" \
  --model="openai/gpt-4" \
  --deployment=http \
  --outputFile="$EXAMPLE_DIR/code_reviewer_agent.ts" \
  --enableReflection=true \
  --npmPackages="eslint,prettier,typescript" \
  --advancedArgs='{
    "logLevel": "debug",
    "memoryLimit": 1024,
    "maxIterations": 20,
    "temperature": 0.3,
    "streamResponse": true,
    "contextWindow": 8192
  }' \
  --systemPrompt="You are an expert Code Reviewer agent that analyzes code for quality, security, and best practices.

Your expertise includes:
- Code quality assessment
- Security vulnerability detection
- Performance optimization suggestions
- Design pattern recommendations
- Best practices enforcement
- Style guide compliance

Focus areas:
1. Code Structure & Organization
2. Security & Data Protection
3. Performance & Optimization
4. Error Handling & Edge Cases
5. Documentation & Comments
6. Testing & Maintainability

Available tools:
{TOOL_LIST}

Follow this format:
Thought: <analysis reasoning>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <detailed code review with:
- Summary of findings
- Critical issues (if any)
- Security concerns
- Performance improvements
- Style recommendations
- Best practices suggestions>"

echo -e "\n${YELLOW}[3/5]${NC} Creating example code samples..."
cat > "$EXAMPLE_DIR/example_code.js" << EOL
// Example code for review
function calculateTotal(items) {
  let total = 0;
  for(var i=0; i<items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

// Security vulnerability example
function authenticateUser(username, password) {
  if(username == "admin" && password == "password123") {
    return true;
  }
  return false;
}

// Performance issue example
function searchArray(arr, item) {
  return arr.filter(x => x === item).length > 0;
}

// Error handling example
function divideNumbers(a, b) {
  return a/b;
}

// Async code example
function fetchUserData(userId) {
  fetch('https://api.example.com/users/' + userId)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    });
}
EOL

echo -e "\n${YELLOW}[4/5]${NC} Creating example queries file..."
cat > "$EXAMPLE_DIR/example_queries.txt" << EOL
# Example Code Review Queries

1. Basic Code Review
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Please review this code for quality and best practices:",
    "code": "function calculateTotal(items) {
      let total = 0;
      for(var i=0; i<items.length; i++) {
        total = total + items[i].price;
      }
      return total;
    }"
  }'

2. Security Review
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Check this authentication function for security issues:",
    "code": "function authenticateUser(username, password) {
      if(username == \"admin\" && password == \"password123\") {
        return true;
      }
      return false;
    }"
  }'

3. Performance Analysis
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Analyze this search function for performance:",
    "code": "function searchArray(arr, item) {
      return arr.filter(x => x === item).length > 0;
    }"
  }'

4. Error Handling Review
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Review error handling in this function:",
    "code": "function divideNumbers(a, b) {
      return a/b;
    }"
  }'

5. Full Codebase Review
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Please do a comprehensive review of example_code.js"
  }'
EOL

echo -e "\n${YELLOW}[5/5]${NC} Creating startup script..."
cat > "$EXAMPLE_DIR/start_server.sh" << EOL
#!/bin/bash
echo -e "${CYAN}Starting Code Reviewer Agent Server...${NC}"
echo -e "${CYAN}This agent will analyze code for:${NC}"
echo -e "${GREEN}• Code quality${NC}"
echo -e "${GREEN}• Security vulnerabilities${NC}"
echo -e "${GREEN}• Performance issues${NC}"
echo -e "${GREEN}• Best practices${NC}"
echo -e "${GREEN}• Style guide compliance${NC}"
deno run --allow-net --allow-env --allow-run code_reviewer_agent.ts
EOL

chmod +x "$EXAMPLE_DIR/start_server.sh"

echo -e "\n${GREEN}✓ Code Reviewer Agent created successfully!${NC}"
echo -e "${GREEN}✓ Example code samples generated${NC}"
echo -e "${GREEN}✓ Example queries saved${NC}"
echo -e "${GREEN}✓ Startup script created${NC}"

echo -e "\n${BLUE}Location:${NC} $EXAMPLE_DIR"
echo -e "${BLUE}Files created:${NC}"
echo -e "  • code_reviewer_agent.ts (Main agent)"
echo -e "  • example_code.js (Sample code for review)"
echo -e "  • example_queries.txt (Sample API requests)"
echo -e "  • start_server.sh (Startup script)"

echo -e "\n${BLUE}To start the server:${NC}"
echo -e "  cd $EXAMPLE_DIR"
echo -e "  ./start_server.sh"

echo -e "\n${BLUE}To test the agent:${NC}"
echo -e "  See example_queries.txt for sample requests"
echo -e "  Each query demonstrates different code review capabilities"
