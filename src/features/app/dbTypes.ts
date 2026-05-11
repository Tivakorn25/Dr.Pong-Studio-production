import type { RoomStatus } from '@/src/features/rooms/types';

export type EquipmentRow = {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
  available_quantity: number;
  updated_at: string;
};

export type ChecklistItemRow = {
  id: string;
  section_id: string;
  equipment_id: string | null;
  name: string;
  quantity: number;
  status: 'good' | 'damaged' | 'missing';
  note: string | null;
  sort_order: number;
  updated_at: string;
};

export type RoomSectionRow = {
  id: string;
  room_id: string;
  title: string;
  sort_order: number;
  updated_at: string;
  section_checklist_items?: ChecklistItemRow[] | null;
};

export type RoomDbRow = {
  id: string;
  name: string;
  description?: string | null;
  status: RoomStatus;
  updated_at: string;
  room_sections?: RoomSectionRow[] | null;
};

export type EquipmentRequestRow = {
  id: string;
  equipment_id: string | null;
  equipment_name: string;
  category: string;
  quantity: number;
  requested_by: string;
  status: 'pending' | 'approved' | 'ready' | 'returned';
  created_at: string;
  updated_at: string;
};
