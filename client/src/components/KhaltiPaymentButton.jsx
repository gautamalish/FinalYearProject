import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initiatePayment, verifyPayment } from '../services/payment';
import { FaMoneyBillWave, FaSpinner } from 'react-icons/fa';

/**
 * KhaltiPaymentButton component for processing payments via Khalti
 * @param {Object} props - Component props
 * @param {Object} props.job - Job object containing details about the job
 * @param {Function} props.onPaymentSuccess - Callback function to execute after successful payment
 */
const KhaltiPaymentButton = ({ job, onPaymentSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Khalti public key from environment variable
  const KHALTI_PUBLIC_KEY = import.meta.env.VITE_KHALTI_PUBLIC_KEY || '3020189a1caf49208f9e3c9aa3801b5e';

  // Function to initiate payment process
  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = await currentUser.getIdToken();
      const details = await initiatePayment(job._id, token);
      setPaymentDetails(details);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle payment via Khalti
  const handleKhaltiPayment = () => {
    if (!paymentDetails) return;
    
    // Convert amount to paisa (Khalti uses paisa)
    const amountInPaisa = paymentDetails.totalAmount * 100;
    
    // Load Khalti checkout script if not already loaded
    if (!window.KhaltiCheckout) {
      const script = document.createElement('script');
      script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.22.0.0.0/khalti-checkout.iffe.js';
      script.async = true;
      script.onload = () => initializeKhaltiCheckout(amountInPaisa);
      document.body.appendChild(script);
    } else {
      initializeKhaltiCheckout(amountInPaisa);
    }
  };

  // Initialize Khalti checkout
  const initializeKhaltiCheckout = (amountInPaisa) => {
    const config = {
      // replace this key with yours
      "publicKey": KHALTI_PUBLIC_KEY,
      "productIdentity": job._id,
      "productName": job.title,
      "productUrl": window.location.href,
      "eventHandler": {
        async onSuccess(payload) {
          // Handle successful payment
          try {
            setLoading(true);
            const token = await currentUser.getIdToken();
            const result = await verifyPayment(
              job._id,
              payload.token,
              payload.amount,
              token
            );
            
            // Close modal and notify parent component
            setShowPaymentModal(false);
            if (onPaymentSuccess) {
              onPaymentSuccess(result);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(err.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        onError(error) {
          console.error('Khalti payment error:', error);
          setError('Payment failed. Please try again.');
        },
        onClose() {
          console.log('Khalti payment widget closed');
        }
      },
      "amount": amountInPaisa
    };

    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ popUp: true });
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
              <span className="font-medium">Rs. {paymentDetails.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee (10%):</span>
              <span className="font-medium">Rs. {paymentDetails.serviceFee}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>Rs. {paymentDetails.totalAmount}</span>
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
              onClick={handleKhaltiPayment}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>Pay with Khalti</>
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
        disabled={loading || job.paymentStatus === 'paid'}
        className={`w-full px-4 py-3 rounded-md flex items-center justify-center transition-colors ${job.paymentStatus === 'paid' 
          ? 'bg-green-100 text-green-800 cursor-not-allowed' 
          : 'bg-purple-600 text-white hover:bg-purple-700'}`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Processing...
          </>
        ) : job.paymentStatus === 'paid' ? (
          <>Payment Completed</>
        ) : (
          <>
            <FaMoneyBillWave className="mr-2" />
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

export default KhaltiPaymentButton;