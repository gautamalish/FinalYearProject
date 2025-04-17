import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ErrorPage from "./pages/ErrorPage";
import HiringPage from "./pages/HiringPage";
import HiringForm from "./pages/HiringForm";
import WorkerProfilePage from "./pages/WorkerProfilePage";
import ServicesPage from "./pages/ServicesPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ProtectedAdminRoute from "./components/ProtectedAdmin";
import Header from "./components/home/Header";
import WorkerRegistration from "./pages/WorkerRegistration";
import Profile from "./pages/Profile";
import JobDetails from "./pages/JobDetails";
import ClientDashboard from "./pages/ClientDashboard";
import { NotificationProvider } from "./contexts/NotificationContext";

// This component will be rendered inside BrowserRouter
// and can safely use the useLocation hook
const HeaderWithConditionalRendering = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  
  // Only render the Header when not on auth pages
  return !isAuthPage ? <Header /> : null;
};

function App() {
  return (
    <main>
      <BrowserRouter>
        <NotificationProvider>
          <HeaderWithConditionalRendering />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:category" element={<ServicesPage />} />
            <Route path="/hiring" element={<HiringForm />} />
            <Route path="/hiring-page" element={<HiringPage />} />
            <Route path="/worker/profile" element={<WorkerProfilePage />} />
            <Route path="/professionals" element={<ProfessionalsPage />} />
            <Route path="/worker-registration" element={<WorkerRegistration />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/job-details/:jobId" element={<JobDetails />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </main>
  );
}

export default App;
