import axios from "axios";

const API_URL = "http://localhost:3000/api/admin";

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// User Management
export const fetchUsers = async (token) => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeader(token));
  return response.data;
};

export const deleteUser = async (userId, token) => {
  await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader(token));
};

export const updateUserRole = async (userId, role, token) => {
  const response = await axios.patch(
    `${API_URL}/users/${userId}/role`,
    { role },
    getAuthHeader(token)
  );
  return response.data;
};

// Category Management
export const fetchCategories = async (token) => {
  const response = await axios.get(
    `${API_URL}/categories`,
    getAuthHeader(token)
  );
  return response.data;
};

export const createCategory = async (categoryData, token) => {
  const formData = new FormData();
  formData.append("name", categoryData.name);
  formData.append("description", categoryData.description);

  if (categoryData.thumbnail instanceof File) {
    formData.append("thumbnail", categoryData.thumbnail);
  }

  const response = await axios.post(`${API_URL}/categories`, formData, {
    headers: {
      ...getAuthHeader(token),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update your updateCategory function
export const updateCategory = async (categoryId, categoryData, token) => {
  const formData = new FormData();
  formData.append("name", categoryData.name);
  formData.append("description", categoryData.description);

  if (categoryData.thumbnail instanceof File) {
    formData.append("thumbnail", categoryData.thumbnail);
  }

  const response = await axios.put(
    `${API_URL}/categories/${categoryId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const deleteCategory = async (categoryId, token) => {
  const response = await axios.delete(
    `${API_URL}/categories/${categoryId}`,
    getAuthHeader(token)
  );
  return response.data;
};

// Analytics
export const fetchStats = async (token) => {
  const response = await axios.get(`${API_URL}/stats`, getAuthHeader(token));
  return response.data;
};

// Cloudinary Upload
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "image_upload"); // Replace with your upload preset

  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/dcyvr82e0/image/upload", // Replace with your cloud name
    formData
  );
  return response.data.secure_url;
};
