import { supabase } from '@/src/lib/supabaseClient';
import type { RequestItem } from '@/src/store';
import { RequestStatus } from '@/src/store';
import type { EquipmentRequestRow } from './dbTypes';
import { mapRequestRow } from './mappers';

export async function insertEquipmentRequest(input: {
  equipmentId: string | null;
  equipmentName: string;
  category: string;
  quantity: number;
  requestedBy: string;
  status: RequestStatus;
}): Promise<RequestItem> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .insert({
      equipment_id: input.equipmentId && !input.equipmentId.startsWith('manual-') ? input.equipmentId : null,
      equipment_name: input.equipmentName,
      category: input.category,
      quantity: input.quantity,
      requested_by: input.requestedBy,
      status: input.status,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRequestRow(data as EquipmentRequestRow);
}

export async function updateEquipmentRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<RequestItem> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRequestRow(data as EquipmentRequestRow);
}

export async function deleteEquipmentRequest(id: string): Promise<void> {
  const { error } = await supabase.from('equipment_requests').delete().eq('id', id);
  if (error) throw error;
}
