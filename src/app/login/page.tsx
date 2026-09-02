"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDeviceMode = searchParams.get("mode") === "device";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-lg font-semibold text-[var(--color-brand-msasa)]">
          Check your email
        </p>
        <p className="max-w-sm text-sm text-ink-500">
          We sent a magic link to <strong>{email}</strong>. Click the link to
          sign in.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-sm text-ink-500 underline-offset-4 hover:underline"
        >
          ← Use a different sign-in method
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold text-white"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ★
        </div>
        <h1 className="text-xl font-bold">
          {isDeviceMode ? "Classroom Device Sign In" : "Teacher / Admin Sign In"}
        </h1>
      </div>

      <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[var(--color-surface-2)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-sun)] focus:ring-2 focus:ring-[var(--color-brand-sun)]/20"
            placeholder="you@nenyere.edu"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-ink-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[var(--color-surface-2)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-sun)] focus:ring-2 focus:ring-[var(--color-brand-sun)]/20"
            placeholder="At least 10 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--color-brand-sun)] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {!isDeviceMode && (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
            <span className="text-xs text-ink-500">or</span>
            <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="rounded-lg border border-[var(--color-surface-2)] px-6 py-3 font-semibold text-ink-700 transition-colors hover:bg-[var(--color-surface-1)] disabled:opacity-50"
          >
            Send magic link
          </button>
        </>
      )}

      <Link
        href="/welcome"
        className="text-center text-sm text-ink-500 underline-offset-4 hover:underline"
      >
        ← Back to welcome
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Suspense
        fallback={
          <div className="text-sm text-ink-500">Loading…</div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
