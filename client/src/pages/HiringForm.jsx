import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaPhone,
} from "react-icons/fa";

const HiringForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, mongoUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [worker, setWorker] = useState(null);

  // Get workerId from URL query params
  const searchParams = new URLSearchParams(location.search);
  const workerId = searchParams.get("workerId");

  const [formData, setFormData] = useState({
    clientName: mongoUser?.name || "",
    clientPhone: mongoUser?.phone || "",
    location: "",
    date: "",
    time: "",
    problemDescription: "",
  });

  useEffect(() => {
    // Fetch worker details if workerId is available
    const fetchWorkerDetails = async () => {
      if (!workerId) {
        setError("Worker ID is missing. Please try again.");
        return;
      }

      try {
        const token = await currentUser?.getIdToken();
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const response = await axios.get(
          `/api/workers/details/${workerId}`,
          config
        );
        setWorker(response.data);
      } catch (err) {
        console.error("Error fetching worker details:", err);
        setError("Failed to load worker details. Please try again.");
      }
    };

    fetchWorkerDetails();
  }, [workerId, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!currentUser) {
      setError("You must be logged in to hire a worker");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await currentUser.getIdToken();

      const jobData = {
        workerId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        description: formData.problemDescription,
        status: "pending",
      };

      await axios.post("http://localhost:3000/api/jobs/create", jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccess(true);
      // Reset form after successful submission
      setFormData({
        clientName: mongoUser?.name || "",
        clientPhone: mongoUser?.phone || "",
        location: "",
        date: "",
        time: "",
        problemDescription: "",
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Error creating job:", err);
      setError(
        err.response?.data?.message || "Failed to create job. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <div className="rounded-full bg-green-100 p-4 mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Hiring Request Sent!
          </h2>
          <p className="text-gray-600 mb-6">
            Your request has been sent to {worker?.name}. You will be notified
            when they respond to your request.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Hire a Professional
          </h1>
          {worker && (
            <p className="mt-2 text-gray-600">
              You are about to hire{" "}
              <span className="font-semibold">{worker.name}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="clientName"
                  placeholder="Your Name"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="clientPhone"
                  placeholder="Your Phone Number"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Service Details
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  placeholder="Service Location"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="time"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaFileAlt className="text-gray-400" />
                </div>
                <textarea
                  name="problemDescription"
                  placeholder="Describe the problem or service needed"
                  rows="4"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Hire Now"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HiringForm;
