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
  const [paymentDetails, setPaymentDetails] = useState(null);
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

    const fetchJobAndPaymentDetails = async () => {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        
        // Fetch both job details and payment details in parallel
        const [jobResponse, paymentDetails] = await Promise.all([
          axios.get(`/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getPaymentDetails(jobId, token)
        ]);

        setJob(jobResponse.data);
        setPaymentDetails(paymentDetails);

        // Redirect if job is not completed or already paid
        if (
          jobResponse.data.status !== "completed" ||
          jobResponse.data.paymentStatus !== "pending"
        ) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        setError(err.response?.data?.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndPaymentDetails();
  }, [currentUser, mongoUser, jobId, navigate]);

  const handlePayment = async () => {
    if (!stripe || !job || !paymentDetails) return;

    setProcessingPayment(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();

      // Create payment intent with the exact amount from paymentDetails
      const paymentIntentResponse = await createPaymentIntent(
        job._id,
        Math.round(paymentDetails.amount * 100), // Using paymentDetails.amount instead of totalAmount
        "inr",
        token
      );

      const { clientSecret, paymentIntentId } = paymentIntentResponse;

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // Test token
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

      // Confirm payment with backend
      await confirmPayment(paymentIntentId, job._id, token);

      setPaymentSuccess(true);
      setJob((prev) => ({ ...prev, paymentStatus: "paid" }));

      setTimeout(() => {
        navigate("/dashboard");
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

  if (!job || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
          <div className="text-center text-gray-600">
            <p>Job details not found</p>
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
        {paymentSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">
              Payment completed successfully. Redirecting to dashboard...
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Payment for Service</h1>
          </div>

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
                    Total Amount: Rs. {paymentDetails.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Complete Your Payment
              </h3>
              <p className="text-gray-600 mb-6">
                Please complete the payment to finalize this service.
              </p>

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