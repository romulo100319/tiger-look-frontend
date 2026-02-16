import { Routes, Route, Navigate } from 'react-router-dom';
// import useSecurity from './hooks/useSecurity'; // Keep this commented out for now
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  return user ? children : <Navigate to="/login" />;
};

function App() {
  // useSecurity(); // Commented out so you can use F12 to debug

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