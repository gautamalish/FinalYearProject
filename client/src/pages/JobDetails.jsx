import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaPhone, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import KhaltiPaymentButton from '../components/KhaltiPaymentButton';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser, mongoUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!currentUser || !jobId) {
        setError('Authentication or job information missing');
        setLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`http://localhost:3000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, currentUser]);

  const handleStatusUpdate = async (newStatus) => {
    if (!currentUser || !jobId) return;

    try {
      setUpdateStatus('updating');
      const token = await currentUser.getIdToken();
      await axios.patch(`/api/jobs/${jobId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setJob(prev => ({ ...prev, status: newStatus }));
      setUpdateStatus('success');
      
      // Reset status message after 3 seconds
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      console.error('Error updating job status:', err);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus(''), 3000);
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
          <div className="text-center text-red-600 mb-4">
            <FaTimesCircle className="mx-auto text-4xl mb-2" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-center">{error}</p>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
          <p className="text-center">Job not found</p>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle successful payment
  const handlePaymentSuccess = (result) => {
    setPaymentSuccess(true);
    // Update job data to reflect payment
    setJob(prev => ({ ...prev, paymentStatus: 'paid' }));
    // Show success message for 3 seconds
    setTimeout(() => setPaymentSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Status Banner */}
        <div className={`w-full p-3 text-white text-center ${getStatusColor(job.status)}`}>
          <p className="font-medium">Status: {formatStatus(job.status)}</p>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{job.title}</h1>
          
          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <FaUser className="text-blue-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{job.clientName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaPhone className="text-blue-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{job.clientPhone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FaCalendarAlt className="text-blue-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{job.date}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-blue-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{job.time}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Problem Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
          
          {/* Action Buttons - Only show for workers */}
          {mongoUser?.role === 'worker' && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
              
              {updateStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center">
                  <FaCheckCircle className="mr-2" />
                  <span>Job status updated successfully!</span>
                </div>
              )}
              
              {updateStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
                  <FaTimesCircle className="mr-2" />
                  <span>Failed to update job status. Please try again.</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                {job.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      disabled={updateStatus === 'updating'}
                    >
                      Accept Job
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={updateStatus === 'updating'}
                    >
                      Decline Job
                    </button>
                  </>
                )}
                
                {job.status === 'accepted' && (
                  <button
                    onClick={() => handleStatusUpdate('in_progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={updateStatus === 'updating'}
                  >
                    Start Job
                  </button>
                )}
                
                {job.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={updateStatus === 'updating'}
                  >
                    Mark as Completed
                  </button>
                )}
                
                {updateStatus === 'updating' && (
                  <span className="ml-3 text-gray-500 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    Updating...
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Payment Section - Only show for clients when job is completed and payment is pending */}
          {mongoUser?.role === 'client' && job.status === 'completed' && job.paymentStatus === 'pending' && (
            <div className="border-t pt-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
              
              {paymentSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center">
                  <FaCheckCircle className="mr-2" />
                  <span>Payment successful! Thank you for your payment.</span>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">Please complete the payment to finalize this job.</p>
                <p className="text-sm text-gray-600">A 10% service fee will be added to the total amount.</p>
              </div>

              <KhaltiPaymentButton job={job} onPaymentSuccess={handlePaymentSuccess} />
            </div>
          )}

          {/* Review Section - Only show for clients when job is completed */}
          {mongoUser?.role === 'client' && job.status === 'completed' && (
            <div className="border-t pt-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Rate & Review Service</h2>
              
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {reviewError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                        className="text-2xl focus:outline-none"
                      >
                        <FaStar
                          className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this service..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    required
                  />
                </div>

                <button
                  onClick={async () => {
                    try {
                      setIsSubmittingReview(true);
                      setReviewError('');
                      
                      const token = await currentUser.getIdToken();
                      await axios.post('http://localhost:3000/api/reviews/create',
                        {
                          jobId: job._id,
                          rating: review.rating,
                          comment: review.comment
                        },
                        { headers: { Authorization: `Bearer ${token}` }}
                      );

                      // Refresh job data to reflect the new review
                      const updatedJob = await axios.get(`/api/jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setJob(updatedJob.data);
                      
                      // Reset review form
                      setReview({ rating: 5, comment: '' });
                    } catch (err) {
                      console.error('Error submitting review:', err);
                      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
                    } finally {
                      setIsSubmittingReview(false);
                    }
                  }}
                  disabled={isSubmittingReview || !review.comment.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
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
  switch (status) {
    case 'pending': return 'Pending';
    case 'accepted': return 'Accepted';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

export default JobDetails;