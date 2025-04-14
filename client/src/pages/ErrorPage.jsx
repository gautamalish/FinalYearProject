import { useLocation } from "react-router-dom";

export default function ErrorPage() {
  const location = useLocation();
  const { message, details } = location.state || {};

  return (
    <div className="error-container">
      <h1>{message || "Unexpected Error"}</h1>
      <p>{details || "Something went wrong"}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
      <button onClick={() => navigate("/")}>Go Home</button>
    </div>
  );
}
