import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ErrorPage from "./pages/ErrorPage";
import HiringForm from "./pages/HiringForm";
import ServicesPage from "./pages/ServicesPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ProtectedAdminRoute from "./components/ProtectedAdmin";
import Header from "./components/home/Header";
import WorkerRegistration from "./pages/WorkerRegistration";
import Profile from "./pages/Profile";
import JobDetails from "./pages/JobDetails";
import ClientDashboard from "./pages/ClientDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import PaymentPage from "./pages/PaymentPage";
import { NotificationProvider } from "./contexts/NotificationContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
// This component will be rendered inside BrowserRouter
// and can safely use the useLocation hook
const HeaderWithConditionalRendering = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  // Only render the Header when not on auth pages
  return !isAuthPage ? <Header /> : null;
};

function App() {
  return (
    <main>
      <BrowserRouter>
        <NotificationProvider>
          <HeaderWithConditionalRendering />
          <Elements stripe={stripePromise}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:category" element={<ServicesPage />} />
              <Route path="/hiring" element={<HiringForm />} />
              <Route path="/professionals" element={<ProfessionalsPage />} />
              <Route
                path="/worker-registration"
                element={<WorkerRegistration />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/job-details/:jobId" element={<JobDetails />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/worker-dashboard" element={<WorkerDashboard />} />
              <Route path="/payment/:jobId" element={<PaymentPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </Elements>
        </NotificationProvider>
      </BrowserRouter>
    </main>
  );
}

export default App;
