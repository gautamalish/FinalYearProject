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
 * Initiates a payment for a completed job
 * @param {string} jobId - The ID of the job to pay for
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment details including amount and service fee
 */
export const initiatePayment = async (jobId, token) => {
  try {
    const response = await axios.get(
      `${PAYMENT_ENDPOINT}/initiate/${jobId}`,
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Verifies a payment with Khalti
 * @param {string} jobId - The ID of the job being paid for
 * @param {string} khaltiToken - Token received from Khalti after payment
 * @param {number} amount - Payment amount in paisa (Khalti uses paisa)
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment verification result
 */
export const verifyPayment = async (jobId, khaltiToken, amount, token) => {
  try {
    const response = await axios.post(
      `${PAYMENT_ENDPOINT}/verify`,
      {
        jobId,
        token: khaltiToken,
        amount
      },
      getAuthConfig(token)
    );
    return response.data;
  } catch (error) {
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
 * Gets details for a specific payment
 * @param {string} paymentId - The ID of the payment
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId, token) => {
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