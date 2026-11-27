// frontend/app/admin/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { ArrowLeft, Shield, Mail, Key, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';

const SECURITY_QUESTIONS = [
  'What is your favorite food?',
  'What city were you born in?',
  'What was the name of your first pet?',
  'What is your mother’s maiden name?',
  'What was your childhood nickname?',
];

export default function AdminLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'setup' | 'forgot'
  const [forgotStep, setForgotStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [fetchedQuestion, setFetchedQuestion] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const switchMode = (newMode) => {
    setMode(newMode);
    setForgotStep(1);
    setError('');
    setSuccessMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });
      if (!res.data.user?.isAdmin && res.data.user?.role !== 'admin') {
        setError('Access denied: Customer accounts cannot open Owner Portal.');
        setLoading(false);
        return;
      }
      localStorage.setItem('pickle_token', res.data.token);
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid owner credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role: 'admin',
        adminSecret,
        securityQuestion,
        securityAnswer,
      });
      localStorage.setItem('pickle_token', res.data.token);
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Owner setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/forgot-password/question', { email });
      setFetchedQuestion(res.data.securityQuestion);
      setForgotStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'No owner account found');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/forgot-password/reset', {
        email,
        securityAnswer,
        newPassword,
      });
      setSuccessMsg(res.data.message);
      setSecurityAnswer('');
      setNewPassword('');
      setPassword('');
      switchMode('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect security answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl space-y-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-red-800">
          <ArrowLeft size={14} /> <span>Go Back to Store</span>
        </Link>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-gray-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            {mode === 'forgot' ? <HelpCircle size={24} /> : <Shield size={24} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {mode === 'login' && 'Owner Control Sign In'}
            {mode === 'setup' && 'First-Time Owner Setup'}
            {mode === 'forgot' && 'Reset Owner Password'}
          </h1>
          <p className="text-xs text-gray-500">Restricted to Store Owner only</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl text-center">{error}</div>}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Owner Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@pickle.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <button type="button" onClick={() => switchMode('forgot')} className="text-[11px] font-bold text-red-800 hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Owner Dashboard'}
            </button>
            <p className="text-center text-xs text-gray-500">
              No owner account yet?{' '}
              <button type="button" onClick={() => switchMode('setup')} className="font-bold text-gray-900 underline">
                First-Time Owner Setup
              </button>
            </p>
          </form>
        )}

        {mode === 'setup' && (
          <form onSubmit={handleOwnerSetup} className="space-y-3">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Owner Name" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
            <div className="grid grid-cols-2 gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
            <input type="password" required value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Owner Secret Code (PICKLE_OWNER_2026)" className="w-full px-3.5 py-2.5 border border-red-300 bg-red-50/40 rounded-xl text-xs font-semibold text-gray-900" />
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
              <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 bg-white">
                {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
              <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} placeholder="Security Answer" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 bg-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Complete Owner Setup'}
            </button>
            <p className="text-center text-xs text-gray-600">
              Already set up? <button type="button" onClick={() => switchMode('login')} className="font-black text-gray-900 underline">Sign In</button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <div className="space-y-4">
            {forgotStep === 1 ? (
              <form onSubmit={handleFetchQuestion} className="space-y-4">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Registered Owner Email" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
                <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-xs">
                  {loading ? 'Checking...' : 'Find Security Question'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-900">{fetchedQuestion}</div>
                <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} placeholder="Security Answer" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900" />
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs">
                  {loading ? 'Resetting...' : 'Verify & Reset Password'}
                </button>
              </form>
            )}
            <p className="text-center text-xs text-gray-600">
              Back to <button type="button" onClick={() => switchMode('login')} className="font-black text-gray-900 underline">Sign In</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}