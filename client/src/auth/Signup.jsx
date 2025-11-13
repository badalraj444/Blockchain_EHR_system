import React from "react";

function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050f0a] text-gray-100 p-6">

      <div className="
        w-full max-w-lg bg-[rgba(255,255,255,0.03)] 
        border border-[#0b3b21] rounded-2xl p-8
        shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md
      ">

        {/* Title */}
        <h1 className="text-3xl font-semibold text-green-300 mb-6 text-center">
          Create Your Account
        </h1>

        {/* Email */}
        <label className="text-xs text-gray-300">Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="
            w-full mt-1 mb-4 px-4 py-2 rounded-lg 
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221] 
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
        />

        {/* Public Key */}
        <label className="text-xs text-gray-300">Public Key (PEM)</label>
        <textarea
          placeholder="Paste your public key here..."
          rows={4}
          className="
            w-full mt-1 mb-4 px-4 py-2 rounded-lg
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
        ></textarea>

        {/* Role Select */}
        <label className="text-xs text-gray-300">Select Your Role</label>
        <select
          className="
            w-full mt-1 mb-6 px-4 py-2 rounded-lg
            bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
            text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
          "
        >
          <option className="bg-[#050f0a]">Patient</option>
          <option className="bg-[#050f0a]">CareProvider</option>
          <option className="bg-[#050f0a]">Researcher</option>
        </select>

        {/* Password */}
        <label className="text-xs text-gray-300">Password</label>
        <input
          type="password"
          placeholder="Create a strong password"
          className="
    w-full mt-1 mb-6 px-4 py-2 rounded-lg
    bg-[rgba(255,255,255,0.04)] border border-[#0b3221]
    text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0ea45f]
  "
        />

        {/* Submit Button (UI Only) */}
        <button
          className="
            w-full px-4 py-3 rounded-xl 
            bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e]
            font-medium text-gray-900 shadow hover:scale-[1.01] 
            transition-transform
          "
        >
          Sign Up
        </button>

        {/* Footer Hint */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account? <span className="text-green-200 underline cursor-pointer">Log in</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
