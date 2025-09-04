// src/SignUp.jsx
import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="text-sm text-neutral-400 mt-1">Start building lasting habits.</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-300">Email</span>
          <input
            type="email"
            placeholder="name@site.com"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-neutral-300">Password</span>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="text-xs text-neutral-500 mt-1">
            Use at least 8 characters, including a number and a symbol.
          </span>
        </label>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-900 font-medium"
        >
          Sign up
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-neutral-300">
        Already have an account?{" "}
        <Link to="/signin" className="text-emerald-300 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
