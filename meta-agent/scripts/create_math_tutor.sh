#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Creating Math Tutor Agent${NC}"
echo -e "${BLUE}========================================${NC}"

# Get script directory and create output directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXAMPLE_DIR="$SCRIPT_DIR/examples/math_tutor"
mkdir -p "$EXAMPLE_DIR"

echo -e "\n${YELLOW}[1/4]${NC} Configuring agent parameters..."
echo -e "${GREEN}• Setting up as an HTTP server${NC}"
echo -e "${GREEN}• Enabling self-reflection${NC}"
echo -e "${GREEN}• Adding math-focused tools${NC}"
echo -e "${GREEN}• Configuring advanced logging${NC}"

echo -e "\n${YELLOW}[2/4]${NC} Generating agent..."
deno run --allow-net --allow-env --allow-run --allow-write "$SCRIPT_DIR/../agent.ts" \
  --agentName="MathTutorAgent" \
  --model="openai/gpt-4" \
  --deployment=http \
  --outputFile="$EXAMPLE_DIR/math_tutor_agent.ts" \
  --enableReflection=true \
  --npmPackages="mathjs" \
  --advancedArgs='{
    "logLevel": "debug",
    "memoryLimit": 512,
    "maxIterations": 15,
    "temperature": 0.7,
    "streamResponse": true
  }' \
  --systemPrompt="You are an advanced Math Tutor agent that helps students understand mathematical concepts and solve problems step by step.

Your expertise includes:
- Arithmetic and basic math
- Algebra and equation solving
- Step-by-step problem solving
- Clear explanations of concepts
- Multiple solution approaches

Available tools:
{TOOL_LIST}

Follow this format:
Thought: <reasoning>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <answer with detailed explanation>"

echo -e "\n${YELLOW}[3/4]${NC} Creating example queries file..."
cat > "$EXAMPLE_DIR/example_queries.txt" << EOL
# Example Math Tutor Queries

1. Basic Arithmetic
curl "http://localhost:8000?input=Can you help me solve 23 * 17?"

2. Algebra Problem
curl "http://localhost:8000?input=How do I solve the equation 3x + 7 = 22?"

3. Step by Step Division
curl "http://localhost:8000?input=Can you show me how to divide 156 by 13 step by step?"

4. Multiple Methods
curl "http://localhost:8000?input=What are different ways to solve x^2 - 4 = 0?"

5. Concept Explanation
curl "http://localhost:8000?input=Can you explain what a quadratic equation is and when we use it?"
EOL

echo -e "\n${YELLOW}[4/4]${NC} Creating startup script..."
cat > "$EXAMPLE_DIR/start_server.sh" << EOL
#!/bin/bash
echo "Starting Math Tutor Agent Server..."
deno run --allow-net --allow-env --allow-run math_tutor_agent.ts
EOL

chmod +x "$EXAMPLE_DIR/start_server.sh"

echo -e "\n${GREEN}✓ Math Tutor Agent created successfully!${NC}"
echo -e "${GREEN}✓ Example queries saved${NC}"
echo -e "${GREEN}✓ Startup script generated${NC}"
echo -e "\n${BLUE}Location:${NC} $EXAMPLE_DIR"
echo -e "${BLUE}To start the server:${NC}"
echo -e "  cd $EXAMPLE_DIR"
echo -e "  ./start_server.sh"
echo -e "\n${BLUE}To test the agent:${NC}"
echo -e "  See example_queries.txt for sample requests"
