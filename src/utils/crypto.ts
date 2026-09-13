/**
 * Secure cryptographic password hashing utility using Web Crypto API (SHA-256 with salt).
 * Works across modern browsers and Node.js runtimes without external dependencies.
 */

const SALT_PREFIX = "minimall_sec_v1_";

/**
 * Generates a SHA-256 cryptographic hash of the password with application-level salt.
 */
export async function hashPassword(password: string, salt: string = "marketplace"): Promise<string> {
  if (!password) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT_PREFIX}${salt}_${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Constant-time comparison simulation to prevent timing attacks.
 */
export function verifyPasswordHash(providedHash: string, storedHash: string): boolean {
  if (providedHash.length !== storedHash.length) return false;
  let result = 0;
  for (let i = 0; i < providedHash.length; i++) {
    result |= providedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}
