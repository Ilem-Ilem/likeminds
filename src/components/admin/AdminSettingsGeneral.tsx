import React, { useEffect, useState } from 'react';
import { Save, Globe, Mail, MessageCircle, Image as ImageIcon } from 'lucide-react';

export default function AdminSettingsGeneral() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-10 bg-slate-100 rounded-lg w-1/4" />
    <div className="h-64 bg-slate-100 rounded-xl" />
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">General Settings</h1>
        <p className="text-sm text-slate-500">Configure your site's basic information and branding.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Site Name
            </label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={e => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Logo URL
            </label>
            <div className="flex gap-4 items-start">
              <input
                type="url"
                value={settings.site_logo || ''}
                onChange={e => setSettings({ ...settings, site_logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
              {settings.site_logo && (
                <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src={settings.site_logo} alt="Logo Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <MessageCircle className="w-3 h-3" /> WhatsApp Group Link
            </label>
            <input
              type="url"
              value={settings.whatsapp_group_link || ''}
              onChange={e => setSettings({ ...settings, whatsapp_group_link: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
