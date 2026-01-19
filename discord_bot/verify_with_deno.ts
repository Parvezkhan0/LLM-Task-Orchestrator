#!/usr/bin/env -S deno run --allow-net
/**
 * Discord Endpoint Verification Script with Signature Verification (Deno Version)
 * ------------------------------------------------------------------------------
 * This script tests a Discord interaction endpoint by sending a simulated
 * Discord ping request with proper signature verification.
 * 
 * Usage:
 *   deno run --allow-net verify_with_deno.ts <endpoint_url> <public_key>
 * 
 * Example:
 *   deno run --allow-net verify_with_deno.ts https://eojucgnpskovtadfwfir.supabase.co/functions/v1/agentics-bot 1c0acbbf1665de4ea916ca43953ff0a4a03fb17d4ac03d1379c6c489c0fc8565
 */

// Check command line arguments
if (Deno.args.length < 2) {
  console.error('Error: Missing required arguments.');
  console.error('Usage: deno run --allow-net verify_with_deno.ts <endpoint_url> <public_key>');
  Deno.exit(1);
}

const endpointUrl = Deno.args[0];
const publicKey = Deno.args[1];

console.log(`Testing Discord interaction endpoint: ${endpointUrl}`);
console.log(`Using public key: ${publicKey}`);

// Create a test interaction payload (Discord ping)
const interactionPayload = {
  type: 1,  // PING type
  id: 'test_interaction_id',
  application_id: 'test_application_id'
};

// Convert payload to string
const payloadString = JSON.stringify(interactionPayload);

// Create a timestamp (required for Discord signature)
const timestamp = Math.floor(Date.now() / 1000).toString();

// Create the message to sign (timestamp + payload)
const message = new TextEncoder().encode(timestamp + payloadString);

/**
 * Convert a hex string to a Uint8Array.
 * @param hex - The hex string to convert
 * @returns The resulting Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\dA-F]{2}/gi) || [];
  const integers = pairs.map(s => parseInt(s, 16));
  return new Uint8Array(integers);
}

/**
 * Convert a Uint8Array to a hex string.
 * @param bytes - The Uint8Array to convert
 * @returns The resulting hex string
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate a key pair for signing
// Note: In a real Discord interaction, Discord would sign with their private key
// and your endpoint would verify with your public key. Here we're simulating both sides.
const keyPair = await crypto.subtle.generateKey(
  {
    name: 'Ed25519',
    namedCurve: 'Ed25519',
  },
  true,
  ['sign', 'verify']
);

// Sign the message
const signature = await crypto.subtle.sign(
  'Ed25519',
  keyPair.privateKey,
  message
);

// Convert signature to hex
const signatureHex = uint8ArrayToHex(new Uint8Array(signature));

// Send the request
console.log('Sending request with signature verification...');
try {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://discord.com, 10)',
      'X-Signature-Ed25519': signatureHex,
      'X-Signature-Timestamp': timestamp
    },
    body: payloadString
  });

  console.log(`Response status: ${response.status}`);
  
  const data = await response.text();
  console.log('Response received:');
  console.log(data);
  console.log('');
  
  try {
    const responseJson = JSON.parse(data);
    if (responseJson.type === 1) {
      console.log('✅ Success! The endpoint responded with the correct PONG response.');
    } else {
      console.log('❌ Error: The endpoint did not respond with the expected PONG response.');
    }
  } catch (error) {
    console.log('❌ Error: Could not parse response as JSON.');
    console.log(`Error details: ${error.message}`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
}

console.log('');
console.log('Note: This test simulates Discord signature verification, but uses a different key pair.');
console.log('For a complete test, use the Discord Developer Portal to verify your endpoint.');