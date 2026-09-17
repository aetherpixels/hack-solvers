import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function WelfarePanel() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadWelfare = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/welfare`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadWelfare();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-green-50 border border-green-200 p-6 rounded shadow">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Worker Welfare Panel</h2>
        <p className="text-green-700">Transparent view of worker earnings, welfare fund contributions, and fair-wage comparisons. This is the core differentiator of the cooperative model.</p>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Earnings & Welfare Fund (per Worker)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalEarnings" name="Net Earnings (₹)" fill="#16a34a" stackId="a" />
              <Bar dataKey="welfareFund" name="Welfare Fund Contribution (₹)" fill="#f59e0b" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Welfare Data Table</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Worker Name</th>
              <th className="p-3">Jobs Completed</th>
              <th className="p-3">Net Earnings</th>
              <th className="p-3 text-orange-600">Welfare Fund Contribution</th>
              <th className="p-3">Fair Wage Benchmark</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{row.name}</td>
                <td className="p-3">{row.jobs}</td>
                <td className="p-3 text-green-600 font-bold">₹{row.totalEarnings.toFixed(2)}</td>
                <td className="p-3 text-orange-600 font-bold">₹{row.welfareFund.toFixed(2)}</td>
                <td className="p-3">
                  {row.totalEarnings / row.jobs > 400 ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Above Minimum Wage</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Needs Review</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
