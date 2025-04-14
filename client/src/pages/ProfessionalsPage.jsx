import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const ProfessionalsPage = () => {
  const { currentUser } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = await currentUser?.getIdToken();
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get('/api/workers', config);
        setWorkers(Array.isArray(response?.data) ? response.data : []);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Service Professionals</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.length > 0 ? (
          workers.map((worker) => (
            <div
              key={worker._id || worker.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={worker.profilePicture || "/fallback.png"}
                  alt={worker.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "/fallback.png";
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {worker.name || "Unknown Professional"}
                  </h2>
                  <p className="text-gray-600">{worker.title || "Service Professional"}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">
                      {worker.rating ? `${worker.rating.toFixed(1)} / 5.0` : "No ratings yet"}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {worker.bio || "No bio available"}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {worker.email || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {worker.phone || "Not provided"}
                </p>
                {worker.categories && worker.categories.length > 0 && (
                  <div>
                    <span className="font-medium">Services:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {worker.categories.map((category) => (
                        <span
                          key={category._id}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
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
                onClick={() => window.location.href = `/worker/${worker._id}`}
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
    </div>
  );
};

export default ProfessionalsPage;