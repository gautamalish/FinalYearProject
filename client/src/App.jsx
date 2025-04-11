import { useState } from "react";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MapComponent from "./components/location/Maps";
import WorkerList from "./pages/WorkerList";
import HiringPage from "./pages/HiringPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdmin";
import WorkerProfilePage from "./pages/WorkerProfilePage";

function App() {
  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/location" element={<MapComponent />} />
          <Route path="/services/:categoryName" element={<WorkerList />} />
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
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
