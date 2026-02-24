import React from 'react';
import { User } from 'lucide-react';

interface BookProps {
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
}

const BookCard: React.FC<BookProps> = ({ title, author, category, cover, description }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="aspect-[2/3] overflow-hidden relative">
        <img 
          src={cover} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-brand-primary shadow-sm uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
          <User className="w-3.5 h-3.5" />
          <span>{author}</span>
        </div>
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
