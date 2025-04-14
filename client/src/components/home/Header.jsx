import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserCog,
  FaSignOutAlt,
  FaSpinner,
  FaUserTie,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logOut, updateUserRole, mongoUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  console.log(currentUser);

  const handleLogout = async () => {
    await logOut();
    navigate("/signin");
  };

  const handleRoleSwitch = async (newRole) => {
    setIsSwitchingRole(true);
    try {
      await updateUserRole(currentUser.uid, newRole);
      navigate(0); // This refreshes the page while maintaining React Router state
    } catch (error) {
      console.error("Error switching role:", error);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 w-full z-50">
      <nav className="max-w-[100rem] mx-auto flex justify-between items-center p-4 sm:p-5 lg:p-6">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <p className="text-3xl font-bold text-white group-hover:opacity-90 transition">
            <span className="text-yellow-300">Hire</span>Me
          </p>
        </div>

        

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium">
          <button
            onClick={() => navigate("/services")}
            className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => navigate("/professionals")}
            className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            Professionals
          </button>
          <button
            onClick={() => navigate("/about")}
            className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            About
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-3 items-center">
          {!currentUser ? (
            <>
              <button
                className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold border border-white hover:bg-white/20 transition-all"
                onClick={() => navigate("/signin")}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              <button
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-all"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FaUserCog className="text-white text-xl" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-semibold">{currentUser.email}</p>
                      <p className="text-xs text-gray-500">{mongoUser.role}</p>
                    </div>

                    <button
                      onClick={() =>
                        handleRoleSwitch(
                          mongoUser.role === "worker" ? "client" : "worker"
                        )
                      }
                      disabled={isSwitchingRole}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {isSwitchingRole ? (
                        <span className="flex items-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Switching...
                        </span>
                      ) : mongoUser.role === "worker" ? (
                        <>
                          <FaUser className="mr-2" />
                          Switch to Client
                        </>
                      ) : (
                        <>
                          <FaUserTie className="mr-2" />
                          Switch to Worker
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
