"use client";

import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
    } else {
      window.location.href = "/login";
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">

      <div className="w-96 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">

        <h1 className="text-2xl font-semibold mb-4">Create Account</h1>

        {error && (
          <p className="text-red-400 text-sm mb-2">{error}</p>
        )}

        <input
          placeholder="Name"
          className="w-full mb-3 p-2 rounded bg-white/10 outline-none"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-white/10 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 rounded bg-white/10 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full p-2 rounded bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-[1.02] transition"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-xs mt-4 text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}