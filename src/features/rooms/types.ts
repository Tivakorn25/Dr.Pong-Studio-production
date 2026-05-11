export type RoomStatus = 'available' | 'in_use' | 'maintenance';

export type RoomRow = {
  id: string;
  name: string;
  status: RoomStatus;
  updated_at: string;
};

