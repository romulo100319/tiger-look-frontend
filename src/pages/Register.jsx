import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: 'Male', birthdate: '', program: 'BSIT',
    email: '', password: '', confirmPassword: '',
    otp: '' 
  });
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); 
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError("Please enter an email address first.");
      return;
    }
    setError('');
    setMessage('Sending code...');
    
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { email: formData.email });
      setMessage('✅ Verification code sent! Check your email.');
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-page">
      <div className="animated-bg">
        <div className="blob"></div><div className="blob"></div><div className="blob"></div>
      </div>
      
      <div className="auth-container wide">
        <h2 style={{ color: 'white' }}>Create Account</h2>
        <p style={{ color: '#cbd5e1' }}>Join the Tiger Look!</p>
        
        {error && <div style={{textAlign: 'center', color: '#ef4444', marginBottom: '1rem'}}>{error}</div>}
        {message && <div style={{textAlign: 'center', color: '#4ade80', marginBottom: '1rem'}}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Names */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input 
              name="first_name" 
              value={formData.first_name} // <--- ADDED VALUE
              onChange={handleChange} 
              required 
              placeholder="First Name" 
            />
            <input 
              name="middle_name" 
              value={formData.middle_name} // <--- ADDED VALUE
              onChange={handleChange} 
              placeholder="Middle Name" 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input 
              name="last_name" 
              value={formData.last_name} // <--- ADDED VALUE
              onChange={handleChange} 
              required 
              placeholder="Last Name" 
            />
            <input 
              name="suffix" 
              value={formData.suffix} // <--- ADDED VALUE
              onChange={handleChange} 
              placeholder="Suffix" 
            />
          </div>

          {/* Program & Gender */}
          <select name="program" onChange={handleChange} value={formData.program} style={{marginTop: '10px'}}>
             <option value="BSIT">BSIT - Information Technology</option>
             <option value="BSCS">BSCS - Computer Science</option>
             <option value="BSIS">BSIS - Information Systems</option>
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <select name="gender" onChange={handleChange} value={formData.gender}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input 
              type="date" 
              name="birthdate" 
              value={formData.birthdate} // <--- ADDED VALUE
              onChange={handleChange} 
              required 
            />
          </div>

          {/* EMAIL & OTP */}
          <div style={{ marginTop: '15px', position: 'relative' }}>
             <label style={{color: '#cbd5e1'}}>Email Address</label>
             <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} // <--- ADDED VALUE
                  onChange={handleChange} 
                  required 
                  placeholder="student@gmail.com" 
                  style={{ flex: 1, marginBottom: 0 }} 
                />
                <button 
                  type="button" 
                  onClick={handleSendOTP} 
                  style={{ 
                    padding: '0 20px', background: '#eab308', color: 'black', fontWeight: 'bold', 
                    border: 'none', borderRadius: '8px', cursor: 'pointer' 
                  }}
                >
                  Send Code
                </button>
             </div>
          </div>

          <div style={{ marginTop: '15px' }}>
             <label style={{color: '#cbd5e1'}}>Verification Code</label>
             <input 
               name="otp" 
               value={formData.otp} // <--- ADDED VALUE
               onChange={handleChange} 
               required 
               placeholder="123456" 
               maxLength="6"
               style={{ letterSpacing: '5px', textAlign: 'center', fontWeight: 'bold' }}
             />
          </div>

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <input 
              type="password" 
              name="password" 
              value={formData.password} // <--- ADDED VALUE
              onChange={handleChange} 
              required 
              placeholder="Password" 
            />
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} // <--- ADDED VALUE
              onChange={handleChange} 
              required 
              placeholder="Confirm" 
            />
          </div>

          <button type="submit" className="primary-btn" style={{marginTop: '25px'}}>
            Verify & Register
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8'}}>
          Already have an account? <Link to="/login" style={{color: '#3b82f6', fontWeight: 'bold'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;