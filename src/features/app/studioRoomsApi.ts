import { supabase } from '@/src/lib/supabaseClient';
import type { RoomStatus } from '@/src/features/rooms/types';
import type { Room } from '@/src/store';
import type { RoomDbRow } from './dbTypes';
import { mapRoomDbToRoom } from './mappers';
import { adjustEquipmentAvailable, bumpEquipmentTotals, insertEquipment } from './equipmentDbApi';

export async function insertStudioRoom(input: {
  name: string;
  description?: string;
  status?: RoomStatus;
}): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() ?? 'สตูผลิตสื่อคุณภาพ',
      status: input.status ?? 'available',
    })
    .select('id,name,description,status,updated_at')
    .single();

  if (error) throw error;
  return mapRoomDbToRoom({ ...(data as RoomDbRow), room_sections: [] });
}

export async function deleteStudioRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
}

export async function updateStudioRoomMeta(input: {
  id: string;
  name?: string;
  description?: string;
  status?: RoomStatus;
}): Promise<void> {
  const patch: Record<string, string> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase.from('rooms').update(patch).eq('id', input.id);
  if (error) throw error;
}

async function nextSectionSortOrder(roomId: string): Promise<number> {
  const { data, error } = await supabase
    .from('room_sections')
    .select('sort_order')
    .eq('room_id', roomId)
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error) throw error;
  const max = data?.[0]?.sort_order;
  return typeof max === 'number' ? max + 1 : 0;
}

export async function addRoomSectionWithItem(input: {
  roomId: string;
  title: string;
  quantity: number;
  /** If set, decrement warehouse available qty. */
  equipmentId?: string | null;
}): Promise<void> {
  const sortOrder = await nextSectionSortOrder(input.roomId);

  const { data: section, error: secErr } = await supabase
    .from('room_sections')
    .insert({
      room_id: input.roomId,
      title: input.title.trim(),
      sort_order: sortOrder,
    })
    .select('id')
    .single();

  if (secErr) throw secErr;
  const sectionId = section.id as string;

  const { error: itemErr } = await supabase.from('section_checklist_items').insert({
    section_id: sectionId,
    equipment_id: input.equipmentId ?? null,
    name: input.title.trim(),
    quantity: input.quantity,
    status: 'good',
    sort_order: 0,
  });

  if (itemErr) {
    await supabase.from('room_sections').delete().eq('id', sectionId);
    throw itemErr;
  }

  if (input.equipmentId) {
    try {
      await adjustEquipmentAvailable(input.equipmentId, -input.quantity);
    } catch (e) {
      await supabase.from('room_sections').delete().eq('id', sectionId);
      throw e;
    }
  }
}

export async function deleteRoomSection(sectionId: string): Promise<void> {
  const { data: items, error: listErr } = await supabase
    .from('section_checklist_items')
    .select('equipment_id, quantity, name')
    .eq('section_id', sectionId);

  if (listErr) throw listErr;

  for (const it of items ?? []) {
    if (it.equipment_id) {
      await adjustEquipmentAvailable(it.equipment_id as string, Number(it.quantity) || 0);
    } else if (it.name) {
      const { data: eqRows } = await supabase
        .from('equipment')
        .select('id, available_quantity')
        .ilike('name', it.name as string)
        .limit(1);

      const eq = eqRows?.[0];
      if (eq?.id) {
        await adjustEquipmentAvailable(eq.id as string, Number(it.quantity) || 0);
      }
    }
  }

  const { error } = await supabase.from('room_sections').delete().eq('id', sectionId);
  if (error) throw error;
}

/** When a request is approved: add or bump inventory (matches RequestsView behavior). */
export async function syncInventoryFromRequest(input: {
  equipmentName: string;
  quantity: number;
  category: string;
  existingEquipmentId?: string | null;
}): Promise<void> {
  if (input.existingEquipmentId && !input.existingEquipmentId.startsWith('manual-')) {
    await bumpEquipmentTotals({
      id: input.existingEquipmentId,
      totalDelta: input.quantity,
      availableDelta: input.quantity,
    });
    return;
  }

  const { data: rows, error } = await supabase
    .from('equipment')
    .select('id')
    .ilike('name', input.equipmentName)
    .limit(1);

  if (error) throw error;

  const matchId = rows?.[0]?.id as string | undefined;

  if (matchId) {
    await bumpEquipmentTotals({
      id: matchId,
      totalDelta: input.quantity,
      availableDelta: input.quantity,
    });
  } else {
    await insertEquipment({
      name: input.equipmentName,
      category: input.category || 'Accessory',
      totalQuantity: input.quantity,
      availableQuantity: input.quantity,
    });
  }
}
