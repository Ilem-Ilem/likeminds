import React, { useEffect, useState } from 'react';
import { Save, CreditCard, ShieldCheck, Key, AlertCircle } from 'lucide-react';

export default function AdminSettingsPayments() {
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
        alert('Payment settings saved successfully!');
      }
    } catch (error) {
      alert('Failed to save payment settings.');
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
        <h1 className="text-2xl font-bold text-slate-900">Payment Integration</h1>
        <p className="text-sm text-slate-500">Configure your payment providers and API keys.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 max-w-2xl">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">Security Warning</p>
          API keys are stored in the database. Ensure you use restricted keys with only necessary permissions. 
          Never share your Secret Keys publicly.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <CreditCard className="w-3 h-3" /> Payment Provider
            </label>
            <select
              value={settings.payment_provider || 'stripe'}
              onChange={e => setSettings({ ...settings, payment_provider: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            >
              <option value="stripe">Stripe</option>
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Public Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.payment_public_key || ''}
                  onChange={e => setSettings({ ...settings, payment_public_key: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                <Key className="w-3 h-3" /> Secret Key
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={settings.payment_secret_key || ''}
                  onChange={e => setSettings({ ...settings, payment_secret_key: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
