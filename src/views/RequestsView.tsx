import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Package, 
  RotateCcw,
  User,
  Calendar,
  AlertCircle,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppData } from '@/src/features/app/AppDataContext';
import {
  deleteEquipmentRequest,
  insertEquipmentRequest,
  updateEquipmentRequestStatus,
} from '@/src/features/app/requestsDbApi';
import { syncInventoryFromRequest } from '@/src/features/app/studioRoomsApi';
import { RequestStatus, useDrPongStore } from '../store';

export default function RequestsView({ 
  store, 
  onShowEquipment 
}: { 
  store: ReturnType<typeof useDrPongStore>,
  onShowEquipment?: () => void 
}) {
  const { requests, equipment, refresh } = useAppData();
  const [isAdding, setIsAdding] = useState(false);
  
  const categories = ['Camera', 'Lens', 'Lighting', 'Audio', 'Grip', 'Accessory'];

  // New Request Form
  const [reqForm, setReqForm] = useState({
    equipmentName: '',
    category: 'Camera',
    quantity: 1,
    requestedBy: '',
    status: RequestStatus.PENDING
  });

  const addRequest = async () => {
    if (!reqForm.equipmentName.trim() || !reqForm.requestedBy.trim()) return;

    const matchedEquipment = equipment.find(e => e.name.toLowerCase() === reqForm.equipmentName.toLowerCase());

    if (reqForm.status === RequestStatus.APPROVED) {
      await syncInventoryFromRequest({
        equipmentName: reqForm.equipmentName.trim(),
        quantity: reqForm.quantity,
        category: reqForm.category,
        existingEquipmentId: matchedEquipment?.id ?? null,
      });
    } else {
      await insertEquipmentRequest({
        equipmentId: matchedEquipment?.id ?? null,
        equipmentName: reqForm.equipmentName.trim(),
        category: reqForm.category,
        quantity: reqForm.quantity,
        requestedBy: reqForm.requestedBy.trim(),
        status: reqForm.status,
      });
    }

    await refresh();
    setIsAdding(false);
    setReqForm({ 
      equipmentName: '', 
      category: 'Camera', 
      quantity: 1, 
      requestedBy: '', 
      status: RequestStatus.PENDING 
    });
  };

  const updateStatus = async (id: string, status: RequestStatus) => {
    if (status === RequestStatus.APPROVED) {
      const req = requests.find(r => r.id === id);
      if (req) {
        await syncInventoryFromRequest({
          equipmentName: req.equipmentName,
          quantity: req.quantity,
          category: req.category,
          existingEquipmentId: req.equipmentId.startsWith('manual-') ? null : req.equipmentId,
        });
        await deleteEquipmentRequest(id);
        await refresh();
        return;
      }
    }
    await updateEquipmentRequestStatus(id, status);
    await refresh();
  };

  const deleteRequest = async (id: string) => {
    await deleteEquipmentRequest(id);
    await refresh();
  };

  const statusMap = {
    [RequestStatus.PENDING]: { icon: <Clock size={16} />, label: 'รอดำเนินการ', color: 'bg-amber-100 text-amber-700' },
    [RequestStatus.APPROVED]: { icon: <CheckCircle size={16} />, label: 'อนุมัติแล้ว', color: 'bg-blue-100 text-blue-700' },
    [RequestStatus.READY]: { icon: <Package size={16} />, label: 'พร้อมรับ', color: 'bg-emerald-100 text-emerald-700' },
    [RequestStatus.RETURNED]: { icon: <RotateCcw size={16} />, label: 'คืนแล้ว', color: 'bg-gray-100 text-gray-700' },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายการเบิก (Checkout)</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">ติดตามสถานะการเบิกและคืนอุปกรณ์</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
            store.isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20'
          }`}
        >
          <Plus size={18} />
          เพิ่มรายการเบิกใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {requests.map((request) => {
            const reqStatusCfg = statusMap[request.status] ?? statusMap[RequestStatus.PENDING];
            return (
            <motion.div
              layout
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`border border-gray-100 rounded-3xl p-6 transition-all flex flex-col md:flex-row md:items-center gap-6 group transition-colors duration-300 ${
                store.isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    store.isDark ? 'bg-white/5 border border-white/10' : reqStatusCfg.color
                  } ${store.isDark && request.status === RequestStatus.PENDING ? 'text-amber-400' : store.isDark ? 'text-blue-400' : ''}`}>
                    {reqStatusCfg.icon}
                    {reqStatusCfg.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">#{request.id.slice(-6)}</span>
                </div>
                <h3 className={`text-xl font-bold truncate transition-colors ${store.isDark ? 'text-gray-100' : 'text-[#141414]'}`}>{request.equipmentName}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium transition-colors dark:text-gray-400">
                    <User size={14} className="text-gray-400" />
                    {request.requestedBy}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium transition-colors dark:text-gray-400">
                    <Calendar size={14} className="text-gray-400" />
                    {request.requestDate}
                  </span>
                  <span className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    store.isDark ? 'text-white bg-white/5 border border-white/10' : 'text-black bg-gray-100'
                  }`}>
                    จำนวน: {request.quantity}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {Object.entries(statusMap).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => void updateStatus(request.id, status as RequestStatus)}
                    className={`flex-shrink-0 p-2.5 rounded-xl transition-all border ${
                      request.status === status 
                        ? (store.isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black shadow-lg shadow-black/10') 
                        : (store.isDark ? 'bg-black text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-black')
                    }`}
                  >
                    {config.icon}
                  </button>
                ))}
              </div>

              {/* General Actions */}
              <div className={`flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 transition-colors ${store.isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <button 
                  onClick={() => void deleteRequest(request.id)}
                  className={`p-3 rounded-xl transition-all ${
                    store.isDark ? 'text-gray-500 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          );
          })}
        </AnimatePresence>

        {requests.length === 0 && (
          <div className={`py-20 text-center border-2 border-dashed rounded-[2.5rem] transition-colors ${
            store.isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm transition-colors ${store.isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50'}`}>
              <ClipboardList size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-400">ยังไม่มีรายการเบิกอุปกรณ์</h3>
            <p className="text-sm text-gray-400 mt-1 italic">กดปุ่ม "เพิ่มรายการเบิกใหม่" เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl transition-all border ${
              store.isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
            }`}
          >
            <h2 className={`text-2xl font-bold tracking-tight mb-8 flex items-center gap-3 transition-colors ${store.isDark ? 'text-white' : 'text-black'}`}>
              <Package className="text-gray-400" />
              สร้างรายการเบิกอุปกรณ์
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">พิมพ์ชื่ออุปกรณ์</label>
                  <div className="relative group/search">
                    <input 
                      type="text" 
                      value={reqForm.equipmentName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReqForm({...reqForm, equipmentName: val});
                        // Auto-fill category if name matches
                        const match = equipment.find(eq => eq.name.toLowerCase() === val.toLowerCase());
                        if (match) {
                          setReqForm(prev => ({...prev, category: match.category, equipmentName: val}));
                        }
                      }}
                      className={`w-full border-none rounded-xl p-4 text-base font-bold outline-none transition-all shadow-inner ${
                        store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                      }`}
                      placeholder="ระบุชื่ออุปกรณ์..."
                      autoFocus
                    />
                    {/* Autocomplete dropdown */}
                    {reqForm.equipmentName.length > 0 && equipment.filter(e => 
                      e.name.toLowerCase().includes(reqForm.equipmentName.toLowerCase()) && 
                      e.name.toLowerCase() !== reqForm.equipmentName.toLowerCase()
                    ).length > 0 && (
                      <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl border z-10 max-h-48 overflow-y-auto ${
                        store.isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                      }`}>
                        {equipment
                          .filter(e => e.name.toLowerCase().includes(reqForm.equipmentName.toLowerCase()))
                          .map(e => (
                            <button
                              key={e.id}
                              onClick={() => {
                                setReqForm({...reqForm, equipmentName: e.name, category: e.category});
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">หมวดหมู่</label>
                  <div className="relative group">
                    <select 
                      value={reqForm.category}
                      onChange={(e) => setReqForm({...reqForm, category: e.target.value})}
                      className={`w-full border-none rounded-xl p-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer shadow-inner ${
                        store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                      }`}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">ชื่อผู้เบิก</label>
                  <input 
                    type="text" 
                    value={reqForm.requestedBy}
                    onChange={(e) => setReqForm({...reqForm, requestedBy: e.target.value})}
                    className={`w-full border-none rounded-xl p-4 text-base font-bold outline-none transition-all shadow-inner ${
                      store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                    }`}
                    placeholder="ระบุชื่อผู้เบิก..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">จำนวน</label>
                  <input 
                    type="number" 
                    value={reqForm.quantity}
                    min={1}
                    onChange={(e) => setReqForm({...reqForm, quantity: parseInt(e.target.value) || 1})}
                    className={`w-full border-none rounded-xl p-4 text-xl font-black text-center outline-none transition-all shadow-inner ${
                      store.isDark ? 'bg-black text-white focus:ring-2 focus:ring-gray-700' : 'bg-gray-50 text-black focus:ring-2 focus:ring-black'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-right">สถานะเริ่มแรก</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(statusMap).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => setReqForm({...reqForm, status: status as RequestStatus})}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all transition-colors ${
                        reqForm.status === status 
                          ? (store.isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black shadow-lg shadow-black/10') 
                          : (store.isDark ? 'bg-black text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-black')
                      }`}
                    >
                      {config.icon}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setIsAdding(false)}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold transition-all ${
                    store.isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => void addRequest()}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    store.isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white shadow-xl shadow-black/10 hover:shadow-black/20'
                  }`}
                  disabled={!reqForm.equipmentName.trim() || !reqForm.requestedBy.trim()}
                >
                  บันทึกรายการเบิก
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ClipboardList({ size }: { size: number }) {
  return <Package size={size} />;
}
