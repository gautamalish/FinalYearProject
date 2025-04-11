import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const WorkerCategoryForm = () => {
  const { currentUser } = useAuth();
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await currentUser?.getIdToken();

        // Fetch all available categories
        const categoriesRes = await axios.get("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch worker's current categories
        const workerRes = await axios.get(`/api/users/${currentUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAvailableCategories(categoriesRes.data);
        setSelectedCategories(workerRes.data.categories || []);
      } catch (err) {
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.patch(
        `/api/users/${currentUser.uid}/categories`,
        { categories: selectedCategories },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Categories updated successfully!");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update categories");
      setSuccess(null);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Select Your Service Categories
      </h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-6">
          {availableCategories.map((category) => (
            <div key={category._id} className="flex items-center">
              <input
                type="checkbox"
                id={`cat-${category._id}`}
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryToggle(category._id)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor={`cat-${category._id}`} className="ml-2">
                {category.name}
              </label>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Save Categories
        </button>
      </form>
    </div>
  );
};

export default WorkerCategoryForm;
