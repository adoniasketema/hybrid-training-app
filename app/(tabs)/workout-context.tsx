import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

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
  startWorkout: () => void;
  addStrengthEntry: (exercise: string, sets: number, reps: number, weightKg: number) => void;
  addCardioEntry: (exercise: string, distanceKm: number, durationMin: number) => void;
  completeWorkout: () => void;
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

  const startWorkout = useCallback(() => {
    if (!todayLog) {
      setTodayLog({
        id: todayKey(),
        date: todayKey(),
        completed: false,
        entries: [],
      });
    }
  }, [todayLog]);

  const addStrengthEntry = useCallback(
    (exercise: string, sets: number, reps: number, weightKg: number) => {
      setTodayLog((log) =>
        log
          ? {
              ...log,
              entries: [
                ...log.entries,
                { id: `${Date.now()}`, type: 'strength', exercise, sets, reps, weightKg },
              ],
            }
          : log,
      );
    },
    [],
  );

  const addCardioEntry = useCallback(
    (exercise: string, distanceKm: number, durationMin: number) => {
      setTodayLog((log) =>
        log
          ? {
              ...log,
              entries: [
                ...log.entries,
                { id: `${Date.now()}`, type: 'cardio', exercise, distanceKm, durationMin },
              ],
            }
          : log,
      );
    },
    [],
  );

  const completeWorkout = useCallback(() => {
    setTodayLog((log) => {
      if (!log || log.completed || log.entries.length === 0) {
        return log;
      }

      const completedLog = { ...log, completed: true };
      setWorkoutHistory((history) => [completedLog, ...history.filter((item) => item.date !== completedLog.date)]);
      return completedLog;
    });
  }, []);

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
