import axios from "axios";

// Configuration
const API_URL = "http://localhost:3000/api/admin";
const CLOUDINARY_CLOUD_NAME = "your_cloud_name"; // Move to .env
const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset"; // Move to .env

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000; // 10 seconds timeout

// Helper Functions
const getAuthConfig = (token) => {
  if (!token) {
    throw new Error("No token provided");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    switch (status) {
      case 401:
        throw new Error(data.message || "Session expired - please login again");
      case 403:
        throw new Error(data.message || "Forbidden - insufficient permissions");
      case 404:
        throw new Error(data.message || "Resource not found");
      default:
        throw new Error(data.message || `Request failed with status ${status}`);
    }
  } else if (error.request) {
    // Request was made but no response received
    throw new Error("No response from server - please try again");
  } else {
    // Something happened in setting up the request
    throw new Error(`Request setup error: ${error.message}`);
  }
};

// User Management
export const fetchUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users`, getAuthConfig(token));
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteUser = async (userId, token) => {
  try {
    await axios.delete(`${API_URL}/users/${userId}`, getAuthConfig(token));
  } catch (error) {
    handleApiError(error);
  }
};

export const updateUserRole = async (userId, role, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/users/${userId}/role`,
      { role },
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Category Management
export const fetchCategories = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/categories");
    console.log("API Response:", response.data); // Add this line
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
export const fetchPopularCategories = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/popular-categories?period=week&limit=4"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    throw error;
  }
};
export const createCategory = async (formData, token) => {
  // Change parameter name to formData
  try {
    // Get the name from formData to validate
    const name = formData.get("name");
    if (!name || name.trim() === "") {
      throw new Error("Category name is required");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(
      `${API_URL}/categories`,
      formData, // Send the FormData directly
      config
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || "Failed to create category";
    console.error("Category creation error:", errorMsg, error.response?.data);
    throw new Error(errorMsg);
  }
};

export const updateCategory = async (categoryId, formData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/categories/${categoryId}`,
      formData,
      {
        ...getAuthConfig(token),
        headers: {
          ...getAuthConfig(token).headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteCategory = async (categoryId, token) => {
  try {
    const response = await axios.delete(
      `${API_URL}/categories/${categoryId}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Analytics
export const fetchStats = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/stats`, getAuthConfig(token));
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Cloudinary Upload
export const uploadImageToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    handleApiError(error);
  }
};
