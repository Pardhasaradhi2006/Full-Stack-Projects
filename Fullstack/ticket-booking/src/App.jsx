import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PaymentGateway from './pages/PaymentGateway';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import Chatbot from './components/Chatbot';
import './App.css';

const ProtectedAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'Admin') return <Navigate to="/" />;
  return children;
};

function AppContent() {
  return (
    <div className="app-container">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentGateway />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
