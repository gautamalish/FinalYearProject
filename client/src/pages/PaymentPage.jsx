import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaDollarSign, FaUser, FaCalendarAlt, FaClock } from 'react-icons/fa';
import KhaltiCheckout from 'khalti-checkout-web';

const PaymentPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Redirect if job is not completed or payment is not pending
        if (response.data.status !== 'completed' || response.data.paymentStatus !== 'pending') {
          navigate('/dashboard');
          return;
        }

        // Calculate duration and total amount
        const startTime = new Date(response.data.startTime);
        const endTime = new Date(response.data.endTime);
        const totalDurationHours = (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours
        const hourlyRate = response.data.hourlyRate || 0;
        
        // Calculate total amount using the same method as server
        const totalAmount = hourlyRate * parseFloat(totalDurationHours.toFixed(2));

        // Calculate duration in hours and minutes for display
        const durationMinutes = Math.round(totalDurationHours * 60); // Convert hours to minutes
        const displayHours = Math.floor(durationMinutes / 60);
        const remainingMinutes = durationMinutes % 60;
        const durationDisplay = displayHours > 0 
          ? `${displayHours} hour${displayHours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''}` 
          : `${remainingMinutes} minutes`;

        setJob({
          ...response.data,
          duration: durationDisplay,
          durationMinutes,
          totalAmount: totalAmount
        });
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, currentUser, navigate]);

  const handlePayment = async () => {
    if (!job || processing) return;

    try {
      setProcessing(true);
      setError('');

      // Calculate total amount (amount in paisa - Khalti requirement)
      const amountInPaisa = Math.round(job.totalAmount * 100);

      // Configure Khalti
      let config = {
        publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY,
        productIdentity: jobId,
        productName: job.title || 'Service Payment',
        productUrl: window.location.href,
        eventHandler: {
          onSuccess: async (payload) => {
            try {
              // Verify payment with our backend
              const token = await currentUser.getIdToken();
              await axios.post(`/api/payments/verify/${jobId}`, {
                token: payload.token,
                amount: amountInPaisa
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });

              setPaymentSuccess(true);
              
              // Redirect to dashboard after 3 seconds
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
            } catch (error) {
              console.error('Payment verification error:', error);
              setError('Payment verification failed. Please contact support.');
              setProcessing(false);
            }
          },
          onError: (error) => {
            console.error('Khalti payment error:', error);
            setError('Payment failed. Please try again.');
            setProcessing(false);
          },
          onClose: () => {
            setProcessing(false);
          }
        },
        amount: amountInPaisa
      };

      const checkout = new KhaltiCheckout(config);
      checkout.show({ popUp: false });

    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.response?.data?.message || 'Payment processing failed');
      setProcessing(false);
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

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <div className="rounded-full bg-green-100 p-4 mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. You will be redirected to your dashboard shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-4 py-5 text-white text-center">
            <h1 className="text-2xl font-bold">Payment Details</h1>
          </div>

          <div className="p-6">
            {job && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaUser className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Service Provider</span>
                  </div>
                  <span className="font-semibold">{job.worker?.name}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Service Date</span>
                  </div>
                  <span className="font-semibold">{job.date}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaClock className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Service Time</span>
                  </div>
                  <span className="font-semibold">{job.time}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaDollarSign className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Hourly Rate</span>
                  </div>
                  <span className="font-semibold">Rs. {job.hourlyRate}/hr</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaClock className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Duration</span>
                  </div>
                  <span className="font-semibold">{job.duration}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaDollarSign className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Total Amount</span>
                  </div>
                  <span className="font-semibold text-lg text-blue-600">
                    Rs. {job.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaDollarSign className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Amount to Pay</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">Rs. {job.totalAmount}</span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full px-6 py-3 text-white rounded-lg flex items-center justify-center space-x-2 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <FaDollarSign className="text-xl" />
                  <span className="text-lg font-semibold">
                    {processing ? 'Processing...' : 'Pay Now'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;