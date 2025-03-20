import React from "react";
import electrician from "../assets/electrician.avif";
const WorkerList = () => {
  return (
    <div>
      <h1>Electricians near you</h1>
      <div className="border border-gray-300">
        <img
          src={electrician}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>
    </div>
  );
};

export default WorkerList;
