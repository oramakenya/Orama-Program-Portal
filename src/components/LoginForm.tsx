"use client";

import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  Palette,
  Music,
  Drama,
  Sparkles,
  AlertCircle,
  Key,
  UserCheck,
  ArrowRight,
  BookOpen,
  Layers,
  Award,
  CreditCard,
  LayoutDashboard,
  CheckCircle2,
  FolderKanban,
  FileCode,
  GraduationCap,
  Sliders,
} from "lucide-react";
import { AvatarBadge } from "./AvatarBadge";

interface LoginFormProps {
  onLoginSuccess: (data: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<"parent" | "instructor">("parent");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickSelect = (demoRole: "parent" | "instructor", demoUsername: string, demoCode: string) => {
    setRole(demoRole);
    setUsername(demoUsername);
    setCode(demoCode);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !code.trim()) {
      setError("Please fill in both Username and Registration Code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, username, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to sign in. Please verify your credentials.");
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1a3a] text-[#faf8f5] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Vector Art Patterns */}
      <div className="absolute top-[-150px] left-[-150px] w-[600px] h-[600px] bg-[#f27a1a]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-[#1e3a5f]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[800px] bg-radial from-[#142850]/40 to-transparent blur-2xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full border-b border-white/10 bg-[#081226]/90 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f27a1a] to-[#f9a03f] flex items-center justify-center font-bold text-white shadow-lg shadow-[#f27a1a]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif font-extrabold text-xl text-white tracking-tight">
                ORAMA <span className="gradient-text">Creative Arts</span>
              </span>
              <span className="hidden sm:inline-block ml-3 text-[10px] bg-[#1e3a5f] text-[#f9a03f] px-2.5 py-0.5 rounded-full border border-[#f27a1a]/30 font-bold uppercase tracking-widest">
                Program Portal
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 my-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive <span className="gradient-text">eLearning & Course Authoring</span> Portal
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            A fullstack portal for parents to track student attendance, performance grades, and UGX payment plan options (with flexible UGX 50,000 plan switch fees), while enabling instructors with drag-and-drop course module creation, lesson authoring, and direct chat.
          </p>

          {/* Interactive Feature Mockup Grid (NO pictures - Pure Vector UI) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="glass-dark p-4 rounded-2xl border border-white/10 hover:border-[#f27a1a]/50 transition group">
              <div className="w-9 h-9 rounded-xl bg-[#f27a1a]/20 text-[#f27a1a] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Visual Arts & Painting</h4>
              <p className="text-[11px] text-gray-400 mt-1">
                Oil impressionism, acrylic layering, landscape perspective & gallery critiques.
              </p>
            </div>

            <div className="glass-dark p-4 rounded-2xl border border-white/10 hover:border-[#f27a1a]/50 transition group">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Music className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Piano & Music Theory</h4>
              <p className="text-[11px] text-gray-400 mt-1">
                Classical sonatas, sight reading, pedal resonance & recital evaluations.
              </p>
            </div>

            <div className="glass-dark p-4 rounded-2xl border border-white/15 hover:border-[#f27a1a]/50 transition group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Drama className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Drama & Stage Arts</h4>
              <p className="text-[11px] text-gray-400 mt-1">
                Monologue delivery, character voice modulation & spatial blocking.
              </p>
            </div>
          </div>

          {/* Key Portal Specs */}
          <div className="p-5 rounded-2xl bg-[#142850]/60 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>UGX 50,000 Flexible Plan Switch Fee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Child Parent Switching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Inverted Faculty Studio UI</span>
            </div>
          </div>
        </div>

        {/* Right Side: Portal Login Form Card */}
        <div className="lg:col-span-5">
          <div className="glass-dark border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-serif font-bold text-white">Portal Sign In</h2>
              <p className="text-xs text-gray-400 mt-1">
                Select your portal view and enter credentials
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#081226] p-1.5 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole("parent");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === "parent"
                    ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-lg shadow-[#f27a1a]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <User className="w-4 h-4" />
                Parent / Guardian
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("instructor");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === "instructor"
                    ? "bg-[#1e3a5f] text-[#f9a03f] border border-[#f27a1a]/50 shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Instructor Studio
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={role === "parent" ? "e.g. sakello" : "e.g. prof_emmanuel"}
                    className="w-full pl-10 pr-4 py-3 bg-[#081226]/90 border border-white/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  {role === "parent" ? "Student Code or Parent Code" : "Instructor Code"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={role === "parent" ? "e.g. ORM-2024-KIPRAH" : "e.g. INST-ART-01"}
                    className="w-full pl-10 pr-4 py-3 bg-[#081226]/90 border border-white/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white shadow-xl shadow-[#f27a1a]/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating ORAMA Account...
                  </div>
                ) : (
                  <>
                    Access ORAMA Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  ⚡ 1-Click Testing Accounts
                </span>
                <span className="text-[10px] text-[#f9a03f] bg-[#f27a1a]/20 px-2 py-0.5 rounded border border-[#f27a1a]/30 font-mono">
                  Instant Load
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Parent 1 */}
                <button
                  type="button"
                  onClick={() => handleQuickSelect("parent", "sakello", "ORM-2024-KIPRAH")}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <AvatarBadge name="Sarah Akello" role="parent" size="sm" />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        Sarah Akello
                        <span className="text-[9px] bg-[#f27a1a]/20 text-[#f9a03f] px-1.5 py-0.2 rounded font-normal">
                          2 Children
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        `sakello` / `ORM-2024-KIPRAH`
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#f27a1a] group-hover:underline font-semibold">
                    Select &rarr;
                  </span>
                </button>

                {/* Parent 2 */}
                <button
                  type="button"
                  onClick={() => handleQuickSelect("parent", "dochieng", "ORM-2024-GRACE")}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <AvatarBadge name="David Ochieng" role="parent" size="sm" />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        David Ochieng
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-normal">
                          1 Child
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        `dochieng` / `ORM-2024-GRACE`
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-400 group-hover:underline font-semibold">
                    Select &rarr;
                  </span>
                </button>

                {/* Instructor 1 */}
                <button
                  type="button"
                  onClick={() => handleQuickSelect("instructor", "prof_emmanuel", "INST-ART-01")}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <AvatarBadge name="Emmanuel Mugisha" role="instructor" discipline="Visual Arts" size="sm" />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        Prof. Emmanuel Mugisha
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-normal">
                          Art Mentor
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        `prof_emmanuel` / `INST-ART-01`
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 group-hover:underline font-semibold">
                    Select &rarr;
                  </span>
                </button>

                {/* Instructor 2 */}
                <button
                  type="button"
                  onClick={() => handleQuickSelect("instructor", "maestro_clara", "INST-MUS-02")}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <AvatarBadge name="Clara Ninsiima" role="instructor" discipline="Piano & Music" size="sm" />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        Maestro Clara Ninsiima
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-normal">
                          Piano Mentor
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        `maestro_clara` / `INST-MUS-02`
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-purple-400 group-hover:underline font-semibold">
                    Select &rarr;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-gray-400 border-t border-white/10 bg-[#081226]/80 backdrop-blur-md">
        ORAMA Creative Arts Program &copy; 2026. Kampala.
      </footer>
    </div>
  );
};
