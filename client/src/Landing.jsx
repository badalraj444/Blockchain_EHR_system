import React from "react";

import { Link } from "react-router-dom";
import Intro from "./components/Intro";
function Landing() {
  return (
    <div className="min-h-screen w-full flex bg-[#050f0a] text-gray-100">

      {/* LEFT FIXED SIDEBAR — 40% */}
      {/* LEFT FIXED SIDEBAR — 40% (theme-consistent with Intro) */}
      <div
        className="w-2/5 min-h-screen fixed left-0 top-0 p-15 mt-18 ml-7
            shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md
             flex flex-col items-start justify-center gap-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#064e2a] to-[#07986a] shadow-md">
            {/* small logo / icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 2v20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              <path d="M4 7h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </svg>
          </div>

          <div>
            {/* <h2 className="text-2xl font-semibold text-green-200 leading-tight">EHR DApp</h2> */}
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
             text-center block"
>
  Log in
</Link>

           <Link
  to="/signup"
  className="w-40 px-4 py-3 rounded-xl border border-[#0b3221] 
             text-green-100 hover:bg-[rgba(255,255,255,0.02)] transition
             text-center block"
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
      </div>


      {/* RIGHT SCROLLABLE CONTENT — 60% */}
      <div className="ml-[40%] w-[60%] h-screen overflow-y-auto p-6">
        <Intro />
      </div>

    </div>
  );
}

export default Landing;
