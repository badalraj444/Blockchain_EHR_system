// client/src/utils/convert.js
import { ethers } from "ethers";

/** Hex (0x...) -> base64 */
export function hexToBase64(hex) {
  if (!hex) return "";
  const bytes = ethers.getBytes(hex); // returns Uint8Array (ethers v6)
  // Node Buffer safe conversion:
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  // browser fallback
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** base64 -> Uint8Array */
export function base64ToUint8Array(b64) {
  if (!b64) return new Uint8Array();
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(b64, "base64");
    return new Uint8Array(buf);
  }
  const binary = atob(b64);
  const len = binary.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** base64 -> hex (0x...) (useful for sending bytes to ethers) */
export function base64ToHex(base64) {
  const u8 = base64ToUint8Array(base64);
  return ethers.hexlify(u8);
}

/** deterministic JSON stringify: keys in ascending order */
export function deterministicStringify(obj) {
  const allKeys = [];
  JSON.stringify(obj, (k, v) => {
    allKeys.push(k);
    return v;
  });
  // But easier: stringify recursively with sorted keys:
  function sortedStringify(o) {
    if (o === null || typeof o !== "object" || Array.isArray(o)) return JSON.stringify(o);
    const keys = Object.keys(o).sort();
    const parts = keys.map(k => `"${k}":${sortedStringify(o[k])}`);
    return `{${parts.join(",")}}`;
  }
  return sortedStringify(obj);
}

/** Normalize hex strings to lowercase 0x... */
export function normalizeHex(hex) {
  return hex ? hex.toLowerCase() : hex;
}

export default {
  hexToBase64,
  base64ToUint8Array,
  base64ToHex,
  deterministicStringify,
  normalizeHex,
};
