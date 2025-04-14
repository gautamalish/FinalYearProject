import React, { useState, useEffect } from "react";
import { FaArrowRight, FaGoogle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase-config";
import axios from "axios";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [error, setError] = useState("");

  // Auto-refresh token every 55 minutes
  useEffect(() => {
    const timer = setInterval(async () => {
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken(true);
          localStorage.setItem("token", token);
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }
    }, 55 * 60 * 1000); // 55 minutes

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loginWithGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      setVerifyingAdmin(true);
      const response = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirect based on role
      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      if (
        !["auth/cancelled-popup-request", "auth/popup-closed-by-user"].includes(
          error.code
        )
      ) {
        const errorMessage = error.code
          ? error.code.replace("auth/", "").replace(/-/g, " ")
          : "Failed to sign in with Google";
        setError(errorMessage);
      }
    } finally {
      setGoogleLoading(false);
      setVerifyingAdmin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);

      setVerifyingAdmin(true);
      const response = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirect based on role
      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Sign in failed";
      if (error.code) {
        errorMessage = error.code.replace("auth/", "").replace(/-/g, " ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setVerifyingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8">
        {/* Loading indicator */}
        {(isLoading || verifyingAdmin) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-medium">
                {verifyingAdmin ? "Verifying permissions..." : "Signing in..."}
              </p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        )}

        {/* Logo Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-yellow-400">Hire</span>Me
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Sign in to your account
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error.charAt(0).toUpperCase() + error.slice(1)}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-75"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <FaArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <div>
          <button
            onClick={loginWithGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-75"
          >
            {googleLoading ? (
              "Signing in..."
            ) : (
              <>
                <FaGoogle className="text-red-500" />
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
