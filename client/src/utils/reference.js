/**
 * ALL AVAILABLE FUNCTIONS (REFERENCE ONLY)
 * ----------------------------------------
 * This file lists all functions from all utility modules.
 * No logic here — pure overview for your development.
 */

/* ============================
   1.  src/utils/crypto/keys.js
   ============================ */
export const RSA_KEY_FUNCTIONS = [
  "generateRsaKeyPair",
  "exportPrivateKeyToFile",
  "importPrivateKeyFromFile",
  "hashPublicKeyToBytes32",
];

/* ============================
   2.  src/utils/crypto/symmetric.js
   ============================ */
export const AES_FUNCTIONS = [
  "generateAesKeyBase64",
  "aesEncrypt",
  "aesDecrypt",
  "encryptWithPublicKey", // RSA-OAEP for AES key + AES-CBC for data
  "decryptWithPrivateKey",
];

/* ============================
   3.  src/utils/convert.js
   ============================ */
export const CONVERSION_FUNCTIONS = [
  "hexToBase64",
  "base64ToUint8Array",
  "base64ToHex",
  "deterministicStringify",
  "normalizeHex",
];

/* ============================
   4.  src/utils/ipfs.js
   ============================ */
export const IPFS_FUNCTIONS = [
  "combinePayloadForIpfs",
  "parseIpfsData",
  "uploadToIpfs",
  "downloadFromIpfs",

  // aliases for compatibility with old names:
  "uploadToIPFS",
  "fetchDataFromIPFS",
];

/* ============================
   5.  src/utils/blockchain.js
   ============================ */
export const BLOCKCHAIN_FUNCTIONS = [
  "getContract",
  "registerUser",
  "addEHRdata",
  "queryMetadata",
];

/* ============================
   6.  src/utils/file.js
   ============================ */
export const FILE_HELPERS = ["readFileAsText", "downloadTextFile"];

/* ============================
   7.  ALL GROUPED TOGETHER
   ============================ */
export const ALL_FUNCTIONS = {
  RSA_KEY_FUNCTIONS,
  AES_FUNCTIONS,
  CONVERSION_FUNCTIONS,
  IPFS_FUNCTIONS,
  BLOCKCHAIN_FUNCTIONS,
  FILE_HELPERS,
};
