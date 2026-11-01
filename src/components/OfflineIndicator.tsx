/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-2xl border border-amber-400 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>Modo Offline Ativo — Utilizando dados em cache do navegador</span>
    </div>
  );
};
