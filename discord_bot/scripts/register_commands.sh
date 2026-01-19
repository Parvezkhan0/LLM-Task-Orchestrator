#!/bin/bash
#
# Register Discord Slash Commands
# ------------------------------
# This script registers slash commands with Discord's API.
# It requires a Discord bot token and application ID.
#
# Usage:
#   ./register_commands.sh [options]
#
# Options:
#   -t, --token TOKEN     Discord bot token (required)
#   -a, --app-id ID       Discord application ID (required)
#   -g, --guild-id ID     Guild ID for guild-specific commands (optional)
#   -h, --help            Display this help message
#

# Set the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Default values
BOT_TOKEN=""
APP_ID=""
GUILD_ID=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--token)
      BOT_TOKEN="$2"
      shift 2
      ;;
    -a|--app-id)
      APP_ID="$2"
      shift 2
      ;;
    -g|--guild-id)
      GUILD_ID="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./register_commands.sh [options]"
      echo ""
      echo "Options:"
      echo "  -t, --token TOKEN     Discord bot token (required)"
      echo "  -a, --app-id ID       Discord application ID (required)"
      echo "  -g, --guild-id ID     Guild ID for guild-specific commands (optional)"
      echo "  -h, --help            Display this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check required parameters
if [ -z "$BOT_TOKEN" ]; then
  echo "Error: Discord bot token is required. Use -t or --token to provide it."
  exit 1
fi

if [ -z "$APP_ID" ]; then
  echo "Error: Discord application ID is required. Use -a or --app-id to provide it."
  exit 1
fi

# Define the commands to register
COMMANDS='[
  {
    "name": "ask",
    "description": "Ask the agent any question or give it a task",
    "options": [
      {
        "name": "query",
        "description": "Your question or task",
        "type": 3,
        "required": true
      }
    ]
  },
  {
    "name": "calc",
    "description": "Perform a calculation using the calculator tool",
    "options": [
      {
        "name": "expression",
        "description": "The mathematical expression to evaluate",
        "type": 3,
        "required": true
      }
    ]
  },
  {
    "name": "domain",
    "description": "Use domain-specific reasoning for specialized queries",
    "options": [
      {
        "name": "domain",
        "description": "The domain for reasoning (financial, medical, legal)",
        "type": 3,
        "required": true,
        "choices": [
          {
            "name": "Financial",
            "value": "financial"
          },
          {
            "name": "Medical",
            "value": "medical"
          },
          {
            "name": "Legal",
            "value": "legal"
          }
        ]
      },
      {
        "name": "query",
        "description": "The question to answer",
        "type": 3,
        "required": true
      },
      {
        "name": "reasoning_type",
        "description": "Type of reasoning to use",
        "type": 3,
        "required": false,
        "choices": [
          {
            "name": "Deductive (rule-based)",
            "value": "deductive"
          },
          {
            "name": "Inductive (case-based)",
            "value": "inductive"
          },
          {
            "name": "Both",
            "value": "both"
          }
        ]
      }
    ]
  },
  {
    "name": "info",
    "description": "Get information about the bot, its capabilities, and usage statistics"
  },
  {
    "name": "help",
    "description": "Get help on how to use the bot or a specific command",
    "options": [
      {
        "name": "command",
        "description": "The specific command to get help for",
        "type": 3,
        "required": false,
        "choices": [
          {
            "name": "ask",
            "value": "ask"
          },
          {
            "name": "calc",
            "value": "calc"
          },
          {
            "name": "domain",
            "value": "domain"
          },
          {
            "name": "info",
            "value": "info"
          },
          {
            "name": "help",
            "value": "help"
          }
        ]
      }
    ]
  }
]'

# Determine the endpoint URL based on whether a guild ID is provided
if [ -n "$GUILD_ID" ]; then
  ENDPOINT="https://discord.com/api/v10/applications/$APP_ID/guilds/$GUILD_ID/commands"
  echo "Registering guild-specific commands for guild ID: $GUILD_ID"
else
  ENDPOINT="https://discord.com/api/v10/applications/$APP_ID/commands"
  echo "Registering global commands"
fi

# Register the commands
echo "Registering commands with Discord API..."
echo "Endpoint: $ENDPOINT"

RESPONSE=$(curl -s -X PUT \
  -H "Authorization: Bot $BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMMANDS" \
  "$ENDPOINT")

# Check if the request was successful
if [[ $RESPONSE == *"id"* ]]; then
  echo "Commands registered successfully!"
  echo "Response:"
  echo "$RESPONSE" | jq '.'
else
  echo "Error registering commands:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi