import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import WorkerProfileModal from "../components/WorkerProfileModal";
import { FaEnvelope, FaPhone, FaStar, FaDollarSign, FaFilter } from "react-icons/fa";

const ProfessionalsPage = () => {
  const { currentUser } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxHourlyRate: 200,
    searchTerm: ""
  });
  
  // Rating and hourly rate options for select boxes
  const ratingOptions = [0, 1, 2, 3, 4, 5];
  const hourlyRateOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = await currentUser?.getIdToken();
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get('/api/workers', config);
        const workersData = Array.isArray(response?.data) ? response.data : [];
        setWorkers(workersData);
        setFilteredWorkers(workersData);
      } catch (err) {
        console.error("Fetch workers error:", err);
        setError(err.response?.data?.message || "Failed to load professionals");
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            All Service Professionals
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with skilled and trusted service providers in your area
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search professionals..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-full"
                value={filters.searchTerm}
                onChange={(e) => {
                  setFilters({ ...filters, searchTerm: e.target.value });
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = workers.filter(worker =>
                    (worker.name?.toLowerCase().includes(searchTerm) ||
                    worker.title?.toLowerCase().includes(searchTerm) ||
                    worker.bio?.toLowerCase().includes(searchTerm) ||
                    worker.categories?.some(category => category.name.toLowerCase().includes(searchTerm))) &&
                    worker.rating >= filters.minRating &&
                    worker.hourlyRate <= filters.maxHourlyRate
                  );
                  setFilteredWorkers(filtered);
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 flex items-center justify-center rounded-lg transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Rating
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={filters.minRating}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      setFilters({ ...filters, minRating: newValue });
                      const filtered = workers.filter(worker =>
                        worker.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
                        worker.rating >= newValue &&
                        worker.hourlyRate <= filters.maxHourlyRate
                      );
                      setFilteredWorkers(filtered);
                    }}
                  >
                    {ratingOptions.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating === 0 ? 'Any Rating' : `${rating} Stars or higher`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Hourly Rate (RM)
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={filters.maxHourlyRate}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setFilters({ ...filters, maxHourlyRate: newValue });
                      const filtered = workers.filter(worker =>
                        worker.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
                        worker.rating >= filters.minRating &&
                        worker.hourlyRate <= newValue
                      );
                      setFilteredWorkers(filtered);
                    }}
                  >
                    {hourlyRateOptions.map((rate) => (
                      <option key={rate} value={rate}>
                        RS {rate} or less
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <div
              key={worker._id || worker.id}
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
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-gray-700 font-medium">
                        {worker.rating ? `${worker.rating.toFixed(1)} / 5.0` : "No ratings yet"}
                      </span>
                    </div>
                    <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                      <span className="text-gray-700 font-medium">
                        {worker.hourlyRate ? `RS ${worker.hourlyRate}/hr` : "Rate not set"}
                      </span>
                    </div>
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
                      {worker.categories.map((category) => (
                        <span
                          key={category._id}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          {category.name}
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
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No professionals available at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Worker Profile Modal */}
      <WorkerProfileModal 
        worker={selectedWorker} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default ProfessionalsPage;