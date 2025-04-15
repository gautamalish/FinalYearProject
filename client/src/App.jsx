import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ErrorPage from "./pages/ErrorPage";
import MapComponent from "./components/location/Maps";
import WorkerList from "./pages/WorkerList";
import HiringPage from "./pages/HiringPage";
import WorkerProfilePage from "./pages/WorkerProfilePage";
import ServicesPage from "./pages/ServicesPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ProtectedAdminRoute from "./components/ProtectedAdmin";
import Header from "./components/home/Header";
import WorkerRegistration from "./pages/WorkerRegistration";
import Profile from "./pages/Profile";

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
        <HeaderWithConditionalRendering />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/location" element={<MapComponent />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:categoryName" element={<WorkerList />} />
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
          <Route path="/professionals" element={<ProfessionalsPage />} />
          <Route path="/worker-registration" element={<WorkerRegistration />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
