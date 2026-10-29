import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function AuthModal() {
  const { authMode, setAuthMode, login, register } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "login") {
        if (!email || !password) {
          setError("Please enter your email address and password.");
          setLoading(false);
          return;
        }
        const res = await login(email, password);
        if (!res.success) setError(res.error || "Login failed");
      } else {
        if (!email || !password) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        const derivedUsername = email.split("@")[0] || email;
        const res = await register({
          username: derivedUsername,
          full_name: fullName || derivedUsername,
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fcfdff] animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-[#0793E8] p-6 text-white relative">
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
                ? "bg-white text-[#0793E8] shadow-sm"
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder={authMode === "login" ? "Enter your email" : "ben@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none transition ${
                  authMode === "login"
                    ? "focus:border-[#0793E8] focus:ring-2 focus:ring-[#0793E8]/20"
                    : "focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none transition ${
                  authMode === "login"
                    ? "focus:border-[#0793E8] focus:ring-2 focus:ring-[#0793E8]/20"
                    : "focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              authMode === "login"
                ? "bg-[#0793E8] hover:bg-[#0682cf] shadow-md shadow-[#0793E8]/20 cursor-pointer"
                : "bg-pink-500 hover:bg-pink-600 shadow-pink-100 cursor-pointer"
            }`}
          >
            {loading ? "Processing..." : authMode === "login" ? "Sign In to Portal" : "Complete Registration"}
            <ArrowRight className="w-4 h-4" />
          </button>


        </form>
      </div>
    </div>
  );
}
