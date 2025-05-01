import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaStar, FaUser, FaPhone } from 'react-icons/fa';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, mongoUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not a worker
    if (!currentUser || mongoUser?.role !== 'worker') {
      navigate('/');
      return;
    }

    const fetchWorkerJobs = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('/api/jobs/worker', {
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

    fetchWorkerJobs();
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

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.patch(`/api/jobs/${jobId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update the job status in the local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      console.error('Error updating job status:', err);
      setError(err.response?.data?.message || 'Failed to update job status');
    }
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">My Service Jobs</h1>
          <p className="text-gray-600">Manage your assigned jobs and update their status</p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-600 text-lg">You don't have any assigned jobs yet.</p>
            <p className="text-gray-500 mt-2">When clients hire you, their jobs will appear here.</p>
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
                    {job.title ? `Service request from ${job.clientName}` : 'Service Request'}
                  </h2>
                  
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <FaUser className="text-blue-500 mr-2" />
                      <span>Client: {job.clientName}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="text-blue-500 mr-2" />
                      <span>Phone: {job.clientPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-blue-500 mr-2" />
                      <span>{job.date}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-blue-500 mr-2" />
                      <span>{job.time}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => navigate(`/job-details/${job._id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>

                    {/* Status update buttons based on current status */}
                    {job.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateStatus(job._id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(job._id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {job.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(job._id, 'in_progress')}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Start Job
                      </button>
                    )}

                    {job.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(job._id, 'completed')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
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

export default WorkerDashboard;