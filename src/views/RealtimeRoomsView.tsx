import { useMemo, useState, type ReactNode } from 'react';
import { Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { RoomStatus } from '@/src/features/rooms/types';
import { addRoom, updateRoom } from '@/src/features/rooms/roomsApi';
import { useRoomsRealtime } from '@/src/features/rooms/useRoomsRealtime';
import type { useDrPongStore } from '@/src/store';

const STATUS: { value: RoomStatus; label: string; pill: string }[] = [
  { value: 'available', label: 'Available', pill: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20' },
  { value: 'in_use', label: 'In use', pill: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20' },
  { value: 'maintenance', label: 'Maintenance', pill: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20' },
];

function statusMeta(status: RoomStatus) {
  return STATUS.find((s) => s.value === status) ?? STATUS[0];
}

export default function RealtimeRoomsView({ store }: { store: ReturnType<typeof useDrPongStore> }) {
  const { rooms, status, error } = useRoomsRealtime();
  const isDark = store.isDark;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [newStatus, setNewStatus] = useState<RoomStatus>('available');

  const [editingId, setEditingId] = useState<string | null>(null);
  const editingRoom = useMemo(
    () => rooms.find((r) => r.id === editingId) ?? null,
    [rooms, editingId],
  );
  const [savingEdit, setSavingEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<RoomStatus>('available');

  const openEdit = (id: string) => {
    const r = rooms.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setEditName(r.name);
    setEditStatus(r.status);
  };

  const onCreate = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await addRoom({ name: name.trim(), status: newStatus });
      setName('');
      setNewStatus('available');
      setIsAddOpen(false);
    } finally {
      setAdding(false);
    }
  };

  const onSaveEdit = async () => {
    if (!editingRoom) return;
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      await updateRoom({ id: editingRoom.id, name: editName.trim(), status: editStatus });
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight transition-colors">Rooms (Realtime)</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">
            Add rooms, edit status, and sync instantly across devices via Supabase Realtime.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-400">
            {status === 'error' ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span className="uppercase tracking-widest">
              {status === 'loading' ? 'Connecting…' : status === 'error' ? 'Offline' : 'Live'}
            </span>
          </div>
          {status === 'error' && (
            <div className={`mt-3 rounded-2xl border p-4 text-sm ${
              isDark ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              {error?.message ?? 'Failed to connect to Supabase.'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className={`hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all active:scale-95 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-100'
            }`}
            title="Reload"
          >
            <RefreshCw size={16} />
            Reload
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 ${
              isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
            }`}
          >
            <Plus size={18} />
            Add room
          </button>
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${
        isDark ? 'border-gray-800 bg-[#0E0E0E]' : 'border-gray-100 bg-white shadow-sm'
      }`}>
        <div className={`grid grid-cols-12 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] ${
          isDark ? 'text-gray-500 border-b border-gray-800' : 'text-gray-400 border-b border-gray-100'
        }`}>
          <div className="col-span-6">Room</div>
          <div className="col-span-4">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100/5">
          {rooms.map((r) => {
            const meta = statusMeta(r.status);
            return (
              <div key={r.id} className={`grid grid-cols-12 px-6 py-5 items-center gap-4 ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
              }`}>
                <div className="col-span-6 min-w-0">
                  <div className={`text-base font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {r.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    Updated {new Date(r.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="col-span-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold ${meta.pill}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => openEdit(r.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}

          {rooms.length === 0 && status !== 'loading' && (
            <div className={`px-6 py-20 text-center text-sm italic ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              No rooms yet. Add your first room.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <Modal
            title="Add room"
            isDark={isDark}
            onClose={() => (adding ? null : setIsAddOpen(false))}
          >
            <div className="space-y-4">
              <Field label="Room name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Studio A"
                  className={`w-full border-none rounded-xl p-4 text-sm outline-none transition-all ${
                    isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                  autoFocus
                />
              </Field>
              <Field label="Status">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
                  className={`w-full border-none rounded-xl p-4 text-sm font-bold outline-none transition-all ${
                    isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsAddOpen(false)}
                  disabled={adding}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 ${
                    isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={onCreate}
                  disabled={adding}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 ${
                    isDark ? 'bg-white text-black' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
                  }`}
                >
                  {adding ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingRoom && (
          <Modal title="Edit room" isDark={isDark} onClose={() => (savingEdit ? null : setEditingId(null))}>
            <div className="space-y-4">
              <Field label="Room name">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full border-none rounded-xl p-4 text-sm outline-none transition-all ${
                    isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                  autoFocus
                />
              </Field>
              <Field label="Status">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RoomStatus)}
                  className={`w-full border-none rounded-xl p-4 text-sm font-bold outline-none transition-all ${
                    isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingId(null)}
                  disabled={savingEdit}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 ${
                    isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={onSaveEdit}
                  disabled={savingEdit}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 ${
                    isDark ? 'bg-white text-black' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
                  }`}
                >
                  {savingEdit ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({
  title,
  isDark,
  onClose,
  children,
}: {
  title: string;
  isDark: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className={`text-xl font-bold transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
              isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Esc
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-right">
        {label}
      </label>
      {children}
    </div>
  );
}

