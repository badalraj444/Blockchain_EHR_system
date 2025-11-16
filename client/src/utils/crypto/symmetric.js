// client/src/utils/crypto/symmetric.js
import forge from "node-forge";

/**
 * Generate AES-256 key (returns base64 string of 32 bytes)
 */
export function generateAesKeyBase64() {
  const keyBytes = forge.random.getBytesSync(32); // raw bytes
  return forge.util.encode64(keyBytes);
}

/**
 * AES-CBC encrypt plaintext given raw AES key bytes (or base64)
 * Returns { ciphertextBase64, ivBase64 }
 *
 * Input key can be:
 * - base64 string (recommended)
 * - raw forge bytes
 */
export function aesEncrypt(plaintext, aesKeyBase64) {
  const aesKeyBytes = forge.util.decode64(aesKeyBase64);
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher("AES-CBC", aesKeyBytes);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(plaintext, "utf8"));
  cipher.finish();

  const ciphertext = cipher.output.getBytes();
  return {
    ciphertextBase64: forge.util.encode64(ciphertext),
    ivBase64: forge.util.encode64(iv),
  };
}

/**
 * AES-CBC decrypt payload { ciphertextBase64, ivBase64 } using base64 AES key
 * Returns plaintext string
 */
export function aesDecrypt({ ciphertextBase64, ivBase64 }, aesKeyBase64) {
  const aesKeyBytes = forge.util.decode64(aesKeyBase64);
  const ciphertext = forge.util.decode64(ciphertextBase64);
  const iv = forge.util.decode64(ivBase64);

  const decipher = forge.cipher.createDecipher("AES-CBC", aesKeyBytes);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(ciphertext));
  const ok = decipher.finish();
  if (!ok) throw new Error("AES decryption failed");
  return decipher.output.toString("utf8");
}

/**
 * Encrypt plaintext using RSA-OAEP to protect the AES key, and AES-CBC for data.
 * Returns { ciphertextBase64, ivBase64, encryptedAesKeyBase64 }
 *
 * NOTE: this is similar to your existing encryptWithPublicKey implementation.
 */
export function encryptWithPublicKey(plaintext, publicKeyPem) {
  // generate AES key
  const aesKey = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(16);

  // AES-CBC encrypt plaintext
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(plaintext, "utf8"));
  cipher.finish();
  const encryptedBytes = cipher.output.getBytes();

  // Encrypt AES key with RSA-OAEP
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedKeyBytes = publicKey.encrypt(aesKey, "RSA-OAEP");

  return {
    ciphertextBase64: forge.util.encode64(encryptedBytes),
    ivBase64: forge.util.encode64(iv),
    encryptedAesKeyBase64: forge.util.encode64(encryptedKeyBytes),
  };
}

/**
 * Decrypt with private key (payload has base64 fields).
 * Returns plaintext.
 */
export function decryptWithPrivateKey(payload, privateKeyPem) {
  if (!payload || !payload.ciphertextBase64 || !payload.ivBase64 || !payload.encryptedAesKeyBase64) {
    throw new Error("payload missing required fields");
  }
  const encryptedBytes = forge.util.decode64(payload.ciphertextBase64);
  const ivBytes = forge.util.decode64(payload.ivBase64);
  const encryptedKeyBytes = forge.util.decode64(payload.encryptedAesKeyBase64);

  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKey = privateKey.decrypt(encryptedKeyBytes, "RSA-OAEP");

  const decipher = forge.cipher.createDecipher("AES-CBC", aesKey);
  decipher.start({ iv: ivBytes });
  decipher.update(forge.util.createBuffer(encryptedBytes));
  const ok = decipher.finish();
  if (!ok) throw new Error("AES decryption failed (bad key/iv or corrupted ciphertext)");

  return decipher.output.toString("utf8");
}

export default {
  generateAesKeyBase64,
  aesEncrypt,
  aesDecrypt,
  encryptWithPublicKey,
  decryptWithPrivateKey,
};
