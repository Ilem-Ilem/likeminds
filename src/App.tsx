import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookCard from './components/BookCard';
import EventCard from './components/EventCard';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/admin/AdminDashboard';
import Modal from './components/ui/Modal';
import { Book, Calendar as CalendarIcon, Users, MessageCircle } from 'lucide-react';

interface BookData {
  id: number;
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
  is_featured: number;
}

interface EventData {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
  whatsapp_number: string;
  form_fields?: string | any[];
  registration_start_date?: string;
  registration_end_date?: string;
}

function HomePage({ user, settings, onLoginClick }: { user: any, settings: any, onLoginClick: () => void }) {
  const [books, setBooks] = useState<BookData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [regFormData, setRegFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, eventsRes] = await Promise.all([
          fetch('/api/books'),
          fetch('/api/events')
        ]);
        const booksData = await booksRes.json();
        const eventsData = await eventsRes.json();
        
        // Parse form_fields if they are strings
        const parsedEvents = eventsData.map((e: any) => ({
          ...e,
          form_fields: typeof e.form_fields === 'string' ? JSON.parse(e.form_fields) : e.form_fields
        }));

        setBooks(booksData);
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRegisterClick = (eventId: number) => {
    if (!user) {
      onLoginClick();
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.form_fields && Array.isArray(event.form_fields) && event.form_fields.length > 0) {
      setSelectedEvent(event);
      setRegFormData({});
      setIsRegModalOpen(true);
    } else {
      // Direct registration if no fields
      submitRegistration(eventId, {});
    }
  };

  const submitRegistration = async (eventId: number, formResponses: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, eventId, ticketId: 1, formResponses })
      });
      const data = await res.json();
      if (data.success) {
        setIsRegModalOpen(false);
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (error) {
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    submitRegistration(selectedEvent.id, regFormData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Books Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Reads</h2>
              <p className="text-slate-600">Hand-picked books for our community this month.</p>
            </div>
            <button className="text-brand-primary font-bold hover:underline flex items-center gap-1">
              View All Books <Book className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.filter(b => b.is_featured).map(book => (
              <BookCard 
                key={book.id}
                title={book.title}
                author={book.author}
                category={book.category}
                cover={book.cover}
                description={book.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From virtual meetups to local library gatherings, join us for our next literary adventure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard 
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.event_date}
                location={event.location}
                type={event.type}
                onRegister={handleRegisterClick}
              />
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title={`Register for ${selectedEvent?.title}`}
      >
        <form onSubmit={handleRegFormSubmit} className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">Please provide the following additional information to complete your registration.</p>
          
          {Array.isArray(selectedEvent?.form_fields) && selectedEvent?.form_fields.map((field: any) => (
            <div key={field.id}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  required={field.required}
                  value={regFormData[field.label] || ''}
                  onChange={e => setRegFormData({ ...regFormData, [field.label]: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required={field.required}
                    checked={regFormData[field.label] || false}
                    onChange={e => setRegFormData({ ...regFormData, [field.label]: e.target.checked })}
                    className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/20"
                  />
                  <span className="text-sm text-slate-600">I agree / Yes</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  value={regFormData[field.label] || ''}
                  onChange={e => setRegFormData({ ...regFormData, [field.label]: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              )}
            </div>
          ))}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsRegModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Community Section */}
      <section className="py-20 bg-brand-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <MessageCircle className="w-96 h-96 -mr-20 -mt-20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-6">Join the Conversation</h2>
            <p className="text-brand-light/80 text-lg mb-10 leading-relaxed">
              Our WhatsApp community is the heart of Lumina. Get real-time updates, participate in quick polls, and chat with fellow bookworms anytime.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">500+</div>
                  <div className="text-sm text-brand-light/60">Active Members</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Daily</div>
                  <div className="text-sm text-brand-light/60">Discussions</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => settings.whatsapp_group_link && window.open(settings.whatsapp_group_link, '_blank')}
              className="mt-12 bg-white text-brand-primary hover:bg-brand-light px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl disabled:opacity-50"
              disabled={!settings.whatsapp_group_link}
            >
              Join WhatsApp Group
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            {settings.site_logo ? (
              <img src={settings.site_logo} alt={settings.site_name} className="h-6 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="bg-brand-primary p-1.5 rounded-lg">
                <BookOpen className="text-white w-5 h-5" />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight text-brand-secondary">{settings.site_name || 'Lumina'}</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">© {new Date().getFullYear()} {settings.site_name || 'Lumina Book Club'}. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                localStorage.setItem('lumina_user', JSON.stringify({ id: 1, name: 'Admin User', email: 'admin@bookclub.com', role: 'admin' }));
                window.location.reload();
              }}
              className="text-[10px] text-slate-400 hover:text-brand-primary transition-colors uppercase tracking-widest font-bold"
            >
              Quick Admin Access (Demo)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BookOpen({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const savedUser = localStorage.getItem('lumina_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('lumina_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_user');
  };

  return (
    <>
      {!isAdminRoute && (
        <Navbar 
          user={user} 
          settings={settings}
          onLoginClick={() => setIsAuthModalOpen(true)} 
          onLogout={handleLogout} 
        />
      )}
      <Routes>
        <Route path="/" element={<HomePage user={user} settings={settings} onLoginClick={() => setIsAuthModalOpen(true)} />} />
        <Route path="/events" element={<HomePage user={user} settings={settings} onLoginClick={() => setIsAuthModalOpen(true)} />} />
        <Route path="/books" element={<HomePage user={user} settings={settings} onLoginClick={() => setIsAuthModalOpen(true)} />} />
        {user?.role === 'admin' && <Route path="/admin/*" element={<AdminDashboard />} />}
        <Route path="*" element={<HomePage user={user} settings={settings} onLoginClick={() => setIsAuthModalOpen(true)} />} />
      </Routes>

      {!isAdminRoute && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
