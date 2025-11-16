// client/src/components/KeyGenerator.jsx
import React, { useState } from "react";
import { generateRsaKeyPair } from "../utils/generateKeys";

/**
 * KeyGenerator component
 * - Generate RSA keypair on click
 * - Shows public and private PEM on screen
 * - Allows downloading private key as private_key.pem (Http download)
 */
export default function KeyGenerator() {
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPublicKey("");
    setPrivateKey("");

    try {
      const { publicKeyPem, privateKeyPem } = await generateRsaKeyPair(2048);
      setPublicKey(publicKeyPem);
      setPrivateKey(privateKeyPem);
    } catch (err) {
      console.error("Key generation failed:", err);
      setError("Failed to generate keys. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPrivateKey = () => {
    if (!privateKey) return;
    const blob = new Blob([privateKey], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "private_key.pem";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Important: revoke URL to free memory
    URL.revokeObjectURL(url);
  };

  const clearKeysFromMemory = () => {
    // Remove from state (still in JS memory until GC), but this is helpful UX
    setPublicKey("");
    setPrivateKey("");
  };

  return (
    <div className="min-h-screen p-8 bg-[#050f0a] text-gray-100 flex items-start justify-center">
      <div className="w-full max-w-3xl bg-[rgba(255,255,255,0.03)] p-8 rounded-xl border border-[#0b3b21]">
        <h2 className="text-2xl font-semibold text-green-200 mb-4">Generate RSA Key Pair</h2>

        <p className="text-sm text-gray-300 mb-4">
          Click <strong>Generate</strong> to create an RSA keypair. The public key is shown so you can
          copy/paste it to registration forms. Download the private key and keep it secure — it will not
          be stored on the server.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] font-semibold"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Key Pair"}
          </button>

          {privateKey && (
            <>
              <button
                onClick={downloadPrivateKey}
                className="px-4 py-2 rounded border border-[#0b3b21] hover:bg-[rgba(255,255,255,0.02)]"
              >
                Download Private Key
              </button>

              <button
                onClick={clearKeysFromMemory}
                className="px-3 py-2 rounded border border-red-600 text-red-400 hover:bg-[rgba(255,0,0,0.03)]"
              >
                Clear from screen
              </button>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        {publicKey && (
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">Public Key (PEM)</label>
            <textarea
              readOnly
              className="w-full h-40 p-3 bg-[#0b1b12] text-green-100 rounded resize-none font-mono text-xs"
              value={publicKey}
            />
          </div>
        )}

        {privateKey && (
          <div className="mb-2">
            <label className="block text-sm text-gray-300 mb-1">Private Key (PEM)</label>
            <textarea
              readOnly
              className="w-full h-48 p-3 bg-[#0b1b12] text-yellow-200 rounded resize-none font-mono text-xs"
              value={privateKey}
            />
            <p className="text-xs text-gray-400 mt-2">
              Important: download and store this private key securely. If you lose it, you will not be
              able to decrypt AES keys encrypted to this public key.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
