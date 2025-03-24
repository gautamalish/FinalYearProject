import React from "react";
import electrician from "../assets/electrician.avif";
import { FaTrophy } from "react-icons/fa";
import { BsPersonCheckFill } from "react-icons/bs";
import { IoLocation } from "react-icons/io5";
import { FaClock } from "react-icons/fa6";
const HiringPage = () => {
  return (
    <div>
      <div>
        <img
          src={electrician}
          alt="profile picture"
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>
      <div>
        <p>Hannah Baker</p>
        <p>Introduction</p>
        <p>
          Save time, money, and ensure security with RepairButlers. Our on-site
          smartphone repair services provide skilled labor and high-quality
          parts without the need to go to a repair shop. Choose us for fast and
          reliable repairs at your convenience.
        </p>
        <div>
          <div>
            <p>Overview</p>
            <div className="flex">
              <FaTrophy />
              <p>Hired 182 times</p>
            </div>
            <div>
              <BsPersonCheckFill />
              <p>Background Checked</p>
            </div>
            <div>
              <IoLocation />
              <p>Kathmandu, Nepal</p>
            </div>
            <div>
              <FaClock />
              <p>5 Years</p>
            </div>
          </div>
          <div>
            <div>
              <p>Payment Methods</p>
              <p>
                Accepts payments via Apple Pay, Cash, Credit card, Venmo, and
                Zelle.
              </p>
            </div>
            <div>
              <p>Social Media</p>
              <p>Facebook, Instagram, Twitter</p>
            </div>
          </div>
        </div>
        <div>
          <p>Business Hours</p>
          
        </div>
      </div>
    </div>
  );
};

export default HiringPage;
