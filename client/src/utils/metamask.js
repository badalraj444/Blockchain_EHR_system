// client/src/utils/metamask.js
// Browser MetaMask helpers for Vite + Ethers v6.
// These wrap blockchain.js helpers and produce a signer/provider from MetaMask.

import { ethers } from "ethers";
import * as blockchain from "./blockchain.js";

/**
 * NOTE: This module is browser-only and will throw if window.ethereum is missing.
 * Private keys discussed earlier are only for encryption/decryption and for Node scripts — not used here.
 */
function assertBrowser() {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    throw new Error(
      "MetaMask (window.ethereum) not available. Run in a browser with MetaMask."
    );
  }
}

/** Is MetaMask installed? */
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && !!window.ethereum;
}

/** Connect to MetaMask (request accounts) and return { provider, signer, address } */
export async function connectMetaMask() {
  assertBrowser();
  // Request account access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Ethers v6 BrowserProvider
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

/** Get provider & signer without prompting (if already connected) */
export async function getProviderAndSigner() {
  assertBrowser();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

/** Register user via MetaMask signer.
 * Accepts registryAddress + registryAbi (recommended) or will use defaults in blockchain.js.
 * Returns { txHash, receipt }.
 */
export async function sendRegisterUser(params) {
  assertBrowser();
  const { signer } = await getProviderAndSigner();
  return await blockchain.registerUser({ ...params, signer });
}

/** Add EHR data via MetaMask signer.
 * encryptedAesKeyBase64 must be base64 string (from encryptWithPublicKey).
 */
export async function sendAddEHRdata(params) {
  assertBrowser();
  const { signer } = await getProviderAndSigner();
  return await blockchain.addEHRdata({ ...params, signer });
}

/** Read-only query using MetaMask provider (no txs) */
export async function queryMetadata(params) {
  assertBrowser();
  const { provider } = await getProviderAndSigner();
  return await blockchain.queryMetadata({ ...params, provider });
}

/** Convenience wrappers returning txHash only */
export async function registerUserTx(params) {
  const res = await sendRegisterUser(params);
  return res.txHash;
}
export async function addEHRdataTx(params) {
  const res = await sendAddEHRdata(params);
  return res.txHash;
}

/** Event listeners for account / chain changes */
export function onAccountChange(cb) {
  if (typeof window !== "undefined" && window.ethereum && window.ethereum.on) {
    window.ethereum.on("accountsChanged", (accounts) => cb(accounts));
  }
}
export function onChainChange(cb) {
  if (typeof window !== "undefined" && window.ethereum && window.ethereum.on) {
    window.ethereum.on("chainChanged", (chainId) => cb(chainId));
  }
}

export default {
  isMetaMaskInstalled,
  connectMetaMask,
  getProviderAndSigner,
  sendRegisterUser,
  sendAddEHRdata,
  queryMetadata,
  registerUserTx,
  addEHRdataTx,
  onAccountChange,
  onChainChange,
};
