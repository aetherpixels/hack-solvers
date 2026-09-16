import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function CustomerDashboard() {
  const [workers, setWorkers] = useState([]);
  const [category, setCategory] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [lat, setLat] = useState(28.6139); // default Delhi
  const [lng, setLng] = useState(77.2090);
  
  const [bookings, setBookings] = useState([]);

  const searchWorkers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/workers', {
        params: { category, lat, lng, isUrgent },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWorkers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBookings = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBookings();
    searchWorkers();
  }, []);

  const handleBook = async (workerId: string, workerCategory: string) => {
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        workerId,
        category: workerCategory,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        isUrgent,
        lat,
        lng,
        address: 'My Home Address'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Booking created successfully!');
      loadBookings();
    } catch (error) {
      alert('Failed to book');
    }
  };

  const handlePay = async (bookingId: string) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/payments/create-order', {
        bookingId, amount: 1000 // mock 1000 INR
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Mock successful payment verification
      await axios.post('http://localhost:5000/api/payments/verify', {
        bookingId,
        razorpay_payment_id: 'mock_pay_id',
        razorpay_order_id: data.id,
        razorpay_signature: 'mock_sig'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      alert('Payment successful!');
      loadBookings();
    } catch (error) {
      alert('Payment failed');
    }
  };

  const handleRate = async (bookingId: string) => {
    try {
      await axios.post('http://localhost:5000/api/payments/rating', {
        bookingId, stars: 5, comment: 'Excellent service'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Rated 5 stars!');
      loadBookings();
    } catch (error) {
      alert('Rating failed');
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Find a Worker</h2>
        <div className="flex gap-4 mb-4 items-center">
          <input 
            type="text" placeholder="Service (e.g. Plumber)" value={category}
            onChange={e => setCategory(e.target.value)} className="border p-2 rounded flex-1"
          />
          <label className="flex items-center gap-2 font-semibold text-red-600">
            <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
            Urgent (Available Now)
          </label>
          <button onClick={searchWorkers} className="bg-coop-600 text-white px-4 py-2 rounded">Search</button>
        </div>
        
        <div className="flex gap-6 h-96">
          <div className="w-1/3 overflow-y-auto space-y-4">
            {workers.map((w: any) => (
              <div key={w.id} className="border p-4 rounded shadow-sm">
                <h3 className="font-bold text-lg">{w.user.name}</h3>
                <p className="text-sm text-gray-600">{w.skills}</p>
                <p className="text-sm">★ {w.avgRating.toFixed(1)} | {w.experienceYears} yrs exp</p>
                <p className="text-sm text-coop-600 font-semibold">{w.distance.toFixed(1)} km away</p>
                {w.isAvailableNow && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-2 inline-block">Available Now</span>}
                <button onClick={() => handleBook(w.user.id, w.skills)} className="mt-3 w-full bg-coop-500 text-white py-1 rounded">Book Now</button>
              </div>
            ))}
            {workers.length === 0 && <p>No workers found.</p>}
          </div>
          <div className="flex-1 bg-gray-200 rounded">
            <MapContainer center={[lat, lng]} zoom={11} className="h-full w-full rounded">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[lat, lng]}><Popup>You are here</Popup></Marker>
              {workers.map((w: any) => (
                <Marker key={w.id} position={[w.lat, w.lng]}>
                  <Popup>
                    <strong>{w.user.name}</strong><br/>{w.skills}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{b.category} - {b.worker.name}</p>
                <p className="text-sm text-gray-600">Status: <span className="font-semibold">{b.status}</span></p>
                <p className="text-sm">Date: {new Date(b.scheduledAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                {b.status === 'COMPLETED' && !b.payment && (
                  <button onClick={() => handlePay(b.id)} className="bg-green-600 text-white px-4 py-2 rounded">Pay ₹1000</button>
                )}
                {b.status === 'COMPLETED' && b.payment?.status === 'COMPLETED' && !b.rating && (
                  <button onClick={() => handleRate(b.id)} className="bg-yellow-500 text-white px-4 py-2 rounded">Rate 5 Stars</button>
                )}
                {b.rating && <span className="text-yellow-600 font-bold">Rated {b.rating.stars}★</span>}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p>No bookings yet.</p>}
        </div>
      </section>
    </div>
  );
}
