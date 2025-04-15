import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  FaUser,
  FaPhone,
  FaGlobe,
  FaHome,
  FaCamera,
  FaSpinner,
  FaList,
} from "react-icons/fa";

const WorkerRegistration = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    phone: "",
    nationality: "",
    residence: "",
    category: "",
    profileImage: null,
  });
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: e.target.files[0],
    }));
  };

  useEffect(() => {
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  fetchCategories();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError("");

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("nationality", formData.nationality);
    formDataToSend.append("residence", formData.residence);
    formDataToSend.append("category", formData.category);
    if (formData.profileImage) {
      formDataToSend.append("profileImage", formData.profileImage);
    }

      const token = await currentUser.getIdToken();
      await axios.post("/api/workers/register", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Complete Your Worker Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Please provide the following details to become a worker
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGlobe className="text-gray-400" />
            </div>
            <input
              type="text"
              name="nationality"
              placeholder="Nationality"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.nationality}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaHome className="text-gray-400" />
            </div>
            <input
              type="text"
              name="residence"
              placeholder="Current Residence"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.residence}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaList className="text-gray-400" />
            </div>
            <select
              name="category"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={loadingCategories}
            >
              <option value="">Select Service Category</option>
              {loadingCategories ? (
                <option>Loading categories...</option>
              ) : (
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <div className="flex items-center">
              <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-500 rounded-lg border border-blue-500 cursor-pointer hover:bg-blue-50">
                <FaCamera className="mr-2" />
                <span>Choose File</span>
                <input
                  type="file"
                  name="profileImage"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              {formData.profileImage && (
                <span className="ml-3 text-sm text-gray-600">
                  {formData.profileImage.name}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerRegistration;