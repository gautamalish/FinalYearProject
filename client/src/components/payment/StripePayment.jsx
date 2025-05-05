import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getPaymentDetails, createPaymentIntent, confirmPayment } from "../../services/payment";
import { FaCreditCard, FaSpinner } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";

/**
 * StripePaymentButton component for processing payments via Stripe
 * @param {Object} props - Component props
 * @param {Object} props.job - Job object containing details about the job
 * @param {Function} props.onPaymentSuccess - Callback function to execute after successful payment
 */
const StripePaymentButton = ({ job, onPaymentSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripe, setStripe] = useState(null);

  // Stripe public key from environment variable
  const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  // Load Stripe.js when component mounts
  useEffect(() => {
    const loadStripeJS = async () => {
      try {
        const stripeInstance = await loadStripe(STRIPE_PUBLIC_KEY);
        setStripe(stripeInstance);
      } catch (err) {
        console.error("Failed to load Stripe:", err);
        setError("Failed to load payment system. Please refresh the page.");
      }
    };

    if (STRIPE_PUBLIC_KEY) {
      loadStripeJS();
    } else {
      console.error("Stripe public key is not configured");
      setError("Payment system is not properly configured.");
    }
  }, [STRIPE_PUBLIC_KEY]);

  // Function to initiate payment process
  const handleInitiatePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();
      const details = await getPaymentDetails(job._id, token);
      setPaymentDetails(details);
      setShowPaymentModal(true);
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle payment via Stripe
  const handleStripePayment = async () => {
    if (!stripe || !paymentDetails) {
      setError("Payment system is not ready. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();

      // Create a payment intent with your backend
      const paymentIntentResponse = await createPaymentIntent(
        job._id,
        Math.round(paymentDetails.totalAmount * 100), // Convert to cents
        "inr", 
        token
      );

      const { clientSecret, paymentIntentId } = paymentIntentResponse;

      // Use Stripe Elements to collect payment method and confirm payment
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
        return_url: `${window.location.origin}/payment/success?jobId=${job._id}`,
      });

      if (error) {
        throw error;
      }

      // Payment successful, confirm with backend
      await confirmPayment(paymentIntentId, job._id, token);
      
      // Call the success callback
      if (onPaymentSuccess) {
        onPaymentSuccess({
          paymentIntentId,
          jobId: job._id,
          amount: paymentDetails.totalAmount
        });
      }

      // Close the modal
      setShowPaymentModal(false);
      
    } catch (err) {
      console.error("Stripe payment error:", err);
      setError(err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal || !paymentDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Job:</span>
              <span className="font-medium">{job.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Worker:</span>
              <span className="font-medium">{paymentDetails.workerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Amount:</span>
              <span className="font-medium">
                Rs {paymentDetails.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold">
            <span>Total Amount:</span>
            <span>Rs {paymentDetails.amount.toFixed(2)}</span>
            </div>

          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStripePayment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={loading || !stripe}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>Pay with Stripe</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={handleInitiatePayment}
        disabled={loading || job.paymentStatus === "paid"}
        className={`w-full px-4 py-3 rounded-md flex items-center justify-center transition-colors ${
          job.paymentStatus === "paid"
            ? "bg-green-100 text-green-800 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Processing...
          </>
        ) : job.paymentStatus === "paid" ? (
          <>Payment Completed</>
        ) : (
          <>
            <FaCreditCard className="mr-2" />
            Pay Now
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      <PaymentModal />
    </>
  );
};

export default StripePaymentButton;
