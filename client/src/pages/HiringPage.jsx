import React from "react";
import electrician from "../assets/electrician.avif";
import {
  FaTrophy,
  FaClock,
  FaStar,
  FaRegCommentDots,
  FaPhoneAlt,
  FaArrowRight,
} from "react-icons/fa";
import { BsPersonCheckFill } from "react-icons/bs";
import { IoLocation } from "react-icons/io5";

const HiringPage = () => {
  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Profile and Info */}
        <div className="flex-1">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="flex-shrink-0 relative">
              <img
                src={electrician}
                alt="profile picture"
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-md"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-md">
                <BsPersonCheckFill className="text-sm" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  Hannah Baker
                </h1>
              </div>
              <p className="text-lg text-gray-600 mb-4">
                Professional Electrician
              </p>

              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-2"></span>
                  Introduction
                </h2>
                <p className="text-gray-700">
                  Save time, money, and ensure security with our services. Our
                  on-site electrical services provide skilled labor and
                  high-quality work without the need to go through the hassle.
                  Choose us for fast and reliable solutions at your convenience.
                </p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-2"></span>
                Overview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FaTrophy className="text-yellow-500 text-lg" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium block">
                      Hired 182 times
                    </span>
                    <span className="text-gray-500 text-sm">
                      Top 5% in Kathmandu
                    </span>
                  </div>
                </div>
                <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <BsPersonCheckFill className="text-green-500 text-lg" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Background Checked
                  </span>
                </div>
                <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <IoLocation className="text-blue-500 text-lg" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Kathmandu, Nepal
                  </span>
                </div>
                <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FaClock className="text-purple-500 text-lg" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    5 Years Experience
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-2"></span>
                  Payment & Social
                </h2>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Payment Methods
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Apple Pay", "Cash", "Credit Card", "Venmo", "Zelle"].map(
                      (method) => (
                        <span
                          key={method}
                          className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full border border-gray-200"
                        >
                          {method}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Connect With Me
                </h3>
                <div className="flex gap-3">
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors border border-blue-200">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors border border-pink-200">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors border border-sky-200">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full mr-2"></span>
              Business Hours
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {[
                { day: "Sunday", hours: "7:00 AM - 11:00 PM" },
                { day: "Monday", hours: "7:00 AM - 11:00 PM" },
                { day: "Tuesday", hours: "7:00 AM - 11:00 PM" },
                { day: "Wednesday", hours: "7:00 AM - 11:00 PM" },
                { day: "Thursday", hours: "7:00 AM - 11:00 PM" },
                { day: "Friday", hours: "7:00 AM - 11:00 PM" },
                { day: "Saturday", hours: "7:00 AM - 11:00 PM" },
              ].map((item) => (
                <div
                  key={item.day}
                  className="flex justify-between items-center py-3 px-3 border-b border-gray-200 last:border-0 hover:bg-gray-100 rounded transition-colors"
                >
                  <span className="text-gray-700 font-medium">{item.day}</span>
                  <span className="text-gray-700 bg-blue-50 px-3 py-1 rounded-full text-sm border border-blue-100">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full mr-2"></span>
              Customer Reviews
            </h2>
            <div className="flex items-center mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="text-4xl font-bold text-gray-800 mr-4">4.5</div>
              <div>
                <div className="flex items-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`${
                        star <= 4 ? "text-yellow-400" : "text-gray-300"
                      } mr-1`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">Based on 128 reviews</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="font-bold text-blue-600 text-xl">Y</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center mb-1">
                    <p className="font-semibold mr-2">Yorkboi</p>
                    <span className="text-gray-500 text-sm">Oct 18, 2024</span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-yellow-400 mr-1" />
                    ))}
                  </div>
                  <p className="text-gray-700">
                    Best experience from someone who fixes phones. Great
                    communication. He even had screen protectors. Came straight
                    to my house and fixed my phone to the address. Read some
                    info.
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="font-bold text-green-600 text-xl">S</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center mb-1">
                    <p className="font-semibold mr-2">SarahJ</p>
                    <span className="text-gray-500 text-sm">Sep 5, 2024</span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-yellow-400 mr-1" />
                    ))}
                  </div>
                  <p className="text-gray-700">
                    Hannah was punctual, professional, and fixed my electrical
                    issue in no time. Would definitely hire again for any
                    electrical work needed in my home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Form */}
        <div className="lg:w-96">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 border border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-2"></span>
              Book Service
            </h2>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="zip"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Zip Code
                </label>
                <input
                  type="number"
                  id="zip"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  placeholder="Enter your zip code"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service Address
                </label>
                <input
                  type="text"
                  id="location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label
                  htmlFor="details"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service Details
                </label>
                <textarea
                  id="details"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  placeholder="Describe the service you need"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                Check Availability
                <FaArrowRight className="ml-2" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <button className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                <FaRegCommentDots />
                Message Professional
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors">
                <FaPhoneAlt />
                Call Now
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Service Estimate
              </h3>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  Typical pricing for this service:{" "}
                  <span className="font-bold">$75 - $150</span>
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Final price will be confirmed after service details review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringPage;
