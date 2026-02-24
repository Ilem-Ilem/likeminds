import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminBooks from './AdminBooks';
import AdminEvents from './AdminEvents';
import AdminSettingsGeneral from './AdminSettingsGeneral';
import AdminSettingsPayments from './AdminSettingsPayments';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'books': return <AdminBooks />;
      case 'events': return <AdminEvents />;
      case 'settings-general': return <AdminSettingsGeneral />;
      case 'settings-payments': return <AdminSettingsPayments />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary p-1 rounded-md">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Lumina Admin</span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
