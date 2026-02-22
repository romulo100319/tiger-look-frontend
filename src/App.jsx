import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios'; // ⚠️ IMPORTANTE: Need ito para sa interceptor
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './styles/global.css';

// 👇👇👇 THE FIX: AXIOS INTERCEPTOR 👇👇👇
// Ito ang magsasabit ng Token sa bawat request papuntang backend
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 👆👆👆 END OF FIX 👆👆👆

const ProtectedRoute = ({ children }) => {
  // ✅ FIX: Check kung may token, hindi lang userInfo
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;