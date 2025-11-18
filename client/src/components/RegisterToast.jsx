// client/src/components/RegisterToast.jsx
import React, { useState } from "react";
import metamask from "../utils/metamask.js";
import RegistryJson from "../contracts/Registry.json";
import addresses from "../contracts/config/address.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserRegistration } from "../lib/api";
import { toast } from "react-hot-toast";


/**
 * Props:
 *  - open (bool)
 *  - onClose (fn)
 *  - authUser (object)  // must include _id, hashedkey, role, publicpem...
 *
 * This version adds a nicer "waiting / processing" UI:
 * - top progress bar while busy
 * - 3-step progress indicator (Submitting → Mining → Updating)
 * - spinner next to the primary action while busy
 * - disables closing while busy
 *
 * Behaviour and side-effects are unchanged.
 */

export default function RegisterToast({ open, onClose, authUser }) {
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [step, setStep] = useState(0); // 0 = idle, 1 = submitted, 2 = mined, 3 = backend updated
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
            <button onClick={onClose} className="px-3 py-1 bg-gray-800 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helpers to render nice UI
  const explorerTxUrlTemplate = import.meta.env.VITE_EXPLORER_TX_URL || null;
  const txLink = txHash && explorerTxUrlTemplate ? explorerTxUrlTemplate.replace("{tx}", txHash) : null;

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

  async function handleRegister() {
    setBusy(true);
    setStatusMsg("");
    setTxHash(null);
    setStep(0);

    try {
      // 1) check network
      const net = await metamask.isNetworkCorrect();
      if (!net.ok) {
        const expected = net.expected ?? "unknown";
        setStatusMsg(`Wrong network. Expected chainId ${expected}, connected to ${net.actual}`);
        setBusy(false);
        setStep(0);
        return;
      }

      // 2) ensure hashedkey exists
      const userHash = user.hashedkey;
      if (!userHash) {
        setStatusMsg("No user hashedkey in profile. Cannot register.");
        setBusy(false);
        setStep(0);
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
      setStep(1); // submitted

      // 4) check receipt status
      // ethers v6 receipt.status may be number or bigint or string; normalize:
      const okStatus = receipt && (receipt.status === 1 || String(receipt.status) === "1" || receipt.status === true);
      if (!okStatus) {
        setStatusMsg("Transaction mined but failed.");
        setBusy(false);
        setStep(0);
        return;
      }

      setStep(2);
      setStatusMsg("Transaction confirmed — updating your profile...");

      // 5) update backend flag
      await updateRegistration.mutateAsync({ userId: user._id, isRegistered: true });

      setStep(3);
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
      setStep(0);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop — clicking disabled while busy */}
      <div
        className={`absolute inset-0 ${busy ? "bg-black/80" : "bg-black/60"} transition`}
        onClick={() => !busy && onClose && onClose()}
      />

      <div className="relative z-60 w-full max-w-md p-6 bg-[#07110a] border border-[#0b3b21] rounded-lg text-gray-100 shadow-xl">
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
          <span>Register to Blockchain</span>
          {/* small status badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              busy ? "bg-[rgba(14,164,95,0.12)] text-green-100" : "bg-[rgba(255,255,255,0.03)] text-gray-300"
            }`}
          >
            {busy ? "Processing" : txHash ? "Done" : "Ready"}
          </span>
        </h3>

        <p className="text-sm mb-3">
          This will open your wallet (MetaMask). You will be asked to confirm a transaction to register your account on-chain.
        </p>

        <div className="bg-[rgba(255,255,255,0.02)] p-3 rounded mb-3 text-sm">
          <div>
            <strong>Account:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>UserHash (bytes32):</strong>{" "}
            <code className="break-all text-xs text-gray-200">{user.hashedkey}</code>
          </div>
        </div>

        {/* Progress steps */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-4 text-left">
            <StepDot idx={1} active={step >= 1} label="Submitted" />
            <div className="flex-1 border-t border-[#0b3b21] mx-2" />
            <StepDot idx={2} active={step >= 2} label="Mined" />
            <div className="flex-1 border-t border-[#0b3b21] mx-2" />
            <StepDot idx={3} active={step >= 3} label="Profile updated" />
          </div>
        </div>

        {/* status message + tx link */}
        <div className="mb-4">
          {statusMsg && <div className="text-sm mb-2 text-gray-200">{statusMsg}</div>}
          {txLink && (
            <div className="text-sm mb-2">
              Tx:{" "}
              <a href={txLink} target="_blank" rel="noreferrer" className="text-green-300 underline">
                {txHash}
              </a>
            </div>
          )}
        </div>

        {/* action row */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onClose && onClose()}
            disabled={busy}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleRegister}
            disabled={busy}
            className="px-4 py-1 rounded bg-gradient-to-br from-[#0ea45f] to-[#0b8f4e] text-black font-medium disabled:opacity-60 inline-flex items-center gap-3"
          >
            {/* spinner while busy */}
            {busy && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 50 50"
                className="animate-spin"
                aria-hidden
              >
                <circle cx="25" cy="25" r="18" stroke="rgba(0,0,0,0.12)" strokeWidth="4" fill="none" />
                <path
                  d="M43 25c0-9.665-7.835-17.5-17.5-17.5"
                  stroke="#06270f"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}

            <span>{busy ? "Processing..." : "Register Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
