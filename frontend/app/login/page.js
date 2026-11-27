// frontend/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../lib/api';
import {
  ArrowLeft,
  Lock,
  Mail,
  Key,
  User,
  Phone,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const SECURITY_QUESTIONS = [
  'What is your favorite food?',
  'What city were you born in?',
  'What was the name of your first pet?',
  'What is your mother’s maiden name?',
  'What was your childhood nickname?',
];

export default function CustomerAuthPage() {
  const [mode, setMode] = useState('login');
  const [forgotStep, setForgotStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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

      if (res.data.user?.isAdmin || res.data.user?.role === 'admin') {
        setError('This is an Owner account. Please sign in via Owner Portal.');
        setLoading(false);
        return;
      }

      localStorage.setItem('customer_token', res.data.token);
      localStorage.setItem('customer_user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role: 'customer',
        securityQuestion,
        securityAnswer,
      });

      localStorage.setItem('customer_token', res.data.token);
      localStorage.setItem('customer_user', JSON.stringify(res.data.user));
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      setError(err.response?.data?.message || 'No account found with this email');
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
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-sm border border-amber-200 space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-red-800 transition"
        >
          <ArrowLeft size={14} />
          <span>Go Back to Store</span>
        </Link>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-red-100 text-red-800 rounded-2xl flex items-center justify-center mx-auto">
            {mode === 'forgot' ? <HelpCircle size={24} /> : <Lock size={24} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {mode === 'login' && 'Customer Sign In'}
            {mode === 'register' && 'Create Customer Account'}
            {mode === 'forgot' && 'Reset Customer Password'}
          </h1>
          <p className="text-xs text-gray-500">
            {mode === 'login' && 'Sign in to order pickles & track deliveries'}
            {mode === 'register' && 'Quick sign-up for faster checkout & order tracking'}
            {mode === 'forgot' && 'Answer your security question to reset password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] font-bold text-red-800 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In to Store'}
            </button>

            <p className="text-center text-xs text-gray-600">
              New customer?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-black text-red-800 hover:underline"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
              </div>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit Phone"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
              </div>
            </div>

            <div className="relative">
              <Key size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
              />
            </div>

            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-[10px] font-black text-red-900 uppercase tracking-wider block">
                Password Recovery Question
              </span>
              <select
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 bg-white"
              >
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Your secret answer"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Customer Account'}
            </button>

            <p className="text-center text-xs text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-black text-red-800 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <div className="space-y-4">
            {forgotStep === 1 ? (
              <form onSubmit={handleFetchQuestion} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Registered Email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-800 text-white font-bold py-3 rounded-xl text-xs"
                >
                  {loading ? 'Checking...' : 'Find Security Question'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs font-bold text-gray-900">
                  {fetchedQuestion}
                </div>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Security Answer"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs"
                >
                  {loading ? 'Resetting...' : 'Verify & Reset Password'}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-gray-600">
              Back to{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-black text-red-800 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}