import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Search, Edit2, Trash2, Users, Ticket, MessageCircle, XCircle, CheckCircle, Trash } from 'lucide-react';
import Modal from '../ui/Modal';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface EventData {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
  status: string;
  whatsapp_number: string;
  form_fields: FormField[] | string;
  tickets: any[];
  registrations: any[];
  whatsappContacts: any[];
}

export default function AdminEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    type: 'physical',
    status: 'upcoming',
    whatsapp_number: '',
    form_fields: [] as FormField[],
    tickets: [] as any[]
  });

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<EventData | null>(null);

  const handleViewRegistrations = (event: EventData) => {
    setViewingEvent(event);
    setIsRegModalOpen(true);
  };

  const deleteRegistration = async (regId: number) => {
    if (!confirm('Are you sure you want to remove this registration?')) return;
    const res = await fetch(`/api/admin/registrations/${regId}`, { method: 'DELETE' });
    if (res.ok) {
      // Refresh events to get updated registration list
      await fetchEvents();
      // Also update the viewingEvent state if it's open
      if (viewingEvent) {
        const updatedEvent = events.find(e => e.id === viewingEvent.id);
        if (updatedEvent) {
          // We need to fetch again or find in the new events list
          // Since fetchEvents is async, we should probably just find it in the new state
          // But state update is async too. Let's just refetch the specific event or rely on the next render.
          // Better: update local state immediately for better UX
          setViewingEvent({
            ...viewingEvent,
            registrations: viewingEvent.registrations.filter(r => r.id !== regId)
          });
        }
      }
    }
  };

  const fetchEvents = async () => {
    const res = await fetch('/api/admin/events');
    const data = await res.json();
    const parsedData = data.map((e: any) => ({
      ...e,
      form_fields: e.form_fields ? JSON.parse(e.form_fields) : []
    }));
    setEvents(parsedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (event?: EventData) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date.slice(0, 16), // Format for datetime-local
        location: event.location || '',
        type: event.type || 'physical',
        status: event.status,
        whatsapp_number: event.whatsapp_number || '',
        form_fields: Array.isArray(event.form_fields) ? event.form_fields : [],
        tickets: event.tickets || []
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        type: 'physical',
        status: 'upcoming',
        whatsapp_number: '',
        form_fields: [],
        tickets: [{ name: 'General Admission', price: 0, quantity: 100 }]
      });
    }
    setIsModalOpen(true);
  };

  const addTicket = () => {
    setFormData({
      ...formData,
      tickets: [...formData.tickets, { name: '', price: 0, quantity: 0 }]
    });
  };

  const removeTicket = (index: number) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter((_, i) => i !== index)
    });
  };

  const updateTicket = (index: number, updates: any) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.map((t, i) => i === index ? { ...t, ...updates } : t)
    });
  };

  const addFormField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      type: 'text',
      required: true
    };
    setFormData({ ...formData, form_fields: [...formData.form_fields, newField] });
  };

  const removeFormField = (id: string) => {
    setFormData({ ...formData, form_fields: formData.form_fields.filter(f => f.id !== id) });
  };

  const updateFormField = (id: string, updates: Partial<FormField>) => {
    setFormData({
      ...formData,
      form_fields: formData.form_fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events';
    const method = editingEvent ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchEvents();
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all tickets and registrations.')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const updateStatus = async (event: EventData, newStatus: string) => {
    await fetch(`/api/admin/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, status: newStatus })
    });
    fetchEvents();
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Event Management</h1>
          <p className="text-sm text-slate-500">Organize meetups, book reviews, and community gatherings.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-primary/10 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.event_date}
                  onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="physical">Physical</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / Link</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp Contact Number</label>
              <input
                type="text"
                placeholder="e.g. 2348000000000"
                value={formData.whatsapp_number}
                onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tickets</h4>
              <button
                type="button"
                onClick={addTicket}
                className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Ticket
              </button>
            </div>
            <div className="space-y-3">
              {formData.tickets.map((ticket, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Early Bird"
                      value={ticket.name}
                      onChange={e => updateTicket(index, { name: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Price</label>
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={e => updateTicket(index, { price: parseFloat(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                    <input
                      type="number"
                      value={ticket.quantity}
                      onChange={e => updateTicket(index, { quantity: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                    />
                  </div>
                  <div className="col-span-1 pb-1">
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registration Form Fields</h4>
              <button
                type="button"
                onClick={addFormField}
                className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.form_fields.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">No custom fields added. Only basic user info will be collected.</p>
              )}
              {formData.form_fields.map((field, index) => (
                <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Field Label (e.g. Dietary Requirements)"
                        value={field.label}
                        onChange={e => updateFormField(field.id, { label: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none focus:border-brand-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFormField(field.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={field.type}
                      onChange={e => updateFormField(field.id, { type: e.target.value as any })}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] outline-none"
                    >
                      <option value="text">Text Input</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateFormField(field.id, { required: e.target.checked })}
                        className="w-3 h-3 text-brand-primary border-slate-300 rounded"
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Required</span>
                    </label>
                  </div>
                  {field.type === 'select' && (
                    <input
                      type="text"
                      placeholder="Options (comma separated)"
                      value={field.options?.join(', ') || ''}
                      onChange={e => updateFormField(field.id, { options: e.target.value.split(',').map(o => o.trim()) })}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-colors"
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title={`Registrations: ${viewingEvent?.title}`}
      >
        <div className="space-y-4">
          {viewingEvent?.registrations.length === 0 ? (
            <p className="text-center py-8 text-slate-500 italic">No registrations yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {viewingEvent?.registrations.map((reg: any) => (
                <div key={reg.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{reg.user_name}</div>
                      <div className="text-[10px] text-slate-500">{reg.user_email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] text-slate-400">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </div>
                      <button 
                        onClick={() => deleteRegistration(reg.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Registration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {reg.form_responses && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[10px] space-y-1">
                      {Object.entries(JSON.parse(reg.form_responses)).map(([label, value]: [string, any]) => (
                        <div key={label} className="flex gap-2">
                          <span className="font-bold text-slate-500">{label}:</span>
                          <span className="text-slate-700">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Details</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registrations</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{event.title}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="text-xs text-slate-600 truncate max-w-[150px]">{event.location}</div>
                    <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      event.type === 'physical' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-600">{event.registrations.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={event.status}
                      onChange={(e) => updateStatus(event, e.target.value)}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full outline-none border-none cursor-pointer ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                        event.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="closed">Closed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleViewRegistrations(event)}
                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-md transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(event)}
                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-md transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
