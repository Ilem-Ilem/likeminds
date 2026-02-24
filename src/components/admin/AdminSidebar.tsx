import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Book, 
  Calendar, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  CreditCard,
  Globe,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}: AdminSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['settings']);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'books', label: 'Book Management', icon: Book },
    { id: 'events', label: 'Event Management', icon: Calendar },
    { 
      id: 'settings-group', 
      label: 'Site Management', 
      icon: Settings,
      children: [
        { id: 'settings-general', label: 'General Settings', icon: Globe },
        { id: 'settings-payments', label: 'Payments', icon: CreditCard },
      ]
    },
  ];

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col h-screen
        lg:sticky lg:top-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'w-64'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-lg font-bold tracking-tight text-brand-primary">Lumina Admin</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-slate-800 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isExpanded = expandedMenus.includes(item.id);
            const hasChildren = item.children && item.children.length > 0;
            const isActive = activeTab === item.id || (hasChildren && item.children?.some(child => child.id === activeTab));

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => hasChildren ? toggleMenu(item.id) : handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-sm ${
                    isActive && !hasChildren
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span className="font-medium">{item.label}</span>}
                  </div>
                  {hasChildren && (!isCollapsed || isMobileOpen) && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {hasChildren && isExpanded && (!isCollapsed || isMobileOpen) && (
                  <div className="ml-4 pl-2 border-l border-slate-800 space-y-1">
                    {item.children?.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleTabClick(child.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all text-xs ${
                          activeTab === child.id 
                            ? 'bg-slate-800 text-brand-primary font-bold' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <child.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <Link 
            to="/"
            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="font-medium">Exit Admin</span>}
          </Link>
        </div>
      </div>
    </>
  );
}
