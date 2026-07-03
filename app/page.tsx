"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const logoutAndRedirect = async () => {
      if (auth && auth.currentUser) {
        try {
          await signOut(auth);
        } catch (err) {
          console.warn('Không thể đăng xuất phiên trước:', err);
        }
      }
      router.replace('/admin/login?forceLogin=1');
    };
    void logoutAndRedirect();
  }, [router]);

  return null;
}
