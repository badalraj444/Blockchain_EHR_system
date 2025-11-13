import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050f0a] text-gray-100 p-6">
      <div className="max-w-lg w-full bg-[rgba(255,255,255,0.03)] border border-[#0b3b21] rounded-2xl p-8 shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md text-center">
        <h1 className="text-3xl font-bold text-green-300 mb-3 tracking-tight">
          Welcome to the EHR DApp
        </h1>

        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Your healthcare records, secured on blockchain — encrypted, decentralized,
          tamper‑proof, and always under your control.
        </p>

        <p className="text-green-200 text-sm mb-8 italic">
          Share safely • Track access • Stay in control
        </p>

        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] font-semibold shadow hover:scale-[1.03] transition-transform"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
