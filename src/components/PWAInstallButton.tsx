/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'header' | 'prominent';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, platform, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone app mode, render an unobtrusive installed badge or keep hidden
  if (isInstalled && variant === 'compact') {
    return null;
  }

  const handleClick = async () => {
    // If the browser provides a direct prompt (Chromium on desktop/Android), trigger it directly;
    // Otherwise open the multi-platform guide modal.
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title="Adicionar à tela inicial / Instalar como App no celular, tablet ou computador"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer min-h-[36px] ${
            isInstalled
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-800/60 text-cyan-300 hover:border-cyan-600 hover:text-white shadow-sm'
          } ${className}`}
        >
          {isInstalled ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )}
          <span className="hidden sm:inline">
            {isInstalled ? 'App Instalado' : 'Criar Atalho'}
          </span>
          <span className="sm:hidden">
            {isInstalled ? 'App' : 'Atalho'}
          </span>
        </button>
      )}

      {variant === 'prominent' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-md transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Criar Atalho na Tela Inicial</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleClick}
          title="Criar Atalho na Tela Inicial"
          className={`p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {/* Interactive Modal */}
      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isAndroid={isAndroid}
        platform={platform}
        onInstall={install}
      />
    </>
  );
};
