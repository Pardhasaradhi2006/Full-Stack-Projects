import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#0F172A', borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, zIndex: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ textDecoration: 'none', fontWeight: 600, color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-main)' }}>
                    Event Booking
                </Link>
                {user?.role === 'Admin' && (
                    <Link to="/admin-dashboard" style={{ textDecoration: 'none', fontWeight: 600, color: location.pathname.startsWith('/admin-dashboard') ? 'var(--primary)' : 'var(--text-main)' }}>
                        Admin Dashboard
                    </Link>
                )}
            </div>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {user ? (
                        <>
                            <span style={{ fontWeight: 500, color: '#94A3B8' }}>Welcome, <strong style={{ color: '#F8FAFC' }}>{user.username}</strong></span>
                            <button className="btn" onClick={handleLogout} style={{ border: '2px solid #334155', background: '#1E293B', color: '#F8FAFC' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary" style={{ background: '#6366F1' }}>Login</Link>
                            <Link to="/register" className="btn" style={{ border: '2px solid #334155', background: '#1E293B', color: '#F8FAFC' }}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
