import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData, {
        withCredentials: true 
      });

      if (res.status === 200) {
        // 🚀 SAVE THE USER INFO HERE!
        // This makes 'ProtectedRoute' happy.
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        
        console.log("Login successful, user saved to localStorage");
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    // 1. USE THE CLASS, REMOVE THE INLINE STYLE
    <div className="login-page">
      
      {/* 2. ADD THE ANIMATED BACKGROUND */}
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      {/* 3. USE 'auth-container' INSTEAD OF 'register-container' */}
      <div className="auth-container">
        
        <h2>TIGER LOOK PORTAL</h2>
        <p>Sign in to continue</p>
        
        {error && <div style={{color: '#ef4444', marginBottom: '1rem'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            
            {/* WRAPPER FOR INPUT + ICON */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                // Removed inline border styles, CSS handles it
                style={{ paddingRight: '40px' }} 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              
              {/* TOGGLE BUTTON */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#cbd5e1', // Light gray color
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" className="primary-btn">Sign In</button>
        </form>
        
        <p style={{marginTop: '1.5rem', marginBottom: 0}}>
          New Student? <Link to="/register" style={{color: '#3b82f6', fontWeight: 'bold'}}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;