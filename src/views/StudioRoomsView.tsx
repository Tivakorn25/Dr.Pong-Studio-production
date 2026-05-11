import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Plus, ChevronRight, Trash2, Layout, Box, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { RoomStatus } from '@/src/features/rooms/types';
import { useAppData } from '@/src/features/app/AppDataContext';
import {
  addRoomSectionWithItem,
  deleteRoomSection,
  deleteStudioRoom,
  insertStudioRoom,
  updateStudioRoomMeta,
} from '@/src/features/app/studioRoomsApi';
import type { Equipment, Room } from '@/src/store';
import { useDrPongStore } from '@/src/store';

type DrPongStore = ReturnType<typeof useDrPongStore>;

const STATUS_META: { value: RoomStatus; label: string; pill: string }[] = [
  { value: 'available', label: 'ว่าง', pill: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20' },
  { value: 'in_use', label: 'ใช้งาน', pill: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20' },
  { value: 'maintenance', label: 'ซ่อมบำรุง', pill: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20' },
];

function statusPill(status: RoomStatus) {
  return STATUS_META.find((s) => s.value === status) ?? STATUS_META[0];
}

export default function StudioRoomsView({ store }: { store: DrPongStore }) {
  const { rooms, equipment, status, error, refresh } = useAppData();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [busy, setBusy] = useState(false);

  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<RoomStatus>('available');

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  useEffect(() => {
    if (selectedRoomId && !rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(null);
    }
  }, [rooms, selectedRoomId]);

  const openEditRoom = (room: Room) => {
    setEditRoom(room);
    setEditName(room.name);
    setEditDescription(room.description);
    setEditStatus(room.status);
  };

  const saveEditRoom = async () => {
    if (!editRoom || !editName.trim()) return;
    setBusy(true);
    try {
      await updateStudioRoomMeta({
        id: editRoom.id,
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
      });
      setEditRoom(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const addRoom = async () => {
    if (!newRoomName.trim()) return;
    setBusy(true);
    try {
      await insertStudioRoom({ name: newRoomName.trim() });
      setNewRoomName('');
      setIsAddingRoom(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const removeRoom = async (id: string) => {
    setBusy(true);
    try {
      await deleteStudioRoom(id);
      if (selectedRoomId === id) setSelectedRoomId(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (selectedRoomId && selectedRoom) {
    return (
      <RoomDetailView
        room={selectedRoom}
        equipment={equipment}
        isDark={store.isDark}
        busy={busy}
        setBusy={setBusy}
        onBack={() => setSelectedRoomId(null)}
        onRefresh={refresh}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight transition-colors">ห้องสตู (Rooms)</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">ซิงก์แบบเรียลไทม์ผ่าน Supabase — ห้อง เช็คลิสต์ และคลังอุปกรณ์</p>
          {status === 'error' && error && (
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
          )}
        </div>
        <button
          onClick={() => setIsAddingRoom(true)}
          disabled={busy || status === 'loading'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 ${
            store.isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
          }`}
        >
          <Plus size={18} />
          เพิ่มห้องใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {rooms.map((room) => {
            const meta = statusPill(room.status);
            return (
              <motion.div
                layout
                key={room.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group border rounded-3xl p-6 transition-all relative overflow-hidden ${
                  store.isDark
                    ? 'bg-[#111] border-gray-800 hover:bg-white/5 hover:border-gray-700'
                    : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-200/50'
                }`}
              >
                <div className="absolute top-0 right-0 p-3 flex gap-1 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditRoom(room);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      store.isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    title="แก้ไข"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void removeRoom(room.id);
                    }}
                    disabled={busy}
                    className={`p-2 rounded-full transition-colors ${
                      store.isDark ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-red-50 text-red-500'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                      store.isDark
                        ? 'bg-white/5 text-gray-500 group-hover:bg-white group-hover:text-black'
                        : 'bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white'
                    }`}
                  >
                    <Layout size={24} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2 pr-16">
                    <h3
                      className={`text-lg font-bold transition-colors ${
                        store.isDark ? 'text-gray-100' : 'text-gray-900 group-hover:text-black'
                      }`}
                    >
                      {room.name}
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${meta.pill}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6 dark:text-gray-400 line-clamp-2">{room.description}</p>

                  <div
                    className={`flex items-center justify-between pt-6 border-t transition-colors ${
                      store.isDark ? 'border-gray-800' : 'border-gray-50'
                    }`}
                  >
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      {room.sections.length} SECTIONS
                    </span>
                    <div
                      className={`flex items-center gap-1 font-bold text-sm transition-colors ${
                        store.isDark ? 'text-white' : 'text-black'
                      }`}
                    >
                      เข้าดู <ChevronRight size={16} />
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {rooms.length === 0 && status !== 'loading' && (
        <div className={`py-16 text-center rounded-3xl border border-dashed ${store.isDark ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
          ยังไม่มีห้อง — เพิ่มห้องแรก หรือรันสคริปต์ SQL ใน Supabase
        </div>
      )}

      {isAddingRoom && (
        <Modal isDark={store.isDark} title="เพิ่มห้องใหม่" onClose={() => !busy && setIsAddingRoom(false)}>
          <div className="space-y-4">
            <Field label="ชื่อห้อง">
              <input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className={inputClass(store.isDark)}
                placeholder="เช่น Studio A..."
                autoFocus
              />
            </Field>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAddingRoom(false)}
                disabled={busy}
                className={btnGhost(store.isDark)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => void addRoom()}
                disabled={busy}
                className={btnPrimary(store.isDark)}
              >
                {busy ? 'กำลังบันทึก…' : 'สร้างห้อง'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editRoom && (
        <Modal isDark={store.isDark} title="แก้ไขห้อง" onClose={() => !busy && setEditRoom(null)}>
          <div className="space-y-4">
            <Field label="ชื่อห้อง">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass(store.isDark)} />
            </Field>
            <Field label="คำอธิบาย">
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={inputClass(store.isDark)}
              />
            </Field>
            <Field label="สถานะ">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RoomStatus)}
                className={inputClass(store.isDark)}
              >
                {STATUS_META.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setEditRoom(null)} disabled={busy} className={btnGhost(store.isDark)}>
                ยกเลิก
              </button>
              <button type="button" onClick={() => void saveEditRoom()} disabled={busy} className={btnPrimary(store.isDark)}>
                {busy ? 'กำลังบันทึก…' : 'บันทึก'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RoomDetailView({
  room,
  equipment,
  isDark,
  busy,
  setBusy,
  onBack,
  onRefresh,
}: {
  room: Room;
  equipment: Equipment[];
  isDark: boolean;
  busy: boolean;
  setBusy: (v: boolean) => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    const existingEquipment = equipment.find((e) => e.name.toLowerCase() === newSectionTitle.trim().toLowerCase());
    setBusy(true);
    try {
      await addRoomSectionWithItem({
        roomId: room.id,
        title: newSectionTitle.trim(),
        quantity: newItemQty,
        equipmentId: existingEquipment?.id,
      });
      setNewSectionTitle('');
      setNewItemQty(1);
      setIsAddingSection(false);
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    setBusy(true);
    try {
      await deleteRoomSection(sectionId);
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-100 text-[#141414]'}`}
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#141414]'}`}>
            {room.name}
          </h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">จัดการเช็คลิสต์อุปกรณ์ภายในห้อง</p>
        </div>
      </div>

      <div className="space-y-3">
        {room.sections.map((section) => {
          const mainItem = section.items[0] || { status: 'good' as const, quantity: 1 };
          return (
            <div
              key={section.id}
              className={`rounded-2xl border transition-all group ${
                isDark ? 'bg-[#111] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 shadow-sm overflow-hidden hover:border-gray-300'
              }`}
            >
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <h2 className={`text-base font-bold truncate tracking-tight transition-colors ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {section.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-black min-w-[40px] text-center px-3 py-1 rounded-lg border transition-colors ${
                      isDark ? 'text-white bg-black border-gray-800' : 'text-gray-800 bg-gray-50 border-gray-100'
                    }`}
                  >
                    {mainItem.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void deleteSection(section.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark ? 'text-gray-500 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {room.sections.length === 0 && (
          <div
            className={`py-20 text-center border-2 border-dashed rounded-[2rem] text-gray-400 italic transition-colors ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            ยังไม่มีข้อมูลเช็คลิสต์ในห้องนี้
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsAddingSection(true)}
          disabled={busy}
          className={`w-full py-8 mt-6 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3 font-bold text-sm disabled:opacity-50 ${
            isDark
              ? 'border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 hover:bg-white/5'
              : 'border-gray-200 text-gray-400 hover:text-black hover:border-black hover:bg-gray-100'
          }`}
        >
          <div className={`p-3 rounded-full shadow-sm transition-colors ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <Plus size={20} />
          </div>
          เพิ่มรายการ / ส่วนงานใหม่
        </button>
      </div>

      {isAddingSection && (
        <Modal isDark={isDark} title="เพิ่มรายการใหม่" onClose={() => !busy && setIsAddingSection(false)}>
          <div className="space-y-6">
            <Field label="เลือกอุปกรณ์จากคลัง หรือพิมพ์ชื่อใหม่">
              <div className="relative">
                <input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className={inputClass(isDark)}
                  placeholder="ค้นหาอุปกรณ์..."
                  autoFocus
                />
                {newSectionTitle.length > 0 &&
                  equipment.filter(
                    (e) =>
                      e.name.toLowerCase().includes(newSectionTitle.toLowerCase()) &&
                      e.name.toLowerCase() !== newSectionTitle.toLowerCase(),
                  ).length > 0 && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl border z-10 max-h-48 overflow-y-auto ${
                        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                      }`}
                    >
                      {equipment
                        .filter((e) => e.name.toLowerCase().includes(newSectionTitle.toLowerCase()))
                        .map((e) => (
                          <button
                            type="button"
                            key={e.id}
                            onClick={() => setNewSectionTitle(e.name)}
                            className={`w-full text-left p-3 text-sm font-bold flex justify-between items-center transition-colors ${
                              isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-black'
                            }`}
                          >
                            <span>{e.name}</span>
                            <span className="text-[10px] text-gray-400 font-black">คงเหลือ {e.availableQuantity}</span>
                          </button>
                        ))}
                    </div>
                  )}
              </div>
            </Field>
            <Field label="จำนวน (Quantity)">
              <input
                type="number"
                min={1}
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseInt(e.target.value, 10) || 1)}
                className={inputClass(isDark)}
              />
            </Field>
            <div className="flex gap-3 pt-6">
              <button type="button" onClick={() => setIsAddingSection(false)} disabled={busy} className={btnGhost(isDark)}>
                ยกเลิก
              </button>
              <button type="button" onClick={() => void addSection()} disabled={busy} className={btnPrimary(isDark)}>
                {busy ? 'กำลังบันทึก…' : 'บันทึกรายการ'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, isDark, onClose, children }: { title: string; isDark: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      >
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
          <Box className="text-gray-400" size={24} />
          {title}
        </h2>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-right">{label}</label>
      {children}
    </div>
  );
}

function inputClass(isDark: boolean) {
  return `w-full border-none rounded-xl p-4 text-sm outline-none transition-all ${
    isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
  }`;
}

function btnGhost(isDark: boolean) {
  return `flex-1 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 ${
    isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
  }`;
}

function btnPrimary(isDark: boolean) {
  return `flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 ${
    isDark ? 'bg-white text-black' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
  }`;
}
