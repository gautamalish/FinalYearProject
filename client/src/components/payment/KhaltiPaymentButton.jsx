import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { initiatePayment, verifyPayment } from '../../services/payment';
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

  // Khalti public key from environment variable (using test key for sandbox)
  // For test mode, we need to use the test key provided by Khalti
  // The key format should be like "test_public_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  // Using a valid test key format for Khalti sandbox
  // Note: This is a valid test public key format for Khalti sandbox
  // Get Khalti public key from environment variable
  const KHALTI_PUBLIC_KEY = import.meta.env.VITE_KHALTI_PUBLIC_KEY;
  
  // Use Khalti sandbox for testing
  const IS_SANDBOX = true;
  
  // Log the configured key for debugging
  useEffect(() => {
    console.log('Configured Khalti public key:', KHALTI_PUBLIC_KEY);
  }, []);

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
    const amountInPaisa = Math.round(paymentDetails.totalAmount * 100);
    
    console.log('Payment amount in paisa:', amountInPaisa);
    console.log('Using Khalti public key:', KHALTI_PUBLIC_KEY);
    
    // Load Khalti checkout script if not already loaded
    if (!window.KhaltiCheckout) {
      const script = document.createElement('script');
      // Use the correct script for Khalti checkout
      script.src = 'https://khalti.com/static/khalti-checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Khalti script loaded successfully');
        initializeKhaltiCheckout(amountInPaisa);
      };
      script.onerror = (error) => {
        console.error('Failed to load Khalti script:', error);
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
      };
      try {
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error appending Khalti script to document:', error);
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
      } finally {
        // Ensure loading state is reset if script fails to load
        if (!window.KhaltiCheckout) {
          setLoading(false);
        }
      }
    } else {
      initializeKhaltiCheckout(amountInPaisa);
    }
  };

  // Initialize Khalti checkout
  const initializeKhaltiCheckout = (amountInPaisa) => {
    try {
      if (!KHALTI_PUBLIC_KEY) {
        setError('Payment gateway configuration error - missing public key');
        console.error('Khalti public key is undefined');
        return;
      }
    
      if (!KHALTI_PUBLIC_KEY.startsWith('test_public_key_') && 
          !KHALTI_PUBLIC_KEY.startsWith('live_public_key_')) {
        setError('Invalid payment gateway configuration');
        console.error('Invalid Khalti key format:', KHALTI_PUBLIC_KEY);
        return;
      }
      // Log the amount in paisa for debugging
      console.log('Payment amount in paisa:', amountInPaisa);
      console.log('Using Khalti public key:', KHALTI_PUBLIC_KEY);
      
      // Make sure amount is an integer
      const amount = Math.round(amountInPaisa);
      const config = {
        // Merchant configuration - key must be in correct format
        "publicKey": KHALTI_PUBLIC_KEY,
        "productIdentity": job._id.toString(),
        "productName": job.title || 'Service Payment',
        "productUrl": window.location.href,
        // Amount in paisa (Khalti requirement)
        "amount": amount,
        // Enable test mode for sandbox testing
        "testMode": true,
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
          // Provide more detailed error information for debugging
          setError(`Payment failed: ${error.message || JSON.stringify(error) || 'Unknown error'}. Please try again.`);
        },
        onClose() {
          console.log('Khalti payment widget closed');
        }
      }
    };

      const checkout = new window.KhaltiCheckout(config);
      checkout.show({ popUp: true });
    } catch (error) {
      console.error('Error initializing Khalti checkout:', error);
      setError('Failed to initialize payment gateway. Please try again.');
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