import { supabase } from '@/lib/supabase';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type StrengthEntry = {
  id: string;
  type: 'strength';
  exercise: string;
  sets: number;
  reps: number;
  weightKg: number;
};

type CardioEntry = {
  id: string;
  type: 'cardio';
  exercise: string;
  distanceKm: number;
  durationMin: number;
};

type WorkoutEntry = StrengthEntry | CardioEntry;

type WorkoutLog = {
  id: string;
  date: string;
  completed: boolean;
  entries: WorkoutEntry[];
};

type WorkoutContextValue = {
  todayLog: WorkoutLog | null;
  workoutHistory: WorkoutLog[];
  weeklySessions: number;
  streak: number;
  startWorkout: () => Promise<void>;
  addStrengthEntry: (exercise: string, sets: number, reps: number, weightKg: number) => Promise<void>;
  addCardioEntry: (exercise: string, distanceKm: number, durationMin: number) => Promise<void>;
  completeWorkout: () => Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

const todayKey = () => new Date().toISOString().slice(0, 10);

const dateDiffInDays = (current: Date, previous: Date) => {
  const utc1 = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
  const utc2 = Date.UTC(previous.getFullYear(), previous.getMonth(), previous.getDate());
  return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [todayLog, setTodayLog] = useState<WorkoutLog | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: workouts } = await supabase
      .from('workouts')
      .select(`
        id, date, completed,
        workout_exercises (
          id, sets, reps, weight_kg, duration_minutes, distance_km,
          exercises ( id, name, type )
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!workouts) return;

    const mapped: WorkoutLog[] = workouts.map((w: any) => ({
      id: w.id,
      date: w.date,
      completed: w.completed,
      entries: w.workout_exercises.map((we: any) => {
        if (we.exercises.type === 'cardio') {
          return {
            id: we.id,
            type: 'cardio',
            exercise: we.exercises.name,
            distanceKm: we.distance_km ?? 0,
            durationMin: we.duration_minutes ?? 0,
          } as CardioEntry;
        } else {
          return {
            id: we.id,
            type: 'strength',
            exercise: we.exercises.name,
            sets: we.sets ?? 0,
            reps: we.reps ?? 0,
            weightKg: we.weight_kg ?? 0,
          } as StrengthEntry;
        }
      }),
    }));

    const today = mapped.find((w) => w.date === todayKey()) ?? null;
    const history = mapped.filter((w) => w.completed);

    setTodayLog(today);
    setWorkoutHistory(history);
  };

  const startWorkout = useCallback(async () => {
    if (todayLog) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, date: todayKey(), completed: false })
      .select()
      .single();

    if (error || !data) return;

    setTodayLog({ id: data.id, date: data.date, completed: false, entries: [] });
  }, [todayLog]);

  const addStrengthEntry = useCallback(
    async (exercise: string, sets: number, reps: number, weightKg: number) => {
      if (!todayLog) return;

      const { data: ex } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', exercise)
        .single();

      if (!ex) return;

      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({ workout_id: todayLog.id, exercise_id: ex.id, sets, reps, weight_kg: weightKg })
        .select()
        .single();

      if (error || !data) return;

      setTodayLog((log) =>
        log ? {
          ...log,
          entries: [...log.entries, { id: data.id, type: 'strength', exercise, sets, reps, weightKg }],
        } : log
      );
    },
    [todayLog]
  );

  const addCardioEntry = useCallback(
    async (exercise: string, distanceKm: number, durationMin: number) => {
      if (!todayLog) return;

      const { data: ex } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', exercise)
        .single();

      if (!ex) return;

      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({ workout_id: todayLog.id, exercise_id: ex.id, duration_minutes: durationMin, distance_km: distanceKm })
        .select()
        .single();

      if (error || !data) return;

      setTodayLog((log) =>
        log ? {
          ...log,
          entries: [...log.entries, { id: data.id, type: 'cardio', exercise, distanceKm, durationMin }],
        } : log
      );
    },
    [todayLog]
  );

  const completeWorkout = useCallback(async () => {
    if (!todayLog || todayLog.completed || todayLog.entries.length === 0) return;

    const { error } = await supabase
      .from('workouts')
      .update({ completed: true })
      .eq('id', todayLog.id);

    if (error) return;

    const completedLog = { ...todayLog, completed: true };
    setTodayLog(completedLog);
    setWorkoutHistory((history) => [completedLog, ...history.filter((w) => w.date !== completedLog.date)]);
  }, [todayLog]);

  const streak = useMemo(() => {
    const history = [...workoutHistory].sort((a, b) => b.date.localeCompare(a.date));
    let streakCount = 0;
    let lastDate = new Date();

    for (const entry of history) {
      const entryDate = new Date(entry.date);
      const difference = dateDiffInDays(lastDate, entryDate);
      if (difference === 0 || difference === 1) {
        streakCount += 1;
        lastDate = entryDate;
      } else {
        break;
      }
    }

    return streakCount;
  }, [workoutHistory]);

  const weeklySessions = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    return workoutHistory.filter((entry) => new Date(entry.date) >= cutoff).length;
  }, [workoutHistory]);

  const value: WorkoutContextValue = {
    todayLog,
    workoutHistory,
    weeklySessions,
    streak,
    startWorkout,
    addStrengthEntry,
    addCardioEntry,
    completeWorkout,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
}