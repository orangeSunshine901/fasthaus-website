"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function TeamLogin({ configured }: { configured: boolean }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f5f3ef] p-6">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm md:p-10">
        <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#c7471d]">
          <LockKeyhole size={22} />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">A little room to create.</h1>
        <p className="mt-3 text-neutral-500">Manage product photography with the team.</p>
        <form
          className="mt-8"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            const password = new FormData(event.currentTarget).get("password");
            try {
              const response = await fetch("/api/cms/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              router.refresh();
            } catch (error) {
              setError(error instanceof Error ? error.message : "Could not sign in. Try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="team-password" className="text-sm font-semibold">
            Team password
          </label>
          <div className="relative mt-2">
            <input
              id="team-password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={256}
              disabled={!configured || busy}
              className="w-full rounded-xl border border-neutral-200 p-3.5 pr-12 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-3 top-3.5 text-neutral-500"
            >
              {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error || (!configured ? "Team access hasn’t been set up yet." : "")}
          </p>
          <button
            disabled={busy || !configured}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-[#20251e] p-3.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Opening the studio…" : "Enter media studio"}
            <ArrowRight size={18} />
          </button>
        </form>
        <Link href="/" className="mt-8 block text-center text-sm text-neutral-500 hover:text-black">
          Back to the website
        </Link>
      </div>
    </main>
  );
}
