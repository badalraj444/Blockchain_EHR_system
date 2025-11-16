// client/src/utils/blockchain.js
// Browser-first ESM helpers for interacting with Registry & Metadata contracts (Vite).
// Uses client/src/contracts/*.json and client/src/config/addresses.js by default,
// but also accepts explicit abi/address params so callers can override.

import { ethers } from "ethers";
import { base64ToHex } from "./convert.js";

// Import compiled ABIs and addresses (Option A layout)
import RegistryJson from "../contracts/Registry.json";
import MetadataJson from "../contracts/Metadata.json";
import addresses from "../contracts/config/address.js";

/**
 * Create ethers.Contract
 * providerOrSigner should be an ethers.Provider (read) or ethers.Signer (write).
 */
export function getContract(address, abi, providerOrSigner) {
  if (!address || !abi || !providerOrSigner) {
    throw new Error("getContract requires (address, abi, providerOrSigner)");
  }
  return new ethers.Contract(address, abi, providerOrSigner);
}

/**
 * registerUser:
 * - signer required (ethers.Signer from MetaMask)
 * - registryAddress, registryAbi optional (falls back to imports)
 */
export async function registerUser({ registryAddress = addresses.registry, registryAbi = RegistryJson.abi, signer, userHashHex, role }) {
  if (!signer) throw new Error("registerUser requires a signer (ethers.Signer). Call connectMetaMask() first.");
  if (!registryAddress || !registryAbi) throw new Error("registryAddress and registryAbi are required (or ensure Registry.json + addresses.js exist).");

  const registry = new ethers.Contract(registryAddress, registryAbi, signer);
  const tx = await registry.registerUser(userHashHex, role);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

/**
 * addEHRdata:
 * - signer required
 * - encryptedAesKeyBase64 is converted -> bytes hex automatically
 */
export async function addEHRdata({ metadataAddress = addresses.metadata, metadataAbi = MetadataJson.abi, signer, ownerHashHex, dataType, cid, encryptedAesKeyBase64 }) {
  if (!signer) throw new Error("addEHRdata requires a signer (ethers.Signer). Call connectMetaMask() first.");
  if (!metadataAddress || !metadataAbi) throw new Error("metadataAddress and metadataAbi are required (or ensure Metadata.json + addresses.js exist).");
  if (!encryptedAesKeyBase64) throw new Error("encryptedAesKeyBase64 (base64) is required");

  const encKeyHex = base64ToHex(encryptedAesKeyBase64); // converts to 0x...
  const metadata = new ethers.Contract(metadataAddress, metadataAbi, signer);
  const tx = await metadata.addEHRdata(ownerHashHex, dataType, cid, encKeyHex);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

/**
 * queryMetadata (read-only):
 * - provider required (ethers.Provider)
 * - returns [dataTypes[], HIList[], encKeys[]]
 */
export async function queryMetadata({ metadataAddress = addresses.metadata, metadataAbi = MetadataJson.abi, provider, userHashHex }) {
  if (!provider) throw new Error("queryMetadata requires an ethers provider (read-only). Use provider from connectMetaMask() or new BrowserProvider(window.ethereum).");
  if (!metadataAddress || !metadataAbi) throw new Error("metadataAddress and metadataAbi are required.");

  const metadata = new ethers.Contract(metadataAddress, metadataAbi, provider);
  const result = await metadata.searchData(userHashHex);
  return result;
}




export default {
  getContract,
  registerUser,
  addEHRdata,
  queryMetadata,
  
};
