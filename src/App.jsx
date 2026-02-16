import { Routes, Route, Navigate } from 'react-router-dom';
import useSecurity from './hooks/useSecurity'; // Import the hook
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './styles/global.css';

// Simple Auth checking
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  return user ? children : <Navigate to="/login" />;
};

// There should be only ONE "function App()"
function App() {
  // Activate the Security Hook
  useSecurity(); 

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