import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logOut } = useAuth();
  console.log(currentUser);

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

        {/* Search bar */}
        <div className="hidden sm:flex items-center bg-white/90 rounded-xl px-4 py-2 shadow-sm w-1/3 max-w-xl hover:shadow-md transition-all">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Find services or professionals..."
            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-white font-medium">
          <button
            onClick={() => navigate("/services")}
            className="hover:text-yellow-300 transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => navigate("/professionals")}
            className="hover:text-yellow-300 transition-colors"
          >
            Professionals
          </button>
          <button
            onClick={() => navigate("/about")}
            className="hover:text-yellow-300 transition-colors"
          >
            About
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-3">
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
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                onClick={logOut}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
