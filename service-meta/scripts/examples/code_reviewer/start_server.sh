#!/bin/bash
echo -e "\033[0;36mStarting Code Reviewer Agent Server...\033[0m"
echo -e "\033[0;36mThis agent will analyze code for:\033[0m"
echo -e "\033[0;32m• Code quality\033[0m"
echo -e "\033[0;32m• Security vulnerabilities\033[0m"
echo -e "\033[0;32m• Performance issues\033[0m"
echo -e "\033[0;32m• Best practices\033[0m"
echo -e "\033[0;32m• Style guide compliance\033[0m"
deno run --allow-net --allow-env --allow-run code_reviewer_agent.ts
