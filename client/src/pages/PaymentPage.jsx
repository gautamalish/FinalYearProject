import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { createPaymentIntent, confirmPayment, getPaymentDetails } from "../services/payment";
import { loadStripe } from "@stripe/stripe-js";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaDollarSign,
  FaCreditCard,
  FaSpinner,
} from "react-icons/fa";

const PaymentPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser, mongoUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load Stripe when component mounts
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(
          import.meta.env.VITE_STRIPE_PUBLIC_KEY
        );
        setStripe(stripeInstance);
      } catch (err) {
        console.error("Failed to load Stripe:", err);
        setError("Failed to initialize payment system");
      }
    };

    initializeStripe();
  }, []);

  useEffect(() => {
    // Redirect if not logged in or not a client
    if (!currentUser || mongoUser?.role !== "client") {
      navigate("/");
      return;
    }

    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        const response = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJob(response.data);

        // Redirect if job is not completed or already paid
        if (
          response.data.status !== "completed" ||
          response.data.paymentStatus !== "pending"
        ) {
          navigate("/client-dashboard");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [currentUser, mongoUser, jobId, navigate]);

  const handlePayment = async () => {
    if (!stripe || !job) return;

    setProcessingPayment(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();

      // Get payment details first
      const paymentDetails = await getPaymentDetails(job._id, token);
      
      // Step 1: Create payment intent on your backend
      const paymentIntentResponse = await createPaymentIntent(
        job._id,
        Math.round(paymentDetails.totalAmount * 100), // Convert to cents
        "usd", // or your preferred currency
        token
      );

      const { clientSecret, paymentIntentId } = paymentIntentResponse;

      // Step 2: Use Stripe Elements to collect payment method and confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // Use a test token for development
          },
          billing_details: {
            name: currentUser.displayName || 'Customer',
            email: currentUser.email,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Step 3: Confirm the payment with our backend
      await confirmPayment(paymentIntentId, job._id, token);

      // If we get here, payment was successful
      setPaymentSuccess(true);
      setJob((prev) => ({ ...prev, paymentStatus: "paid" }));

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/client-dashboard");
      }, 3000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed");
    } finally {
      setProcessingPayment(false);
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
            <button
              onClick={() => navigate("/client-dashboard")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
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
          <div className="text-center text-gray-600">
            <p>Job not found</p>
            <button
              onClick={() => navigate("/client-dashboard")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/client-dashboard")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        {/* Payment success message */}
        {paymentSuccess && (
          <div
            className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">
              {" "}
              Payment completed successfully. Redirecting to dashboard...
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Payment for Service</h1>
          </div>

          {/* Job details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {job.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaUser className="text-blue-500 mr-2" />
                  <span>Worker: {job.worker?.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="text-blue-500 mr-2" />
                  <span>Location: {job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  <span>Date: {job.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaClock className="text-blue-500 mr-2" />
                  <span>Time: {job.time}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaDollarSign className="text-blue-500 mr-2" />
                  <span>Hourly Rate: Rs. {job.hourlyRate}</span>
                </div>
                {job.duration && (
                  <div className="flex items-center text-gray-600">
                    <FaClock className="text-blue-500 mr-2" />
                    <span>Duration: {job.duration} hour(s)</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600 font-semibold">
                  <FaDollarSign className="text-blue-500 mr-2" />
                  <span>
                    Total Amount: Rs.{" "}
                    {job.totalAmount || job.hourlyRate * (job.duration || 1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Complete Your Payment
              </h3>
              <p className="text-gray-600 mb-6">
                Please complete the payment to finalize this service. The
                payment will be securely processed through Stripe.
              </p>

              {/* Payment button */}
              <div className="mt-4">
                <button
                  onClick={handlePayment}
                  disabled={processingPayment || paymentSuccess || !stripe}
                  className={`w-full px-4 py-3 rounded-md flex items-center justify-center transition-colors ${
                    paymentSuccess
                      ? "bg-green-100 text-green-800 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : paymentSuccess ? (
                    "Payment Completed"
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Pay with Stripe
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
