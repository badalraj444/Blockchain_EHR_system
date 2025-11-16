// client/src/components/RegisterToast.jsx
import React, { useState } from "react";
import metamask from "../utils/metamask.js";
import RegistryJson from "../contracts/Registry.json";
import addresses from "../contracts/config/address.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserRegistration } from "../lib/api";
import { toast } from "react-toastify";

/**
 * Props:
 *  - open (bool)
 *  - onClose (fn)
 *  - authUser (object)  // must include _id, hashedkey, role, publicpem...
 *
 * Usage: <RegisterToast open={open} onClose={()=>setOpen(false)} authUser={authUser} />
 */
export default function RegisterToast({ open, onClose, authUser }) {
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const qc = useQueryClient();

  const updateRegistration = useMutation({
    mutationFn: ({ userId, isRegistered }) => updateUserRegistration(userId, isRegistered),
    onSuccess: () => {
      qc.invalidateQueries(["authUser"]);
      toast.success("Local profile updated: registered on-chain");
    },
    onError: () => {
      toast.error("Failed to update registration status on server");
    },
  });

  if (!open) return null;

  // minimal guard
  const user = authUser;
  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-black/60 p-6 rounded-md text-white">
          No user data available.
          <div className="mt-3">
            <button onClick={onClose} className="px-3 py-1 bg-gray-800 rounded">Close</button>
          </div>
        </div>
      </div>
    );
  }

  async function handleRegister() {
    setBusy(true);
    setStatusMsg("");
    setTxHash(null);

    try {
      // 1) check network
      const net = await metamask.isNetworkCorrect();
      if (!net.ok) {
        const expected = net.expected ?? "unknown";
        setStatusMsg(`Wrong network. Expected chainId ${expected}, connected to ${net.actual}`);
        setBusy(false);
        return;
      }

      // 2) ensure hashedkey exists
      const userHash = user.hashedkey;
      if (!userHash) {
        setStatusMsg("No user hashedkey in profile. Cannot register.");
        setBusy(false);
        return;
      }

      // 3) call metamask to register (this opens MetaMask)
      setStatusMsg("Opening wallet to confirm registration transaction...");
      const res = await metamask.sendRegisterUser({
        registryAddress: addresses.registry,
        registryAbi: RegistryJson.abi,
        userHashHex: userHash,
        role: user.role || "Patient",
      });

      // res expected: { txHash, receipt }
      const { txHash: tx, receipt } = res || {};
      setTxHash(tx || null);
      setStatusMsg("Transaction submitted. Waiting for confirmation...");

      // 4) check receipt status
      // ethers v6 receipt.status may be number or bigint or string; normalize:
      const okStatus = receipt && (receipt.status === 1 || String(receipt.status) === "1" || receipt.status === true);
      if (!okStatus) {
        setStatusMsg("Transaction mined but failed.");
        setBusy(false);
        return;
      }

      // 5) update backend flag
      setStatusMsg("Transaction confirmed — updating your profile...");
      await updateRegistration.mutateAsync({ userId: user._id, isRegistered: true });

      setStatusMsg("Registration complete.");
      setBusy(false);
      // optional auto-close
      setTimeout(() => {
        onClose && onClose();
      }, 900);
    } catch (err) {
      console.error("Register error:", err);
      const msg = err?.message || "User rejected transaction or error occurred";
      setStatusMsg(`Error: ${msg}`);
      toast.error(msg);
      setBusy(false);
    }
  }

  const explorerTxUrlTemplate = import.meta.env.VITE_EXPLORER_TX_URL || null;
  const txLink = txHash && explorerTxUrlTemplate ? explorerTxUrlTemplate.replace("{tx}", txHash) : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => !busy && onClose && onClose()} />

      <div className="relative z-60 w-full max-w-md p-6 bg-[#07110a] border border-[#0b3b21] rounded-lg text-gray-100 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Register to Blockchain</h3>

        <p className="text-sm mb-3">
          This will open your wallet (MetaMask). You will be asked to confirm a transaction to register your account on-chain.
        </p>

        <div className="bg-[rgba(255,255,255,0.02)] p-3 rounded mb-3 text-sm">
          <div><strong>Account:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>UserHash (bytes32):</strong> <code className="break-all">{user.hashedkey}</code></div>
        </div>

        <div className="mb-3">
          {statusMsg && <div className="text-sm mb-2">{statusMsg}</div>}
          {txLink && (
            <div className="text-sm mb-2">
              Tx: <a href={txLink} target="_blank" rel="noreferrer" className="text-green-300 underline">{txHash}</a>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => onClose && onClose()}
            disabled={busy}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleRegister}
            disabled={busy}
            className="px-4 py-1 rounded bg-green-600 text-black font-medium disabled:opacity-60"
          >
            {busy ? "Processing..." : "Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
