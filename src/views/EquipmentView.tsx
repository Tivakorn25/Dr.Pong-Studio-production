import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Tag,
  Hash,
  ChevronDown,
  CheckCircle2,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Equipment, useDrPongStore } from '../store';

export default function EquipmentView({ store }: { store: ReturnType<typeof useDrPongStore> }) {
  const { equipment, setEquipment } = store;
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [form, setForm] = useState<Partial<Equipment>>({
    name: '',
    category: 'Camera',
    totalQuantity: 1,
    availableQuantity: 1
  });

  const categories = ['Camera', 'Lens', 'Lighting', 'Audio', 'Grip', 'Accessory'];

  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const addEquipment = () => {
    if (!form.name || !form.category) return;
    const newEquip: Equipment = {
      id: Date.now().toString(),
      name: form.name,
      category: form.category,
      totalQuantity: form.totalQuantity || 1,
      availableQuantity: form.availableQuantity || form.totalQuantity || 1
    };
    setEquipment([...equipment, newEquip]);
    setIsAdding(false);
    setForm({ name: '', category: 'Camera', totalQuantity: 1, availableQuantity: 1 });
  };

  const updateEquipment = () => {
    if (!editingItem || !form.name) return;
    setEquipment(equipment.map(e => e.id === editingItem.id ? {
      ...e,
      name: form.name!,
      category: form.category!,
      totalQuantity: form.totalQuantity!,
      availableQuantity: form.availableQuantity!
    } : e));
    setEditingItem(null);
    setForm({ name: '', category: 'Camera', totalQuantity: 1, availableQuantity: 1 });
  };

  const startEdit = (item: Equipment) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      totalQuantity: item.totalQuantity,
      availableQuantity: item.availableQuantity
    });
  };

  const deleteEquipment = (id: string) => {
    setEquipment(equipment.filter(e => e.id !== id));
  };

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">คลังอุปกรณ์ (Inventory)</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">จัดการรายการอุปกรณ์โปรดักชั่นทั้งหมดในสตูดิโอ</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all active:scale-95 ${
            store.isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
          }`}
        >
          <Plus size={18} />
          เพิ่มอุปกรณ์ใหม่
        </button>
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden transition-colors duration-300 ${
        store.isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        {/* Controls */}
        <div className={`p-6 border-b flex flex-col sm:flex-row items-center gap-4 ${store.isDark ? 'border-gray-800' : 'border-gray-50'}`}>
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่ออุปกรณ์ หรือหมวดหมู่..." 
              className={`w-full border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all ${
                store.isDark ? 'bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-gray-700' : 'bg-gray-50 text-black focus:bg-white focus:ring-2 focus:ring-black shadow-inner'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-colors ${
            store.isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
          }`}>
            <Filter size={18} />
            Filter
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={store.isDark ? 'bg-white/5' : 'bg-gray-50/50'}>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] w-16">#</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">ชื่ออุปกรณ์</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">หมวดหมู่</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">จำนวน (พร้อมใช้ / ทั้งหมด)</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">สถานะ</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${store.isDark ? 'divide-gray-800' : 'divide-gray-50'}`}>
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item, index) => (
                  <tr key={item.id} className={`transition-colors group ${store.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50/80'}`}>
                    <td className="px-8 py-6 font-mono text-xs text-gray-400">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className={`font-bold transition-colors ${store.isDark ? 'text-gray-100' : 'text-[#141414]'}`}>{item.name}</span>
                        <span className="text-[10px] text-gray-400 italic font-medium">SKU-{item.id.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        store.isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Tag size={12} />
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold transition-colors ${store.isDark ? 'text-white' : 'text-black'}`}>{item.availableQuantity}</span>
                        <span className="text-gray-300 text-sm">/</span>
                        <span className="text-gray-400 text-sm">{item.totalQuantity}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {item.availableQuantity === 0 ? (
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          store.isDark ? 'text-red-400 bg-red-400/10' : 'text-red-500 bg-red-50'
                        }`}>Out of Stock</span>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          store.isDark ? 'text-green-400 bg-green-400/10' : 'text-green-500 bg-green-50'
                        }`}>Available</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            store.isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteEquipment(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            store.isDark ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">
                    ไม่พบรายการอุปกรณ์ที่คุณค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl transition-colors duration-300 border ${
              store.isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
            } overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-current">
                {editingItem ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
              </h2>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${store.isDark ? 'bg-white !text-black' : 'bg-black'}`}>
                <Box size={24} />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">ชื่ออุปกรณ์</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className={`w-full border-none rounded-2xl p-4 text-base font-bold outline-none transition-all shadow-inner ${
                    store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                  }`}
                  placeholder="ระบุชื่ออุปกรณ์..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">จำนวน</label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      value={form.totalQuantity}
                      onChange={(e) => setForm({...form, totalQuantity: parseInt(e.target.value) || 1})}
                      className={`w-full border-none rounded-2xl p-4 pl-12 text-xl font-black text-center outline-none transition-all shadow-inner ${
                        store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                      }`}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">หมวดหมู่</label>
                  <div className="relative">
                    <select 
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      className={`w-full border-none rounded-2xl p-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer shadow-inner ${
                        store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                      }`}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {editingItem && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">จำนวนที่พร้อมใช้</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      value={form.availableQuantity}
                      onChange={(e) => setForm({...form, availableQuantity: parseInt(e.target.value) || 0})}
                      className={`w-full border-none rounded-2xl p-4 pl-12 text-xl font-black text-center outline-none transition-all shadow-inner ${
                        store.isDark ? 'bg-black text-green-400 focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-green-600 focus:ring-2 focus:ring-black'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                  }}
                  className={`flex-1 px-8 py-4 rounded-2xl font-bold transition-all ${
                    store.isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={editingItem ? updateEquipment : addEquipment}
                  className={`flex-1 px-8 py-4 rounded-2xl font-bold font-bold transition-all active:scale-95 ${
                    store.isDark ? 'bg-white text-black' : 'bg-black text-white shadow-xl shadow-black/10 hover:shadow-black/20'
                  }`}
                >
                  {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มอุปกรณ์'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
