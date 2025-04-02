import { useState } from "react";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MapComponent from "./components/location/Maps";
import WorkerList from "./pages/WorkerList";
import HiringPage from "./pages/HiringPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/location" element={<MapComponent />} />
          <Route path="/workers" element={<WorkerList />} />
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
