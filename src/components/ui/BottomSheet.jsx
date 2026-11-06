import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * RNF-01: Modal deslizable desde abajo (Bottom-Sheet) ubicado en la mitad inferior
 * de la pantalla para operarse cómodamente con el pulgar de una sola mano.
 */
export function BottomSheet({ isOpen, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop oscuro */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor deslizable alineado al contenedor móvil */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200"
      >
        {/* Tirador visual superior */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Cabecera del BottomSheet */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800/80">
          <div className="pr-2">
            <h3 className="text-base font-bold text-slate-100 leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="min-w-[48px] min-h-[48px] -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con scroll interno */}
        <div className="p-5 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

