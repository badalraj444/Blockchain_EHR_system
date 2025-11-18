// src/auth/Signup.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { signup } from "../lib/api";

// utils (make sure paths match your project)
import { generateRsaKeyPair, hashPublicKeyToBytes32 } from "../utils/crypto/keys.js";

/**
 * Signup component:
 * - automatically generates RSA keypair on submit
 * - hashes public PEM to bytes32 and includes it in payload
 * - triggers download of private PEM for user to store locally
 * - sends only publicpem & hashedkey to backend (never the private key)
 *
 * New behaviour:
 * - After successful signup, a modal opens reminding the user to keep the PEM safe.
 */

function Signup() {
  const [form, setForm] = useState({
    email: "",
    role: "Patient",
    password: "",
  });

  const [busy, setBusy] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false); // NEW: show modal after success
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationFn: (payload) => signup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      // keep previous toast
      toast.success("Account created successfully. Private key downloaded — keep it safe!");
      // show the modal that explains importance of PEM file
      setShowKeyModal(true);
      setForm({ email: "", role: "Patient", password: "" });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Signup failed";
      toast.error(msg);
    },
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // download helper: create a file download for private key PEM
  function downloadPrivateKey(privatePem, filename = "private_key.pem") {
    try {
      const blob = new Blob([privatePem], { type: "application/x-pem-file" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error("Failed to download private key:", err);
      // fallback: show private key in prompt (useful only for testing)

      alert("Copy your private key:\n\n" + privatePem);
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please provide email and password");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setBusy(true);
    try {
      // 1) Generate RSA keypair (client-side)
      const { privateKeyPem, publicKeyPem } = await generateRsaKeyPair(2048);

      // 2) Hash public PEM to bytes32
      const hashedkey = hashPublicKeyToBytes32(publicKeyPem); // returns 0x...

      // 3) Offer private key download to user (client-only)
      const downloadSuccess = downloadPrivateKey(privateKeyPem, "ehr_private_key.pem");

      // 4) Toast / popup to warn the user to keep private key safe
      // (Important: once lost, the data cannot be read)
      if (downloadSuccess) {
        toast.success(
          "Private key downloaded — save it securely (offline). If you lose this file you will not be able to decrypt your data.",
          { duration: 8000 }
        );
      } else {
        toast.success(
          "Private key shown in-browser as fallback — copy and store it securely. If you lose this key you will not be able to decrypt your data.",
          { duration: 10000 }
        );
      }

      // 5) Prepare payload (never include private key)
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
        publicpem: publicKeyPem,
        hashedkey, // bytes32 hex
      };

      // 6) Call signup API
      await mutate(payload);
    } catch (err) {
      console.error("Signup failed:", err);
      toast.error(err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#050f0a] text-gray-100 p-6">
        <div
          className="
          w-full max-w-lg bg-[rgba(255,255,255,0.03)] 
          border border-[#0b3b21] rounded-2xl p-8
          shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md
        "
        >
          <h1 className="text-3xl font-semibold text-green-300 mb-6 text-center">
            Create Your Account
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/60 text-sm">
              {error?.response?.data?.message || "Something went wrong"}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label className="text-xs text-gray-300">Email Address</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 mb-4 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[#0b3221] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]"
              required
            />

            {/* Role Select */}
            <label className="text-xs text-gray-300">Select Your Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full mt-1 mb-6 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[#0b3221] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]"
              required
            >
              <option>Patient</option>
              <option>CareProvider</option>
              <option>Researcher</option>
            </select>

            {/* Password */}
            <label className="text-xs text-gray-300">Password</label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Create a strong password"
              className="w-full mt-1 mb-6 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[#0b3221] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]"
              required
              minLength={8}
            />

            <button
              type="submit"
              disabled={isLoading || busy}
              className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] font-medium text-gray-900 shadow hover:scale-[1.01] transition-transform ${isLoading || busy ? "opacity-70 cursor-wait" : ""}`}
            >
              {isLoading || busy ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-green-200 underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modal: Important PEM safekeeping notice */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowKeyModal(false)}
            aria-hidden
          />

          <div className="relative z-60 w-full max-w-md p-6 bg-[#07110a] border border-[#0b3b21] rounded-lg text-gray-100 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Important — keep your private key safe</h3>

            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              We have provided your private key file (PEM). <strong>Store it in a secure,
                offline location</strong> — for example, an encrypted USB drive or password manager that supports file storage.
            </p>

            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              <strong>Why this matters:</strong> your private key is required to decrypt any
              encrypted data you (or others) upload to the system. <span className="text-red-400 font-semibold">If you lose this file, you will not be able to read your encrypted data — it cannot be recovered by the server.</span>
            </p>

            <p className="text-sm text-gray-400 mb-4">
              We recommend making at least one secure backup and keeping it in a separate location.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-md bg-gradient-to-br from-[#0ea45f] to-[#0b8f4e] text-black font-medium"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Signup;
