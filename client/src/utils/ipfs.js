// client/src/utils/ipfs.js
import { create } from "ipfs-http-client";
import { deterministicStringify } from "./convert.js";

/**
 * ipfs client
 * Make sure you have VITE_IPFS_API_URL set in your .env
 * e.g. VITE_IPFS_API_URL=https://ipfs.infura.io:5001/api/v0
 * $env:VITE_IPFS_API_URL="http://127.0.0.1:5001/api/v0"

 */
// const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });
const ipfs = create({ url: "http://127.0.0.1:5001/api/v0" });

/**
 * Deterministic payload builder for IPFS.
 * Input:
 *   - ciphertextBase64: string
 *   - ivBase64: string
 *   - meta: optional object
 * Returns string (JSON) - deterministic ordering.
 */
export function combinePayloadForIpfs({ ciphertextBase64, ivBase64, meta = {} }) {
  const payload = {
    ciphertext: ciphertextBase64,
    iv: ivBase64,
    meta,
  };
  return deterministicStringify(payload);
}

/**
 * Parse IPFS JSON string to our shape:
 * returns { ciphertextBase64, ivBase64, meta }
 */
export function parseIpfsData(jsonString) {
  if (!jsonString) throw new Error("empty ipfs data");
  const parsed = JSON.parse(jsonString);
  return {
    ciphertextBase64: parsed.ciphertext,
    ivBase64: parsed.iv,
    meta: parsed.meta ?? {},
  };
}

/**
 * Upload a string (expected JSON string) to IPFS and return CID string.
 * - stringifiedData: JSON string or raw string to store
 */
export async function uploadToIpfs(stringifiedData) {
  try {
    console.log("Uploading data to IPFS...");
    const result = await ipfs.add(stringifiedData);
    // ipfs.add returns an object with `path` or `cid` depending on client version
    // Commonly result.path is the CID string; result.cid.toString() also works.
    const cid = result.path ?? (result.cid ? result.cid.toString() : null);
    console.log("Data uploaded to IPFS, cid:", cid);
    if (!cid) throw new Error("No CID returned from IPFS add");
    return cid;
  } catch (error) {
    console.error("IPFS upload failed:", error);
    throw new Error("Failed to upload data to IPFS.");
  }
}

/**
 * Download content by CID from IPFS and return the full string content.
 * (Works for JSON string we stored earlier.)
 */
export async function downloadFromIpfs(ipfsHash) {
  try {
    console.log("Fetching encrypted data from IPFS, Hash:", ipfsHash);
    const stream = ipfs.cat(ipfsHash);
    let data = "";
    // ipfs.cat returns an async iterable of Uint8Array chunks
    for await (const chunk of stream) {
      data += new TextDecoder().decode(chunk);
    }
    console.log("Encrypted data fetched from IPFS.");
    return data; // stringified JSON or raw string
  } catch (error) {
    console.error("Error fetching data from IPFS:", error);
    throw new Error("Failed to retrieve data.");
  }
}

/**
 * Legacy/alternate names (alias) so existing code won't break
 */
export const uploadToIPFS = uploadToIpfs;
export const fetchDataFromIPFS = downloadFromIpfs;

export default {
  combinePayloadForIpfs,
  parseIpfsData,
  uploadToIpfs,
  downloadFromIpfs,
  uploadToIPFS,
  fetchDataFromIPFS,
};
