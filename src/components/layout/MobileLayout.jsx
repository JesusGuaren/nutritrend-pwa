import React, { useState } from 'react';
import { Flame, Scale, Layers, Download } from 'lucide-react';

/**
 * Contenedor Mobile-First (max-w-md mx-auto min-h-screen) + Bottom Navigation fija (h-16)
 * con diseño para el pulgar (RNF-01) y tema oscuro OLED (bg-slate-950 text-slate-100).
 */
export function MobileLayout({
  activeTab,
  onChangeTab,
  isSyncing,
  isEmbeddedPreview = false,
  showInstallBanner = false,
  onInstallApp,
  onBackToShowcase,
  children
}) {
  const navItems = [
    { id: 'dashboard', label: 'Hoy', icon: Flame },
    { id: 'weight', label: 'Peso EMA', icon: Scale },
    { id: 'catalog', label: 'Catálogo', icon: Layers }
  ];

  return (
    <div className={`${isEmbeddedPreview ? 'min-h-full' : 'min-h-screen'} bg-slate-950 text-slate-100 flex justify-center`}>
      <div
        className={`w-full max-w-md ${
          isEmbeddedPreview ? 'min-h-[680px]' : 'min-h-screen'
        } bg-slate-950 flex flex-col relative border-x border-slate-900/80 shadow-2xl`}
      >
        {/* Indicador sutil superior de sincronización Stale-While-Revalidate */}
        {isSyncing && (
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-0.5 bg-emerald-500/30 overflow-hidden z-50">
            <div className="h-full w-1/3 bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Banner superior de descarga rápida si el usuario entró en modo web pero aún no la instala */}
        {showInstallBanner && !isEmbeddedPreview && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-3.5 py-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToShowcase}
              className="text-[11px] font-semibold text-slate-300 hover:text-white underline"
            >
              ← Portada
            </button>
            <button
              type="button"
              onClick={onInstallApp}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
              Instalar App en el Teléfono
            </button>
          </div>
        )}

        {/* Contenido principal con padding inferior amplio para la barra de navegación y FAB */}
        <main className="flex-1 pb-24 px-4 pt-3 overflow-y-auto">
          {children}
        </main>

        {/* RNF-01: Barra de navegación fija abajo (h-16) */}
        <nav
          aria-label="Navegación principal"
          className={`${
            isEmbeddedPreview ? 'sticky bottom-0 w-full' : 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md'
          } h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 z-40 px-2 flex items-center justify-around`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex-1 h-12 min-h-[48px] rounded-xl flex flex-col items-center justify-center transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
