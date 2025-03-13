import React from "react";
import { useState } from "react";
const Header = () => {
  return (
    <div>
      <nav className="bg-gray-500 flex justify-between p-5 items-center">
        <p className="text-2xl font-medium">
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
          <button>Sign Up</button>
          <button>Log In</button>
        </div>
      </nav>
    </div>
  );
};

export default Header;
