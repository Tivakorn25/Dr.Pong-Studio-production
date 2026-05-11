import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import type { RoomRow } from './types';
import { listRooms } from './roomsApi';

type State =
  | { status: 'loading'; rooms: RoomRow[]; error: null }
  | { status: 'ready'; rooms: RoomRow[]; error: null }
  | { status: 'error'; rooms: RoomRow[]; error: Error };

function upsertById(rooms: RoomRow[], row: RoomRow) {
  const idx = rooms.findIndex((r) => r.id === row.id);
  if (idx === -1) return [row, ...rooms];
  const next = rooms.slice();
  next[idx] = row;
  return next;
}

export function useRoomsRealtime() {
  const [state, setState] = useState<State>({ status: 'loading', rooms: [], error: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rooms = await listRooms();
        if (cancelled) return;
        // Keep status as-is; realtime subscribe callback will flip to "ready"
        // once we know the channel is actually live.
        setState((prev) => ({
          status: prev.status === 'error' ? prev.status : 'loading',
          rooms,
          error: null,
        }));
      } catch (e) {
        if (cancelled) return;
        setState({
          status: 'error',
          rooms: [],
          error: e instanceof Error ? e : new Error('Failed to load rooms'),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let refetchTimer: number | null = null;
    let refetchQueued = false;

    const queueRefetch = () => {
      if (refetchQueued || disposed) return;
      refetchQueued = true;
      refetchTimer = window.setTimeout(async () => {
        refetchQueued = false;
        try {
          const rooms = await listRooms();
          if (disposed) return;
          setState((prev) => (prev.status === 'error' ? prev : { status: 'ready', rooms, error: null }));
        } catch {
          // Ignore refetch errors; realtime events already updated local state.
        }
      }, 100);
    };

    const channel = supabase
      .channel('rooms-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          setState((prev) => {
            const currentRooms = prev.rooms;

            if (payload.eventType === 'DELETE') {
              const oldRow = payload.old as { id?: string } | null;
              const id = oldRow?.id;
              if (!id) return prev;
              return { ...prev, rooms: currentRooms.filter((r) => r.id !== id) };
            }

            const newRow = payload.new as RoomRow | null;
            if (!newRow?.id) return prev;
            return { ...prev, rooms: upsertById(currentRooms, newRow) };
          });

          // Reconcile ordering and server-side fields (e.g. updated_at trigger)
          // without blocking immediate UI updates.
          queueRefetch();
        },
      )
      .subscribe((status) => {
        if (disposed) return;

        if (status === 'SUBSCRIBED') {
          setState((prev) => (prev.status === 'error' ? prev : { ...prev, status: 'ready', error: null }));
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setState((prev) => ({
            status: 'error',
            rooms: prev.rooms,
            error: new Error(`[Supabase Realtime] ${status}`),
          }));
        }
      });

    return () => {
      disposed = true;
      if (refetchTimer !== null) window.clearTimeout(refetchTimer);
      void supabase.removeChannel(channel);
    };
  }, []);

  const byId = useMemo(() => new Map(state.rooms.map((r) => [r.id, r])), [state.rooms]);

  return { ...state, byId };
}

