import React, { useState } from 'react';
import { 
  Home, 
  Box, 
  ClipboardList, 
  Menu, 
  X, 
  Plus, 
  Settings,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrPongStore } from './store';
import RoomsView from './views/RoomsView';
import EquipmentView from './views/EquipmentView';
import RequestsView from './views/RequestsView';

type View = 'rooms' | 'equipment' | 'requests';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('rooms');
  const [roomsKey, setRoomsKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const store = useDrPongStore();
  const { isDark, setIsDark } = store;

  const handleNavClick = (view: View) => {
    if (view === 'rooms' && currentView === 'rooms') {
      setRoomsKey(prev => prev + 1);
    }
    setCurrentView(view);
    // Close sidebar after selection as requested
    setIsSidebarOpen(false);
  };

  if (!store.isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F5F5] font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-black text-gray-100 dark' : 'bg-[#F5F5F5] text-[#141414]'}`}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 left-0 z-50 w-72 border-r transition-colors duration-300 md:relative ${
              isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Brand */}
              <div className="p-6 mb-4">
                <h1 className={`text-xl font-bold tracking-tight select-none transition-colors ${isDark ? 'text-white' : 'text-[#141414]'}`}>
                  Dr.Pong <span className="font-light text-gray-400">studio</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1 font-medium">Production Checklist</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-1">
                <NavItem 
                  icon={<Home size={20} />} 
                  label="ห้อง (Rooms)" 
                  active={currentView === 'rooms'} 
                  onClick={() => handleNavClick('rooms')}
                  isDark={isDark}
                />
                <NavItem 
                  icon={<Box size={20} />} 
                  label="ลิสอุปกรณ์ทั้งหมด" 
                  active={currentView === 'equipment'} 
                  onClick={() => handleNavClick('equipment')}
                  isDark={isDark}
                />
                <NavItem 
                  icon={<ClipboardList size={20} />} 
                  label="รายการที่รอเบิก" 
                  active={currentView === 'requests'} 
                  onClick={() => handleNavClick('requests')}
                  isDark={isDark}
                />
              </nav>

              {/* Sidebar Footer */}
              <div className={`p-4 border-t transition-colors ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-gray-700 transition-all">
                    DP
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">Admin User</p>
                    <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">Super Admin</p>
                  </div>
                  <Settings size={16} className="text-gray-400 hover:text-gray-600" />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top bar */}
        <header className={`h-16 backdrop-blur-md border-b flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300 ${
          isDark ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Menu size={20} />
            </button>
            <div className={`h-4 w-[1px] hidden md:block ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <h2 className="text-sm font-medium text-gray-500 capitalize">
              {currentView === 'rooms' ? 'ห้องทั้งหมด' : currentView === 'equipment' ? 'คลังอุปกรณ์' : 'สถานะการเบิกจ่าย'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className={`border-none rounded-full py-1.5 pl-10 pr-4 text-sm w-48 focus:w-64 outline-none transition-all ${
                  isDark ? 'bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-gray-700' : 'bg-gray-100 text-black focus:bg-white focus:ring-1 focus:ring-black shadow-inner'
                }`}
              />
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all group relative overflow-hidden ${
                isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="moon"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                  >
                    <Moon size={20} className="text-blue-400 fill-blue-400/20" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                  >
                    <Sun size={20} className="text-orange-500 fill-orange-500/20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            {currentView === 'rooms' && <RoomsView key={roomsKey} store={store} />}
            {currentView === 'equipment' && <EquipmentView store={store} />}
            {currentView === 'requests' && <RequestsView store={store} onShowEquipment={() => setCurrentView('equipment')} />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isDark }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isDark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? (isDark ? 'bg-white text-black shadow-lg shadow-white/5' : 'bg-black text-white shadow-lg shadow-black/10') 
          : (isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-[#141414]')
      }`}
    >
      <span className={`${active ? (isDark ? 'text-black' : 'text-white') : (isDark ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-black')} transition-colors`}>
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      {active && (
        <motion.div 
          layoutId="activePill"
          className={`ml-auto w-1.5 h-1.5 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`}
        />
      )}
    </button>
  );
}
