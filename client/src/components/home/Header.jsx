import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate = useNavigate();
  return (
    <div>
      <nav className="bg-gray-500 flex justify-between p-5 items-center sticky top-0">
        <p
          className="text-2xl font-medium cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-yellow-400">Hire</span>Me
        </p>
        <div className="w-2/3 text-center">
          <input
            type="text"
            placeholder="Search"
            className="rounded-md p-1 w-1/3"
          />
        </div>
        <div className="flex gap-5">
          <button className="text-white" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
          <button className="text-white" onClick={() => navigate("/signin")}>
            Log In
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Header;
