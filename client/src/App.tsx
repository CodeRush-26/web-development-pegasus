// React Hooks
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Custom Hooks
import SmoothScroll from "@/hooks/SmoothScroll";
import ScrollToTop from "@/hooks/ScrollToTop";

// Components
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/CustomComponents/Navbar";
import Footer from "@/components/CustomComponents/Footer";
import ProtectedRoute from "@/components/CustomComponents/ProtectedRoute";
import api from "@/api/api";
import useUserStore from "@/store/userStore";

// Pages
import HomePage from "@/Pages/HomePage/HomePage";
import UserDashboard from "@/Pages/UserDashboard/UserDashBoard";
import DashboardHome from "@/Pages/UserDashboard/DashboardHome";
import DashboardProfile from "@/Pages/UserDashboard/DashboardProfile";
import DashboardSettings from "@/Pages/UserDashboard/DashboardSettings";
import AdminDashboard from "@/Pages/AdminDashboard/AdminDashboard";
import PlaybackDashboard from "@/Pages/AdminDashboard/PlaybackDashboard";
import CaptainView from "@/Pages/CaptainView/CaptainView";
import FleetMapPage from "@/Pages/CommandCenter/FleetMapPage";
import DirectivesPage from "@/Pages/CommandCenter/DirectivesPage";
import LoginPage from "@/Pages/LoginPage/LoginPage";
import RegisterPage from "@/Pages/RegisterPage/RegisterPage";
import OTPPage from "@/Pages/OTPPage/OTPPage";

import ShipDetailPage from "@/Pages/CommandCenter/ShipDetailPage";

import CaptainLayout from "@/Pages/CaptainView/CaptainLayout";

// Styles
import "./App.css";

function App() {
  const location = useLocation();
  const { token, setUser, logout } = useUserStore();
  const isCaptainRoute = location.pathname.startsWith("/captain");
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/captain") ||
    location.pathname.startsWith("/admin");

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get("/api/users/profile");
          const userData = response.data;
          // Ensure the ID is set correctly for the store
          setUser({ ...userData, id: userData._id });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // Only logout if it's a 401/403
          // @ts-ignore
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    };

    fetchUser();
  }, [token, setUser, logout]);

  return (
    <>
      {!isCaptainRoute && <Navbar />}
      <SmoothScroll />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPPage />} />

        {/* Protected User Routes — all inside UserDashboard layout */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<UserDashboard />}>
            {/* Default: Command Centre overview */}
            <Route index element={<DashboardHome />} />

            {/* Fleet Map — live map for everyone */}
            <Route path="map" element={<FleetMapPage />} />
            <Route path="ships/:shipId" element={<ShipDetailPage />} />

            {/* Directives — available to all roles */}
            <Route path="directives" element={<DirectivesPage />} />

            {/* Profile & Settings — all users */}
            <Route path="profile" element={<DashboardProfile />} />
            <Route path="settings" element={<DashboardSettings />} />

            {/* Admin-only (inside layout so sidebar is visible) */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="playback" element={<PlaybackDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Captain-only standalone layout */}
        <Route element={<ProtectedRoute allowedRoles={["captain"]} />}>
          <Route path="/captain" element={<CaptainLayout />}>
            <Route index element={<CaptainView />} />
          </Route>
        </Route>

        {/* Admin-only top-level routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ScrollToTop />
      {!isDashboardRoute && <Footer />}
      <Toaster />
    </>
  );
}

export default App;
