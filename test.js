import { fetchDataFromIPFS } from "./client/src/utils/ipfs.js";

// Replace with a real CID
const CID_TO_FETCH = "QmYkQQvmZ93W6TtS8Hu4B4Q9Brb4yaMeVvmMV9dieCFeAr";

async function test() {
  console.log("\n=== Testing fetchDataFromIPFS (alias) ===");

  try {
    const content = await fetchDataFromIPFS(CID_TO_FETCH);
    console.log("Fetched content:", content);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
