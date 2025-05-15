import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentDetails,
} from "../services/payment";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
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
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!currentUser || mongoUser?.role !== "client") {
      navigate("/");
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();

        const [jobResponse, paymentDetails] = await Promise.all([
          axios.get(`/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getPaymentDetails(jobId, token),
        ]);

        setJob(jobResponse.data);
        setPaymentDetails(paymentDetails);

        if (
          jobResponse.data.status !== "completed" ||
          jobResponse.data.paymentStatus !== "pending"
        ) {
          navigate("/dashboard");
          return;
        }

        // Create Stripe PaymentIntent
        const paymentIntentResponse = await createPaymentIntent(
          jobId,
          Math.round(paymentDetails.amount * 100),
          "inr",
          token
        );

        setClientSecret(paymentIntentResponse.clientSecret);
      } catch (err) {
        console.error("Error loading payment page:", err);
        setError(
          err.response?.data?.message || "Failed to load payment details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [currentUser, mongoUser, jobId, navigate]);

  const handlePayment = async () => {
    setProcessingPayment(true);
    setError("");

    if (!stripe || !elements) {
      setError("Stripe not initialized");
      setProcessingPayment(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const token = await currentUser.getIdToken();

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: currentUser.displayName || "Customer",
              email: currentUser.email,
            },
          },
        }
      );

      if (error) {
        throw error;
      }

      await confirmPayment(paymentIntent.id, job._id, token);

      setPaymentSuccess(true);
      setJob((prev) => ({ ...prev, paymentStatus: "paid" }));

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <p className="text-red-600 text-center">{error}</p>
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {paymentSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Payment completed. Redirecting...
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4 text-2xl font-semibold">
            Payment for Service
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{job.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-gray-600 flex items-center">
                  <FaUser className="text-blue-500 mr-2" />
                  Worker: {job.worker?.name}
                </div>
                <div className="text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="text-blue-500 mr-2" />
                  Location: {job.location}
                </div>
                <div className="text-gray-600 flex items-center">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  Date: {job.date}
                </div>
                <div className="text-gray-600 flex items-center">
                  <FaClock className="text-blue-500 mr-2" />
                  Time: {job.time}
                </div>
              </div>
              <div>
                <div className="text-gray-600 flex items-center">
                  <FaDollarSign className="text-blue-500 mr-2" />
                  Hourly Rate: Rs{job.hourlyRate}
                </div>
                <div className="text-gray-600 flex items-center">
                  <FaClock className="text-blue-500 mr-2" />
                  Duration: {job.duration} hour(s)
                </div>
                <div className="text-gray-800 font-bold flex items-center">
                  <FaDollarSign className="text-blue-500 mr-2" />
                  Total: Rs{paymentDetails.amount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Enter Payment Details
              </h3>

              <div className="border p-4 rounded-md mb-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#c23d4b",
                      },
                    },
                  }}
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={processingPayment || paymentSuccess}
                className={`w-full flex justify-center items-center px-4 py-3 rounded-md transition ${
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
                    Pay Now
                  </>
                )}
              </button>

              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
