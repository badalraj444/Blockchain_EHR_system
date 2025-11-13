import React from "react";

function CareProvider() {
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
          Care Provider Dashboard
        </h1>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Upload Data for Patient */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">Upload Data</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Upload encrypted medical records on behalf of patients you are authorized to treat.
            </p>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] text-sm shadow hover:scale-[1.01] transition">
              Upload for Patient
            </button>
          </div>

          {/* View Authorized Patients */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">My Patients</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              View patient profiles and records for whom you currently hold access permission.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              View Patients
            </button>
          </div>

          {/* Request Access */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">Request Access</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Ask patients for access to view or update their medical records.
            </p>
            <button className="px-4 py-2 rounded-lg border border-[#0b3221] text-sm hover:bg-[rgba(255,255,255,0.02)] transition">
              Request Permission
            </button>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition">
            <h2 className="text-xl text-green-200 font-semibold mb-2">Notifications</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Alerts for access approvals, denials, and activity updates.
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

export default CareProvider;
