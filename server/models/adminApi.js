// Admin API Service (create a new file adminApi.js)
import axios from "axios";

const API_URL = "http://localhost:3000/api/admin";

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchUsers = async (token) => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeader(token));
  return response.data;
};

export const deleteUser = async (userId, token) => {
  await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader(token));
};

export const fetchJobs = async (token) => {
  const response = await axios.get(`${API_URL}/jobs`, getAuthHeader(token));
  return response.data;
};

export const createJob = async (jobData, token) => {
  const response = await axios.post(
    `${API_URL}/jobs`,
    jobData,
    getAuthHeader(token)
  );
  return response.data;
};

export const updateJob = async (jobId, jobData, token) => {
  const response = await axios.put(
    `${API_URL}/jobs/${jobId}`,
    jobData,
    getAuthHeader(token)
  );
  return response.data;
};

export const deleteJob = async (jobId, token) => {
  await axios.delete(`${API_URL}/jobs/${jobId}`, getAuthHeader(token));
};

export const fetchStats = async (token) => {
  const response = await axios.get(`${API_URL}/stats`, getAuthHeader(token));
  return response.data;
};
