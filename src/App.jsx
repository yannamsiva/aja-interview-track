import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import LandingPage from "./components/LandingPage/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import EmployeeDashboard from "./pages/Dashboard/EmployeeDashboard";
import DeliveryTeamDashboard from "./pages/Dashboard/DeliveryTeamDashboard";
import SalesTeamDashboard from "./pages/Dashboard/SalesTeamDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import InterviewQuestions from './pages/InterviewQuestions/InterviewQuestions';
import { AuthProvider } from "./context/AuthContext"; 
import "./assets/styles/global.css";

function AppContent() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sidebarVisible = !['/', '/login', '/register', '/about'].includes(location.pathname);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const handleSidebarToggle = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      {sidebarVisible && (
        <Sidebar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onToggle={handleSidebarToggle}
        />
      )}
      <main
        className="main-content"
        style={{
          marginLeft: sidebarVisible ? (sidebarCollapsed ? '70px' : '250px') : '0',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {!sidebarVisible && (<Navbar
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />)}
        <div className="page-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
              <Route path="/dashboard/employee/questions" element={<InterviewQuestions />} />
              <Route path="/dashboard/delivery-team" element={<DeliveryTeamDashboard />} />
              <Route path="/dashboard/sales-team" element={<SalesTeamDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Routes>
          </AnimatePresence>
        </div>
        {!sidebarVisible && (<Footer darkMode={darkMode} />)}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
