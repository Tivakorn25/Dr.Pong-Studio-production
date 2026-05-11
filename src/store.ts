import { useState, useEffect } from 'react';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  READY = 'ready',
  RETURNED = 'returned',
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
}

export interface RoomSection {
  id: string;
  title: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    status: 'good' | 'damaged' | 'missing';
    note?: string;
  }[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  sections: RoomSection[];
}

export interface RequestItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  category: string;
  quantity: number;
  requestDate: string;
  status: RequestStatus;
  requestedBy: string;
}

export function useDrPongStore() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('drpong_rooms');
    const savedEquipment = localStorage.getItem('drpong_equipment');
    const savedRequests = localStorage.getItem('drpong_requests');
    const savedTheme = localStorage.getItem('drpong_theme');

    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedEquipment) setEquipment(JSON.parse(savedEquipment));
    if (savedRequests) setRequests(JSON.parse(savedRequests));
    if (savedTheme) setIsDark(JSON.parse(savedTheme));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('drpong_rooms', JSON.stringify(rooms));
      localStorage.setItem('drpong_equipment', JSON.stringify(equipment));
      localStorage.setItem('drpong_requests', JSON.stringify(requests));
      localStorage.setItem('drpong_theme', JSON.stringify(isDark));
    }
  }, [rooms, equipment, requests, isDark, isLoaded]);

  // Initial dummy data if empty
  useEffect(() => {
    if (isLoaded && rooms.length === 0 && equipment.length === 0) {
      const initialEquipment: Equipment[] = [
        { id: '1', name: 'Sony A7IV', category: 'Camera', totalQuantity: 3, availableQuantity: 2 },
        { id: '2', name: 'Aputure 600d', category: 'Lighting', totalQuantity: 2, availableQuantity: 2 },
        { id: '3', name: 'Rode NTG3', category: 'Audio', totalQuantity: 2, availableQuantity: 1 },
      ];
      const initialRooms: Room[] = [
        { 
          id: 'r1', 
          name: 'Studio A', 
          description: 'Main production studio', 
          sections: [
            { 
              id: 's1', 
              title: 'Camera Setup', 
              items: [{ id: 'i1', name: 'Tripod Sachtler', status: 'good', quantity: 1 }] 
            }
          ] 
        }
      ];
      setEquipment(initialEquipment);
      setRooms(initialRooms);
    }
  }, [isLoaded, rooms.length, equipment.length]);

  return {
    rooms, setRooms,
    equipment, setEquipment,
    requests, setRequests,
    isDark, setIsDark,
    isLoaded
  };
}
