export const getApiBaseUrl = () => {
  // 1. Jika ada environment variable VITE_API_BASE_URL (misal diset di Vercel atau file .env)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol, port, origin } = window.location;

    // 2. Jika diakses via IP jaringan lokal (misal: handphone/laptop lain buka http://192.168.x.x:5173 di Wi-Fi yang sama)
    const isLocalNetworkIp =
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.endsWith('.local');

    if (isLocalNetworkIp && port !== '8000') {
      return `${protocol}//${hostname}:8000/api`;
    }

    // 3. Jika di localhost / 127.0.0.1 pada port dev frontend (misal :5173)
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '8000') {
      return 'http://127.0.0.1:8000/api';
    }

    // 4. Jika diakses di domain online (misal: vercel.app) atau disajikan langsung oleh Laravel
    return `${origin}/api`;
  }

  return 'http://127.0.0.1:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();
