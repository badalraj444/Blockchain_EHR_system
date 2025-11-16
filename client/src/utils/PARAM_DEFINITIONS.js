// client/src/utils/PARAM_DEFINITIONS.js
/**
 * PARAM_DEFINITIONS
 * Single place to document names, expected types and encodings for all main parameters
 * used across the client / ipfs / blockchain flow.
 *
 * Use validateParam(name, value) in tests to quickly sanity-check values.
 */

/* ---------------------------
   Helper validators (basic)
   --------------------------- */
function isHex0x(str) {
  return typeof str === "string" && /^0x[0-9a-fA-F]+$/.test(str);
}
function isBytes32Hex(str) {
  return isHex0x(str) && str.length === 66; // 0x + 64 hex chars
}
function isBase64(str) {
  return typeof str === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(str);
}
function isPem(str) {
  return typeof str === "string" && /-----BEGIN [A-Z ]+-----/.test(str);
}
function isCid(str) {
  return typeof str === "string" && str.length > 5; // loose check; CID formats vary
}

/* ---------------------------
   Parameter definitions
   --------------------------- */
export const PARAM_DEFINITIONS = {
  // Keys
  publicKeyPem: {
    name: "publicKeyPem",
    description: "User's RSA public key in PEM format",
    jsType: "string (PEM)",
    solidityType: "n/a (hashed to bytes32 before on-chain)",
    encoding: "PEM text with headers",
    example:
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----",
    validator: isPem,
  },

  privateKeyPem: {
    name: "privateKeyPem",
    description: "User's RSA private key in PEM format — store locally only",
    jsType: "string (PEM)",
    solidityType: "n/a",
    encoding: "PEM text",
    example:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...\n-----END PRIVATE KEY-----",
    validator: isPem,
  },

  // Derived ID used on-chain
  userHashBytes32: {
    name: "userHashBytes32",
    description:
      "Keccak256 hash of canonical publicKey PEM — used as bytes32 user ID on-chain",
    jsType: "string",
    solidityType: "bytes32",
    encoding: "0x-prefixed hex (32 bytes)",
    example: "0x3a1f...ab (66 chars total)",
    validator: isBytes32Hex,
  },

  // Symmetric key & encrypted AES key
  aesKeyBase64: {
    name: "aesKeyBase64",
    description:
      "AES-256 symmetric key used to encrypt data (transient on client)",
    jsType: "string",
    solidityType: "n/a (never stored in plain on-chain)",
    encoding: "base64 of 32 raw bytes",
    example: "q3J5cHRvS2V5... (base64)",
    validator: isBase64,
  },

  encryptedAesKeyBase64: {
    name: "encryptedAesKeyBase64",
    description:
      "RSA-OAEP(encrypted AES key) encoded as base64 (client-side form)",
    jsType: "string",
    solidityType: "bytes (store as bytes in contract)",
    encoding:
      "base64 string (when converting for chain -> convert to bytes/hex)",
    example: "KJH3... (base64)",
    validator: isBase64,
  },

  encryptedAesKeyBytesHex: {
    name: "encryptedAesKeyBytesHex",
    description:
      "Same encrypted AES key but converted to hex (0x...) when sending to contract",
    jsType: "string",
    solidityType: "bytes",
    encoding: "0x-prefixed hex (variable length depending on RSA key size)",
    example: "0xdeadbeef...",
    validator: isHex0x,
  },

  // Encrypted payload fields (stored on IPFS)
  ciphertextBase64: {
    name: "ciphertextBase64",
    description:
      "AES-encrypted payload (ciphertext) encoded as base64 for IPFS storage",
    jsType: "string",
    solidityType: "n/a (stored in IPFS JSON)",
    encoding: "base64",
    example: "Zm9vYmFy... (base64)",
    validator: isBase64,
  },

  ivBase64: {
    name: "ivBase64",
    description: "Initialization vector used for AES (base64)",
    jsType: "string",
    solidityType: "n/a",
    encoding: "base64 (16 bytes for AES-CBC)",
    example: "AAAAAAAAAAAA... (base64)",
    validator: isBase64,
  },

  // IPFS
  cid: {
    name: "cid",
    description: "Content identifier returned by IPFS after upload",
    jsType: "string",
    solidityType: "string",
    encoding: "IPFS CID (v0/v1, variable format)",
    example: "bafybeihdwdcefgh4dqkjv67uzcmw7o...",
    validator: isCid,
  },

  // Metadata fields stored on-chain
  dataType: {
    name: "dataType",
    description: "Human-readable type/category of the data (e.g., lab-report)",
    jsType: "string",
    solidityType: "string",
    encoding: "plain text",
    example: "lab-report",
    validator: (v) => typeof v === "string" && v.length > 0,
  },

  HI_or_CID: {
    name: "HI_or_CID",
    description:
      "Human identifier or CID stored in the contract as a string (we use CID for IPFS)",
    jsType: "string",
    solidityType: "string",
    encoding: "CID string",
    example: "bafybeihd...",
    validator: isCid,
  },

  // Contract return / transport types
  txHash: {
    name: "txHash",
    description: "Transaction hash returned by ethers.js when sending tx",
    jsType: "string",
    solidityType: "n/a",
    encoding: "0x-prefixed hex (32 bytes)",
    example: "0xabc123...",
    validator: isHex0x,
  },

  // Generic hash (payload or ciphertext)
  payloadHashHex: {
    name: "payloadHashHex",
    description: "Hash of the encrypted payload used for integrity checks",
    jsType: "string",
    solidityType: "string or bytes32 depending on choice",
    encoding:
      "0x-prefixed hex (keccak256 or sha256) — pick one and be consistent",
    example: "0x5f6d... (66 chars for bytes32)",
    validator: isHex0x,
  },

  // Misc
  jsonStringifiedIpfsPayload: {
    name: "jsonStringifiedIpfsPayload",
    description:
      "Deterministic JSON string uploaded to IPFS (ciphertext+iv+meta)",
    jsType: "string",
    solidityType: "n/a",
    encoding: "JSON text (deterministic ordering)",
    example: '{"ciphertext":"...","iv":"...","meta":{}}',
    validator: (v) => typeof v === "string" && v.trim().startsWith("{"),
  },

  // Contract ID / ABI references (runtime)
  contractAddress: {
    name: "contractAddress",
    description: "Ethereum contract address (registry / metadata)",
    jsType: "string",
    solidityType: "address",
    encoding: "0x-prefixed hex 20 bytes",
    example: "0xAbc123....",
    validator: (v) => isHex0x(v) && v.length === 42,
  },

  roleString: {
    name: "roleString",
    description: "Role string passed to registerUser (client side)",
    jsType: "string",
    solidityType: "string (interpreted on-chain to enum Role)",
    encoding: "plain text: 'Patient'|'CareProvider'|'Researcher'|'Regulator'",
    example: "Patient",
    validator: (v) =>
      ["Patient", "CareProvider", "Researcher", "Regulator"].includes(v),
  },
};

/* ---------------------------
   Simple runtime validator
   --------------------------- */
export function validateParam(name, value) {
  const def = PARAM_DEFINITIONS[name];
  if (!def) {
    return { ok: false, error: `Unknown param name "${name}"` };
  }
  try {
    const ok = def.validator
      ? def.validator(value)
      : typeof value !== "undefined";
    if (ok) return { ok: true };
    return {
      ok: false,
      error: `Validation failed for "${name}" (expected ${def.jsType}, example: ${def.example})`,
    };
  } catch (err) {
    return {
      ok: false,
      error: `Validator threw for "${name}": ${err.message}`,
    };
  }
}

/* ---------------------------
   Export convenience list of names
   --------------------------- */
export const ALL_PARAM_NAMES = Object.keys(PARAM_DEFINITIONS);

export default {
  PARAM_DEFINITIONS,
  validateParam,
  ALL_PARAM_NAMES,
};
