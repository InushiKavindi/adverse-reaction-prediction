import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, Lock, Mail, User, X, Check, ArrowRight, Sparkles } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, login, register } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "login") {
        const res = await login(username || "parent_ben", password || "password123");
        if (!res.success) setError(res.error || "Login failed");
      } else {
        if (!username || !email || !password) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        const res = await register({
          username,
          full_name: fullName || username,
          email,
          password,
          role: "parent"
        });
        if (!res.success) setError(res.error || "Registration failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await login("parent_ben", "DemoPass123!");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 p-6 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">ChildCare Portal</h2>
              <p className="text-white/80 text-xs">Pediatric Vaccine & Adverse Reaction Defense</p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 m-4 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              authMode === "login"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              authMode === "register"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {authMode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Parent Ben"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={authMode === "login" ? "parent_ben" : "Choose username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
          </div>

          {authMode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="ben@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              authMode === "login"
                ? "bg-sky-500 hover:bg-sky-600 shadow-sky-100"
                : "bg-pink-500 hover:bg-pink-600 shadow-pink-100"
            }`}
          >
            {loading ? "Processing..." : authMode === "login" ? "Sign In to Portal" : "Complete Registration"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Access */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              Quick Demo Access as Parent Ben
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
