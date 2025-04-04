import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaBriefcase,
  FaChartLine,
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase-config";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const { currentUser, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    thumbnail: null,
    thumbnailPreview: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!currentUser) {
          navigate("/signin");
          return;
        }

        // You can still use token if needed for future authenticated API calls
        await currentUser.getIdToken();

        // Mock API calls for now
        setUsers([
          {
            _id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "client",
            joinDate: "2023-05-15",
          },
          {
            _id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "worker",
            joinDate: "2023-06-20",
          },
        ]);

        setCategories([
          {
            _id: "1",
            name: "Electrical",
            description:
              "All electrical services including wiring, repairs, and installations",
            thumbnail:
              "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          },
          {
            _id: "2",
            name: "Plumbing",
            description: "Plumbing and pipe services for homes and businesses",
            thumbnail:
              "https://images.unsplash.com/photo-1600881335729-25e196a553f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          },
        ]);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        alert("Category name is required");
        return;
      }

      // In a real app, you would upload to Cloudinary here
      // let thumbnailUrl = "";
      // if (newCategory.thumbnail) {
      //   const formData = new FormData();
      //   formData.append("file", newCategory.thumbnail);
      //   formData.append("upload_preset", "your_upload_preset");

      //   const uploadRes = await axios.post(
      //     "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
      //     formData
      //   );
      //   thumbnailUrl = uploadRes.data.secure_url;
      // }

      // For demo purposes, we'll just use the preview URL
      const thumbnailUrl =
        newCategory.thumbnailPreview || "https://via.placeholder.com/150";

      const categoryData = {
        name: newCategory.name,
        description: newCategory.description,
        thumbnail: thumbnailUrl,
      };

      setCategories([
        ...categories,
        { ...categoryData, _id: Date.now().toString() },
      ]);

      setNewCategory({
        name: "",
        description: "",
        thumbnail: null,
        thumbnailPreview: "",
      });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategory({
          ...newCategory,
          thumbnail: file,
          thumbnailPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user._id !== userId));
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((cat) => cat._id !== categoryId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <button
            onClick={logOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaBriefcase /> Categories
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaUsers /> Users
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaChartLine /> Analytics
          </button>
        </div>

        {/* Categories Management */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBriefcase /> Category Management
            </h2>

            {/* Add New Category Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FaPlus /> Add New Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Electrical, Plumbing, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the category"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                      <FaImage className="inline mr-1" />
                      Upload Image
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {newCategory.thumbnailPreview && (
                      <img
                        src={newCategory.thumbnailPreview}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <FaPlus /> Add Category
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={category.thumbnail}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {category.description}
                    </p>
                    <div className="flex justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-2">
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUsers /> User Management
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "worker"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine /> System Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {users.length}
                </p>
                <p className="text-sm text-blue-500 mt-1">
                  +5.2% from last month
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-lg font-medium text-green-800">
                  Categories
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {categories.length}
                </p>
                <p className="text-sm text-green-500 mt-1">+2 new this month</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="text-lg font-medium text-purple-800">Workers</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter((user) => user.role === "worker").length}
                </p>
                <p className="text-sm text-purple-500 mt-1">+3 new signups</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-3">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      New worker registered - Jane Smith
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-3">
                    <FaBriefcase className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      New category added - Plumbing
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-full mr-3">
                    <FaUsers className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      New client registered - John Doe
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
