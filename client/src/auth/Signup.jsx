// src/auth/Signup.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { signup } from "../lib/api";

// utils (make sure paths match your project)
import { generateRsaKeyPair } from "../utils/crypto/keys.js";
import { hashPublicKeyToBytes32 } from "../utils/crypto/keys.js";

/**
 * Signup component:
 * - automatically generates RSA keypair on submit
 * - hashes public PEM to bytes32 and includes it in payload
 * - triggers download of private PEM for user to store locally
 * - sends only publicpem & hashedkey to backend (never the private key)
 */
function Signup() {
  const [form, setForm] = useState({
    email: "",
    role: "Patient",
    password: "",
  });

  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationFn: (payload) => signup(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Account created successfully. Private key downloaded — keep it safe!");
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
    } catch (err) {
      console.error("Failed to download private key:", err);
      // fallback: show private key in prompt (useful only for testing)
      // eslint-disable-next-line no-alert
      alert("Copy your private key:\n\n" + privatePem);
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
      downloadPrivateKey(privateKeyPem, "ehr_private_key.pem");

      // 4) Prepare payload (never include private key)
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
        publicpem: publicKeyPem,
        hashedkey, // bytes32 hex
      };

      // 5) Call signup API
      await mutate(payload);
    } catch (err) {
      console.error("Signup failed:", err);
      toast.error(err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
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
  );
}

export default Signup;
