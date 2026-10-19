import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Input Email/NRP, 2: Input New Password
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userFound, setUserFound] = useState(null);

  const navigate = useNavigate();

  // Step 1: Verification / Find Account
  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserFound(data.email || identifier);
        setSuccessMessage(data.message || 'Akun ditemukan! Silakan masukkan password baru.');
        setStep(2);
        setIsLoading(false);
        return;
      } else {
        setErrorMessage(data.message || 'Akun tidak ditemukan.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API reset connection failed, falling back to local auth:', err);
    }

    // Fallback Offline Verification
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const isAdmin = identifier === 'admin@safety.local' || identifier === '12345678';
    const foundUser = registeredUsers.find(
      (u) => u.email === identifier || u.nrp === identifier
    );

    if (isAdmin) {
      setUserFound('admin@safety.local');
      setSuccessMessage('Akun Admin ditemukan. Silakan buat password baru.');
      setStep(2);
    } else if (foundUser) {
      setUserFound(foundUser.email || foundUser.nrp);
      setSuccessMessage(`Akun atas nama ${foundUser.name} ditemukan. Silakan buat password baru.`);
      setStep(2);
    } else {
      setErrorMessage('Akun dengan Email atau NRP tersebut tidak terdaftar di sistem.');
    }
    setIsLoading(false);
  };

  // Step 2: Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setIsLoading(true);

    const targetAccount = userFound || identifier;

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: targetAccount,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Also update local storage if present
        updateLocalStoragePassword(targetAccount, newPassword);
        setSuccessMessage('Password berhasil diperbarui! Mengalihkan ke halaman login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
    } catch (err) {
      console.warn('API Reset password offline, updating locally:', err);
    }

    // Update locally if API unavailable
    updateLocalStoragePassword(targetAccount, newPassword);
    setSuccessMessage('Password berhasil diperbarui (Mode Offline)! Mengalihkan ke halaman login...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1200);
    setIsLoading(false);
  };

  const updateLocalStoragePassword = (account, pass) => {
    if (account === 'admin@safety.local' || account === '12345678') {
      localStorage.setItem('admin_password', pass);
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedUsers = registeredUsers.map((u) => {
      if (u.email === account || u.nrp === account) {
        return { ...u, password: pass };
      }
      return u;
    });
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-3 py-6">
      <div className="w-full max-w-md bg-surface p-5 sm:p-8 rounded-xl shadow-lg border border-line">
        
        {/* Header */}
        <div className="text-center mb-6">
          <img src="/img/logoNM.png" alt="Astra Otoparts Logo" className="h-12 w-auto mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-ink">
            {step === 1 ? 'Lupa Password' : 'Buat Password Baru'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            {step === 1
              ? 'Masukkan Email atau NRP akun Anda untuk verifikasi reset password.'
              : `Masukkan password baru untuk akun ${userFound || identifier}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-pending/10 border border-pending/30 text-pending text-xs rounded-md font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 bg-new/10 border border-new/30 text-new text-xs rounded-md font-medium flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Step 1: Input Identifier */}
        {step === 1 && (
          <form onSubmit={handleVerifyAccount} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                <Mail size={14} className="text-accent" />
                Email atau NRP *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="contoh: nama@gmail.com, admin@safety.local, atau 12345678"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-navy-deep hover:bg-ink text-surface font-medium text-sm rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Cari Akun...' : 'Verifikasi Akun'}
            </button>
          </form>
        )}

        {/* Form Step 2: Input New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                <Lock size={14} className="text-accent" />
                Password Baru *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                <Lock size={14} className="text-accent" />
                Konfirmasi Password Baru *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-line rounded-md bg-bg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-navy-deep hover:bg-ink text-surface font-medium text-sm rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Memperbarui Password...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        {/* Navigation Link Back */}
        <div className="mt-6 pt-4 border-t border-line text-center text-xs sm:text-sm">
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline"
          >
            <ArrowLeft size={14} />
            Kembali ke Login
          </a>
        </div>

      </div>
    </div>
  );
}
