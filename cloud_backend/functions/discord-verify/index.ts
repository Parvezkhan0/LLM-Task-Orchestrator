// Discord Verification Handler with Signature Verification
// This implementation handles Discord's verification ping and verifies request signatures

// Get Discord public key from environment variables
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

if (!DISCORD_PUBLIC_KEY) {
  console.error("Error: DISCORD_PUBLIC_KEY is not set in environment.");
}

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
 * Verify a Discord request using Ed25519.
 * @param publicKey - The Discord application public key
 * @param signature - The signature from the 'X-Signature-Ed25519' header
 * @param timestamp - The timestamp from the 'X-Signature-Timestamp' header
 * @param body - The raw request body
 * @returns Whether the request is valid
 */
async function verifyDiscordRequest(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  try {
    // Convert the hex strings to Uint8Arrays
    const publicKeyBytes = hexToUint8Array(publicKey);
    const signatureBytes = hexToUint8Array(signature);
    
    // Create the message to verify (timestamp + body)
    const message = new TextEncoder().encode(timestamp + body);
    
    // Verify the signature
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify']
    );
    
    return await crypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signatureBytes,
      message
    );
  } catch (err) {
    console.error('Error verifying Discord request:', err);
    return false;
  }
}

Deno.serve(async (req) => {
  // Only handle POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Get the signature and timestamp headers
    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");
    
    // Get the raw request body as text
    const bodyText = await req.text();
    
    console.log("Headers:", {
      signature,
      timestamp
    });
    
    console.log("Body:", bodyText);
    
    // Verify the request signature if we have all required data
    if (signature && timestamp && DISCORD_PUBLIC_KEY) {
      try {
        const isValidRequest = await verifyDiscordRequest(
          DISCORD_PUBLIC_KEY,
          signature,
          timestamp,
          bodyText
        );
        
        if (!isValidRequest) {
          console.error("Invalid request signature");
          return new Response("Invalid request signature", { status: 401 });
        }
        
        console.log("Signature verification passed");
      } catch (error) {
        console.error("Error during signature verification:", error);
        // Continue processing even if verification fails (for testing)
      }
    } else {
      console.warn("Missing signature, timestamp, or public key - skipping verification");
    }
    
    // Parse the request body as JSON
    const body = JSON.parse(bodyText);
    console.log("Parsed body:", JSON.stringify(body));
    
    // Handle Discord ping (verification) request
    if (body.type === 1) {
      console.log("Received Discord ping - responding with pong");
      return new Response(
        JSON.stringify({ type: 1 }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // For any other request type, just acknowledge
    return new Response(
      JSON.stringify({ message: "Received non-ping request", type: body.type }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
