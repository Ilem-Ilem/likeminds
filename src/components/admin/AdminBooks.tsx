import React, { useEffect, useState } from 'react';
import { Book, Plus, Search, Edit2, Trash2, Star, Link as LinkIcon } from 'lucide-react';
import Modal from '../ui/Modal';

interface BookData {
  id: number;
  title: string;
  author: string;
  cover: string;
  description: string;
  category: string;
  status: string;
  is_featured: number;
  event_id: number | null;
}

export default function AdminBooks() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    description: '',
    category: '',
    status: 'available',
    is_featured: 0
  });

  const fetchBooks = async () => {
    const res = await fetch('/api/admin/books');
    const data = await res.json();
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenModal = (book?: BookData) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        cover: book.cover,
        description: book.description,
        category: book.category,
        status: book.status,
        is_featured: book.is_featured
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        cover: '',
        description: '',
        category: '',
        status: 'available',
        is_featured: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingBook ? `/api/admin/books/${editingBook.id}` : '/api/admin/books';
    const method = editingBook ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchBooks();
    }
  };

  const toggleFeatured = async (book: BookData) => {
    await fetch(`/api/admin/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...book, is_featured: book.is_featured ? 0 : 1 })
    });
    fetchBooks();
  };

  const deleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    await fetch(`/api/admin/books/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Management</h1>
          <p className="text-sm text-slate-500">Manage the club's library and featured reads.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-primary/10 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Genre</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Image URL</label>
            <input
              type="url"
              required
              value={formData.cover}
              onChange={e => setFormData({ ...formData, cover: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured === 1}
                  onChange={e => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/20"
                />
                <span className="text-xs font-bold text-slate-500 uppercase">Featured Book</span>
              </label>
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
              {editingBook ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search books..."
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
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Book</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Genre</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Linked Event</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={book.cover} 
                        alt={book.title} 
                        className="w-8 h-12 object-cover rounded shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{book.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      book.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => toggleFeatured(book)}
                      className={`p-1.5 rounded-md transition-all ${
                        book.is_featured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${book.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {book.event_id ? (
                      <div className="flex items-center gap-1 text-brand-primary text-[10px] font-medium">
                        <LinkIcon className="w-3 h-3" />
                        <span>Event #{book.event_id}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Not linked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(book)}
                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-md transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteBook(book.id)}
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
