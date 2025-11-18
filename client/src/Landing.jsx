import React from "react";
import { Link } from "react-router-dom";
import Intro from "./components/Intro";

function Landing() {
  return (
    <div className="min-h-screen w-full flex bg-[#050f0a] text-gray-100">

      {/* LEFT FIXED SIDEBAR — 40% */}
      <div
        className="w-2/5 min-h-screen fixed left-0 top-0 p-6 pt-20 ml-7
            shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md
             flex flex-col items-start justify-center gap-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center 
                       bg-gradient-to-br from-[#064e2a] to-[#07986a] shadow-md
                       transform transition-transform duration-300 hover:scale-105"
            aria-hidden
          >
            {/* small logo / icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="opacity-95"
            >
              <path d="M12 2v20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              <path d="M4 7h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </svg>
          </div>

          <div>
            <p className="text-xs text-gray-400">Secure • Decentralized • Patient-first</p>
          </div>
        </div>

        <div className="max-w-[85%]">
          <h3 className="text-lg font-semibold text-green-200">Welcome</h3>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Take control of your health records. Approve access, upload encrypted files,
            and view an auditable history of who accessed your data.
          </p>
        </div>

        <div className="w-full mt-4 flex flex-col gap-3">
          <Link
            to="/login"
            className="w-40 px-4 py-3 rounded-xl border border-[#0b3221] 
                       text-green-100 hover:bg-[rgba(255,255,255,0.02)] transition
                       text-center block transform-gpu transition-all duration-200
                       hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-[#0ea45f] focus:ring-opacity-30"
            aria-label="Log in"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="w-40 px-4 py-3 rounded-xl border border-[#0b3221] 
                       text-green-100 hover:bg-[rgba(255,255,255,0.02)] transition
                       text-center block transform-gpu transition-all duration-200
                       hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-[#0ea45f] focus:ring-opacity-30"
            aria-label="Sign up"
          >
            Sign up
          </Link>
        </div>

        <div className="mt-6 w-full text-xs text-gray-400">
          <div className="mb-1"><strong className="text-green-300">Quick features</strong></div>
          <ul className="list-disc list-inside space-y-1">
            <li>Client-side encryption</li>
            <li>Permissioned sharing & audit trails</li>
            <li>IPFS-backed file storage</li>
          </ul>
        </div>

        {/* subtle footer / trust line */}
        <div className="mt-6 text-[11px] text-gray-500 max-w-[85%]">
          <div className="mb-1">Built with privacy-first principles • Enterprise-ready</div>
          <div className="text-[10px] text-gray-600">© {new Date().getFullYear()} EHR DApp</div>
        </div>
      </div>

      {/* RIGHT SCROLLABLE CONTENT — 60% */}
      <div className="hidden md:block lg:block ml-[40%] w-[60%] h-screen overflow-y-auto p-6">
        <Intro />
      </div>

    </div>
  );
}

export default Landing;
