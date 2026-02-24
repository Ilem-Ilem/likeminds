import React, { useEffect, useState } from 'react';
import { Users, Calendar, Book, CheckCircle, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
    </div>
  </div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Events', value: stats?.totalEvents, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Total Registrations', value: stats?.totalRegistrations, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">{card.value}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-900 font-medium text-sm">New user registered: user{i}@example.com</p>
                  <p className="text-slate-500 text-[10px]">{i} hour ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Database</span>
              <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">API Server</span>
              <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">WhatsApp Gateway</span>
              <span className="text-amber-500 font-bold text-[10px] uppercase tracking-wider">Warning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
