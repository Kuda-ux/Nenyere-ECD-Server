import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Nenyere ECD Digital Learning Platform",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

      <div className="prose prose-sm max-w-none space-y-6 text-ink-700">
        <section>
          <h2 className="text-xl font-semibold">What we collect</h2>
          <p className="mt-2">
            We collect only the minimum information needed to support your
            child&apos;s learning: first name, birth month (not full date of
            birth), ECD level, and learning progress. We do{" "}
            <strong>not</strong> collect photos, addresses, phone numbers, ID
            numbers, or medical data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Why we collect it</h2>
          <p className="mt-2">
            To identify your child in class, place them at the correct ECD
            level, and help teachers track their development. Learning evidence
            (activity attempts, mastery indicators) is used solely for
            educational purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Where it is stored</h2>
          <p className="mt-2">
            Data is stored securely with Supabase (database) and Vercel
            (hosting). Both providers may store data outside Zimbabwe. We follow
            data protection principles under the Zimbabwe Cyber and Data
            Protection Act [Chapter 12:07] and SI 155 of 2024.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Consent</h2>
          <p className="mt-2">
            A parent or guardian must give written consent before any
            child&apos;s data is processed. The school holds the signed consent
            form. You may withdraw consent at any time, and we will erase your
            child&apos;s data after a 30-day grace period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Your rights</h2>
          <ul className="mt-2 list-disc pl-6">
            <li>Request a copy of all data we hold about your child</li>
            <li>Request erasure of all data</li>
            <li>Withdraw consent at any time</li>
            <li>Contact the school administrator or Data Protection Officer</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">No advertising</h2>
          <p className="mt-2">
            We do not use any advertising or third-party analytics trackers. No
            child data is ever sold or shared with advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact the school administrator at Nenyere
            Day Care Centre, Mbare, Harare.
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-12 inline-block text-sm text-ink-500 underline-offset-4 hover:underline"
      >
        ← Back to home
      </Link>
    </main>
  );
}
