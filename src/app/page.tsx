import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 px-6 py-16">
      {/* Decorative floating shapes */}
      <span className="pointer-events-none absolute text-6xl opacity-20" style={{ top: "10%", left: "8%" }} aria-hidden="true">🌟</span>
      <span className="pointer-events-none absolute text-5xl opacity-20" style={{ top: "70%", left: "85%" }} aria-hidden="true">📚</span>
      <span className="pointer-events-none absolute text-4xl opacity-15" style={{ top: "80%", left: "10%" }} aria-hidden="true">🧸</span>
      <span className="pointer-events-none absolute text-5xl opacity-20" style={{ top: "15%", left: "80%" }} aria-hidden="true">🎨</span>

      {/* Logo + title */}
      <div className="z-10 flex flex-col items-center gap-6 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-3xl text-6xl shadow-2xl"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Nenyere ECD
          </h1>
          <p className="mt-2 text-lg text-white/80">
            Digital Learning Platform for Early Childhood
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="z-10 mt-12 flex w-full max-w-md flex-col gap-4">
        <Link
          href="/login"
          className="flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          👩‍🏫 Teacher Sign In
        </Link>
        <Link
          href="/kids"
          className="flex items-center justify-center gap-3 rounded-2xl bg-white/15 px-8 py-4 text-lg font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/25 active:scale-95"
        >
          📱 Launch Devices
        </Link>
      </div>

      {/* Footer */}
      <p className="z-10 mt-16 text-sm text-white/60">
        Set up devices from your teacher dashboard after signing in.
      </p>
    </main>
  );
}
