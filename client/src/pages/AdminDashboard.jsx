import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaBriefcase,
  FaChartLine,
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchUsers,
  deleteUser,
  updateUserRole,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchStats,
  uploadImageToCloudinary,
} from "../services/admin";

const AdminDashboard = () => {
  const { currentUser, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    thumbnail: null,
    thumbnailPreview: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!currentUser) {
          navigate("/signin");
          return;
        }

        const token = await currentUser.getIdToken();

        // Load all data in parallel
        const [usersData, categoriesData, statsData] = await Promise.all([
          fetchUsers(token),
          fetchCategories(token),
          fetchStats(token),
        ]);

        setUsers(usersData);
        setCategories(categoriesData);
        setStats(statsData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, navigate]);

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        alert("Category name is required");
        return;
      }

      setLoading(true);
      const token = await currentUser.getIdToken();

      const categoryData = {
        name: newCategory.name,
        description: newCategory.description,
        thumbnail: newCategory.thumbnail, // This should be the File object
      };

      const createdCategory = await createCategory(categoryData, token);
      setCategories([...categories, createdCategory]);

      setNewCategory({
        name: "",
        description: "",
        thumbnail: null,
        thumbnailPreview: "",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      setError(error.message || "Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory.name.trim()) {
        alert("Category name is required");
        return;
      }

      setLoading(true);
      const token = await currentUser.getIdToken();

      let thumbnailUrl = editingCategory.thumbnail;
      if (editingCategory.newThumbnail) {
        thumbnailUrl = await uploadImageToCloudinary(
          editingCategory.newThumbnail
        );
      }

      const categoryData = {
        name: editingCategory.name,
        description: editingCategory.description,
        thumbnail: thumbnailUrl,
      };

      const updatedCategory = await updateCategory(
        editingCategory._id,
        categoryData,
        token
      );

      setCategories(
        categories.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        )
      );
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        await deleteCategory(categoryId, token);
        setCategories(categories.filter((cat) => cat._id !== categoryId));
      } catch (error) {
        console.error("Error deleting category:", error);
        setError("Failed to delete category. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        await deleteUser(userId, token);
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const updatedUser = await updateUserRole(userId, newRole, token);
      setUsers(
        users.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingCategory) {
          setEditingCategory({
            ...editingCategory,
            newThumbnail: file,
            thumbnailPreview: reader.result,
          });
        } else {
          setNewCategory({
            ...newCategory,
            thumbnail: file,
            thumbnailPreview: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditingCategory = (category) => {
    setEditingCategory({
      ...category,
      thumbnailPreview: category.thumbnail?.url || category.thumbnail,
      newThumbnail: null,
    });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditingUser(null);
  };

  if (loading && !stats) {
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

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

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
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <FaPlus /> Add Category
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) =>
                editingCategory?._id === category._id ? (
                  <div
                    key={category._id}
                    className="border rounded-lg overflow-hidden shadow-sm p-4 bg-gray-50"
                  >
                    <div className="h-40 bg-gray-200 overflow-hidden mb-4">
                      <img
                        src={
                          editingCategory.thumbnailPreview ||
                          editingCategory.thumbnail?.url ||
                          editingCategory.thumbnail ||
                          "https://via.placeholder.com/150"
                        }
                        alt={editingCategory.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editingCategory.description}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thumbnail
                        </label>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="w-full text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 bg-gray-300 rounded"
                        >
                          <FaTimes />
                        </button>
                        <button
                          onClick={handleUpdateCategory}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          {loading ? "Saving..." : <FaSave />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={category._id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={
                          category.thumbnail?.url ||
                          category.thumbnail ||
                          "https://via.placeholder.com/150"
                        }
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
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
                        <button
                          onClick={() => startEditingCategory(category)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
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
                )
              )}
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
                        {editingUser?._id === user._id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                role: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1"
                          >
                            <option value="admin">Admin</option>
                            <option value="worker">Worker</option>
                            <option value="client">Client</option>
                          </select>
                        ) : (
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
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingUser?._id === user._id ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateUserRole(user._id, editingUser.role)
                              }
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              {loading ? "Saving..." : <FaSave />}
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === "analytics" && stats && (
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
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-blue-500 mt-1">
                  +{stats.userGrowthPercentage}% from last month
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-lg font-medium text-green-800">
                  Categories
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalCategories}
                </p>
                <p className="text-sm text-green-500 mt-1">
                  +{stats.newCategoriesThisMonth} new this month
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="text-lg font-medium text-purple-800">Workers</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalWorkers}
                </p>
                <p className="text-sm text-purple-500 mt-1">
                  +{stats.newWorkersThisMonth} new signups
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {stats.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div
                      className={`p-3 rounded-full mr-3 ${
                        activity.type === "user"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {activity.type === "user" ? <FaUsers /> : <FaBriefcase />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
