import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <main>
      <BrowserRouter>
        <Header />
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
