import React from "react";

function Researcher() {
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
          Researcher Dashboard
        </h1>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Request Data */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">
              Request Data
            </h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Submit permission requests to access anonymized or approved datasets.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] text-sm shadow hover:scale-[1.01] transition">
              Request Access
            </button>
          </div>

          {/* View Available Data */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">
              View Available Data
            </h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Explore datasets that are currently open to you based on granted permissions.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              Browse Data
            </button>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">
              Notifications
            </h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Get updates when requests are approved, denied, or when new datasets become available.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              View Notifications
            </button>
          </div>

          {/* Download Granted Data — extra obvious feature */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">
              Download Data
            </h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Access and download datasets for which you currently hold valid permissions.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              Download Files
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Researcher;
