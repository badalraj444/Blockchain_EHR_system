// client/src/components/ViewRecordsModal.jsx
import React, { useEffect, useState } from "react";
import metamask from "../utils/metamask";
import * as blockchain from "../utils/blockchain";
import { fetchDataFromIPFS } from "../utils/ipfs";
import { hexToBase64 } from "../utils/convert";
import { decryptWithPrivateKey } from "../utils/crypto/symmetric";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import addresses from "../contracts/config/address.js";
import MetadataJson from "../contracts/Metadata.json";


/**
 * Props:
 *  - open (bool)
 *  - onClose (fn)
 *  - authUser (object) with hashedkey (bytes32)
 */
export default function ViewRecordsModal({ open, onClose, authUser }) {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]); // { idx, dataType, cid, encKeyHex, encKeyBase64, metaPreview }
    const [privatePem, setPrivatePem] = useState(null); // string
    const [busyIndex, setBusyIndex] = useState(null);
    const [logMsgs, setLogMsgs] = useState([]);

    useEffect(() => {
        if (open) {
            loadMetadata();
        } else {
            // clear state when closed
            setRecords([]);
            setPrivatePem(null);
            setBusyIndex(null);
            setLogMsgs([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function pushLog(msg) {
        setLogMsgs((s) => [...s, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }

    async function loadMetadata() {
        if (!authUser) {
            toast.error("You must be logged in.");
            return;
        }
        if (!authUser.hashedkey) {
            toast.error("User missing hashedkey.");
            return;
        }

        setLoading(true);
        setRecords([]);
        pushLog("Fetching metadata from blockchain...");

        try {
            // get a provider (read-only) via metamask helper
            const { provider } = await metamask.getProviderAndSigner();

            // call queryMetadata (returns [dataTypes[], HIList[], encKeys[]])
            const [dataTypes, HIList, encKeys] = await blockchain.queryMetadata({
                metadataAddress: addresses.metadata,
                metadataAbi: MetadataJson.abi,
                provider,
                userHashHex: authUser.hashedkey,
            });

            const parsed = [];
            for (let i = 0; i < HIList.length; i++) {
                const dataType = dataTypes[i];
                const cid = HIList[i];

                // encKey may be returned as bytes-like (Uint8Array) or hex string; normalize to hex string
                let encKeyHex = null;
                const rawEnc = encKeys[i];
                try {
                    // ethers.hexlify handles Uint8Array or 0x... strings safely
                    encKeyHex = ethers.hexlify(rawEnc);
                } catch (err) {
                    // fallback if it's already a string
                    encKeyHex = typeof rawEnc === "string" ? rawEnc : null;
                }

                // convert hex -> base64 for RSA decrypt helper
                const encKeyBase64 = encKeyHex ? hexToBase64(encKeyHex) : null;

                parsed.push({
                    idx: i,
                    dataType,
                    cid,
                    encKeyHex,
                    encKeyBase64,
                });
            }

            setRecords(parsed);
            pushLog(`Loaded ${parsed.length} metadata entries.`);
        } catch (err) {
            console.error("loadMetadata error:", err);
            toast.error("Failed to fetch metadata from chain.");
            pushLog("Error fetching metadata: " + (err?.message || err));
        } finally {
            setLoading(false);
        }
    }

    function handlePrivatePemFile(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            const txt = reader.result;
            setPrivatePem(txt);
            pushLog("Private key loaded into memory (not stored).");
        };
        reader.onerror = (err) => {
            console.error("private key read error", err);
            toast.error("Failed to read private key file.");
        };
        reader.readAsText(f);
    }

    // Utility: convert base64 string -> Blob
    function base64ToBlob(base64, mime = "application/octet-stream") {
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    }

    // Utility: download blob with filename
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // Main action per record: fetch IPFS, decrypt AES key with private PEM, decrypt data, download
    async function handleDecryptAndDownload(rec) {
        if (!privatePem) {
            toast.error("Please upload your private PEM file before decrypting.");
            return;
        }
        setBusyIndex(rec.idx);
        pushLog(`Starting decrypt/download for record ${rec.idx} (CID ${rec.cid})...`);

        try {
            // 1) fetch payload from IPFS
            pushLog("Fetching encrypted payload from IPFS...");
            const payloadStr = await fetchDataFromIPFS(rec.cid);
            if (!payloadStr) throw new Error("Empty payload from IPFS");
            let payloadObj;
            try {
                payloadObj = JSON.parse(payloadStr);
            } catch (e) {
                // attempt fallback names
                throw new Error("IPFS payload is not valid JSON");
            }
            const ciphertextBase64 = payloadObj.ciphertext || payloadObj.ciphertextBase64 || payloadObj.ciphertextBase64;
            const ivBase64 = payloadObj.iv || payloadObj.ivBase64 || payloadObj.ivBase64;
            const meta = payloadObj.meta || {};

            if (!ciphertextBase64 || !ivBase64) {
                throw new Error("IPFS payload missing ciphertext or iv");
            }
            pushLog("Encrypted payload retrieved.");

            // 2) prepare decrypt payload for decryptWithPrivateKey
            // --- inside handleDecryptAndDownload(rec) after fetching payloadObj and extracting ciphertextBase64, ivBase64, meta ---

            // sanity checks
            if (!rec.encKeyBase64) {
                throw new Error("Missing encrypted AES key from chain (encKeyBase64)");
            }

            // Build payload using the exact field names expected by decryptWithPrivateKey
            const decryptPayload = {
                ciphertextBase64,             // from IPFS payload
                ivBase64,                     // from IPFS payload
                encryptedAesKeyBase64: rec.encKeyBase64, // must be base64
            };

            // Debug logs (optional, remove in prod)
            console.debug("decryptPayload keys:", Object.keys(decryptPayload));
            console.debug("encryptedAesKeyBase64 sample:", decryptPayload.encryptedAesKeyBase64?.slice(0, 30));

            // Call decrypt
            const plaintext = await decryptWithPrivateKey(decryptPayload, privatePem);

            if (!plaintext) throw new Error("Decryption returned empty plaintext");

            // 4) plaintext is base64 encoded file content (because when uploaded we encrypted base64 string)
            const mime = meta.mimetype || "application/octet-stream";
            const filename = meta.filename || `record-${rec.idx}`;

            const blob = base64ToBlob(plaintext, mime);
            downloadBlob(blob, filename);
            pushLog("Downloaded decrypted file to browser.");
            toast.success(`Downloaded ${filename}`);
        } catch (err) {
            console.error("Decrypt/download error:", err);
            toast.error(err?.message || "Failed to decrypt/download");
            pushLog("Error: " + (err?.message || String(err)));
        } finally {
            setBusyIndex(null);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
            <div className="absolute inset-0 bg-black/60" onClick={() => !busyIndex && onClose && onClose()} />

            <div className="relative w-full max-w-3xl p-6 bg-[#07110a] border border-[#0b3b21] rounded-lg text-gray-100">
                <h3 className="text-lg font-semibold mb-2">View My Records</h3>

                <div className="mb-3 text-sm">
                    <strong>Note:</strong> You must upload your <em>private</em> PEM to decrypt records. The key is kept in-memory only and never sent to server.
                </div>

                <div className="mb-3">
                    <label className="text-xs text-gray-300">Upload Private Key (PEM)</label>
                    <input type="file" accept=".pem" onChange={handlePrivatePemFile} className="block mt-1" />
                </div>

                <div className="mb-4">
                    <button
                        onClick={loadMetadata}
                        disabled={loading}
                        className="px-3 py-1 rounded bg-indigo-600"
                    >
                        {loading ? "Loading..." : "Reload Metadata"}
                    </button>
                </div>

                <div className="mb-3 bg-[rgba(255,255,255,0.02)] p-3 rounded max-h-[40vh] overflow-auto">
                    {records.length === 0 && <div className="text-xs text-gray-400">No records found.</div>}

                    {records.map((rec) => (
                        <div key={rec.idx} className="mb-3 border-b border-[#0b3221] pb-2">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <div className="text-sm font-medium text-green-200">{rec.dataType || "unknown"}</div>
                                    <div className="text-xs text-gray-400 break-all">{rec.cid}</div>
                                    <div className="text-xs text-gray-500">encKey: {rec.encKeyHex?.slice(0, 20) + "..."}</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => handleDecryptAndDownload(rec)}
                                        disabled={busyIndex !== null}
                                        className="px-3 py-1 rounded bg-green-600 text-black"
                                    >
                                        {busyIndex === rec.idx ? "Processing..." : "Decrypt & Download"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-2 text-sm">
                    <div className="font-medium">Logs</div>
                    <div className="text-xs text-gray-400 max-h-32 overflow-auto">
                        {logMsgs.length === 0 && <div className="text-xs text-gray-500">No logs yet</div>}
                        {logMsgs.map((l, i) => (
                            <div key={i} className="break-words">{l}</div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={() => onClose && onClose()} disabled={busyIndex !== null} className="px-3 py-1 rounded bg-gray-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
