#!/bin/bash

# Run Agent With Output Script
# This script starts the ReAct agent server in the background and then makes a request to it

# Set the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PARENT_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# Default values
PORT=8000
QUERY="Give me a plan to build a discord bot?"
DOMAIN=""
REASONING_TYPE="both" # Can be "deductive", "inductive", or "both"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -q|--query)
      QUERY="$2"
      shift 2
      ;;
    -d|--domain)
      DOMAIN="$2"
      shift 2
      ;;
    -r|--reasoning)
      REASONING_TYPE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./run_agent_with_output.sh [options]"
      echo ""
      echo "Options:"
      echo "  -p, --port PORT       Specify the port to run on (default: 8000)"
      echo "  -q, --query QUERY     Specify the query to send to the agent (default: 'What is 2+2?')"
      echo "  -d, --domain DOMAIN   Specify a domain for domain-specific reasoning (financial, medical, legal)"
      echo "  -r, --reasoning TYPE  Specify reasoning type: 'deductive', 'inductive', or 'both' (default: 'both')"
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

# Start the server in the background
echo "Starting the ReAct agent server on port $PORT..."
PORT=$PORT "$PARENT_DIR/start_reasoning_agent.sh" > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 2

# Validate reasoning type
if [[ "$REASONING_TYPE" != "deductive" && "$REASONING_TYPE" != "inductive" && "$REASONING_TYPE" != "both" ]]; then
  echo "Invalid reasoning type: $REASONING_TYPE"
  echo "Supported types: deductive, inductive, both"
  kill $SERVER_PID
  exit 1
fi

# Prepare the request body
if [ -n "$DOMAIN" ]; then
  # If domain is specified, create a domain-specific query
  case $DOMAIN in
    financial)
      if [ "$REASONING_TYPE" = "deductive" ]; then
        # For deductive reasoning, we provide complete information
        REQUEST_BODY="{\"domain\":\"financial\", \"reasoningType\":\"deductive\", \"data\":{\"expectedReturn\":0.07, \"riskLevel\":\"low\"}, \"query\":\"$QUERY\"}"
      elif [ "$REASONING_TYPE" = "inductive" ]; then
        # For inductive reasoning, we provide past returns for the agent to infer from
        REQUEST_BODY="{\"domain\":\"financial\", \"reasoningType\":\"inductive\", \"data\":{\"pastReturns\":[0.05, 0.06, 0.08, 0.09, 0.07]}, \"query\":\"$QUERY\"}"
      else
        # Default to both
        REQUEST_BODY="{\"domain\":\"financial\", \"reasoningType\":\"both\", \"data\":{\"expectedReturn\":0.07, \"riskLevel\":\"low\", \"pastReturns\":[0.05, 0.06, 0.08, 0.09, 0.07]}, \"query\":\"$QUERY\"}"
      fi
      ;;
    medical)
      if [ "$REASONING_TYPE" = "deductive" ]; then
        # For deductive reasoning, we provide specific symptoms that match a rule
        REQUEST_BODY="{\"domain\":\"medical\", \"reasoningType\":\"deductive\", \"symptoms\":[\"fever\", \"rash\"], \"query\":\"$QUERY\"}"
      elif [ "$REASONING_TYPE" = "inductive" ]; then
        # For inductive reasoning, we provide symptoms that require matching to cases
        REQUEST_BODY="{\"domain\":\"medical\", \"reasoningType\":\"inductive\", \"symptoms\":[\"cough\", \"headache\"], \"query\":\"$QUERY\"}"
      else
        # Default to both
        REQUEST_BODY="{\"domain\":\"medical\", \"reasoningType\":\"both\", \"symptoms\":[\"fever\", \"cough\"], \"query\":\"$QUERY\"}"
      fi
      ;;
    legal)
      if [ "$REASONING_TYPE" = "deductive" ]; then
        # For deductive reasoning, we provide a clear case that matches a rule
        REQUEST_BODY="{\"domain\":\"legal\", \"reasoningType\":\"deductive\", \"caseType\":\"contract\", \"signed\":false, \"query\":\"$QUERY\"}"
      elif [ "$REASONING_TYPE" = "inductive" ]; then
        # For inductive reasoning, we provide a case that requires matching to past cases
        REQUEST_BODY="{\"domain\":\"legal\", \"reasoningType\":\"inductive\", \"caseType\":\"criminal\", \"evidence\":\"weak\", \"query\":\"$QUERY\"}"
      else
        # Default to both
        REQUEST_BODY="{\"domain\":\"legal\", \"reasoningType\":\"both\", \"caseType\":\"contract\", \"signed\":true, \"query\":\"$QUERY\"}"
      fi
      ;;
    *)
      echo "Unknown domain: $DOMAIN"
      echo "Supported domains: financial, medical, legal"
      kill $SERVER_PID
      exit 1
      ;;
  esac
else
  # Simple query without domain-specific reasoning
  REQUEST_BODY="{\"query\":\"$QUERY\", \"reasoningType\":\"$REASONING_TYPE\"}"
fi

# Make a request to the server
echo "Sending query to agent: '$QUERY'"
echo "Request body: $REQUEST_BODY"
echo ""
echo "Agent response:"
echo "------------------------------------"
curl -s -X POST -H "Content-Type: application/json" -d "$REQUEST_BODY" http://localhost:$PORT
echo ""
echo "------------------------------------"

# Kill the server
echo ""
echo "Stopping the server..."
if ps -p $SERVER_PID > /dev/null; then
  kill $SERVER_PID
  echo "Server process $SERVER_PID terminated."
else
  echo "Server process already terminated."
fi

echo "Done!"
