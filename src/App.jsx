import React, { useEffect, useMemo, useState } from "react";
// Charts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ------------------------
// Types
// ------------------------
const CATEGORIES = [
  { key: "productive", label: "Productive" },
  { key: "neutral", label: "Neutral" },
  { key: "waste", label: "Waste" },
];

// A single hour log entry
// { activity: string, category: "productive" | "neutral" | "waste" }

// ------------------------
// Helpers
// ------------------------
const todayISO = () => new Date().toISOString().slice(0, 10);
const toISO = (d) => new Date(d).toISOString().slice(0, 10);
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

function addDays(dateISO, days) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function daysBetween(aISO, bISO) {
  const a = new Date(aISO);
  const b = new Date(bISO);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// ------------------------
// Local Storage
// ------------------------
const STORAGE_KEY = "habit21:data:v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load data", e);
    return null;
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
}

// ------------------------
// Main App
// ------------------------
export default function Habit21App() {
  const [habit, setHabit] = useState(() =>
    loadData()?.habit || { title: "", startDate: todayISO() }
  );
  const [logs, setLogs] = useState(() => loadData()?.logs || {}); // { [dateISO]: { [hour]: {activity, category} } }
  const [selectedDate, setSelectedDate] = useState(() => todayISO());
  const [showSetup, setShowSetup] = useState(() => !loadData()?.habit?.title);
  const [editor, setEditor] = useState(null); // { hour, activity, category }

  // Persist
  useEffect(() => {
    saveData({ habit, logs });
  }, [habit, logs]);

  // 21-day window
  const endDate = useMemo(() => addDays(habit.startDate, 20), [habit.startDate]);
  const withinWindow = useMemo(() => {
    const diffFromStart = daysBetween(habit.startDate, selectedDate);
    const diffToEnd = daysBetween(selectedDate, endDate);
    return diffFromStart >= 0 && diffToEnd >= 0;
  }, [habit.startDate, selectedDate, endDate]);

  const dayIndex = clamp(daysBetween(habit.startDate, selectedDate), 0, 20);
  const currentDayLabel = `Day ${dayIndex + 1} / 21`;

  // Daily helpers
  const dayLogs = logs[selectedDate] || {};
  const totals = useMemo(() => {
    const t = { productive: 0, neutral: 0, waste: 0 };
    Object.values(dayLogs).forEach((entry) => {
      if (entry?.category && t[entry.category] !== undefined) t[entry.category]++;
    });
    return t;
  }, [dayLogs]);

  const overall = useMemo(() => {
    // Aggregate across the whole 21-day window
    const agg = { productive: 0, neutral: 0, waste: 0 };
    for (let i = 0; i < 21; i++) {
      const d = addDays(habit.startDate, i);
      const dl = logs[d] || {};
      Object.values(dl).forEach((e) => {
        if (e?.category && agg[e.category] !== undefined) agg[e.category]++;
      });
    }
    return agg;
  }, [logs, habit.startDate]);

  const streak = useMemo(() => {
    // count consecutive days from start where at least 1 productive hour exists
    let s = 0;
    for (let i = 0; i < 21; i++) {
      const d = addDays(habit.startDate, i);
      const dl = logs[d] || {};
      const hasProductive = Object.values(dl).some((e) => e.category === "productive");
      if (hasProductive) s++;
      else break;
    }
    return s;
  }, [logs, habit.startDate]);

  const last7 = useMemo(() => {
    const points = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(selectedDate, -i);
      const dl = logs[d] || {};
      const prod = Object.values(dl).filter((e) => e.category === "productive").length;
      points.push({ date: d.slice(5), productive: prod });
    }
    return points;
  }, [logs, selectedDate]);

  // Actions
  function startCycle(newTitle, startDate) {
    const t = (newTitle || "").trim();
    setHabit({ title: t || "My 21-Day Habit", startDate });
    setSelectedDate(startDate);
    setShowSetup(false);
  }

  function resetAll() {
    if (!confirm("Reset everything? This will clear all logs.")) return;
    setHabit({ title: "", startDate: todayISO() });
    setLogs({});
    setSelectedDate(todayISO());
    setShowSetup(true);
  }

  function openEditor(hour) {
    const entry = dayLogs[hour] || { activity: "", category: "productive" };
    setEditor({ hour, ...entry });
  }

  function saveEditor() {
    if (!editor) return;
    const { hour, activity, category } = editor;
    setLogs((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [hour]: { activity, category },
      },
    }));
    setEditor(null);
  }

  function clearHour(hour) {
    setLogs((prev) => {
      const day = { ...(prev[selectedDate] || {}) };
      delete day[hour];
      return { ...prev, [selectedDate]: day };
    });
  }

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-30 backdrop-blur border-b border-neutral-800/80 bg-neutral-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500" />
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">21-Day Habit Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
              onClick={() => setShowSetup(true)}
            >
              {habit.title ? "Edit Habit" : "Set Habit"}
            </button>
            <button
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-red-700/60 text-red-300 text-sm"
              onClick={resetAll}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Banner / Summary */}
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-neutral-400 text-sm">Habit</div>
            <div className="mt-1 text-lg font-medium">{habit.title || "Not set"}</div>
            <div className="mt-2 text-xs text-neutral-400">Start: {habit.startDate} · End: {endDate}</div>
          </div>
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-neutral-400 text-sm">Progress</div>
            <div className="mt-2">
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  style={{ width: `${((dayIndex + 1) / 21) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-sm">{currentDayLabel}</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-neutral-400 text-sm">Streak</div>
            <div className="mt-1 text-lg font-medium">{streak} day{streak === 1 ? "" : "s"}</div>
            <div className="mt-1 text-xs text-neutral-400">Consecutive days with ≥1 productive hour</div>
          </div>
        </div>
      </section>

      {/* Date + Totals */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={habit.startDate}
              max={endDate}
            />
            <span className="text-sm text-neutral-400">{withinWindow ? currentDayLabel : "(outside 21-day window)"}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge colorClass="bg-emerald-500/20 text-emerald-300 border-emerald-600/40" label={`Productive: ${totals.productive}`} />
            <Badge colorClass="bg-neutral-500/20 text-neutral-300 border-neutral-600/40" label={`Neutral: ${totals.neutral}`} />
            <Badge colorClass="bg-rose-500/20 text-rose-300 border-rose-600/40" label={`Waste: ${totals.waste}`} />
          </div>
        </div>
      </section>

      {/* 24h Grid */}
      <section className="max-w-6xl mx-auto px-4 mt-4">
        <div className="rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {range(24).map((h) => {
              const entry = dayLogs[h];
              const color = entry
                ? entry.category === "productive"
                  ? "bg-emerald-500/20 border-emerald-600/40"
                  : entry.category === "waste"
                  ? "bg-rose-500/20 border-rose-600/40"
                  : "bg-neutral-500/20 border-neutral-600/40"
                : "hover:bg-neutral-900/60";
              return (
                <button
                  key={h}
                  className={`relative p-3 border border-neutral-800 text-left transition-colors ${color}`}
                  onClick={() => openEditor(h)}
                >
                  <div className="text-xs text-neutral-400">{String(h).padStart(2, "0")}:00</div>
                  <div className="mt-1 text-sm line-clamp-2 min-h-[2rem]">
                    {entry ? entry.activity : <span className="text-neutral-600">Log activity…</span>}
                  </div>
                  {entry && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearHour(h);
                      }}
                      className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-md border border-neutral-700 hover:bg-neutral-800"
                    >
                      Clear
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reports */}
      <section className="max-w-6xl mx-auto px-4 mt-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-sm text-neutral-400">Today Split</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Productive", value: totals.productive },
                      { name: "Neutral", value: totals.neutral },
                      { name: "Waste", value: totals.waste },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {/* No explicit colors (let chart lib pick defaults) */}
                    {[0, 1, 2].map((i) => (
                      <Cell key={i} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-sm text-neutral-400">Last 7 Days – Productive Hours</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} domain={[0, 24]} />
                  <Tooltip />
                  <Bar dataKey="productive" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 lg:col-span-2">
            <div className="text-sm text-neutral-400 mb-2">Overall (21 days)</div>
            <div className="flex gap-3 text-sm">
              <Badge colorClass="bg-emerald-500/20 text-emerald-300 border-emerald-600/40" label={`Productive: ${overall.productive}`} />
              <Badge colorClass="bg-neutral-500/20 text-neutral-300 border-neutral-600/40" label={`Neutral: ${overall.neutral}`} />
              <Badge colorClass="bg-rose-500/20 text-rose-300 border-rose-600/40" label={`Waste: ${overall.waste}`} />
            </div>
          </div>
        </div>
      </section>

      {/* Setup Modal */}
      {showSetup && (
        <Modal onClose={() => setShowSetup(false)} title="Set your 21-day habit">
          <HabitSetupForm
            defaultTitle={habit.title}
            defaultStart={habit.startDate}
            onSave={(t, s) => startCycle(t, s)}
          />
        </Modal>
      )}

      {/* Hour Editor Modal */}
      {editor && (
        <Modal onClose={() => setEditor(null)} title={`Log – ${selectedDate} · ${String(editor.hour).padStart(2, "0")}:00`}>
          <HourEditor
            value={editor}
            onChange={setEditor}
            onSave={saveEditor}
            onCancel={() => setEditor(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// ------------------------
// UI Subcomponents
// ------------------------
function Badge({ colorClass, label }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-xs ${colorClass}`}>{label}</span>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="px-2 py-1 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function HabitSetupForm({ defaultTitle, defaultStart, onSave }) {
  const [title, setTitle] = useState(defaultTitle || "");
  const [start, setStart] = useState(defaultStart || todayISO());

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.(title, start);
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Habit Title</span>
        <input
          className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none"
          placeholder="e.g., Code for 2 hours"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Start Date</span>
        <input
          type="date"
          className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </label>
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={() => onSave?.(title, start)}
        >
          Save
        </button>
      </div>
    </form>
  );
}

function HourEditor({ value, onChange, onSave, onCancel }) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Activity</span>
        <input
          className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 outline-none"
          placeholder="e.g., Studied React, Watched YouTube"
          value={value.activity}
          onChange={(e) => onChange({ ...value, activity: e.target.value })}
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-neutral-300">Category</span>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`px-3 py-2 rounded-xl border text-sm transition-colors ${
                value.category === c.key
                  ? "bg-neutral-800 border-neutral-600"
                  : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
              }`}
              onClick={() => onChange({ ...value, category: c.key })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </label>
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-900 font-medium"
          onClick={onSave}
        >
          Save Log
        </button>
      </div>
    </div>
  );
}
