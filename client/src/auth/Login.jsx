// src/components/Login.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/api"; // make sure this exists and sends { email, password }
import { toast } from "react-hot-toast";


function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isLoading, error } = useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: (data) => {
      // refresh auth user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged in successfully");
      // optionally navigate to dashboard (change path if needed)
      // navigate("/dashboard");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Login failed";
      toast.error(msg);
    },
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic client-side check
    if (!form.email || !form.password) {
      toast.error("Please provide both email and password");
      return;
    }
    mutate({ email: form.email, password: form.password });
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
          Log in
        </h1>

        {/* Inline error */}
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

          {/* Password */}
          <label className="text-xs text-gray-300">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="••••••••"
            className="
              w-full mt-1 mb-6 px-4 py-2 rounded-lg
              bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
              text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
            "
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e]
              font-medium text-gray-900 shadow
              hover:scale-[1.01] transition-transform
              ${isLoading ? "opacity-70 cursor-wait" : ""}
            `}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-200 underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
