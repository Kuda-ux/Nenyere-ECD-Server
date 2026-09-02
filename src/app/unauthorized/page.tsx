import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold text-white"
          style={{ backgroundColor: "var(--color-danger)" }}
          aria-hidden="true"
        >
          !
        </div>
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="max-w-sm text-sm text-ink-500">
          You do not have permission to access this page. Please contact your
          school administrator if you believe this is an error.
        </p>
      </div>
      <Link
        href="/"
        className="text-sm text-ink-500 underline-offset-4 hover:underline"
      >
        ← Back to home
      </Link>
    </main>
  );
}
