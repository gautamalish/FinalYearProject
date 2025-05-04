import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:3000/api';

// API endpoints
const PAYMENT_ENDPOINT = `${API_URL}/payments`;

// Helper function to get auth config with token
const getAuthConfig = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Error handling function
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new Error(data.message || `Request failed with status ${status}`);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('No response from server - please try again');
  } else {
    // Something happened in setting up the request
    throw new Error(`Request setup error: ${error.message}`);
  }
};

/**
 * Gets payment details for a job
 * @param {string} jobId - The ID of the job to pay for
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment details including amount and service fee
 */
export const getPaymentDetails = async (jobId, token) => {
  try {
    const response = await axios.get(
      `${PAYMENT_ENDPOINT}/details/${jobId}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Creates a payment intent with Stripe
 * @param {string} jobId - The ID of the job to pay for
 * @param {number} amount - Payment amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment intent details including client secret
 */
export const createPaymentIntent = async (jobId, amount, currency = 'usd', token) => {
  try {
    const response = await axios.post(
      `${PAYMENT_ENDPOINT}/create-payment-intent`,
      { jobId, amount, currency },
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Confirms a successful payment with Stripe
 * @param {string} paymentIntentId - The ID of the Stripe payment intent
 * @param {string} jobId - The ID of the job being paid for
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment confirmation result
 */
export const confirmPayment = async (paymentIntentId, jobId, token) => {
  try {
    const response = await axios.post(
      `${PAYMENT_ENDPOINT}/confirm-payment`,
      { paymentIntentId, jobId },
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    console.error('Payment confirmation error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    handleApiError(error);
  }
};

/**
 * Gets payment history for the current user
 * @param {string} token - Firebase auth token
 * @returns {Promise<Array>} List of payment transactions
 */
export const getPaymentHistory = async (token) => {
  try {
    const response = await axios.get(
      `${PAYMENT_ENDPOINT}/history`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Gets details for a specific payment by ID
 * @param {string} paymentId - The ID of the payment
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentById = async (paymentId, token) => {
  try {
    const response = await axios.get(
      `${PAYMENT_ENDPOINT}/${paymentId}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};