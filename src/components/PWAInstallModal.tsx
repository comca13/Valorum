/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Laptop, 
  Apple, 
  Download, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  Sparkles,
  Zap,
  WifiOff,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { DevicePlatform } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: DevicePlatform;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  isAndroid,
  platform,
  onInstall,
}) => {
  // Pre-select active tab according to user's device
  const [activeTab, setActiveTab] = useState<'auto' | 'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });

  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    try {
      const ok = await onInstall();
      if (ok) {
        setInstallSuccess(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0c1220] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 id="pwa-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Criar Atalho na Tela Inicial</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Acesse o Valorum BRL como um app nativo no celular, tablet ou computador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* App Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="/icon.svg" 
                alt="Valorum BRL Icon" 
                className="w-12 h-12 rounded-xl shadow-md border border-slate-700/80 shrink-0 object-cover" 
              />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Valorum Financeiro BRL</span>
                  {isInstalled && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" /> Instalado
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block font-mono">
                  valorum-brl.app · Standalone Web App
                </span>
              </div>
            </div>

            {/* Direct Native Install Button (if browser supports beforeinstallprompt) */}
            {isInstallable && !isInstalled && !installSuccess && (
              <button
                onClick={handleDirectInstall}
                disabled={isInstalling}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-cyan-950 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'Instalando...' : 'Instalar Agora'}</span>
              </button>
            )}
          </div>

          {/* Installed Confirmation Banner */}
          {(isInstalled || installSuccess) && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-white">Aplicativo instalado com sucesso!</span>
                O Valorum BRL já está disponível na tela inicial do seu dispositivo. Você pode abri-lo sem barras de endereço.
              </div>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Acesso em 1 Toque</span>
              <span className="text-[10px] text-slate-400">Ícone na tela inicial</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
              <Sparkles className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Tela Cheia</span>
              <span className="text-[10px] text-slate-400">Sem barra de navegação</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
              <WifiOff className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Cache Inteligente</span>
              <span className="text-[10px] text-slate-400">Carregamento instantâneo</span>
            </div>
          </div>

          {/* Device Selection Tabs */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Passo a Passo por Dispositivo:
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="truncate">Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span className="truncate">iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="truncate">Computador</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Android Guide */}
          {activeTab === 'android' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Smartphone className="w-4 h-4" />
                <span>No Google Chrome, Samsung Internet ou Edge (Android):</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    No canto superior direito do navegador, toque no menu de <strong>três pontos (⋮)</strong>.
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Toque na opção <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Confirme clicando em <strong>&ldquo;Instalar&rdquo;</strong>. O atalho com o ícone oficial aparecerá na grade de aplicativos do seu celular.
                  </span>
                </li>
              </ol>

              {isInstallable && (
                <div className="pt-2">
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Diretamente via Navegador</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: iPhone & iPad (iOS Safari) Guide */}
          {activeTab === 'ios' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Apple className="w-4 h-4" />
                <span>No Safari do iPhone ou iPad (iOS):</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="leading-relaxed">
                    Certifique-se de estar usando o navegador <strong>Safari</strong> da Apple.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="leading-relaxed">
                    Na barra inferior do Safari, toque no botão de <strong>Compartilhar</strong> (ícone quadrado com uma seta para cima <Share className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />).
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="leading-relaxed">
                    Role a lista de opções para baixo e toque em <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />).
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <div className="leading-relaxed">
                    Toque em <strong>&ldquo;Adicionar&rdquo;</strong> no canto superior direito para fixar o ícone na sua tela inicial.
                  </div>
                </li>
              </ol>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300">
                💡 <strong>Dica:</strong> Se você abriu este link dentro do Instagram ou WhatsApp, toque nos 3 pontinhos e selecione &ldquo;Abrir no Safari&rdquo; para liberar a opção.
              </div>
            </div>
          )}

          {/* Tab 3: Desktop Guide (Windows / Mac / Linux / Chrome / Edge) */}
          {activeTab === 'desktop' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Laptop className="w-4 h-4" />
                <span>No Google Chrome, Microsoft Edge ou Brave (PC / Mac):</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Olhe para a <strong>barra de endereços (URL)</strong> no topo do navegador. Ao lado da estrela de favoritos, você verá o ícone de computador com uma seta para baixo (ou o botão <strong>&ldquo;Instalar Valorum BRL&rdquo;</strong>).
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Como alternativa, clique no menu de três pontos <strong>(⋮)</strong> &gt; <strong>&ldquo;Salvar e compartilhar&rdquo;</strong> &gt; <strong>&ldquo;Instalar Valorum Financeiro BRL...&rdquo;</strong>.
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    O aplicativo abrirá em uma <strong>janela independente</strong> sem barra de navegação, com atalho na Área de Trabalho e na Barra de Tarefas (Windows / Dock do Mac).
                  </span>
                </li>
              </ol>

              {isInstallable && (
                <div className="pt-2">
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicativo no Computador</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Share / Copy URL Helper */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              Quer abrir no outro aparelho?
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Link do App</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>PWA Standard · Service Worker Ativo</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
