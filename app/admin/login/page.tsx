"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, rtdb } from '../../../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref as dbRef, get } from 'firebase/database';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceLogin = searchParams.get('forceLogin') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [forceLogoutDone, setForceLogoutDone] = useState(false);

  const fetchUserRole = async (uid: string) => {
    if (!rtdb) return null;
    try {
      const mapSnap = await get(dbRef(rtdb, `users/uidMap/${uid}`));
      const nameKey = mapSnap.val();
      if (!nameKey) return null;
      const profileSnap = await get(dbRef(rtdb, `users/profiles/${nameKey}`));
      return profileSnap.val()?.role || null;
    } catch (err) {
      console.warn('Không thể kiểm tra vai trò người dùng:', err);
      return null;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    if (!auth) {
      setCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && forceLogin && !forceLogoutDone) {
        setForceLogoutDone(true);
        try {
          await signOut(auth);
        } catch (err) {
          console.warn('Không thể đăng xuất phiên trước:', err);
        }
        setCheckingAuth(false);
        return;
      }

      if (user) {
        const role = await fetchUserRole(user.uid);
        setCheckingAuth(false);
        if (role === 'admin' || role === 'receptionist') {
          router.push('/bookings');
          return;
        }
        setError('Bạn không đủ quyền hạn để đăng nhập.');
        try {
          await signOut(auth);
        } catch (err) {
          console.warn('Không thể đăng xuất người dùng không đủ quyền:', err);
        }
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router, forceLogin, forceLogoutDone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Check if Firebase is configured
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
      setError('Firebase chưa được cấu hình. Vui lòng cập nhật file .env với thông tin Firebase của bạn.');
      return;
    }
    
    if (!auth) {
      setError('Firebase chưa được khởi tạo. Vui lòng kiểm tra file .env');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login successful:', user.email);

      const role = await fetchUserRole(user.uid);
      if (role !== 'admin' && role !== 'receptionist') {
        setError('Bạn không đủ quyền hạn để đăng nhập.');
        await signOut(auth);
        setLoading(false);
        return;
      }

      router.push('/bookings');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
        : 'Đăng nhập thất bại. Vui lòng thử lại sau.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Show loading while checking auth state
  if (checkingAuth) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center overflow-hidden font-sans">
        <div className="app-container flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold">Đang kiểm tra đăng nhập...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center overflow-hidden font-sans">
      <div className="app-container flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Đăng nhập Lễ tân</h2>
          
          {error && <div className="text-sm text-red-600 mb-3 p-2 bg-red-50 border border-red-200 rounded">{error}</div>}
          <label className="block mb-2 text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-2 border rounded" type="email" required />
          <label className="block mb-2 text-sm">Mật khẩu</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded" type="password" required />
          <button type="submit" disabled={loading || !auth} className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          
          {!auth && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <p className="font-semibold">Lưu ý:</p>
              <p>Firebase chưa được cấu hình. Vui lòng cập nhật file <code className="bg-red-100 px-1 rounded">.env</code> với thông tin Firebase thực tế.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
