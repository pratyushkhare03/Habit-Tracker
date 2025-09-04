// src/SignIn.jsx
import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout"; // or AuthSplitLayout

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Enter your email to reset password");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-semibold">Sign in</h2>
        <p className="text-sm text-neutral-400 mt-1">Welcome back. Let’s build the streaks.</p>
      </div>
      <form onSubmit={handleSignIn} className="space-y-4">
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
        </label>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-900 font-medium"
        >
          Sign in
        </button>
      </form>
      <div className="mt-4 text-sm flex items-center justify-between">
        <button onClick={handleForgotPassword} className="text-emerald-300 hover:underline">
          Forgot password?
        </button>
        <Link to="/signup" className="text-neutral-300 hover:underline">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}
