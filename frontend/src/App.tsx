import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WelfarePanel from './pages/WelfarePanel';

function App() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = window.location.pathname;
  };

  const ProtectedRoute = ({ children, role }: { children: JSX.Element, role?: string }) => {
    if (!token) return <Navigate to="/login" />;
    if (role && userRole !== role) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {token && <Navbar />}
        <main className="flex-1 p-4 w-full max-w-6xl mx-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/customer/*" element={
              <ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>
            } />
            
            <Route path="/worker/*" element={
              <ProtectedRoute role="WORKER"><WorkerDashboard /></ProtectedRoute>
            } />
            
            <Route path="/admin/*" element={
              <ProtectedRoute role="COOPERATIVE_ADMIN"><AdminDashboard /></ProtectedRoute>
            } />

            <Route path="/admin/welfare" element={
              <ProtectedRoute role="COOPERATIVE_ADMIN"><WelfarePanel /></ProtectedRoute>
            } />

            <Route path="/" element={
              token 
                ? (userRole === 'CUSTOMER' ? <Navigate to="/customer" /> 
                  : userRole === 'WORKER' ? <Navigate to="/worker" />
                  : <Navigate to="/admin" />)
                : <Navigate to="/login" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
