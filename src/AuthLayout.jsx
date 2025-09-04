// src/AuthLayout.jsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      <div className="flex-1 grid place-items-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl backdrop-blur p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
