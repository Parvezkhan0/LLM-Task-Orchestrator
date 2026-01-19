#!/bin/bash
#
# ReAct Agent Runner
# -----------------
# This script is part of the agent system and runs the ReAct reasoning agent.
# It loads environment variables from .env and starts the Deno TypeScript agent.
#
# Usage:
#   ./start_reasoning_agent.sh [options]
#
# Options:
#   -p, --port PORT       Specify the port to run on (default: 8000)
#   -m, --model MODEL     Specify the OpenRouter model to use
#   -d, --debug           Enable debug mode with verbose logging
#   -h, --help            Display this help message
#

# Set the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DEBUG=false
PORT=8000
CUSTOM_MODEL=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -m|--model)
      CUSTOM_MODEL="$2"
      shift 2
      ;;
    -d|--debug)
      DEBUG=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./start_reasoning_agent.sh [options]"
      echo ""
      echo "Options:"
      echo "  -p, --port PORT       Specify the port to run on (default: 8000)"
      echo "  -m, --model MODEL     Specify the OpenRouter model to use"
      echo "  -d, --debug           Enable debug mode with verbose logging"
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

# Load environment variables from .env file
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
else
  echo "Error: .env file not found in $SCRIPT_DIR"
  echo "Please create a .env file with OPENROUTER_API_KEY=your_api_key"
  exit 1
fi

# Check if OPENROUTER_API_KEY is set
if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "Error: OPENROUTER_API_KEY is not set in .env file"
  exit 1
fi

# Set custom model if specified
if [ -n "$CUSTOM_MODEL" ]; then
  export OPENROUTER_MODEL="$CUSTOM_MODEL"
  echo "Using custom model: $CUSTOM_MODEL"
fi

# Set debug flags
DENO_FLAGS="--allow-net --allow-env"
if [ "$DEBUG" = true ]; then
  DENO_FLAGS="$DENO_FLAGS --log-level=debug"
  echo "Debug mode enabled"
fi

echo "Starting ReAct Agent on port $PORT..."
echo "Press Ctrl+C to stop the agent"

# Set PORT environment variable for the agent
export PORT

# Run the agent with Deno
deno run $DENO_FLAGS "$SCRIPT_DIR/examples/reasoning.ts"
