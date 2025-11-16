/**
 * ALL AVAILABLE FUNCTIONS (REFERENCE ONLY)
 * ----------------------------------------
 * This file lists all functions from all utility modules.
 * No logic here — pure overview for your development.
 */

/* ============================
   1.  CRYPTO / RSA / KEYPAIR
   ============================ */
export const RSA_KEY_FUNCTIONS = [
  "generateRsaKeyPair",
  "exportPrivateKeyToFile",
  "importPrivateKeyFromFile",
  "hashPublicKeyToBytes32",
];

/* ============================
   2.  CRYPTO / SYMMETRIC AES
   ============================ */
export const AES_FUNCTIONS = [
  "generateAesKeyBase64",
  "aesEncrypt",
  "aesDecrypt",
  "encryptWithPublicKey", // RSA-OAEP for AES key + AES-CBC for data
  "decryptWithPrivateKey",
];

/* ============================
   3.  DATA CONVERSION HELPERS
   ============================ */
export const CONVERSION_FUNCTIONS = [
  "hexToBase64",
  "base64ToUint8Array",
  "base64ToHex",
  "deterministicStringify",
  "normalizeHex",
];

/* ============================
   4.  IPFS HELPERS
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
   5.  BLOCKCHAIN HELPERS
   ============================ */
export const BLOCKCHAIN_FUNCTIONS = [
  "getContract",
  "registerUser",
  "addEHRdata",
  "queryMetadata",
];

/* ============================
   6.  FILE HELPERS
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
