import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', role: 'CUSTOMER' });
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      window.location.href = '/';
    } catch (error) {
      alert('Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input type="text" placeholder="Name" className="border p-2 rounded" required
          onChange={e => setFormData({...formData, name: e.target.value})} />
        <input type="text" placeholder="Phone" className="border p-2 rounded" required
          onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input type="email" placeholder="Email (optional)" className="border p-2 rounded"
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" className="border p-2 rounded" required
          onChange={e => setFormData({...formData, password: e.target.value})} />
        <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="CUSTOMER">Customer (Hire a worker)</option>
          <option value="WORKER">Worker (Offer services)</option>
        </select>
        <button type="submit" className="bg-coop-600 text-white p-2 rounded font-bold">Sign Up</button>
      </form>
      <div className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-coop-600 underline">Login</Link>
      </div>
    </div>
  );
}
