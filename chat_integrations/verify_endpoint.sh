#!/bin/bash
#
# Discord Endpoint Verification Script
# -----------------------------------
# This script tests a Discord interaction endpoint by sending a simulated
# Discord ping request and checking the response.
#
# Usage:
#   ./verify_endpoint.sh <endpoint_url>
#
# Example:
#   ./verify_endpoint.sh https://eojucgnpskovtadfwfir.supabase.co/functions/v1/agentics-bot
#

# Check if endpoint URL is provided
if [ -z "$1" ]; then
  echo "Error: No endpoint URL provided."
  echo "Usage: ./verify_endpoint.sh <endpoint_url>"
  exit 1
fi

ENDPOINT_URL="$1"
echo "Testing Discord interaction endpoint: $ENDPOINT_URL"

# Create a temporary file for the response
RESPONSE_FILE=$(mktemp)

# Send a simulated Discord ping request
echo "Sending Discord ping request..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "User-Agent: DiscordBot (https://discord.com, 10)" \
  -d '{"type": 1, "id": "test_interaction_id", "application_id": "test_app_id"}' \
  "$ENDPOINT_URL" > "$RESPONSE_FILE"

# Check if the request was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to connect to the endpoint."
  rm "$RESPONSE_FILE"
  exit 1
fi

# Check the response
echo "Response received:"
cat "$RESPONSE_FILE"
echo ""

# Check if the response contains the expected type: 1 (PONG)
if grep -q '"type":1' "$RESPONSE_FILE" || grep -q '"type": 1' "$RESPONSE_FILE"; then
  echo "✅ Success! The endpoint responded with the correct PONG response."
else
  echo "❌ Error: The endpoint did not respond with the expected PONG response."
  echo "This may indicate that the endpoint is not properly handling Discord interactions."
fi

# Clean up
rm "$RESPONSE_FILE"

echo ""
echo "Note: This test only verifies basic endpoint functionality."
echo "Discord also performs signature verification which this script doesn't test."
echo "To fully verify the endpoint, use it in the Discord Developer Portal."
echo ""
echo "For a more comprehensive test that includes signature verification, you can use:"
echo "https://github.com/discord/discord-interactions-js/blob/main/examples/verify.js"