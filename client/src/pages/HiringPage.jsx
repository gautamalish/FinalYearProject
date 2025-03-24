import React from "react";
import electrician from "../assets/electrician.avif";
import { FaTrophy } from "react-icons/fa";
import { BsPersonCheckFill } from "react-icons/bs";
import { IoLocation } from "react-icons/io5";
import { FaClock } from "react-icons/fa6";
const HiringPage = () => {
  return (
    <div>
      <div className="flex mt-5">
        <div>
          <img
            src={electrician}
            alt="profile picture"
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
        <div className="w-1/2">
          <p className="font-bold">Hannah Baker</p>
          <p className="font-semibold mt-1">Introduction</p>
          <p className=" break-words">
            Save time, money, and ensure security with RepairButlers. Our
            on-site smartphone repair services provide skilled labor and
            high-quality parts without the need to go to a repair shop. Choose
            us for fast and reliable repairs at your convenience.
          </p>
          <div className="flex gap-5 items-start mt-2">
            <div>
              <p className="font-semibold">Overview</p>
              <div className="flex items-center">
                <FaTrophy />
                <p>Hired 182 times</p>
              </div>
              <div className="flex items-center">
                <BsPersonCheckFill />
                <p>Background Checked</p>
              </div>
              <div className="flex items-center">
                <IoLocation />
                <p>Kathmandu, Nepal</p>
              </div>
              <div className="flex items-center">
                <FaClock />
                <p>5 Years</p>
              </div>
            </div>
            <div>
              <div>
                <p className="font-semibold">Payment Methods</p>
                <p>
                  Accepts payments via Apple Pay, Cash, Credit card, Venmo, and
                  Zelle.
                </p>
              </div>
              <div>
                <p className="font-semibold mt-2">Social Media</p>
                <p>Facebook, Instagram, Twitter</p>
              </div>
            </div>
          </div>
          <p className="font-semibold mt-2">Business Hours</p>
          <div className="border border-gray-500 w-1/3 bg-gray-100 rounded-md">
            <div className="flex justify-between">
              <p>Sun</p>
              <p>7:00am - 11.00am</p>
            </div>
            <div className="flex justify-between">
              <p>Mon</p>
              <p>7:00am - 11.00am</p>
            </div>
            <div className="flex justify-between">
              <p>Tues</p>
              <p>7:00am - 11.00am</p>
            </div>
            <div className="flex justify-between">
              <p>Wednes</p>
              <p>7:00am - 11.00am</p>
            </div>
            <div className="flex justify-between">
              <p>Thurs</p>
              <p>7:00am - 11.00am</p>
            </div>
            <div className="flex justify-between">
              <p>Friday</p>
              <p>7:00am - 11.00am</p>
            </div>
            <div className="flex justify-between">
              <p>Sat</p>
              <p>7:00am - 11.00am</p>
            </div>
          </div>
          <div className="mt-7 flex gap-20">
            <button className="text-gold bg-gray-100 p-2 rounded-md border border-gray-300 w-72">
              Message
            </button>
            <button className="text-gold bg-gray-100 p-2 rounded-md border border-gray-300 w-72">
              Call
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-gray-100 p-5 ml-28 px-10 gap-3">
          <div className="flex flex-col">
            <label htmlFor="zip">Zip Code</label>
            <input
              type="number"
              className="border border-gray-500 p-1 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              className="border border-gray-500 p-1 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="details">Details</label>
            <input
              type="text"
              className="border border-gray-500 p-1 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name=""
              id=""
              className="border border-gray-500 p-1 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              name=""
              id=""
              className="border border-gray-500 p-1 rounded-md w-80"
            />
          </div>
          <button className="bg-gold text-white rounded-md p-2 px-3 mt-4">
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
};

export default HiringPage;
