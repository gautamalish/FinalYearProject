import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaStar, FaDollarSign } from 'react-icons/fa';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, mongoUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not a client
    if (!currentUser || mongoUser?.role !== 'client') {
      navigate('/');
      return;
    }

    const fetchJobs = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('/api/jobs/client', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(response.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.response?.data?.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentUser, mongoUser, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">My Service Requests</h1>
          <p className="text-gray-600">Manage your service requests and reviews</p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-600 text-lg">You haven't made any service requests yet.</p>
            <button
              onClick={() => navigate('/professionals')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Find a Professional
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className={`${getStatusColor(job.status)} px-4 py-2 text-white text-center`}>
                  {formatStatus(job.status)}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {job.worker ? `Service request to ${job.worker.name}` : 'Service Request'}
                  </h2>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-blue-500 mr-2" />
                      {job.date}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-blue-500 mr-2" />
                      {job.time}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => navigate(`/job-details/${job._id}`)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>

                      {job.status === 'completed' && job.paymentStatus === 'pending' && (
                        <button
                          onClick={() => navigate(`/payment/${job._id}`)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <FaDollarSign className="mr-2" />
                          Pay Now (Rs. {job.totalAmount})
                        </button>
                      )}
                    </div>

                    {job.status === 'completed' && !job.review && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          <FaStar className="inline text-yellow-400 mr-1" />
                          Don't forget to leave a review!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;