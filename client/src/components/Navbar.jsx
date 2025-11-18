// client/src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAuthUser from "../hooks/useAuthUser";
import RegisterToast from "./RegisterToast";

function Navbar({ children }) {
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isregisteredOnchain = authUser?.isRegistered2Blockchain;

  const location = useLocation();
  const { logoutMutation } = useLogout();

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const showLogout =
    location.pathname.startsWith("/patient") ||
    location.pathname.startsWith("/careprovider") ||
    location.pathname.startsWith("/researcher");

  // NEW → Show Home button ONLY on login or signup pages
  const showHomeOnAuthPages =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div
      className="min-h-screen bg-[#050f0a] text-gray-100 flex flex-col"
      style={{ fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif" }}
    >
      <nav
        className="
          w-full px-6 md:px-8 py-4 border-b border-[#0b3b21]
          bg-[rgba(255,255,255,0.03)] backdrop-blur-md
          shadow-[0_4px_20px_rgba(0,0,0,0.4)]
          flex items-center justify-between sticky top-0 z-50
        "
      >
        {/* LEFT: Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg 
            bg-gradient-to-br from-[#0ea45f] to-[#0b8f4e] 
            flex items-center justify-center shadow-md transform transition-transform duration-200
            hover:scale-105"
          >
            <span className="text-white font-bold text-lg">E</span>
          </div>

          <Link
            to="/"
            className="text-green-200 text-lg md:text-xl font-semibold tracking-wide hover:text-green-100 transition"
          >
            Electronic Healthcare Record Sharing System
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 text-sm md:gap-6">

          {/* 💡 Show Home button ONLY on login/signup */}
          {showHomeOnAuthPages && (
            <Link
              to="/"
              className="
                px-4 py-1.5 rounded-md border border-[#0b3b21] 
                text-gray-200 hover:bg-[rgba(255,255,255,0.03)] transition
                transform hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-[#0ea45f] focus:ring-opacity-25
              "
            >
              Home
            </Link>
          )}

          {/* Hide About/Features/Docs on dashboard pages */}
          {!showLogout && !showHomeOnAuthPages && (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-300 hover:text-green-200 transition cursor-pointer">About</span>
              <span className="text-gray-300 hover:text-green-200 transition cursor-pointer">Features</span>
              <span className="text-gray-300 hover:text-green-200 transition cursor-pointer">Docs</span>
            </div>
          )}

          {/* Dashboard actions (register to chain + logout) */}
          {showLogout && (
            <div className="flex items-center gap-3">
              {!isLoading && isAuthenticated && !isregisteredOnchain && (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-3 py-1.5 rounded-md bg-[#fbbf24] text-black font-medium hover:brightness-95 transition transform hover:-translate-y-0.5"
                >
                  Register to Chain
                </button>
              )}

              <button
                onClick={logoutMutation}
                className="px-4 py-1.5 rounded-md border border-[#0b3b21] hover:bg-[rgba(255,255,255,0.03)] transition text-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Register Toast (unchanged) */}
      <RegisterToast
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        authUser={authUser}
      />

      <main className="flex-1">{children}</main>
    </div>
  );
}

export default Navbar;
