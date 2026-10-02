'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Plus,
  Download,
  Upload,
  Trash2,
  Pencil,
  CalendarCheck2,
  TrendingUp,
  Sparkles,
  Target,
  Flame,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

type Habit = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  items: Record<string, boolean>;
};

const STORAGE_KEY = 'habit-growth-v1';
const DAYS = 30;

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toISODate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getLastNDays(n: number) {
  const arr: { iso: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    arr.push({ iso: toISODate(date), label: `${date.getMonth() + 1}/${date.getDate()}` });
  }
  return arr;
}

function calculateStreak(habit: Habit) {
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const iso = toISODate(cursor);
    if (habit.items[iso]) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

function calculateCompletionRate(habit: Habit) {
  const lastDays = getLastNDays(DAYS);
  const count = lastDays.filter((day) => habit.items[day.iso]).length;
  return Math.round((count / DAYS) * 100);
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6ee7b7');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Habit[];
        setHabits(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (habits.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [habits]);

  const totalCompletion = useMemo(() => {
    if (!habits.length) return 0;
    const total = habits.reduce((sum, habit) => sum + calculateCompletionRate(habit), 0);
    return Math.round(total / habits.length);
  }, [habits]);

  const longestStreak = useMemo(() => {
    if (!habits.length) return 0;
    return Math.max(...habits.map(calculateStreak));
  }, [habits]);

  const addHabit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newHabit: Habit = {
      id: window.crypto.randomUUID(),
      name: trimmed,
      color,
      createdAt: toISODate(new Date()),
      items: {}
    };

    setHabits((current) => [newHabit, ...current]);
    setName('');
    setColor('#6ee7b7');
  };

  const toggleDay = (habitId: string, iso: string) => {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) return habit;
        const nextItems = { ...habit.items };
        if (nextItems[iso]) delete nextItems[iso];
        else nextItems[iso] = true;
        return { ...habit, items: nextItems };
      })
    );
  };

  const updateHabitName = (habitId: string) => {
    const target = habits.find((habit) => habit.id === habitId);
    if (!target) return;
    const value = window.prompt('Edit habit name', target.name);
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setHabits((current) =>
      current.map((habit) => (habit.id === habitId ? { ...habit, name: trimmed } : habit))
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((current) => current.filter((habit) => habit.id !== habitId));
  };

  const exportHabits = () => {
    const blob = new Blob([JSON.stringify(habits, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-growth-${toISODate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importHabits = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Habit[];
      if (!Array.isArray(parsed)) throw new Error('Invalid file');
      setHabits(parsed);
    } catch {
      window.alert('Import failed. Please upload a valid habit export JSON file.');
    } finally {
      event.target.value = '';
    }
  };

  const clearAll = () => {
    if (!window.confirm('Clear all habits?')) return;
    setHabits([]);
  };

  const days = getLastNDays(DAYS);

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-emerald-300/80">
              <Sparkles className="h-4 w-4" />
              Personal growth dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Habit Growth</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportHabits}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400/40 hover:text-white">
              <Upload className="h-4 w-4" />
              Import
              <input type="file" accept="application/json" className="hidden" onChange={importHabits} />
            </label>

            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Longest streak" value={`${longestStreak} days`} tone="rose" />
          <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Average completion" value={`${totalCompletion}%`} tone="emerald" />
          <MetricCard icon={<Target className="h-5 w-5" />} label="Active habits" value={`${habits.length}`} tone="violet" />
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-soft backdrop-blur-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
              <Plus className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">Add a new habit</h2>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Read 20 minutes, journal, workout..."
              className="h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-slate-100 outline-none transition focus:border-emerald-400/60"
            />
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2">
              <span className="text-sm text-slate-300">Color</span>
              <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded-md border-0 bg-transparent p-0" />
            </div>
            <button
              onClick={addHabit}
              className="h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-violet-500 px-5 font-medium text-slate-950 transition hover:opacity-95"
            >
              Add habit
            </button>
          </div>
        </section>

        <section className="space-y-6">
          {habits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/50 p-10 text-center text-slate-300">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
                <CalendarCheck2 className="h-6 w-6" />
              </div>
              <p className="text-lg font-medium text-slate-100">No habits yet</p>
              <p className="mt-2 text-sm text-slate-400">Add your first habit above and build momentum.</p>
            </div>
          ) : (
            habits.map((habit) => {
              const streak = calculateStreak(habit);
              const rate = calculateCompletionRate(habit);

              return (
                <article key={habit.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-soft backdrop-blur-md">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: habit.color }} />
                      <h3 className="text-xl font-semibold">{habit.name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateHabitName(habit.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300 transition hover:border-sky-400/50 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-sm text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
                      <Flame className="h-4 w-4 text-rose-300" />
                      {streak} day streak
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-300" />
                      {rate}% in last 30 days
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="flex min-w-[760px] gap-2">
                      {days.map((day) => {
                        const done = !!habit.items[day.iso];
                        return (
                          <button
                            key={`${habit.id}-${day.iso}`}
                            onClick={() => toggleDay(habit.id, day.iso)}
                            title={`${habit.name} on ${day.iso}`}
                            className={[
                              'flex h-12 w-12 flex-col items-center justify-center rounded-xl border transition duration-150',
                              done
                                ? 'border-transparent text-slate-950 shadow-lg'
                                : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-violet-400/40'
                            ].join(' ')}
                            style={done ? { background: `linear-gradient(135deg, ${habit.color}, #f8fafc)` } : undefined}
                          >
                            <span className="text-[10px] font-medium">{day.label.split('/')[0]}</span>
                            <span className="text-xs font-semibold">{day.label.split('/')[1]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <footer className="mt-10 flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            Local-first and privacy focused
          </div>
          <span className="inline-flex items-center gap-2 text-slate-400">
            Built for momentum <ChevronRight className="h-4 w-4" />
          </span>
        </footer>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'rose' | 'emerald' | 'violet';
}) {
  const palette = {
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-200 border-rose-400/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-400/20',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-400/20'
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${palette[tone]}`}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/60">{icon}</div>
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
