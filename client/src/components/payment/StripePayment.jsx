import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPaymentDetails,
  createPaymentIntent,
  confirmPayment,
} from "../../services/payment";
import { FaCreditCard, FaSpinner } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Stripe public key from environment variable
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Stripe Elements Wrapper
const StripePaymentWrapper = ({
  job,
  paymentDetails,
  clientSecret,
  onClose,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setProcessing(true);
    setError("");

    if (!stripe || !elements) {
      setError("Stripe has not loaded.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const token = await currentUser.getIdToken();

    try {
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

      if (error) throw error;

      await confirmPayment(paymentIntent.id, job._id, token);
      onSuccess(paymentIntent.id);
      onClose();
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Payment Details</h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Job:</span>
            <span>{job.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Worker:</span>
            <span>{paymentDetails.workerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span>Rs{paymentDetails.amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="border p-3 rounded mb-4">
          <CardElement />
        </div>

        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 border px-4 py-2 rounded hover:bg-gray-100"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </div>
            ) : (
              <>Pay Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StripePaymentButton = ({ job, onPaymentSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [showModal, setShowModal] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();
      const details = await getPaymentDetails(job._id, token);
      setPaymentDetails(details);

      const paymentIntent = await createPaymentIntent(
        job._id,
        Math.round(details.amount * 100),
        "inr",
        token
      );

      setClientSecret(paymentIntent.clientSecret);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSuccess = (paymentIntentId) => {
    if (onPaymentSuccess) {
      onPaymentSuccess({
        paymentIntentId,
        jobId: job._id,
        amount: paymentDetails.amount,
      });
    }
  };

  return (
    <>
      <button
        onClick={initiatePayment}
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

      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}

      {showModal && stripePromise && clientSecret && (
        <Elements stripe={stripePromise}>
          <StripePaymentWrapper
            job={job}
            paymentDetails={paymentDetails}
            clientSecret={clientSecret}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </Elements>
      )}
    </>
  );
};

export default StripePaymentButton;
