import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    nrp: '',
    no_wa: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    // Cek konfirmasi password
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    // Cek panjang password
    if (formData.password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    // Cek duplicate NRP & Email di Local Storage
    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const isNrpExist = formData.nrp === '12345678' || existingUsers.some(u => u.nrp === formData.nrp);
    const isEmailExist = formData.email === 'admin@safety.local' || existingUsers.some(u => u.email === formData.email);

    if (isNrpExist) {
      setErrorMessage('NRP sudah terdaftar! Silakan gunakan NRP lain atau login.');
      return;
    }

    if (isEmailExist) {
      setErrorMessage('Email sudah terdaftar! Silakan gunakan email lain atau login.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          nrp: formData.nrp,
          no_wa: formData.no_wa,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      // Jika Laravel mengembalikan error
      if (!res.ok) {
        let msg = data.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.';
        if (data.errors) {
          const firstErrGroup = Object.values(data.errors)[0];
          if (Array.isArray(firstErrGroup) && firstErrGroup.length > 0) {
            msg = firstErrGroup[0];
          }
        }
        setErrorMessage(msg);
        return;
      }

      // Registrasi berhasil via API
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccessMessage(
        'Registrasi berhasil! Mengalihkan ke halaman login...'
      );

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.warn('API Register offline, menyimpan akun secara lokal:', error);

      // Save user locally for offline use
      const newUser = {
        name: formData.name,
        nrp: formData.nrp,
        no_wa: formData.no_wa,
        email: formData.email,
        password: formData.password,
        role: 'user',
      };

      existingUsers.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(existingUsers));
      localStorage.setItem('user', JSON.stringify(newUser));

      setSuccessMessage(
        'Registrasi berhasil (Mode Offline)! Mengalihkan ke halaman login...'
      );

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-3 py-6">
      <div className="w-full max-w-lg bg-surface p-5 sm:p-8 rounded-xl shadow-lg border border-line">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img src="/img/logoNM.png" alt="Astra Otoparts Logo" className="h-12 w-auto mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-ink">
            COE Management
          </h1>

          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Pendaftaran Akun Baru ESG & Safety
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-pending/10 border border-pending/30 text-pending text-xs rounded-md font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 p-3 bg-new/10 border border-new/30 text-new text-xs rounded-md font-medium flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Nama */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <User size={14} className="text-accent" />
              Nama Lengkap *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          {/* NRP & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <CreditCard size={14} className="text-accent" />
                NRP (Nomor Induk) *
              </label>

              <input
                type="text"
                name="nrp"
                value={formData.nrp}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="12345678"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Phone size={14} className="text-accent" />
                Nomor WhatsApp *
              </label>

              <input
                type="text"
                name="no_wa"
                value={formData.no_wa}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="081234567890"
                required
              />
            </div>

          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Mail size={14} className="text-accent" />
              Email (Perusahaan / Pribadi) *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              placeholder="contoh: nama@gmail.com atau nama@perusahaan.com"
              required
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Lock size={14} className="text-accent" />
                Password *
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Lock size={14} className="text-accent" />
                Konfirmasi Password *
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-2.5 px-4 bg-navy-deep hover:bg-ink text-surface font-medium text-sm rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
          </button>

        </form>

        {/* Login */}
        <div className="mt-6 text-center text-xs sm:text-sm text-ink-soft">
          Sudah memiliki akun?{' '}

          <Link
            to="/login"
            className="text-accent font-semibold hover:underline"
          >
            Login di sini
          </Link>
        </div>

      </div>
    </div>
  );
}