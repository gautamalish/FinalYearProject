import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async (user) => {
      try {
        if (!user) {
          navigate("/signin");
          return;
        }

        const token = await user.getIdToken();

        const res = await axios.get("http://localhost:3000/api/users/me/info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.role !== "admin") {
          navigate("/");
          return;
        }

        setIsVerified(true);
      } catch (error) {
        console.error("Admin verification failed:", error);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin(currentUser);
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
