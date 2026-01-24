#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
PURPLE='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Clear screen
clear

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}           Meta Agent Creator Suite${NC}"
echo -e "${BLUE}================================================${NC}"

echo -e "\n${WHITE}Available Agent Types:${NC}"
echo -e "${CYAN}1) Math Tutor Agent${NC}"
echo -e "   • Mathematical problem solving"
echo -e "   • Step-by-step explanations"
echo -e "   • Multiple solution approaches"

echo -e "\n${CYAN}2) Code Reviewer Agent${NC}"
echo -e "   • Code quality analysis"
echo -e "   • Security scanning"
echo -e "   • Performance optimization"

echo -e "\n${CYAN}3) Research Assistant Agent${NC}"
echo -e "   • Information gathering"
echo -e "   • Data analysis"
echo -e "   • Citation management"

echo -e "\n${CYAN}4) Federation Agent${NC}"
echo -e "   • Multi-agent coordination"
echo -e "   • Task delegation"
echo -e "   • Result aggregation"

echo -e "\n${YELLOW}Select an agent type to create (1-4):${NC}"
read -p "> " choice

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

case $choice in
    1)
        echo -e "\n${GREEN}Creating Math Tutor Agent...${NC}"
        "$SCRIPT_DIR/create_math_tutor.sh"
        ;;
    2)
        echo -e "\n${GREEN}Creating Code Reviewer Agent...${NC}"
        "$SCRIPT_DIR/create_code_reviewer.sh"
        ;;
    3)
        echo -e "\n${GREEN}Creating Research Assistant Agent...${NC}"
        "$SCRIPT_DIR/create_research_assistant.sh"
        ;;
    4)
        echo -e "\n${GREEN}Creating Federation Agent...${NC}"
        "$SCRIPT_DIR/create_federation_agent.sh"
        ;;
    *)
        echo -e "\n${RED}Invalid choice. Please select a number between 1 and 4.${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}================================================${NC}"
echo -e "${GREEN}Agent creation complete!${NC}"
echo -e "${BLUE}================================================${NC}"

echo -e "\n${WHITE}Would you like to:${NC}"
echo -e "${CYAN}1) Create another agent${NC}"
echo -e "${CYAN}2) Start the created agent${NC}"
echo -e "${CYAN}3) Exit${NC}"

read -p "> " next_action

case $next_action in
    1)
        exec "$SCRIPT_DIR/create_agent.sh"
        ;;
    2)
        case $choice in
            1) cd "$SCRIPT_DIR/examples/math_tutor" && ./start_server.sh ;;
            2) cd "$SCRIPT_DIR/examples/code_reviewer" && ./start_server.sh ;;
            3) cd "$SCRIPT_DIR/examples/research_assistant" && ./start_server.sh ;;
            4) cd "$SCRIPT_DIR/examples/federation_agent" && ./start_server.sh ;;
        esac
        ;;
    3)
        echo -e "\n${GREEN}Thank you for using Meta Agent Creator Suite!${NC}"
        exit 0
        ;;
    *)
        echo -e "\n${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac
