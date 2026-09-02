import { useState } from 'react';
import { Lock, User, Sparkles, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate small API delay for micro-animation feel
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 overflow-hidden font-serif">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>

      <div className="w-full max-w-md px-4 z-10">
        {/* Glassmorphic Card Container */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
              <Sparkles className="text-white h-7 w-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Sri Sai Lorven Clinic
            </h2>
            <p className="text-indigo-200/60 mt-2 text-sm font-medium">
              AI Receptionist Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-200 text-xs font-semibold animate-shake">
                <AlertCircle className="shrink-0 h-4.5 w-4.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[0.7rem] font-bold text-indigo-200/50 uppercase tracking-widest block ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-indigo-200/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[0.7rem] font-bold text-indigo-200/50 uppercase tracking-widest block ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-indigo-200/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer block text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
