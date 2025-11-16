// client/src/utils/decryptWithPrivateKey.js
import forge from "node-forge";

/**
 * Decrypt the object returned by encryptWithPublicKey.
 * Input:
 *   - payload: { encryptedData (base64), iv (base64), encryptedAesKey (base64) }
 *   - privateKeyPem: string (PEM)
 * Returns: plaintext string
 */
export function decryptWithPrivateKey(payload, privateKeyPem) {
  if (!payload || !payload.encryptedData || !payload.iv || !payload.encryptedAesKey) {
    throw new Error("payload must contain encryptedData, iv and encryptedAesKey");
  }
  if (!privateKeyPem || typeof privateKeyPem !== "string") {
    throw new Error("privateKeyPem must be a PEM string");
  }

  // decode base64
  const encryptedBytes = forge.util.decode64(payload.encryptedData);
  const ivBytes = forge.util.decode64(payload.iv);
  const encryptedKeyBytes = forge.util.decode64(payload.encryptedAesKey);

  // parse private key and decrypt AES key using RSA-OAEP
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKey = privateKey.decrypt(encryptedKeyBytes, "RSA-OAEP");

  // AES-CBC decrypt
  const decipher = forge.cipher.createDecipher("AES-CBC", aesKey);
  decipher.start({ iv: ivBytes });
  decipher.update(forge.util.createBuffer(encryptedBytes));
  const ok = decipher.finish();
  if (!ok) throw new Error("AES decryption failed (bad key/iv or corrupted ciphertext)");

  return decipher.output.toString("utf8");
}

export default decryptWithPrivateKey;
