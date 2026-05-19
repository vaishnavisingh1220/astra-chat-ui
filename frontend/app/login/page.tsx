"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN HANDLER
  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Sending:", email, password); // 🔍 DEBUG

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Response:", res); // 🔍 DEBUG

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center 
    bg-gradient-to-br from-[#020617] via-[#020617] to-[#1E1B4B] text-white">

      <div className="w-[380px] p-6 rounded-2xl 
      bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">

        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-1">Welcome Back 👋</h1>
        <p className="text-sm text-gray-400 mb-5">
          Login to continue using Astra
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-3 p-2 rounded bg-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg 
          bg-white/10 border border-white/10 
          outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg 
          bg-white/10 border border-white/10 
          outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full p-3 rounded-lg 
          bg-gradient-to-r from-blue-500 to-indigo-500 
          hover:scale-[1.02] transition font-medium"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-2 text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* GOOGLE */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full p-3 rounded-lg mb-2
          bg-white text-black hover:scale-[1.02] transition"
        >
          Continue with Google
        </button>

        {/* GITHUB */}
        <button
          onClick={() => signIn("github")}
          className="w-full p-3 rounded-lg
          bg-gray-800 hover:bg-gray-700 transition"
        >
          Continue with GitHub
        </button>

        {/* SIGNUP LINK */}
        <p className="text-xs text-gray-400 mt-5 text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="underline hover:text-white">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}