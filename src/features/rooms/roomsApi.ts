import { supabase } from '@/src/lib/supabaseClient';
import type { RoomRow, RoomStatus } from './types';

export async function listRooms(): Promise<RoomRow[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id,name,status,updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RoomRow[];
}

export async function addRoom(input: { name: string; status: RoomStatus }): Promise<RoomRow> {
  const { data, error } = await supabase
    .from('rooms')
    .insert({ name: input.name, status: input.status })
    .select('id,name,status,updated_at')
    .single();

  if (error) throw error;
  return data as RoomRow;
}

export async function updateRoom(input: {
  id: string;
  name?: string;
  status?: RoomStatus;
}): Promise<RoomRow> {
  const patch: Partial<Pick<RoomRow, 'name' | 'status'>> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from('rooms')
    .update(patch)
    .eq('id', input.id)
    .select('id,name,status,updated_at')
    .single();

  if (error) throw error;
  return data as RoomRow;
}

