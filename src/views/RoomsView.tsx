import { useState } from 'react';
import { 
  Plus, 
  ChevronRight, 
  Trash2, 
  Layout, 
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, useDrPongStore } from '../store';

export default function RoomsView({ store }: { store: ReturnType<typeof useDrPongStore>, key?: any }) {
  const { rooms, setRooms } = store;
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const addRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
      id: Date.now().toString(),
      name: newRoomName,
      description: 'สตูผลิตสื่อคุณภาพ',
      sections: []
    };
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
    setIsAddingRoom(false);
  };

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
    if (selectedRoomId === id) setSelectedRoomId(null);
  };

  if (selectedRoomId && selectedRoom) {
    return <RoomDetailView room={selectedRoom} onBack={() => setSelectedRoomId(null)} store={store} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight transition-colors">ห้องสตู (Rooms)</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">จัดการข้อมูลอุปกรณ์ตามรายห้อง</p>
        </div>
        <button 
          onClick={() => setIsAddingRoom(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 ${
            store.isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
          }`}
        >
          <Plus size={18} />
          เพิ่มห้องใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {rooms.map((room) => (
            <motion.div
              layout
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group border rounded-3xl p-6 transition-all cursor-pointer relative overflow-hidden ${
                store.isDark 
                  ? 'bg-[#111] border-gray-800 hover:bg-white/5 hover:border-gray-700' 
                  : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-200/50'
              }`}
              onClick={() => setSelectedRoomId(room.id)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRoom(room.id);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    store.isDark ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-red-50 text-red-500'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                store.isDark 
                  ? 'bg-white/5 text-gray-500 group-hover:bg-white group-hover:text-black' 
                  : 'bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white'
              }`}>
                <Layout size={24} />
              </div>
              
              <h3 className={`text-lg font-bold transition-colors ${store.isDark ? 'text-gray-100' : 'text-gray-900 group-hover:text-black'}`}>{room.name}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6 dark:text-gray-400">{room.description}</p>
              
              <div className={`flex items-center justify-between pt-6 border-t transition-colors ${store.isDark ? 'border-gray-800' : 'border-gray-50'}`}>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  {room.sections.length} SECTIONS
                </span>
                <div className={`flex items-center gap-1 font-bold text-sm transition-colors ${store.isDark ? 'text-white' : 'text-black'}`}>
                   เข้าดู <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAddingRoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${store.isDark ? 'bg-gray-900' : 'bg-white'}`}
          >
            <h2 className={`text-xl font-bold mb-6 transition-colors ${store.isDark ? 'text-white' : 'text-black'}`}>เพิ่มห้องใหม่</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-right">ชื่อห้อง</label>
                <input 
                  type="text" 
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className={`w-full border-none rounded-xl p-4 text-sm outline-none transition-all ${
                    store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                  placeholder="เช่น Studio A, ห้องตัดต่อ..."
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAddingRoom(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors ${
                    store.isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={addRoom}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                    store.isDark ? 'bg-white text-black' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
                  }`}
                >
                  สร้างห้อง
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function RoomDetailView({ room, onBack, store }: { room: Room, onBack: () => void, store: ReturnType<typeof useDrPongStore> }) {
  const { rooms, setRooms, equipment, setEquipment } = store;
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    
    // Find if this equipment exists in main list to sync available qty
    const existingEquipment = equipment.find(e => e.name.toLowerCase() === newSectionTitle.toLowerCase());
    
    if (existingEquipment) {
      if (existingEquipment.availableQuantity < newItemQty) {
        // Option: allow anyway but alert, or block. Let's allow but notify if I could.
        // For now, let's just proceed with sync logic.
      }
      
      const updatedEquipment = equipment.map(e => 
        e.id === existingEquipment.id 
          ? { ...e, availableQuantity: Math.max(0, e.availableQuantity - newItemQty) } 
          : e
      );
      setEquipment(updatedEquipment);
    }

    const updatedRoom: Room = {
      ...room,
      sections: [
        ...room.sections,
        { 
          id: Date.now().toString(), 
          title: newSectionTitle.trim(), 
          items: [{ 
            id: Date.now().toString() + "-1", 
            name: newSectionTitle.trim(), 
            quantity: newItemQty, 
            status: 'good' 
          }] 
        }
      ]
    };

    setRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
    setNewSectionTitle('');
    setNewItemQty(1);
    setIsAddingSection(false);
  };

  const deleteSection = (sectionId: string) => {
    const sectionToDelete = room.sections.find(s => s.id === sectionId);
    if (!sectionToDelete) return;

    // Restore available qty
    const mainItem = sectionToDelete.items[0];
    if (mainItem) {
      const existingEquipment = equipment.find(e => e.name.toLowerCase() === mainItem.name.toLowerCase());
      if (existingEquipment) {
        const updatedEquipment = equipment.map(e => 
          e.id === existingEquipment.id 
            ? { ...e, availableQuantity: e.availableQuantity + mainItem.quantity } 
            : e
        );
        setEquipment(updatedEquipment);
      }
    }

    const updatedRoom: Room = {
      ...room,
      sections: room.sections.filter(s => s.id !== sectionId)
    };
    setRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${store.isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-100 text-[#141414]'}`}
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold tracking-tight transition-colors ${store.isDark ? 'text-white' : 'text-[#141414]'}`}>{room.name}</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">จัดการเช็คลิสต์อุปกรณ์ภายในห้อง</p>
        </div>
      </div>

      <div className="space-y-3">
        {room.sections.map((section) => {
          const mainItem = section.items[0] || { status: 'good', quantity: 1 };
          return (
            <div key={section.id} className={`rounded-2xl border transition-all group ${
              store.isDark ? 'bg-[#111] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 shadow-sm overflow-hidden hover:border-gray-300'
            }`}>
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <h2 className={`text-base font-bold truncate tracking-tight transition-colors ${store.isDark ? 'text-gray-200' : 'text-gray-800'}`}>{section.title}</h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-black min-w-[40px] text-center px-3 py-1 rounded-lg border transition-colors ${
                      store.isDark ? 'text-white bg-black border-gray-800' : 'text-gray-800 bg-gray-50 border-gray-100'
                    }`}>
                      {mainItem.quantity}
                    </span>
                    
                    <button 
                      onClick={() => deleteSection(section.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        store.isDark ? 'text-gray-500 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {room.sections.length === 0 && (
          <div className={`py-20 text-center border-2 border-dashed rounded-[2rem] text-gray-400 italic transition-colors ${
            store.isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            ยังไม่มีข้อมูลเช็คลิสต์ในห้องนี้
          </div>
        )}

        <button 
          onClick={() => setIsAddingSection(true)}
          className={`w-full py-8 mt-6 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3 font-bold text-sm ${
            store.isDark 
              ? 'border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 hover:bg-white/5' 
              : 'border-gray-200 text-gray-400 hover:text-black hover:border-black hover:bg-gray-100'
          }`}
        >
          <div className={`p-3 rounded-full shadow-sm transition-colors ${store.isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <Plus size={20} />
          </div>
          เพิ่มรายการ / ส่วนงานใหม่
        </button>
      </div>

      {/* Add Section Modal */}
      {isAddingSection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-[2rem] p-8 w-full max-w-sm shadow-2xl ${store.isDark ? 'bg-gray-900' : 'bg-white'}`}
          >
            <h2 className={`text-xl font-bold mb-8 flex items-center gap-2 transition-colors ${store.isDark ? 'text-white' : 'text-black'}`}>
              <Box className="text-gray-400" size={24} />
              เพิ่มรายการใหม่
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">เลือกอุปกรณ์จากคลัง หรือพิมพ์ชื่อใหม่</label>
                <div className="relative group/search">
                  <input 
                    type="text" 
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className={`w-full border-none rounded-xl p-4 text-base font-bold outline-none transition-all shadow-inner ${
                      store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                    }`}
                    placeholder="ค้นหาอุปกรณ์..."
                    autoFocus
                  />
                  {/* Simple autocomplete dropdown */}
                  {newSectionTitle.length > 0 && equipment.filter(e => 
                    e.name.toLowerCase().includes(newSectionTitle.toLowerCase()) && 
                    e.name.toLowerCase() !== newSectionTitle.toLowerCase()
                  ).length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl border z-10 max-h-48 overflow-y-auto ${
                      store.isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                    }`}>
                      {equipment
                        .filter(e => e.name.toLowerCase().includes(newSectionTitle.toLowerCase()))
                        .map(e => (
                          <button
                            key={e.id}
                            onClick={() => {
                              setNewSectionTitle(e.name);
                            }}
                            className={`w-full text-left p-3 text-sm font-bold flex justify-between items-center transition-colors ${
                              store.isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-black'
                            }`}
                          >
                            <span>{e.name}</span>
                            <span className="text-[10px] text-gray-400 font-black">คงเหลือ {e.availableQuantity}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">จำนวน (Quantity)</label>
                <input 
                  type="number" 
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                  className={`w-full border-none rounded-xl p-4 text-xl font-black text-center outline-none transition-all shadow-inner ${
                    store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                  min="1"
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button 
                  onClick={() => setIsAddingSection(false)}
                  className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
                    store.isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={addSection}
                  className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all active:scale-95 ${
                    store.isDark ? 'bg-white text-black' : 'bg-black text-white shadow-xl shadow-black/10 hover:shadow-black/20'
                  }`}
                >
                  บันทึกรายการ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
