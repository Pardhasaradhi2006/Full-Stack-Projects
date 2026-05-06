import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                login(data);
                navigate('/');
            } else {
                const err = await res.json();
                setError(err.error);
            }
        } catch (e) {
            setError('Server unreachable');
        }
    };

    return (
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="section-title">Login to Account</h2>
                {error && <span className="error-message" style={{ marginBottom: '1rem', display: 'block' }}>{error}</span>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" required className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
