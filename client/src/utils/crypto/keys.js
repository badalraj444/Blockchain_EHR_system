// client/src/utils/crypto/keys.js
import forge from "node-forge";
import { ethers } from "ethers";

/**
 * Generate RSA keypair and return PEM strings.
 * Returns: { privateKeyPem, publicKeyPem }
 */
export function generateRsaKeyPair(bits = 2048) {
  return new Promise((resolve, reject) => {
    try {
      forge.pki.rsa.generateKeyPair({ bits, e: 0x10001, workers: -1 }, (err, keypair) => {
        if (err) return reject(err);
        try {
          const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
          const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
          resolve({ privateKeyPem, publicKeyPem });
        } catch (pemErr) {
          reject(pemErr);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/** Trigger download of private key PEM file (browser) */
export function exportPrivateKeyToFile(privateKeyPem, filename = "private_key.pem") {
  if (typeof window === "undefined") throw new Error("exportPrivateKeyToFile is browser-only");
  const blob = new Blob([privateKeyPem], { type: "application/x-pem-file" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read PEM text from a File object (returns Promise<string>) */
export function importPrivateKeyFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Convert a PEM/public-key string to a canonical form and return a bytes32 keccak256 hash.
 * Returns a hex string like "0x..." of length 66 (32 bytes).
 */
export function hashPublicKeyToBytes32(publicKeyPem) {
  if (!publicKeyPem || typeof publicKeyPem !== "string") {
    throw new Error("publicKeyPem must be a non-empty string");
  }

  // Normalize: remove extra whitespace, normalize line endings
  const normalized = publicKeyPem.trim().replace(/\r\n/g, "\n");

  const bytes = ethers.toUtf8Bytes(normalized);
  const hash = ethers.keccak256(bytes); // returns 0x... (32 bytes)

  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    throw new Error("Unexpected hash length");
  }

  return hash; // e.g. "0x3a1f...ab"
}

export default {
  generateRsaKeyPair,
  exportPrivateKeyToFile,
  importPrivateKeyFromFile,
  hashPublicKeyToBytes32,
};
