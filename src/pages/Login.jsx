import { useContext, useState } from 'react';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      const token = res.data.token;

      if (token) {
        login(token);
        setTimeout(() => {
          navigate('/chat');
        }, 1000);
      } else {
        toast.error('No token received');
      }
    } catch (err) {
      toast.error('Login failed');
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-purple-600 mb-6">Welcome to PulseChat</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-md"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-purple-600 hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
