import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import type { Equipment, RequestItem, Room } from '@/src/store';
import { fetchAppSnapshot, type AppSnapshot } from './appDataApi';

export type AppDataStatus = 'loading' | 'ready' | 'error';

export type AppDataContextValue = AppSnapshot & {
  status: AppDataStatus;
  error: Error | null;
  refresh: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>({
    rooms: [],
    equipment: [],
    requests: [],
  });
  const [status, setStatus] = useState<AppDataStatus>('loading');
  const [error, setError] = useState<Error | null>(null);
  const refetchTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchAppSnapshot();
      setSnapshot(next);
      setError(null);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load app data'));
      setStatus('error');
    }
  }, []);

  const scheduleRefetch = useCallback(() => {
    if (refetchTimer.current !== null) window.clearTimeout(refetchTimer.current);
    refetchTimer.current = window.setTimeout(() => {
      void refresh();
    }, 120);
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let disposed = false;

    const channel = supabase
      .channel('app-data-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        if (!disposed) scheduleRefetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => {
        if (!disposed) scheduleRefetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_sections' }, () => {
        if (!disposed) scheduleRefetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'section_checklist_items' }, () => {
        if (!disposed) scheduleRefetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_requests' }, () => {
        if (!disposed) scheduleRefetch();
      })
      .subscribe((subStatus) => {
        if (disposed) return;
        if (subStatus === 'SUBSCRIBED') {
          setStatus((s) => (s === 'error' ? s : 'ready'));
          return;
        }
        if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT' || subStatus === 'CLOSED') {
          setError(new Error(`[Supabase Realtime] ${subStatus}`));
          setStatus('error');
        }
      });

    return () => {
      disposed = true;
      if (refetchTimer.current !== null) window.clearTimeout(refetchTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [scheduleRefetch]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...snapshot,
      status,
      error,
      refresh,
    }),
    [snapshot, status, error, refresh],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
