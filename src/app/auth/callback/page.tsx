"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { GraduationCap } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const completeSignIn = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setStatus('error');
        setMessage('Invalid or expired sign-in link.');
        return;
      }

      let email = localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please enter your email to confirm sign-in:');
      }

      if (!email) {
        setStatus('error');
        setMessage('Email is required to complete sign-in.');
        return;
      }

      try {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem('emailForSignIn');
        setStatus('success');
        setMessage('Signed in successfully! Redirecting...');
        setTimeout(() => router.replace('/'), 1500);
      } catch {
        setStatus('error');
        setMessage('Sign-in failed. The link may have expired. Please try again.');
      }
    };

    completeSignIn();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-10 max-w-sm w-full text-center space-y-4">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/20 mx-auto">
          <GraduationCap className="w-8 h-8" />
        </div>

        {status === 'loading' && (
          <>
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-semibold text-slate-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 font-['Lexend']">You're in!</h2>
            <p className="text-sm text-slate-500">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 font-['Lexend']">Sign-in failed</h2>
            <p className="text-sm text-slate-500">{message}</p>
            <button
              onClick={() => router.replace('/')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
