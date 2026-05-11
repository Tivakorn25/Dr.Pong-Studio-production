import type { RoomStatus } from '@/src/features/rooms/types';
import type { Equipment, RequestItem, Room, RoomSection } from '@/src/store';
import type { RequestStatus } from '@/src/store';
import type { EquipmentRequestRow, RoomDbRow } from './dbTypes';

function formatRequestDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function mapEquipmentRow(row: {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
  available_quantity: number;
}): Equipment {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    totalQuantity: row.total_quantity,
    availableQuantity: row.available_quantity,
  };
}

export function mapRoomDbToRoom(r: RoomDbRow): Room {
  const sectionsRaw = r.room_sections ?? [];
  const sections: RoomSection[] = sectionsRaw
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => {
      const itemsRaw = s.section_checklist_items ?? [];
      const items = itemsRaw
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          status: it.status,
          ...(it.note ? { note: it.note } : {}),
        }));
      return {
        id: s.id,
        title: s.title,
        items,
      };
    });

  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    status: (r.status ?? 'available') as RoomStatus,
    sections,
  };
}

export function mapRequestRow(row: EquipmentRequestRow): RequestItem {
  return {
    id: row.id,
    equipmentId: row.equipment_id ?? `manual-${row.id}`,
    equipmentName: row.equipment_name,
    category: row.category,
    quantity: row.quantity,
    requestDate: formatRequestDate(row.created_at),
    status: row.status as RequestStatus,
    requestedBy: row.requested_by,
  };
}
