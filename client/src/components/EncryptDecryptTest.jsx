// client/src/components/EncryptDecryptTest.jsx
import React, { useState } from "react";
import { generateRsaKeyPair } from "../utils/generateKeys"; // you created earlier
import encryptWithPublicKey from "../utils/encryptWithPublicKey";
import decryptWithPrivateKey from "../utils/decryptWithPrivateKey";

export default function EncryptDecryptTest() {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState("");
  const [status, setStatus] = useState("");

  const sampleText = "working on capstone project";

  const handleGenerateKeys = async () => {
    setStatus("Generating keypair...");
    try {
      const { publicKeyPem, privateKeyPem } = await generateRsaKeyPair(2048);
      setPublicKey(publicKeyPem);
      setPrivateKey(privateKeyPem);
      setStatus("Keys generated.");
    } catch (err) {
      console.error(err);
      setStatus("Key generation failed: " + err.message);
    }
  };

  const handleEncrypt = () => {
    try {
      if (!publicKey) {
        alert("Generate or paste a public key first.");
        return;
      }
      const payload = encryptWithPublicKey(sampleText, publicKey);
      setEncrypted(payload);
      setDecrypted(""); // clear previous
      setStatus("Encrypted payload created.");
    } catch (err) {
      console.error(err);
      setStatus("Encryption failed: " + err.message);
    }
  };

  const handleDecrypt = () => {
    try {
      if (!privateKey) {
        alert("Provide private key.");
        return;
      }
      if (!encrypted) {
        alert("No encrypted payload available.");
        return;
      }
      const plain = decryptWithPrivateKey(encrypted, privateKey);
      setDecrypted(plain);
      setStatus("Decryption successful.");
    } catch (err) {
      console.error(err);
      setStatus("Decryption failed: " + err.message);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#050f0a] text-gray-100">
      <div className="max-w-3xl mx-auto bg-[rgba(255,255,255,0.03)] border border-[#0b3b21] rounded p-6">
        <h2 className="text-xl text-green-200 font-semibold mb-4">Encrypt / Decrypt Test</h2>

        <div className="mb-4">
          <button onClick={handleGenerateKeys} className="px-3 py-2 rounded bg-[#0ea45f] text-black mr-2">
            Generate Keypair
          </button>
          <button onClick={handleEncrypt} className="px-3 py-2 rounded border mr-2">Encrypt sample</button>
          <button onClick={handleDecrypt} className="px-3 py-2 rounded border">Decrypt</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Sample plaintext</label>
          <div className="font-mono text-sm bg-[#0b1b12] p-2 rounded">{sampleText}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Public Key (PEM)</label>
          <textarea value={publicKey} readOnly rows={6} className="w-full font-mono text-xs p-2 rounded bg-[#0b1b12]" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Private Key (PEM)</label>
          <textarea value={privateKey} readOnly rows={8} className="w-full font-mono text-xs p-2 rounded bg-[#0b1b12]" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Encrypted payload (JSON, base64 fields)</label>
          <textarea
            value={encrypted ? JSON.stringify(encrypted, null, 2) : ""}
            readOnly
            rows={8}
            className="w-full font-mono text-xs p-2 rounded bg-[#0b1b12]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Decrypted plaintext</label>
          <div className="font-mono text-sm bg-[#0b1b12] p-2 rounded">{decrypted}</div>
        </div>

        <div className="text-sm text-gray-400">{status}</div>
      </div>
    </div>
  );
}
