"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/teach");
      router.refresh();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicLinkSent(true);
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-3xl shadow-lg">
          ✉️
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Check your email</h2>
          <p className="mt-2 text-sm text-slate-500">
            We sent a magic link to <strong className="text-slate-700">{email}</strong>.
            Click the link to sign in.
          </p>
        </div>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-sm font-medium text-orange-500 underline-offset-4 hover:underline"
        >
          Use a different sign-in method
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}
          aria-hidden="true"
        >
          ★
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your class and devices</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email address
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              ✉️
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-[#FF9F43] focus:bg-white focus:ring-4 focus:ring-[#FF9F43]/10"
              placeholder="you@nenyere.edu"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              🔒
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-11 text-sm outline-none transition-all focus:border-[#FF9F43] focus:bg-white focus:ring-4 focus:ring-[#FF9F43]/10"
              placeholder="At least 10 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Magic link */}
      <button
        onClick={handleMagicLink}
        disabled={loading || !email}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
      >
        ✨ Send magic link
      </button>

      {/* Back link */}
      <Link
        href="/"
        className="text-center text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
      >
        ← Back to home
      </Link>
    </div>
  );
}

function LoginLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-12 lg:flex">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-20 text-6xl opacity-20">🌟</div>
        <div className="pointer-events-none absolute left-10 top-40 text-5xl opacity-20">📚</div>
        <div className="pointer-events-none absolute right-20 top-1/2 text-4xl opacity-15">🎨</div>

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
            🌟
          </div>
          <span className="text-xl font-bold text-white">Nenyere ECD</span>
        </div>

        {/* Middle content */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Empowering early learning, one little star at a time.
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Manage your classroom, track development milestones, and set up learning devices — all from one beautiful dashboard.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              📊 Real-time dashboards
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              📱 20+ device support
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              🧒 Learner tracking
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-sm text-white/60">
          Made with love for Nenyere Day Care Centre.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 py-16 lg:w-1/2">
        <Suspense
          fallback={
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF9F43]" />
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginLayout />;
}
