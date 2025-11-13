import React from "react";
import { Link } from "react-router-dom";

function Navbar({ children }) {
  return (
    <div className="min-h-screen bg-[#050f0a] text-gray-100 flex flex-col">

      {/* NAVBAR */}
      <nav
        className="
          w-full px-8 py-4 border-b border-[#0b3b21] 
          bg-[rgba(255,255,255,0.03)] backdrop-blur-md
          shadow-[0_4px_20px_rgba(0,0,0,0.4)]
          flex items-center justify-between sticky top-0 z-50
        "
      >
        {/* Left side - App Name / Logo */}
        <div className="flex items-center gap-3">
          <div className="
            w-10 h-10 rounded-lg bg-gradient-to-br 
            from-[#0ea45f] to-[#0b8f4e] flex items-center justify-center shadow
          ">
            {/* placeholder icon */}
            <span className="text-white font-bold text-lg">E</span>
          </div>

          <Link to="/" className="text-green-200 text-xl font-semibold tracking-wide">
            Electronic Healthcare Record Sharing System
          </Link>
        </div>

        {/* Right side - Placeholder links */}
        <div className="flex items-center gap-6 text-sm">
          <Link className="text-gray-300 hover:text-green-200 transition">About</Link>
          <Link className="text-gray-300 hover:text-green-200 transition">Features</Link>
          <Link className="text-gray-300 hover:text-green-200 transition">Docs</Link>

          {/* Buttons */}
          {/* <button className="px-4 py-1.5 rounded-md border border-[#0b3b21] hover:bg-[rgba(255,255,255,0.03)] transition">
            Log in
          </button>
          <button className="px-4 py-1.5 rounded-md bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] font-medium shadow">
            Sign up
          </button> */}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default Navbar;
