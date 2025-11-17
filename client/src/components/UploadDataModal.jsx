// client/src/components/UploadDataModal.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import metamask from "../utils/metamask";
import MetadataJson from "../contracts/Metadata.json";
import addresses from "../contracts/config/address.js";

import { encryptWithPublicKey } from "../utils/crypto/symmetric.js";
import { deterministicStringify } from "../utils/convert.js";
import { uploadToIPFS } from "../utils/ipfs.js";

export default function UploadDataModal({ open, onClose, authUser }) {
  const [busyStep, setBusyStep] = useState(null); // null | step string
  const [fileName, setFileName] = useState("");
  const [dataType, setDataType] = useState("general");
  const [progressLog, setProgressLog] = useState([]);
  const [cid, setCid] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const qc = useQueryClient();

  function log(msg) {
    setProgressLog((s) => [...s, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  if (!open) return null;

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = (e) => reject(e);
      reader.onload = () => {
        const result = reader.result; // e.g. "data:application/pdf;base64,JVBERi0x..."
        if (typeof result === "string") {
          const idx = result.indexOf("base64,");
          if (idx >= 0) resolve(result.slice(idx + 7));
          else resolve(btoa(result));
        } else {
          reject(new Error("Unexpected file reader result type"));
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setProgressLog([]);
    setCid(null);
    setTxHash(null);
  }

  async function handleUploadConfirm(e) {
    e.preventDefault();

    if (!authUser) {
      toast.error("You must be logged in.");
      return;
    }
    if (!authUser.hashedkey) {
      toast.error("Missing user hashedkey. Cannot register metadata.");
      return;
    }
    const input = document.getElementById("upload-file-input");
    const file = input?.files?.[0];
    if (!file) {
      toast.error("Please choose a file.");
      return;
    }

    try {
      // 1) read file as base64
      setBusyStep("reading");
      log("Reading file and converting to base64...");
      const base64Content = await readFileAsBase64(file);
      log(`Read file "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);

      // 2) encrypt using user's public PEM
      setBusyStep("encrypting");
      log("Encrypting file content with user's public key...");
      const publicPem = authUser.publicpem;
      if (!publicPem) throw new Error("No public PEM found in user profile.");

      // IMPORTANT: use the actual return names from your encryption util
      // returns: { ciphertextBase64, ivBase64, encryptedAesKeyBase64 }
      const enc = await encryptWithPublicKey(base64Content, publicPem);
      const { ciphertextBase64, ivBase64, encryptedAesKeyBase64 } = enc;

      if (!ciphertextBase64 || !encryptedAesKeyBase64) {
        throw new Error("Encryption utility returned invalid payload.");
      }
      log("Encryption complete.");

      // 3) package payload for IPFS
      setBusyStep("packaging");
      log("Preparing payload for IPFS...");
      const payload = {
        ciphertext: ciphertextBase64,
        iv: ivBase64,
        meta: {
          filename: file.name,
          mimetype: file.type,
          originalSize: file.size,
          uploadedAt: new Date().toISOString(),
        },
      };

      const payloadString =
        typeof deterministicStringify === "function"
          ? deterministicStringify(payload)
          : JSON.stringify(payload);

      // 4) upload to IPFS
      setBusyStep("ipfs");
      log("Uploading encrypted payload to IPFS...");
      const cidResult = await uploadToIPFS(payloadString);
      setCid(cidResult);
      log(`Uploaded to IPFS: ${cidResult}`);

      // 5) submit metadata on-chain (opens MetaMask)
      setBusyStep("onchain");
      log("Submitting metadata to blockchain (opens MetaMask)...");
      const ownerHashHex = authUser.hashedkey;
      const dataTypeStr = dataType || "general";

      const result = await metamask.sendAddEHRdata({
        metadataAddress: addresses.metadata,
        metadataAbi: MetadataJson.abi,
        ownerHashHex,
        dataType: dataTypeStr,
        cid: cidResult,
        encryptedAesKeyBase64, // pass base64 encrypted AES key directly
      });

      setTxHash(result?.txHash ?? null);
      log(`Transaction submitted: ${result?.txHash ?? "unknown"}`);

      const receipt = result?.receipt;
      const ok =
        receipt &&
        (receipt.status === 1 ||
          String(receipt.status) === "1" ||
          receipt.status === true);
      if (!ok) {
        throw new Error("On-chain transaction failed (receipt status not OK).");
      }

      setBusyStep("done");
      log("On-chain registration of metadata confirmed.");
      toast.success("Data uploaded and metadata stored on chain.");
      qc.invalidateQueries(["authUser"]);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err?.message || "Upload failed");
      log(`Error: ${err?.message || String(err)}`);
      setBusyStep("error");
    } finally {
      setBusyStep(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => !busyStep && onClose && onClose()} />

      <div className="relative w-full max-w-2xl p-6 bg-[#07110a] border border-[#0b3b21] rounded-lg text-gray-100">
        <h3 className="text-lg font-semibold mb-2">Upload Data</h3>

        <p className="text-sm mb-3">This will encrypt your file and store it on IPFS, then write metadata on-chain.</p>

        <form onSubmit={handleUploadConfirm} className="space-y-3">
          <div>
            <label className="text-xs text-gray-300">File</label>
            <input id="upload-file-input" type="file" onChange={handleFileChange} className="block w-full mt-1" />
            {fileName && <div className="text-xs text-gray-400 mt-1">{fileName}</div>}
          </div>

          <div>
            <label className="text-xs text-gray-300">Data type</label>
            <input value={dataType} onChange={(e) => setDataType(e.target.value)} className="w-full mt-1 p-2 rounded bg-[#0b110b] border border-[#0b3221]" />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => onClose && onClose()} disabled={!!busyStep} className="px-3 py-1 rounded bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={!!busyStep} className="px-4 py-1 rounded bg-green-600 text-black">
              {busyStep ? "Processing..." : "Confirm & Upload"}
            </button>
          </div>
        </form>

        <div className="mt-4 bg-[rgba(255,255,255,0.02)] p-3 rounded text-sm h-40 overflow-auto">
          <div className="font-medium text-sm mb-2">Progress</div>
          {progressLog.length === 0 && <div className="text-xs text-gray-400">Waiting for action...</div>}
          {progressLog.map((line, i) => (
            <div key={i} className="text-xs break-words">
              {line}
            </div>
          ))}
          {cid && (
            <div className="mt-2 text-xs">
              IPFS CID: <span className="text-green-300 break-all">{cid}</span>
            </div>
          )}
          {txHash && (
            <div className="mt-2 text-xs">
              Tx: <span className="text-green-300 break-all">{txHash}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
