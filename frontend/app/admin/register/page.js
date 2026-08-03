// frontend/app/admin/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { UserPlus, User, Mail, Key, Phone, Loader2 } from 'lucide-react';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/register', { name, email, phone, password });
      localStorage.setItem('pickle_token', response.data.token);
      router.push('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-amber-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-100 text-red-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Create Admin Account</h1>
          <p className="text-xs text-gray-500 mt-1">Register to manage store orders and inventory</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl text-xs font-bold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Store Owner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                placeholder="admin@picklestore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1">Password</label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-800 text-white font-bold py-3 rounded-xl hover:bg-red-900 transition flex items-center justify-center gap-2 text-xs mt-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6">
          Already have an admin account?{' '}
          <Link href="/admin/login" className="text-red-800 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}