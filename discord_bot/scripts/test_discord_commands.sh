#!/bin/bash
#
# Test Discord Slash Commands
# --------------------------
# This script tests the Discord bot by simulating slash command interactions.
# It starts the bot locally and sends various test interactions.
#
# Usage:
#   ./test_discord_commands.sh [options]
#
# Options:
#   -p, --port PORT       Specify the port to run on (default: 8888)
#   -k, --key KEY         Specify a test Discord public key (optional)
#   -h, --help            Display this help message
#

# Set the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PARENT_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# Default values
PORT=8888
TEST_KEY="67b8c1a3eb7c49f8855af52f6b1231a8" # Example key for testing (not a real Discord key)
OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-"demo"}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -k|--key)
      TEST_KEY="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./test_discord_commands.sh [options]"
      echo ""
      echo "Options:"
      echo "  -p, --port PORT       Specify the port to run on (default: 8888)"
      echo "  -k, --key KEY         Specify a test Discord public key (optional)"
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

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
  echo "Error: Deno is not installed. Please install Deno to run this script."
  echo "Visit https://deno.land/#installation for installation instructions."
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install jq to run this script."
  echo "Install with: apt-get install jq (Debian/Ubuntu) or brew install jq (macOS)"
  exit 1
fi

# Start the Discord bot in the background
echo "Starting Discord bot on port $PORT..."
PORT=$PORT OPENROUTER_API_KEY=$OPENROUTER_API_KEY DISCORD_PUBLIC_KEY=$TEST_KEY deno run --allow-net --allow-env "$PARENT_DIR/agent.ts" &
BOT_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 3

# Function to send a test interaction
send_interaction() {
  local interaction_type=$1
  local command_name=$2
  local options=$3
  local description=$4

  # Create the interaction JSON
  local interaction='{
    "id": "123456789012345678",
    "type": '$interaction_type',
    "data": {
      "name": "'$command_name'"'

  # Add options if provided
  if [ -n "$options" ]; then
    interaction+=',
      "options": '$options
  fi

  interaction+='
    },
    "user": {
      "id": "987654321098765432"
    },
    "guild_id": "111222333444555666",
    "channel_id": "777888999000111222"
  }'

  echo "----------------------------------------------"
  echo "Testing: $description"
  echo "----------------------------------------------"
  echo "Request:"
  echo "$interaction" | jq '.'
  echo ""
  
  # Send the interaction to the bot
  response=$(curl -s -X POST -H "Content-Type: application/json" -d "$interaction" http://localhost:$PORT)
  
  echo "Response:"
  if [[ "$response" == "" ]]; then
    echo "No response received"
  elif jq -e . >/dev/null 2>&1 <<<"$response"; then
    echo "$response" | jq '.'
  else
    echo "Raw response (not valid JSON):"
    echo "$response"
  fi
  echo ""
}

# Test Discord ping (type 1)
send_interaction 1 "" "" "Discord Ping Verification"

# Test /ask command
ask_options='[
  {
    "name": "query",
    "value": "What is the capital of France?"
  }
]'
send_interaction 2 "ask" "$ask_options" "/ask Command"

# Test /calc command
calc_options='[
  {
    "name": "expression",
    "value": "2 + 2 * 3"
  }
]'
send_interaction 2 "calc" "$calc_options" "/calc Command"

# Test /domain command
domain_options='[
  {
    "name": "domain",
    "value": "financial"
  },
  {
    "name": "query",
    "value": "Should I invest in stocks or bonds?"
  },
  {
    "name": "reasoning_type",
    "value": "both"
  }
]'
send_interaction 2 "domain" "$domain_options" "/domain Command"

# Test /info command
send_interaction 2 "info" "" "/info Command"

# Test /help command
send_interaction 2 "help" "" "/help Command (General)"

# Test /help command with specific command
help_options='[
  {
    "name": "command",
    "value": "domain"
  }
]'
send_interaction 2 "help" "$help_options" "/help Command (Specific)"

# Test invalid command
send_interaction 2 "unknown" "" "Invalid Command"

# Kill the bot process
echo "Stopping the Discord bot..."
kill $BOT_PID
wait $BOT_PID 2>/dev/null || true
echo "Test completed."