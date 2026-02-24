import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

interface EventProps {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  onRegister: (id: number) => void;
}

const EventCard: React.FC<EventProps> = ({ id, title, description, date, location, type, onRegister }) => {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-brand-primary/30 transition-all">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-brand-light p-3 rounded-xl">
            <Calendar className="text-brand-primary w-6 h-6" />
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            type === 'physical' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {type}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-6 line-clamp-2">{description}</p>
        
        <div className="space-y-3 mb-8 mt-auto">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>
        
        <button 
          onClick={() => onRegister(id)}
          className="w-full bg-slate-900 hover:bg-brand-primary text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
        >
          Register Now
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
