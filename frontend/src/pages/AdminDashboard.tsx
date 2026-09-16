import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState([]);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [resStats, resPending] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard', { headers }),
        axios.get('http://localhost:5000/api/admin/pending-workers', { headers })
      ]);
      setStats(resStats.data);
      setPending(resPending.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleVerify = async (userId: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/workers/${userId}/verify`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      loadData();
    } catch (error) {
      alert('Verification failed');
    }
  };

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Active Workers</p>
          <p className="text-3xl font-bold">{stats.activeWorkers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center border-2 border-orange-300">
          <p className="text-gray-500 text-sm">Pending Approvals</p>
          <p className="text-3xl font-bold text-orange-500">{stats.pendingWorkers}</p>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4">Heuristic Demand Forecast (Last 40 jobs)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-1 bg-white p-6 rounded shadow overflow-y-auto h-80">
          <h3 className="text-xl font-bold mb-4">Pending Verifications</h3>
          <div className="space-y-4">
            {pending.map((w: any) => (
              <div key={w.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-bold">{w.user.name}</p>
                  <p className="text-sm">{w.skills} - {w.experienceYears} yrs exp</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(w.userId, 'VERIFIED')} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Approve</button>
                  <button onClick={() => handleVerify(w.userId, 'REJECTED')} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Reject</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-gray-500">No pending workers.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
