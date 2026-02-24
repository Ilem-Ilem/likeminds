import React, { useState } from 'react';
import { BookOpen, User, LogIn, LogOut, Shield, Menu, X as CloseIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  user: any;
  settings: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, settings, onLoginClick, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            {settings.site_logo ? (
              <img src={settings.site_logo} alt={settings.site_name} className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="bg-brand-primary p-2 rounded-lg">
                <BookOpen className="text-white w-6 h-6" />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight text-brand-secondary">{settings.site_name || 'Lumina'}</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/events" className="text-slate-600 hover:text-brand-primary font-medium transition-colors">Events</Link>
            <Link to="/books" className="text-slate-600 hover:text-brand-primary font-medium transition-colors">Books</Link>
            <Link to="/about" className="text-slate-600 hover:text-brand-primary font-medium transition-colors">About</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-brand-primary font-bold flex items-center gap-1 bg-brand-light px-3 py-1 rounded-full border border-brand-primary/20">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <User className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-brand-primary font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button 
                  onClick={onLoginClick}
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-full font-semibold transition-all shadow-md shadow-brand-primary/20"
                >
                  Join Club
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-brand-primary transition-colors"
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-4">
          <Link to="/events" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Events</Link>
          <Link to="/books" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Books</Link>
          <Link to="/about" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="block text-brand-primary font-bold flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-primary" />
                  <span className="font-semibold text-slate-700">{user.name}</span>
                </div>
                <button onClick={onLogout} className="text-red-500 font-medium">Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-slate-600 font-medium">Login</button>
                <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">Join Club</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
