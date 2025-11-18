// client/src/components/ViewRecordsModal.jsx
import React, { useEffect, useState } from "react";
import metamask from "../utils/metamask";
import * as blockchain from "../utils/blockchain";
import { fetchDataFromIPFS } from "../utils/ipfs";
import { hexToBase64 } from "../utils/convert";
import { decryptWithPrivateKey } from "../utils/crypto/symmetric";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

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

    // derive a simple UI busy flag and step for progress indicator
    const busy = loading || busyIndex !== null;
    // step: 0 = idle, 1 = fetching metadata, 2 = fetching ipfs/decrypting
    const step = loading ? 1 : busyIndex !== null ? 2 : 0;

    function StepDot({ idx, active, label }) {
        return (
            <div className="flex items-center gap-3">
                <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        active ? "bg-[#0ea45f] shadow-[0_6px_14px_rgba(14,164,95,0.18)]" : "bg-[rgba(255,255,255,0.03)] border border-[#0b3b21]"
                    }`}
                    aria-hidden
                />
                <div className={`text-xs ${active ? "text-green-100 font-medium" : "text-gray-400"}`}>{label}</div>
            </div>
        );
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

    const statusMsg = logMsgs.length > 0 ? logMsgs[logMsgs.length - 1] : "Waiting for action...";

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
            <div
                className={`absolute inset-0 ${busy ? "bg-black/80" : "bg-black/60"} transition`}
                onClick={() => !busy && onClose && onClose()}
            />

            <div className="relative w-full max-w-3xl p-6 bg-[#07110a] border border-[#0b3b21] rounded-lg text-gray-100">
                {/* Top progress bar when busy */}
                {busy && (
                    <div className="absolute left-0 top-0 w-full h-1 rounded-t-lg overflow-hidden" aria-hidden>
                        <div
                            className="h-full animate-[progress_2.2s_linear_infinite]"
                            style={{
                                background:
                                    "linear-gradient(90deg, rgba(14,164,95,0.12), rgba(166,244,197,0.9), rgba(11,143,78,0.18))",
                                width: "40%",
                            }}
                        />
                        <style>{`@keyframes progress { 0% { transform: translateX(-10%); } 50% { transform: translateX(30%); } 100% { transform: translateX(110%); } }`}</style>
                    </div>
                )}

                <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                    <span>View My Records</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${busy ? "bg-[rgba(14,164,95,0.12)] text-green-100" : "bg-[rgba(255,255,255,0.03)] text-gray-300"}`}>
                        {busy ? "Processing" : "Ready"}
                    </span>
                </h3>

                <div className="mb-3 text-sm">
                    <strong>Note:</strong> You must upload your <em>private</em> PEM to decrypt records. The key is kept in-memory only and never sent to server.
                </div>

                <div className="mb-3">
                    <label className="text-xs text-gray-300">Upload Private Key (PEM)</label>
                    <input type="file" accept=".pem" onChange={handlePrivatePemFile} className="block mt-1" disabled={busy} />
                </div>

                <div className="mb-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Progress steps */}
                        <div className="flex-1">
                            <div className="flex items-center justify-start gap-4 text-left">
                                <StepDot idx={1} active={step >= 1} label="Metadata" />
                                <div className="flex-1 border-t border-[#0b3b21] mx-2" />
                                <StepDot idx={2} active={step >= 2} label="IPFS/Decrypt" />
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <button
                                onClick={loadMetadata}
                                disabled={busy}
                                className="px-3 py-1 rounded bg-indigo-600"
                            >
                                {loading ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 50 50" className="inline-block align-middle animate-spin mr-2" aria-hidden>
                                            <circle cx="25" cy="25" r="18" stroke="rgba(0,0,0,0.12)" strokeWidth="4" fill="none" />
                                            <path d="M43 25c0-9.665-7.835-17.5-17.5-17.5" stroke="#06270f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    "Reload Metadata"
                                )}
                            </button>
                        </div>
                    </div>
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
                                        disabled={busy}
                                        className="px-3 py-1 rounded bg-green-600 text-black inline-flex items-center gap-2"
                                    >
                                        {busyIndex === rec.idx && (
                                            <svg width="14" height="14" viewBox="0 0 50 50" className="animate-spin" aria-hidden>
                                                <circle cx="25" cy="25" r="18" stroke="rgba(0,0,0,0.12)" strokeWidth="4" fill="none" />
                                                <path d="M43 25c0-9.665-7.835-17.5-17.5-17.5" stroke="#06270f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                            </svg>
                                        )}

                                        <span>{busyIndex === rec.idx ? "Processing..." : "Decrypt & Download"}</span>
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
                    <div className="mt-2 text-xs text-gray-400">Status: <span className="text-sm">{statusMsg}</span></div>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={() => onClose && onClose()} disabled={busy} className="px-3 py-1 rounded bg-gray-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
