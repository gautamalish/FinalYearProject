import React from "react";
import electrician from "../assets/electrician.avif";
import {
  FaStar,
  FaFilter,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaUserAlt,
  FaClock,
} from "react-icons/fa";

const WorkerList = () => {
  // Sample worker data
  const workers = [
    {
      name: "Hannah Baker",
      rating: 4.0,
      age: 31,
      price: 800,
      location: "KTM",
      experience: "5 years",
    },
    {
      name: "John Smith",
      rating: 4.5,
      age: 35,
      price: 750,
      location: "Pokhara",
      experience: "7 years",
    },
    {
      name: "Sarah Johnson",
      rating: 4.2,
      age: 28,
      price: 850,
      location: "Bhaktapur",
      experience: "3 years",
    },
    {
      name: "Michael Brown",
      rating: 4.8,
      age: 42,
      price: 900,
      location: "Lalitpur",
      experience: "10 years",
    },
    {
      name: "Emily Davis",
      rating: 4.1,
      age: 29,
      price: 780,
      location: "KTM",
      experience: "4 years",
    },
    {
      name: "David Wilson",
      rating: 4.3,
      age: 38,
      price: 820,
      location: "KTM",
      experience: "6 years",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Electricians near you
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Workers List */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workers.map((worker, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
                >
                  <div className="p-4 flex-1">
                    <div className="flex items-start gap-4">
                      <img
                        src={electrician}
                        alt="Profile"
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-yellow-400"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h2 className="text-lg font-bold text-gray-800">
                            {worker.name}
                          </h2>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        </div>

                        <div className="mt-1 flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="text-gray-700 font-medium">
                            {worker.rating}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({Math.floor(Math.random() * 50) + 10} reviews)
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <FaUserAlt className="mr-1 text-gray-500" />
                            {worker.age} years
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaRupeeSign className="mr-1 text-gray-500" />
                            Rs {worker.price}/hr
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaMapMarkerAlt className="mr-1 text-gray-500" />
                            {worker.location}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-1 text-gray-500" />
                            {worker.experience}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-2 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                      Hire Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <FaFilter className="text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Rating
                  </label>
                  <select
                    id="rating"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    {[4.5, 4.0, 3.5, 3.0].map((value) => (
                      <option key={value} value={value}>
                        {value}+ stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="age"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Age Range
                  </label>
                  <select
                    id="age"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="any">Any age</option>
                    <option value="18-30">18-30 years</option>
                    <option value="30-40">30-40 years</option>
                    <option value="40+">40+ years</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Experience
                  </label>
                  <select
                    id="experience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="any">Any experience</option>
                    <option value="1">1+ years</option>
                    <option value="3">3+ years</option>
                    <option value="5">5+ years</option>
                    <option value="10">10+ years</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Max Price (Rs/hr)
                  </label>
                  <input
                    type="number"
                    id="price"
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="City or area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300">
                  Apply Filters
                </button>

                <button className="w-full text-blue-600 hover:text-blue-800 py-2 px-4 rounded-lg font-medium transition-colors duration-300">
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerList;
