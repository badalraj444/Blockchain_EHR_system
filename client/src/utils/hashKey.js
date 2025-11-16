// client/src/utils/hashKey.js
import { ethers } from "ethers";

/**
 * Convert a PEM/public-key string to a canonical form and return a bytes32 keccak256 hash.
 * Returns a hex string like "0x..." of length 66 (32 bytes).
 *
 * Usage:
 *   const bytes32key = hashPublicKeyToBytes32(pemString);
 */
export function hashPublicKeyToBytes32(publicKeyPem) {
  if (!publicKeyPem || typeof publicKeyPem !== "string") {
    throw new Error("publicKeyPem must be a non-empty string");
  }

  // Normalize: remove extra whitespace, normalize line endings
  let normalized = publicKeyPem.trim().replace(/\r\n/g, "\n");

  // Optionally remove header/footer and spaces, if you want to hash only base64 content:
  // const base64 = normalized
  //   .replace("-----BEGIN PUBLIC KEY-----", "")
  //   .replace("-----END PUBLIC KEY-----", "")
  //   .replace(/\n/g, "")
  //   .trim();
  // normalized = base64;

  // We hash the normalized string (PEM with header/footer). This is fine and deterministic.
  const bytes = ethers.toUtf8Bytes(normalized);
  const hash = ethers.keccak256(bytes); // returns 0x... (32 bytes)

  // Ensure it's bytes32 length
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    throw new Error("Unexpected hash length");
  }

  return hash; // e.g. "0x3a1f...ab"
}

export default hashPublicKeyToBytes32;
