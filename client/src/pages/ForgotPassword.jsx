import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("Password reset email sent! Please check your inbox.");
    } catch (err) {
      let message = "Something went wrong.";
      if (err.code) {
        message = err.code.replace("auth/", "").replace(/-/g, " ");
      }
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Reset your password
        </h2>

        {status && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
            {status}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleReset}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Reset Email
          </button>
        </form>

        <div className="text-sm text-center">
          <button
            onClick={() => navigate("/signin")}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
