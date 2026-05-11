import { useState, useEffect } from 'react';
import type { RoomStatus } from '@/src/features/rooms/types';

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
  /** Production room availability (Supabase `rooms.status`). */
  status: RoomStatus;
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
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('drpong_theme');
    if (savedTheme) setIsDark(JSON.parse(savedTheme));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('drpong_theme', JSON.stringify(isDark));
    }
  }, [isDark, isLoaded]);

  return {
    isDark,
    setIsDark,
    isLoaded,
  };
}
