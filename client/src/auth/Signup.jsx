import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom"; // if your project uses 'react-router' adjust accordingly
import { toast } from "react-toastify";
import { signup } from "../lib/api"; // your API helper

function Signup() {
  const [form, setForm] = useState({
    email: "",
    publicpem: "",
    role: "Patient",
    password: "",
    hashedkey: "",
  });

  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationFn: (payload) => signup(payload),
    onSuccess: (data) => {
      // refresh auth user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Account created successfully");
      // clear form (optional)
      setForm({
        email: "",
        publicpem: "",
        role: "Patient",
        password: "",
        hashedkey: "",
      });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Signup failed";
      toast.error(msg);
    },
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // prepare body exactly as required by backend
    const body = {
      email: form.email,
      password: form.password,
      role: form.role,
      publicpem: form.publicpem,
      hashedkey: form.hashedkey,
    };
    mutate(body);
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
        {/* Title */}
        <h1 className="text-3xl font-semibold text-green-300 mb-6 text-center">
          Create Your Account
        </h1>

        {/* show inline error from mutation if present */}
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
            className="
            w-full mt-1 mb-4 px-4 py-2 rounded-lg 
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221] 
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
            required
          />

          {/* Public Key */}
          <label className="text-xs text-gray-300">Public Key (PEM)</label>
          <textarea
            name="publicpem"
            value={form.publicpem}
            onChange={handleChange}
            placeholder="Paste your public key here..."
            rows={4}
            className="
            w-full mt-1 mb-4 px-4 py-2 rounded-lg
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
            required
          ></textarea>

          {/* Hashed Key */}
          <label className="text-xs text-gray-300">Hashed Key (bytes32)</label>
          <input
            name="hashedkey"
            value={form.hashedkey}
            onChange={handleChange}
            type="text"
            placeholder="0x..."
            className="
            w-full mt-1 mb-4 px-4 py-2 rounded-lg
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
            required
          />

          {/* Role Select */}
          <label className="text-xs text-gray-300">Select Your Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="
            w-full mt-1 mb-6 px-4 py-2 rounded-lg
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
            required
          >
            <option className="bg-[#050f0a]" >Patient</option>
            <option className="bg-[#050f0a]" >CareProvider</option>
            <option className="bg-[#050f0a]" >Researcher</option>
          </select>

          {/* Password */}
          <label className="text-xs text-gray-300">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Create a strong password"
            className="
    w-full mt-1 mb-6 px-4 py-2 rounded-lg
    bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
    text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
  "
            required
            minLength={6}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
            w-full px-4 py-3 rounded-xl 
            bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e]
            font-medium text-gray-900 shadow hover:scale-[1.01] 
            transition-transform
            ${isLoading ? "opacity-70 cursor-wait" : ""}
          `}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Footer Hint */}
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
