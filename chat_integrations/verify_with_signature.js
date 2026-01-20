#!/usr/bin/env node
/**
 * Discord Endpoint Verification Script with Signature Verification
 * ---------------------------------------------------------------
 * This script tests a Discord interaction endpoint by sending a simulated
 * Discord ping request with proper signature verification.
 * 
 * Usage:
 *   node verify_with_signature.js <endpoint_url> <public_key>
 * 
 * Example:
 *   node verify_with_signature.js https://eojucgnpskovtadfwfir.supabase.co/functions/v1/agentics-bot 1c0acbbf1665de4ea916ca43953ff0a4a03fb17d4ac03d1379c6c489c0fc8565
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Check command line arguments
if (process.argv.length < 4) {
  console.error('Error: Missing required arguments.');
  console.error('Usage: node verify_with_signature.js <endpoint_url> <public_key>');
  process.exit(1);
}

const endpointUrl = process.argv[2];
const publicKey = process.argv[3];

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
const message = Buffer.from(timestamp + payloadString);

// Create a key pair for signing
// Note: In a real Discord interaction, Discord would sign with their private key
// and your endpoint would verify with your public key. Here we're simulating both sides.
const { privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Sign the message
const signature = crypto.sign(null, message, privateKey);
const signatureHex = signature.toString('hex');

// Parse the URL
const parsedUrl = new URL(endpointUrl);
const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
  path: parsedUrl.pathname + parsedUrl.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payloadString.length,
    'User-Agent': 'DiscordBot (https://discord.com, 10)',
    'X-Signature-Ed25519': signatureHex,
    'X-Signature-Timestamp': timestamp
  }
};

// Choose http or https module based on URL
const requestModule = parsedUrl.protocol === 'https:' ? https : http;

// Send the request
console.log('Sending request with signature verification...');
const req = requestModule.request(options, (res) => {
  console.log(`Response status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    console.log(data);
    console.log('');
    
    try {
      const response = JSON.parse(data);
      if (response.type === 1) {
        console.log('✅ Success! The endpoint responded with the correct PONG response.');
      } else {
        console.log('❌ Error: The endpoint did not respond with the expected PONG response.');
      }
    } catch (error) {
      console.log('❌ Error: Could not parse response as JSON.');
      console.log(`Error details: ${error.message}`);
    }
    
    console.log('');
    console.log('Note: This test simulates Discord signature verification, but uses a different key pair.');
    console.log('For a complete test, use the Discord Developer Portal to verify your endpoint.');
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

// Send the payload
req.write(payloadString);
req.end();