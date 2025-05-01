import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserCog,
  FaSignOutAlt,
  FaSpinner,
  FaUserTie,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaStar,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import NotificationButton from "../NotificationButton";

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
                onClick={() => navigate(mongoUser?.role === 'admin' ? '/admin' :mongoUser?.role==='client'?'/dashboard':'/worker-dashboard')}
              >
                Dashboard
              </button>
              
              {/* Notification Button */}
              <NotificationButton />

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-all"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FaUserCog className="text-white text-xl" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50">
                    {/* Actions */}
                    <div className="px-2 py-2">
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <FaUser className="mr-2 text-blue-500" />
                        View Profile
                      </button>

                      {mongoUser.role === "client" && (
                        <button
                          onClick={() => navigate("/worker-registration")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors mt-1"
                        >
                          <FaUserTie className="mr-2 text-blue-500" />
                          Become a Worker
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Log Out
                      </button>
                    </div>
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
