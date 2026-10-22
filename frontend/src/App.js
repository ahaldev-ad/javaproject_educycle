import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './css/index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import FlowingBackground from './components/FlowingBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Skills from './pages/Skills';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100 position-relative app-body-wrapper pb-mobile-nav">
            <FlowingBackground />
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes - Login Required */}
                <Route
                  path="/resources"
                  element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <ProtectedRoute>
                      <Skills />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />

                {/* Dedicated Admin Portal Route */}
                <Route path="/admin" element={<AdminPanel />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <MobileBottomNav />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
