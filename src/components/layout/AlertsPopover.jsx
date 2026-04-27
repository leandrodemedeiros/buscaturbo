import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Trash2, Car, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const MOCK_ALERTS = [
  { id: '1', title: 'BMW M3 Competition', description: 'Novo anúncio encontrado por R$ 420.000', time: '2 min atrás', type: 'new', read: false },
  { id: '2', title: 'Porsche 911', description: 'Preço reduzido de R$ 950k para R$ 890k', time: '1h atrás', type: 'price', read: false },
  { id: '3', title: 'Honda Civic EX', description: '3 novos anúncios correspondem ao seu alerta', time: '3h atrás', type: 'new', read: true },
  { id: '4', title: 'Ferrari F8', description: 'Novo anúncio em SP por R$ 3.100.000', time: 'Ontem', type: 'new', read: true },
];

export default function AlertsPopover() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const ref = useRef(null);

  const unreadCount = alerts.filter(a => !a.read).length;

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  const removeAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900"
      >
        <Bell className="w-5 h-5" />
        <span className="text-[10px] font-medium">Alertas</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-600" />
              <span className="font-bold text-sm text-zinc-900">Alertas</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-700 px-2">
                  Marcar como lido
                </button>
              )}
              <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alerts list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
            {alerts.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
                Nenhum alerta por enquanto
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 group hover:bg-zinc-50 transition-colors",
                    !alert.read && "bg-blue-50/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    alert.type === 'new' ? "bg-green-100" : "bg-orange-100"
                  )}>
                    {alert.type === 'new'
                      ? <Car className="w-4 h-4 text-green-600" />
                      : <TrendingDown className="w-4 h-4 text-orange-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-semibold text-zinc-900 truncate", !alert.read && "font-bold")}>
                        {alert.title}
                      </p>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{alert.description}</p>
                    <p className="text-xs text-zinc-400 mt-1">{alert.time}</p>
                  </div>
                  {!alert.read && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="px-4 py-2.5 border-t border-zinc-100 text-center">
              <button className="text-xs text-red-500 hover:text-red-700 font-medium">
                Gerenciar alertas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}