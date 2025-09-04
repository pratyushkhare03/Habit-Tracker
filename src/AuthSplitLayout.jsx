// src/AuthSplitLayout.jsx
export default function AuthSplitLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 grid md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center p-10 border-r border-neutral-900 bg-gradient-to-br from-indigo-600/10 to-cyan-500/5">
        <div className="max-w-sm">
          <h1 className="text-3xl font-semibold">Habit Tracker</h1>
          <p className="mt-3 text-neutral-300">Build consistent routines with a 21‑day focus.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
