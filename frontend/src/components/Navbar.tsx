import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-coop-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Co-op Gig Platform</Link>
        <div className="flex gap-4 items-center">
          {role === 'COOPERATIVE_ADMIN' && (
            <>
              <Link to="/admin" className="hover:underline">Dashboard</Link>
              <Link to="/admin/welfare" className="hover:underline">Welfare Panel</Link>
            </>
          )}
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
        </div>
      </div>
    </nav>
  );
}
