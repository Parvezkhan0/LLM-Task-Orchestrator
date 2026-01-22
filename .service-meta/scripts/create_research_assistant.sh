#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}        Creating Research Assistant Agent${NC}"
echo -e "${BLUE}================================================${NC}"

# Get script directory and create output directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXAMPLE_DIR="$SCRIPT_DIR/examples/research_assistant"
mkdir -p "$EXAMPLE_DIR"

echo -e "\n${YELLOW}[1/5]${NC} Configuring agent parameters..."
echo -e "${GREEN}• Setting up advanced research capabilities${NC}"
echo -e "${GREEN}• Enabling multi-source analysis${NC}"
echo -e "${GREEN}• Configuring citation management${NC}"
echo -e "${GREEN}• Setting up fact verification${NC}"
echo -e "${GREEN}• Enabling structured output formatting${NC}"

echo -e "\n${YELLOW}[2/5]${NC} Generating agent..."
deno run --allow-net --allow-env --allow-run --allow-write "$SCRIPT_DIR/../agent.ts" \
  --agentName="ResearchAssistantAgent" \
  --model="openai/gpt-4" \
  --deployment=http \
  --outputFile="$EXAMPLE_DIR/research_assistant_agent.ts" \
  --enableReflection=true \
  --npmPackages="marked,bibtex-parse,pdf-parse" \
  --advancedArgs='{
    "logLevel": "debug",
    "memoryLimit": 2048,
    "maxIterations": 25,
    "temperature": 0.2,
    "streamResponse": true,
    "contextWindow": 16384,
    "cacheSize": 5000
  }' \
  --systemPrompt="You are an expert Research Assistant agent that helps gather, analyze, and synthesize information from various sources.

Your expertise includes:
- Academic research methodology
- Data analysis and synthesis
- Citation management
- Fact verification
- Literature review
- Information organization
- Summary writing
- Critical analysis

Research Process:
1. Information Gathering
2. Source Verification
3. Data Analysis
4. Critical Evaluation
5. Synthesis & Summary
6. Citation & Attribution

Available tools:
{TOOL_LIST}

Follow this format:
Thought: <research strategy>
Action: <ToolName>|<input>
Observation: <result>
...
Final: <comprehensive research output with:
- Executive Summary
- Key Findings
- Methodology
- Analysis
- Conclusions
- References & Citations
- Future Research Directions>"

echo -e "\n${YELLOW}[3/5]${NC} Creating example research topics..."
cat > "$EXAMPLE_DIR/research_topics.md" << EOL
# Example Research Topics

## Technology Trends
- Impact of artificial intelligence on healthcare
- Future of quantum computing
- Sustainable energy technologies
- Cybersecurity challenges in IoT
- Evolution of 5G and 6G networks

## Environmental Studies
- Climate change mitigation strategies
- Ocean plastic pollution solutions
- Renewable energy adoption rates
- Urban sustainability initiatives
- Biodiversity conservation methods

## Social Sciences
- Remote work impact on productivity
- Social media influence on mental health
- Digital privacy concerns
- Educational technology effectiveness
- Cultural impacts of globalization

## Healthcare
- Pandemic response strategies
- Telemedicine adoption trends
- Mental health interventions
- Preventive healthcare methods
- Healthcare accessibility solutions
EOL

echo -e "\n${YELLOW}[4/5]${NC} Creating example queries file..."
cat > "$EXAMPLE_DIR/example_queries.txt" << EOL
# Example Research Queries

1. Technology Trend Analysis
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Research the current state and future trends of quantum computing, including major breakthroughs, challenges, and potential applications."
  }'

2. Environmental Impact Study
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Analyze the effectiveness of various ocean plastic pollution solutions, including current initiatives, technologies, and policy approaches."
  }'

3. Social Impact Analysis
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Investigate the impact of remote work on employee productivity and well-being, including benefits, challenges, and best practices."
  }'

4. Healthcare Innovation Review
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Research the evolution and impact of telemedicine, including adoption rates, effectiveness, and barriers to implementation."
  }'

5. Literature Review
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Conduct a comprehensive literature review on artificial intelligence applications in healthcare, focusing on recent developments and future possibilities."
  }'
EOL

echo -e "\n${YELLOW}[5/5]${NC} Creating startup script..."
cat > "$EXAMPLE_DIR/start_server.sh" << EOL
#!/bin/bash
echo -e "${MAGENTA}Starting Research Assistant Agent Server...${NC}"
echo -e "${MAGENTA}This agent specializes in:${NC}"
echo -e "${GREEN}• Comprehensive research analysis${NC}"
echo -e "${GREEN}• Multi-source information gathering${NC}"
echo -e "${GREEN}• Critical evaluation${NC}"
echo -e "${GREEN}• Fact verification${NC}"
echo -e "${GREEN}• Citation management${NC}"
echo -e "${GREEN}• Structured reporting${NC}"
deno run --allow-net --allow-env --allow-run research_assistant_agent.ts
EOL

chmod +x "$EXAMPLE_DIR/start_server.sh"

echo -e "\n${GREEN}✓ Research Assistant Agent created successfully!${NC}"
echo -e "${GREEN}✓ Research topics generated${NC}"
echo -e "${GREEN}✓ Example queries saved${NC}"
echo -e "${GREEN}✓ Startup script created${NC}"

echo -e "\n${BLUE}Location:${NC} $EXAMPLE_DIR"
echo -e "${BLUE}Files created:${NC}"
echo -e "  • research_assistant_agent.ts (Main agent)"
echo -e "  • research_topics.md (Sample research areas)"
echo -e "  • example_queries.txt (Sample API requests)"
echo -e "  • start_server.sh (Startup script)"

echo -e "\n${CYAN}Research Capabilities:${NC}"
echo -e "  • Academic research methodology"
echo -e "  • Data analysis and synthesis"
echo -e "  • Literature review"
echo -e "  • Citation management"
echo -e "  • Fact verification"
echo -e "  • Critical analysis"

echo -e "\n${BLUE}To start the server:${NC}"
echo -e "  cd $EXAMPLE_DIR"
echo -e "  ./start_server.sh"

echo -e "\n${BLUE}To test the agent:${NC}"
echo -e "  See example_queries.txt for sample research requests"
echo -e "  Each query demonstrates different research capabilities"
