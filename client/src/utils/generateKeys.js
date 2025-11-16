// client/src/utils/generateKeys.js
import forge from "node-forge";

/**
 * Generate RSA keypair and return PEM strings.
 * Uses node-forge which is already in your deps.
 * Returns: { privateKeyPem, publicKeyPem }
 */
export function generateRsaKeyPair(bits = 2048) {
  return new Promise((resolve, reject) => {
    try {
      // Use workers: -1 to avoid webworker spawn issues in some environments
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
