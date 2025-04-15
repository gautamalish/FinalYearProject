import React, { useState } from "react";
import {
  FaArrowRight,
  FaGoogle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase-config";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFormData = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2. Save to MongoDB
      await axios.post("http://localhost:3000/api/users", {
        token,
        firebaseUID: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "client"
      });

      navigate("/");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const signUpWithGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken(); // Get Firebase ID token

      // Send user data to backend
      await axios.post("http://localhost:3000/api/users", {
        token,
        firebaseUID: user.uid,
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || "", // Google might not provide a phone number
        role: "client"
      });

      navigate("/");
    } catch (error) {
      if (
        error.code !== "auth/cancelled-popup-request" &&
        error.code !== "auth/popup-closed-by-user"
      ) {
        setError(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
        {/* Logo Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-yellow-400">Hire</span>Me
          </h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">
            Create your account
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Join thousands of professionals and clients
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="pl-10 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleFormData}
              value={formData.name}
              name="name"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="Phone Number"
              className="pl-10 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleFormData}
              value={formData.phone}
              name="phone"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="pl-10 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleFormData}
              value={formData.email}
              name="email"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="pl-10 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleFormData}
              value={formData.password}
              name="password"
              required
              minLength="6"
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                Privacy Policy
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            {isLoading ? (
              "Creating account..."
            ) : (
              <>
                Continue
                <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <div>
          <button
            onClick={signUpWithGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            {googleLoading ? (
              "Signing up..."
            ) : (
              <>
                <FaGoogle className="text-red-500" />
                Sign up with Google
              </>
            )}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
