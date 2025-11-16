// test_queryMetadata.js
// Query stored metadata and print arrays (dataTypes, HIList, encKeys)
// CommonJS style.

const path = require("path");
const fs = require("fs");
const ethers = require("ethers");

const { tessera, besu } = require("../keys.js");
const addresses = require("../address.js");

const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

function getContractData(contractName) {
  const contractJsonPath = path.resolve(__dirname, "../../", "contracts", `${contractName}.json`);
  const contractJson = JSON.parse(fs.readFileSync(contractJsonPath, "utf8"));
  return {
    abi: contractJson.abi,
    bytecode: contractJson.evm.bytecode.object,
  };
}

async function main() {
  console.log("Starting queryMetadata test...");

  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

  const { abi: metadataAbi } = getContractData("Metadata");
  const metadataAddr = addresses.metadata;
  if (!metadataAddr) {
    console.error("Metadata address not found in ../address.js (key 'metadata'). Aborting.");
    process.exit(1);
  }

  try {
    const metadataRead = new ethers.Contract(metadataAddr, metadataAbi, provider);

    // Use the same ownerKey as before
    const ownerKey = ethers.keccak256(ethers.toUtf8Bytes("test-user-1"));
    console.log("Querying for ownerKey:", ownerKey);

    const result = await metadataRead.searchData(ownerKey);
    // result is tuple: (string[] dataTypes, string[] HIList, bytes[] encKeys)
    const dataTypes = result[0];
    const hiList = result[1];
    const encKeys = result[2];

    console.log("dataTypes length:", dataTypes.length);
    for (let i = 0; i < dataTypes.length; i++) {
      console.log(`index ${i}: dataType=${dataTypes[i]}, HI/CID=${hiList[i]}, encKey(hex)=${encKeys[i]}`);
    }

    console.log("queryMetadata test finished.");
  } catch (err) {
    console.error("queryMetadata failed:", err);
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = main;
