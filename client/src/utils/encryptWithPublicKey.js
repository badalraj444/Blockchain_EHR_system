// client/src/utils/encryptWithPublicKey.js
import forge from "node-forge";

/**
 * Encrypt plaintext using AES-256-CBC for payload and RSA-OAEP to encrypt AES key.
 * Returns base64 strings: { encryptedData, iv, encryptedAesKey }
 *
 * - plaintext: string
 * - publicKeyPem: string (PEM format)
 */
export function encryptWithPublicKey(plaintext, publicKeyPem) {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("plaintext must be a non-empty string");
  }
  if (!publicKeyPem || typeof publicKeyPem !== "string") {
    throw new Error("publicKeyPem must be a PEM string");
  }

  // 1) generate AES key (32 bytes = 256 bits)
  const aesKey = forge.random.getBytesSync(32);

  // 2) AES-CBC encrypt plaintext
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(plaintext, "utf8"));
  cipher.finish();
  const encryptedBytes = cipher.output.getBytes();

  // 3) Encrypt AES key with RSA-OAEP using public key PEM
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedKeyBytes = publicKey.encrypt(aesKey, "RSA-OAEP");

  // 4) Base64 encode everything for easy transport/storage
  return {
    encryptedData: forge.util.encode64(encryptedBytes),
    iv: forge.util.encode64(iv),
    encryptedAesKey: forge.util.encode64(encryptedKeyBytes),
  };
}

export default encryptWithPublicKey;
