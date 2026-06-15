import { useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import TopBar from "./components/Layout/TopBar";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import { useAuth } from "./context/AuthContext";
import PortalChoice from "./pages/PortalChoice";
import Login from "./pages/Login";
import ParentLogin from "./pages/ParentLogin";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Enquiry from "./pages/Enquiry";
import ParentPortal from "./pages/ParentPortal";
import Analytics from "./pages/Analytics";
import Tours from "./pages/Tours";
import FollowUps from "./pages/FollowUps";
import Counsellors from "./pages/Counsellors";
import Operations from "./pages/Operations";

const titleMap = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/follow-ups": "Follow-ups",
  "/tours": "Tour Calendar",
  "/operations": "Operations",
  "/analytics": "Analytics",
  "/counsellors": "Counsellors"
};

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking session" />;
  }

  if (!token) {
    return <Navigate to="/staff-login" replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const ParentRoute = () => {
  const hasParentSession = Boolean(localStorage.getItem("parentToken"));
  const hasStaffSession = Boolean(localStorage.getItem("token"));

  if (!hasParentSession && !hasStaffSession) {
    return <Navigate to="/parent-login" replace />;
  }

  return <Outlet />;
};

const AppLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = useMemo(() => {
    if (location.pathname.startsWith("/leads/")) return "Lead Detail";
    return titleMap[location.pathname] || "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar open={sidebarOpen} onOpen={() => setSidebarOpen(true)} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <TopBar title={title} />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PortalChoice />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/staff-login" element={<Login />} />
      <Route path="/parent-login" element={<ParentLogin />} />
      <Route element={<ParentRoute />}>
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/parent-portal" element={<ParentPortal />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route element={<AdminRoute />}>
            <Route path="/counsellors" element={<Counsellors />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
