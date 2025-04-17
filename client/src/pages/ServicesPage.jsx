import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories } from '../services/admin';
import axios from 'axios';
import defaultImage from '../assets/gardener.jpg';
import { FaSearch, FaStar, FaArrowRight, FaEnvelope, FaPhone } from 'react-icons/fa';
import WorkerProfileModal from '../components/WorkerProfileModal';

const ServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { category } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [categoriesResponse, workersResponse] = await Promise.all([
          fetchCategories(),
          axios.get('/api/workers')
        ]);

        if (!Array.isArray(categoriesResponse)) {
          throw new Error('Categories data is not an array');
        }

        const transformedCategories = categoriesResponse.map((cat) => ({
          id: cat._id,
          name: cat.name,
          imageUrl: cat.thumbnail?.url || defaultImage,
          viewCount: cat.viewCount || 0,
          isPopular: cat.popular || false,
        }));

        setCategories(transformedCategories);
        setWorkers(Array.isArray(workersResponse?.data) ? workersResponse.data : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Couldn\'t load data. Please refresh to try again.');
        setCategories([]);
        setWorkers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const filteredItems = category 
    ? workers.filter(worker => 
        worker.categories?.some(cat => 
          cat.name.toLowerCase() === category.toLowerCase()) &&
        (worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         worker.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return b.viewCount - a.viewCount;
      });

  if (isLoading) {
    return (
      <div className="max-w-[100rem] mx-auto mt-8 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="animate-fade-in">
          <div className="mb-8">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-full md:w-auto h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
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
      <section className="mb-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            {category ? 'Available Professionals' : 'Browse All Services'}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto animate-fade-in delay-100">
            {category ? `Find the perfect ${category} professional for your needs` : 'Find the perfect service professional for your needs'}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto">
          <div className={`relative w-full md:w-2/3 transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300">
              <FaSearch className={`${isSearchFocused ? 'text-blue-500' : ''}`} />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md cursor-pointer text-gray-700"
          >
            <option value="name">Sort by Name</option>
            <option value="viewCount">Sort by Popularity</option>
          </select>
        </div>
      </section>

      {/* Grid Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {category ? (
          // Display Workers for Selected Category
          filteredItems.map((worker) => (
            <div
              key={worker._id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-6 border border-gray-100"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={worker.profilePicture || "/fallback.png"}
                  alt={worker.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100 shadow-lg"
                  onError={(e) => {
                    e.target.src = "/fallback.png";
                  }}
                />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                    {worker.name || "Unknown Professional"}
                  </h2>
                  <p className="text-blue-600 font-medium mb-2">{worker.title || "Service Professional"}</p>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full w-fit">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-gray-700 font-medium">
                      {worker.rating ? `${worker.rating.toFixed(1)} / 5.0` : "No ratings yet"}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-3 mt-4 italic">
                "{worker.bio || "No bio available"}"
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                  <FaEnvelope className="mr-2 text-blue-500" />
                  <span>{worker.email || "Not provided"}</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                  <FaPhone className="mr-2 text-blue-500" />
                  <span>{worker.phone || "Not provided"}</span>
                </div>
                {worker.categories && worker.categories.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center mb-2">
                      <FaStar className="text-blue-500 mr-2" />
                      <span className="font-medium text-gray-800">Specializations</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {worker.categories.map((cat) => (
                        <span
                          key={cat._id}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => {
                  setSelectedWorker(worker);
                  setIsModalOpen(true);
                }}
              >
                View Full Profile
              </button>
            </div>
          ))
        ) : (
          // Display Categories
          filteredItems.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelection(category.id, category.name)}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 text-left focus:outline-none focus:ring-4 focus:ring-blue-100 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
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
          ))
        )}
      </section>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {category ? "No professionals found for this category." : "No services found matching your search."}
          </p>
        </div>
      )}

      {/* Worker Profile Modal */}
      <WorkerProfileModal 
        worker={selectedWorker} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
};

export default ServicesPage;