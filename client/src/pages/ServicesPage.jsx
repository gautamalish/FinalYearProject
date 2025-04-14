import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories } from '../services/admin';
import axios from 'axios';
import defaultImage from '../assets/gardener.jpg';
import { FaSearch, FaStar, FaArrowRight } from 'react-icons/fa';

const ServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'viewCount'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allCategories = await fetchCategories();
        if (!Array.isArray(allCategories)) {
          throw new Error('Categories data is not an array');
        }

        const transformedCategories = allCategories.map((category) => ({
          id: category._id,
          name: category.name,
          imageUrl: category.thumbnail?.url || defaultImage,
          viewCount: category.viewCount || 0,
          isPopular: category.popular || false,
        }));

        setCategories(transformedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Couldn\'t load categories. Please refresh to try again.');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCategories();
  }, []);

  const handleCategorySelection = async (categoryId, categoryName) => {
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await axios.post(
          `/api/categories/${categoryId}/view`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (trackingError) {
        console.error('View tracking failed:', trackingError);
      }
    }

    navigate(`/services/${categoryName.toLowerCase()}`, {
      state: { categoryId, categoryName },
    });
  };

  const filteredCategories = categories
    .filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.viewCount - a.viewCount;
    });

  if (isLoading) {
    return (
      <div className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Search and Filter Section */}
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Browse All Services
        </h1>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="viewCount">Sort by Popularity</option>
          </select>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelection(category.id, category.name)}
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="relative overflow-hidden h-48">
              <img
                src={category.imageUrl}
                alt={`${category.name} service`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                  {category.viewCount} views
                </span>
                {category.isPopular && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    Popular
                  </span>
                )}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                Browse professionals <FaArrowRight className="text-blue-500" />
              </p>
            </div>
          </button>
        ))}
      </section>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No services found matching your search.
          </p>
        </div>
      )}
    </main>
  );
};

export default ServicesPage;