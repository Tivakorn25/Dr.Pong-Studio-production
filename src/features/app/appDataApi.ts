import { supabase } from '@/src/lib/supabaseClient';
import type { Equipment, RequestItem, Room } from '@/src/store';
import type { EquipmentRequestRow, RoomDbRow } from './dbTypes';
import { mapEquipmentRow, mapRequestRow, mapRoomDbToRoom } from './mappers';

export type AppSnapshot = {
  rooms: Room[];
  equipment: Equipment[];
  requests: RequestItem[];
};

export async function fetchAppSnapshot(): Promise<AppSnapshot> {
  const [roomsRes, equipmentRes, requestsRes] = await Promise.all([
    supabase
      .from('rooms')
      .select(
        `
        id,
        name,
        description,
        status,
        updated_at,
        room_sections (
          id,
          room_id,
          title,
          sort_order,
          updated_at,
          section_checklist_items (
            id,
            section_id,
            equipment_id,
            name,
            quantity,
            status,
            note,
            sort_order,
            updated_at
          )
        )
      `,
      )
      .order('updated_at', { ascending: false }),
    supabase.from('equipment').select('id,name,category,total_quantity,available_quantity').order('name', { ascending: true }),
    supabase.from('equipment_requests').select('*').order('created_at', { ascending: false }),
  ]);

  if (roomsRes.error) throw roomsRes.error;
  if (equipmentRes.error) throw equipmentRes.error;
  if (requestsRes.error) throw requestsRes.error;

  const rooms = ((roomsRes.data ?? []) as RoomDbRow[]).map(mapRoomDbToRoom);
  const equipment = ((equipmentRes.data ?? []) as Parameters<typeof mapEquipmentRow>[0][]).map(mapEquipmentRow);
  const requests = ((requestsRes.data ?? []) as EquipmentRequestRow[]).map(mapRequestRow);

  return { rooms, equipment, requests };
}
