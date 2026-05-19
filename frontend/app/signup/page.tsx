"use client";

import API_BASE from "@/lib/api";
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

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      console.log("Signup response status:", res.status);

      const data = await res.json().catch(() => ({}));
      console.log("Signup response body:", data);

      if (!res.ok) {
        setError(data.message || data.error || "Signup failed");
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Signup network error:", err);
      setError("Network error while signing up. Check server status.");
    } finally {
      setLoading(false);
    }
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
          value={name}
          className="w-full mb-3 p-2 rounded bg-white/10 outline-none"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          className="w-full mb-3 p-2 rounded bg-white/10 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
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