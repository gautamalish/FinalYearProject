import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser, token, refreshToken } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async (user) => {
      try {
        if (!user) {
          navigate("/signin");
          return;
        }

        const currentToken = token || (await refreshToken());
        if (!currentToken) {
          navigate("/signin");
          return;
        }

        const res = await axios.get("http://localhost:3000/api/users/me", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        });

        if (!res.data?.success) {
          throw new Error(res.data?.error || "Invalid response from server");
        }

        if (res.data.data?.role !== "admin") {
          navigate("/", {
            state: {
              message: "Access Denied",
              details: "Admin privileges required",
            },
          });
          return;
        }

        setIsVerified(true);
      } catch (error) {
        console.error("Admin verification error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
        });

        if (error.response?.status === 401) {
          navigate("/signin");
        } else if (error.response?.status === 404) {
          navigate("/register");
        } else {
          navigate("/error", {
            state: {
              message: "Verification Failed",
              details: error.response?.data?.error || error.message,
            },
            replace: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      checkAdmin(currentUser);
    } else {
      setLoading(false);
      navigate("/signin");
    }
  }, [navigate, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Verifying admin privileges...</div>
      </div>
    );
  }

  return isVerified ? children : null;
};

export default ProtectedAdminRoute;
