import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user || { name: 'Admin Safety' }));
        window.location.href = '/dashboard';
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.message || 'Kredensial login tidak valid.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API connection failed, falling back to local auth:', err);
    }

    // Fallback if backend API is not responding
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const adminPassword = localStorage.getItem('admin_password') || 'password';

    const matchedRegisteredUser = registeredUsers.find(
      (u) => (u.email === email || u.nrp === email) && u.password === password
    );

    if ((email === 'admin@safety.local' || email === '12345678') && password === adminPassword) {
      localStorage.setItem('user', JSON.stringify({ name: 'Admin Safety', email }));
      window.location.href = '/dashboard';
    } else if (matchedRegisteredUser) {
      localStorage.setItem('user', JSON.stringify(matchedRegisteredUser));
      window.location.href = '/dashboard';
    } else if (
      storedUser.name &&
      (storedUser.email === email || storedUser.nrp === email) &&
      (!storedUser.password || storedUser.password === password)
    ) {
      window.location.href = '/dashboard';
    } else {
      setErrorMessage('Kredensial tidak valid. Gunakan email/NRP dan password yang benar, atau daftar akun baru.');
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-3 py-6">
      <div className="w-full max-w-md bg-surface p-5 sm:p-8 rounded-lg shadow-lg border border-line">
        <div className="text-center mb-6 sm:mb-8">
          <img src="/img/logoNM.png" alt="Astra Otoparts Logo" className="h-12 w-auto mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-ink">COE Management</h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">Login ke Management Area ESG & Safety</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-pending/10 border border-pending/30 text-pending text-xs rounded-md font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-ink mb-1.5 sm:mb-2">
              Email (Perusahaan / Pribadi) atau NRP
            </label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-bg text-sm"
              placeholder="contoh: nama@gmail.com, admin@safety.local, atau 12345678"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label className="block text-xs sm:text-sm font-medium text-ink">Password</label>
              <a
                href="/forgot-password"
                className="text-xs sm:text-sm text-accent font-semibold hover:underline"
              >
                Lupa Password?
              </a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-bg text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-navy-deep hover:bg-ink text-surface font-medium text-sm rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs sm:text-sm text-ink-soft">
          Belum memiliki akun?{' '}
          <a href="/register" className="text-accent font-semibold hover:underline">
            Daftar Akun Baru
          </a>
        </div>

        <div className="mt-6 text-center text-xs sm:text-sm text-ink-soft bg-bg p-3.5 sm:p-4 rounded-md">
          <p className="font-semibold mb-1">Gunakan Demo Akun:</p>
          <p>Email / NRP: <code>admin@safety.local</code> / <code>12345678</code></p>
          <p>Password: <code>password</code></p>
        </div>
      </div>
    </div>
  );
}
