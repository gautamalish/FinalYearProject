import { useState, useEffect } from 'react';
import axios from 'axios';

const Professionals = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/workers');
        setWorkers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch professionals');
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Professionals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workers.map((worker) => (
          <div key={worker.firebaseUID} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-1 aspect-h-1">
              <img
                src={worker.profilePicture || '/fallback.png'}
                alt={`${worker.name}'s profile`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{worker.name}</h2>
              <p className="text-gray-600 mb-2">{worker.email}</p>
              <p className="text-gray-600 mb-4">{worker.phone}</p>
              <div className="mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400">
                    {'★'.repeat(Math.round(worker.rating))}
                    {'☆'.repeat(5 - Math.round(worker.rating))}
                  </span>
                  <span className="ml-2 text-gray-600">{worker.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Services:</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.categories.map((category) => (
                    <span
                      key={category._id}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Professionals;