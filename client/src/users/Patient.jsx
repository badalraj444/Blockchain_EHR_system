import React from "react";

function Patient() {
  return (
    <div className="min-h-screen bg-[#050f0a] text-gray-100 p-8 flex justify-center">

      {/* CARD */}
      <div
        className="
          w-full max-w-4xl
          bg-[rgba(255,255,255,0.03)]
          border border-[#0b3b21]
          rounded-2xl p-10
          shadow-[0_8px_25px_rgba(0,0,0,0.6)]
          backdrop-blur-md
        "
      >
        {/* Title */}
        <h1 className="text-3xl font-semibold text-green-300 mb-8 text-center">
          Patient Dashboard
        </h1>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Upload Data */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">Upload Data</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Securely upload encrypted medical records to your personal vault.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] text-sm shadow hover:scale-[1.01] transition">
              Upload Now
            </button>
          </div>

          {/* View Data */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">View My Data</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Browse all your stored health records securely and quickly.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              View Records
            </button>
          </div>

          {/* Manage Permissions */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">Manage Permissions</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Approve or deny requests from care providers and researchers.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              Manage Access
            </button>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">Notifications</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Stay updated with new access requests and important alerts.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              View Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Patient;



// 1. he can upload his data
// 2. view his data
// 3. manage permissions 
// 4. check notifications