// src/Dashboard.jsx
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import Habit21App from "./Habit21App";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
//   const [user] = useAuthState(auth);
   const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
//   const handleLogout = async () => { await signOut(auth); };
  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500" />
            <h1 className="text-lg font-semibold">Habit Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-neutral-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Habit21App />
        </div>
      </main>
    </div>
  );
}
