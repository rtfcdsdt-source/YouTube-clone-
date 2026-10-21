"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { YouTubeLogo } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Login failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-1 self-center">
        <YouTubeLogo className="h-[24px] w-[110px] text-primary" />
      </Link>
      <h1 className="mb-1 text-2xl font-medium">Sign in</h1>
      <p className="mb-6 text-sm text-secondary">to continue to your video home</p>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-secondary">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border border-yt bg-transparent px-3 py-2.5 text-sm outline-none focus:border-yt-blue"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-secondary">
            Password
          </span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-yt bg-transparent px-3 py-2.5 pr-16 text-sm outline-none focus:border-yt-blue"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-yt-blue hover:bg-surface-2"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {error ? <p className="text-sm text-yt-red">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-yt-blue px-5 py-2.5 text-sm font-medium text-[#0f0f0f] disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-yt-blue hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
