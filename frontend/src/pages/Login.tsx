import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [phone, setPhone] = useState('9999999999');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { phone, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      window.location.href = '/'; // hard reload to reset App state
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Co-op Platform</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
          className="border p-2 rounded" required 
        />
        <input 
          type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded" required 
        />
        <button type="submit" className="bg-coop-600 text-white p-2 rounded font-bold">Login</button>
      </form>
      <div className="mt-4 text-center">
        Don't have an account? <Link to="/signup" className="text-coop-600 underline">Sign up</Link>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Demo Accounts:<br/>
        Admin: 9999999999 | password123<br/>
        Worker 1: 7777777701 | password123<br/>
        Customer 1: 8888888801 | password123
      </div>
    </div>
  );
}
