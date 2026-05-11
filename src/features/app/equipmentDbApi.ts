import { supabase } from '@/src/lib/supabaseClient';
import type { Equipment } from '@/src/store';
import { mapEquipmentRow } from './mappers';

export async function insertEquipment(input: {
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
}): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .insert({
      name: input.name,
      category: input.category,
      total_quantity: input.totalQuantity,
      available_quantity: input.availableQuantity,
    })
    .select('id,name,category,total_quantity,available_quantity')
    .single();

  if (error) throw error;
  return mapEquipmentRow(data);
}

export async function updateEquipmentRow(input: {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
}): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .update({
      name: input.name,
      category: input.category,
      total_quantity: input.totalQuantity,
      available_quantity: input.availableQuantity,
    })
    .eq('id', input.id)
    .select('id,name,category,total_quantity,available_quantity')
    .single();

  if (error) throw error;
  return mapEquipmentRow(data);
}

export async function deleteEquipmentRow(id: string): Promise<void> {
  const { error } = await supabase.from('equipment').delete().eq('id', id);
  if (error) throw error;
}

/** Adjust available quantity by delta (can be negative). */
export async function adjustEquipmentAvailable(id: string, delta: number): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from('equipment')
    .select('available_quantity')
    .eq('id', id)
    .single();

  if (fetchErr) throw fetchErr;
  const next = Math.max(0, (row?.available_quantity ?? 0) + delta);
  const { error } = await supabase.from('equipment').update({ available_quantity: next }).eq('id', id);
  if (error) throw error;
}

export async function bumpEquipmentTotals(input: {
  id: string;
  totalDelta: number;
  availableDelta: number;
}): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from('equipment')
    .select('total_quantity, available_quantity')
    .eq('id', input.id)
    .single();

  if (fetchErr) throw fetchErr;
  const total = Math.max(0, (row?.total_quantity ?? 0) + input.totalDelta);
  const available = Math.max(0, (row?.available_quantity ?? 0) + input.availableDelta);
  const { error } = await supabase
    .from('equipment')
    .update({ total_quantity: total, available_quantity: available })
    .eq('id', input.id);

  if (error) throw error;
}
