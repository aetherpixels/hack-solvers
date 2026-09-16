import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircle, Star, Briefcase, Wallet, Power } from 'lucide-react';

export default function WorkerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('PENDING');

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [resBookings, resProfile] = await Promise.all([
        axios.get('http://localhost:5000/api/bookings', { headers }),
        axios.get('http://localhost:5000/api/workers/me', { headers })
      ]);
      setBookings(resBookings.data);
      setProfile(resProfile.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      loadData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const toggleAvailability = async () => {
    if (!profile) return;
    try {
      await axios.put(`http://localhost:5000/api/workers/availability`, 
        { isAvailableNow: !profile.isAvailableNow },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      loadData();
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  if (!profile) return <p className="p-8 text-center text-gray-500">Loading your profile...</p>;

  // Calculate earnings from COMPLETED/RATED jobs that have a payment
  const completedJobs = bookings.filter((b: any) => b.status === 'COMPLETED' || b.status === 'RATED');
  const totalEarnings = completedJobs.reduce((sum, b: any) => sum + (b.payment?.amount || 0), 0);

  const pendingJobs = bookings.filter((b: any) => ['REQUESTED', 'ACCEPTED'].includes(b.status));
  const historyJobs = bookings.filter((b: any) => ['COMPLETED', 'RATED', 'DECLINED'].includes(b.status));

  const displayJobs = activeTab === 'PENDING' ? pendingJobs : historyJobs;

  return (
    <div className="space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><UserCircle size={28} /></div>
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="font-bold text-lg">{profile.user.name}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Star size={28} /></div>
          <div>
            <p className="text-sm text-gray-500">Your Rating</p>
            <p className="font-bold text-lg">{profile.avgRating.toFixed(1)} ★</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><Wallet size={28} /></div>
          <div>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="font-bold text-lg text-green-600">₹{totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-bold text-lg ${profile.isAvailableNow ? 'text-green-600' : 'text-gray-400'}`}>
              {profile.isAvailableNow ? 'Online' : 'Offline'}
            </p>
          </div>
          <button onClick={toggleAvailability} className={`p-3 rounded-full text-white transition ${profile.isAvailableNow ? 'bg-green-500 hover:bg-green-600 shadow-md shadow-green-200' : 'bg-gray-300 hover:bg-gray-400'}`}>
            <Power size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b flex">
          <button 
            className={`flex-1 py-4 font-semibold ${activeTab === 'PENDING' ? 'text-coop-600 border-b-2 border-coop-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Active Requests ({pendingJobs.length})
          </button>
          <button 
            className={`flex-1 py-4 font-semibold ${activeTab === 'HISTORY' ? 'text-coop-600 border-b-2 border-coop-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            Job History ({historyJobs.length})
          </button>
        </div>

        <div className="p-6 space-y-4">
          {displayJobs.map((b: any) => (
            <div key={b.id} className="border border-gray-200 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-coop-300 transition">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{b.category} for {b.customer.name}</h3>
                  {b.isUrgent && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Urgent</span>}
                </div>
                <p className="text-gray-600 flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-700">Address:</span> {b.address}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`px-2 py-1 rounded font-semibold ${
                    b.status === 'COMPLETED' || b.status === 'RATED' ? 'bg-green-100 text-green-700' :
                    b.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                    b.status === 'DECLINED' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {b.status}
                  </span>
                  <span className="text-gray-400">{new Date(b.scheduledAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                {b.status === 'REQUESTED' && (
                  <>
                    <button onClick={() => updateStatus(b.id, 'ACCEPTED')} className="flex-1 bg-coop-600 hover:bg-coop-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow">Accept Job</button>
                    <button onClick={() => updateStatus(b.id, 'DECLINED')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold transition">Decline</button>
                  </>
                )}
                {b.status === 'ACCEPTED' && (
                  <button onClick={() => updateStatus(b.id, 'COMPLETED')} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow">Mark Completed</button>
                )}
                {(b.status === 'COMPLETED' || b.status === 'RATED') && b.payment && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Earned</p>
                    <p className="font-bold text-green-600 text-xl">₹{b.payment.amount}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {displayJobs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No {activeTab.toLowerCase()} jobs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
