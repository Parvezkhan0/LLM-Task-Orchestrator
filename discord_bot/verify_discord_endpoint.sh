#!/bin/bash
#
# Discord Endpoint Verification Script
# -----------------------------------
# This script tests a Discord interaction endpoint by sending a simulated
# Discord ping request and checking the response.
#
# Usage:
#   ./verify_discord_endpoint.sh <endpoint_url>
#
# Example:
#   ./verify_discord_endpoint.sh https://eojucgnpskovtadfwfir.supabase.co/functions/v1/agentics-bot
#

# Check if endpoint URL is provided
if [ -z "$1" ]; then
  echo "Error: No endpoint URL provided."
  echo "Usage: ./verify_discord_endpoint.sh <endpoint_url>"
  exit 1
fi

ENDPOINT_URL="$1"
echo "Testing Discord interaction endpoint: $ENDPOINT_URL"

# First, let's check if the endpoint responds to a GET request
echo "Checking basic endpoint availability with GET request..."
GET_RESPONSE=$(curl -s "$ENDPOINT_URL")
echo "GET Response: $GET_RESPONSE"
echo ""

# Now let's try a POST request with a Discord ping payload
echo "Sending Discord ping request (without signatures)..."
PING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"type": 1, "id": "test_interaction_id", "application_id": "test_app_id"}' \
  "$ENDPOINT_URL")
echo "POST Response: $PING_RESPONSE"
echo ""

# Now let's try with a timestamp and signature headers
TIMESTAMP=$(date +%s)
echo "Sending Discord ping request with timestamp and signature headers..."
PING_WITH_HEADERS_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-Signature-Ed25519: 1c0acbbf1665de4ea916ca43953ff0a4a03fb17d4ac03d1379c6c489c0fc8565" \
  -H "X-Signature-Timestamp: $TIMESTAMP" \
  -d '{"type": 1, "id": "test_interaction_id", "application_id": "test_app_id"}' \
  "$ENDPOINT_URL")
echo "POST Response with headers: $PING_WITH_HEADERS_RESPONSE"
echo ""

echo "Note: For proper signature verification, Discord uses Ed25519 signatures."
echo "This script doesn't generate valid signatures, so the endpoint may reject the request."
echo "To fully verify the endpoint, use the Discord Developer Portal."
echo ""
echo "If you see a response like 'Missing signature or public key', it means the endpoint"
echo "is correctly checking for Discord's signature headers, which is a good sign."