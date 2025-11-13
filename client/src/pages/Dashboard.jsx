import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const shortAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#06130b] via-[#081710] to-[#031007] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Card */}
        <section className="lg:col-span-2 bg-[rgba(255,255,255,0.03)] border border-[#0b3b21] rounded-2xl p-8 shadow-ehr">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-200">Dashboard</h1>
              <p className="text-gray-300 mt-2">Manage your data and permissions securely on the blockchain.</p>
            </div>

            <div className="text-right">
              {account ? (
                <div className="inline-flex items-center gap-3 bg-[rgba(255,255,255,0.02)] border border-[#0b3221] px-4 py-2 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Connected</div>
                    <div className="text-sm font-medium text-green-100">{shortAddress(account)}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(account)}
                    className="text-xs px-3 py-2 rounded-md border border-[#123e27] bg-transparent hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <Button onClick={connectWallet} className="bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] px-4 py-2 rounded-lg font-medium">
                  Connect MetaMask
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-green-200 mb-3">Quick actions</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/user-registration" className="block p-4 rounded-xl border border-[#0b3221] bg-[rgba(255,255,255,0.02)] hover:scale-[1.01] transition">
                <div className="text-sm font-medium">User Registration</div>
                <div className="text-xs text-gray-400">Register patient identities on-chain</div>
              </Link>

              <Link to="/permissions-management" className="block p-4 rounded-xl border border-[#0b3221] bg-[rgba(255,255,255,0.02)] hover:scale-[1.01] transition">
                <div className="text-sm font-medium">Manage Permissions</div>
                <div className="text-xs text-gray-400">Grant or revoke provider access</div>
              </Link>

              <Link to="/data-upload" className="block p-4 rounded-xl border border-[#0b3221] bg-[rgba(255,255,255,0.02)] hover:scale-[1.01] transition">
                <div className="text-sm font-medium">Upload Data</div>
                <div className="text-xs text-gray-400">Add encrypted medical files</div>
              </Link>

              <Link to="/data-retrieval" className="block p-4 rounded-xl border border-[#0b3221] bg-[rgba(255,255,255,0.02)] hover:scale-[1.01] transition">
                <div className="text-sm font-medium">Retrieve Data</div>
                <div className="text-xs text-gray-400">Fetch files you have access to</div>
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-[#082617] pt-6 text-sm text-gray-300">
            <h3 className="text-sm font-semibold text-green-200 mb-2">About this dashboard</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This dashboard connects to your Web3 wallet to authenticate actions. All data is encrypted client-side and access events are recorded on-chain for an auditable consent trail.
            </p>
          </div>
        </section>

        {/* Right: Status / Activity */}
        <aside className="bg-[rgba(255,255,255,0.02)] border border-[#0b3b21] rounded-2xl p-6 shadow-inner">
          <h4 className="text-sm font-semibold text-green-200">Node status</h4>
          <div className="mt-3 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-400 shadow-sm" aria-hidden></span>
            <span className="text-xs text-gray-300">Node connected • Chain synced</span>
          </div>

          <div className="mt-6">
            <h5 className="text-sm font-semibold text-green-200">Recent activity</h5>
            <ul className="mt-3 space-y-2 text-xs text-gray-400">
              <li className="p-2 bg-[rgba(255,255,255,0.01)] rounded-md border border-[#0b3221]">You shared a record with Dr. Patel • 2h ago</li>
              <li className="p-2 bg-[rgba(255,255,255,0.01)] rounded-md border border-[#0b3221]">Consent granted to City Hospital • 1d ago</li>
              <li className="p-2 bg-[rgba(255,255,255,0.01)] rounded-md border border-[#0b3221]">New audit log entry • 3d ago</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none fixed -z-10 inset-0 overflow-hidden">
        <div className="absolute -right-72 -top-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#08341f] to-transparent opacity-40 blur-3xl transform rotate-12"></div>
      </div>
    </main>
  );
}
