import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ScanBarcode,
  TrendingDown,
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Share,
  MoreVertical,
  Sparkles,
  Flame
} from 'lucide-react';

/**
 * Showcase / Landing Page de presentación para navegador web:
 * - Permite descargar/instalar la App directamente con un botón de descarga (beforeinstallprompt)
 * - En escritorio muestra un código QR automático + Mockup de iPhone/Android interactivo
 * - En móvil muestra un Hero de descarga directa estilo App Store / APK limpia
 * - Al instalarla (o tocar "Abrir App"), entra directo al sistema a pantalla completa
 */
export function LandingShowcase({
  canInstallNatively,
  isIOS,
  onInstallClick,
  onEnterApp,
  children
}) {
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const currentUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://nutritrend-pwa.vercel.app';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=10b981&bgcolor=020617&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleDownloadButton = async () => {
    const result = await onInstallClick();
    if (result.status === 'ios-guide' || result.status === 'manual-guide') {
      setInstallModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Efectos de iluminación ambiental de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* BARRA SUPERIOR DE LA WEB */}
      <header className="relative z-20 max-w-6xl mx-auto px-5 py-4 flex items-center justify-between border-b border-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Flame className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-100">
              NutriTrend
            </span>
            <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              v1.0 Mobile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadButton}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4 stroke-[2.5px]" />
            <span>Descargar App</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: HERO DE DESCARGA + PREVIEW EN CHASIS DE TELÉFONO */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* COLUMNA IZQUIERDA: PRESENTACIÓN Y BOTÓN DE DESCARGA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aplicación Móvil Ultraligera · 0% Publicidad · Sin Suscripciones</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 leading-[1.1]">
            Controla tus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
              Macros y Peso Tendencial EMA
            </span>{' '}
            en menos de 10 segundos.
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
            Diseñada específicamente para operarse con el pulgar desde tu teléfono. Escanea códigos de barras chilenos (EAN-13) con la cámara, registra tus comidas frecuentes en 1 toque y filtra la retención de líquidos con la Media Móvil Exponencial de 7 días estilo MacroFactor.
          </p>

          {/* TARJETA PRINCIPAL DE DESCARGA DIRECTA */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Instalador Web Directo (PWA)
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-100">
                  Instala NutriTrend en tu teléfono
                </h2>
                <p className="text-xs text-slate-400">
                  Peso: ~350 KB · Funciona Offline · Cámara EAN activa · Pantalla completa OLED
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadButton}
                  className="min-h-[54px] px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition"
                >
                  <Download className="w-5 h-5 stroke-[2.5px]" />
                  <span>{canInstallNatively ? 'Instalar App Ahora' : 'Descargar en mi Celular'}</span>
                </button>

                <button
                  type="button"
                  onClick={onEnterApp}
                  className="min-h-[54px] px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <span>Abrir Versión Web</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Código QR visible en pantallas de PC para escanear con el teléfono */}
            <div className="hidden sm:flex items-center gap-4 pt-4 border-t border-slate-800/80">
              <img
                src={qrImageUrl}
                alt="Código QR para abrir en el celular"
                className="w-20 h-20 rounded-xl border border-slate-800 bg-slate-950 p-1 shrink-0"
              />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  ¿Estás viendo esto desde tu PC?
                </div>
                <p className="text-xs text-slate-400">
                  Apunta con la cámara de tu celular a este código QR para abrir la página en tu teléfono y presionar{' '}
                  <strong className="text-emerald-400">“Descargar en mi Celular”</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* GRILLA DE CARACTERÍSTICAS DESTACADAS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <ScanBarcode className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100">Escáner EAN Chile</h3>
              <p className="text-[11px] text-slate-400">
                Conectado al catálogo de Open Food Facts Chile con cámara trasera.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <TrendingDown className="w-5 h-5 text-sky-400" />
              <h3 className="text-xs font-bold text-slate-100">Tendencia EMA 7d</h3>
              <p className="text-[11px] text-slate-400">
                Filtra las fluctuaciones de agua y glucógeno para mostrar tu peso real.
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-100">Quick-Add 1 Toque</h3>
              <p className="text-[11px] text-slate-400">
                Registra favoritos y combos completos en menos de 16 milisegundos.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: MOCKUP INTERACTIVO DE TELÉFONO */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Vista previa interactiva en vivo</span>
          </div>

          {/* Marco realista de Smartphone */}
          <div className="w-full max-w-[390px] rounded-[44px] p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-700/80 shadow-[0_0_70px_-15px_rgba(16,185,129,0.25)] relative">
            {/* Isla dinámica / Notch superior */}
            <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-end px-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
            </div>

            {/* Pantalla interna con la App real funcionando */}
            <div className="w-full h-[680px] rounded-[34px] overflow-y-auto overflow-x-hidden bg-slate-950 border border-slate-800 relative no-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE INSTRUCCIONES RÁPIDAS CUANDO EL NAVEGADOR REQUIERE CONFIRMACIÓN MANUAL */}
      {installModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">
                  Instalar NutriTrend en tu Celular
                </h3>
                <p className="text-xs text-slate-400">
                  Descarga directa sin pasar por tiendas externas
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs text-slate-300">
                <p className="font-bold text-emerald-400">Pasos en iPhone / Safari:</p>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1.5">
                    Toca el botón <strong>Compartir</strong> <Share className="w-4 h-4 text-sky-400 inline" /> en la barra de Safari.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Selecciona <strong>“Agregar a inicio”</strong> y confirma en <strong>Agregar</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs text-slate-300">
                <p className="font-bold text-emerald-400">Pasos en Android (Chrome):</p>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1.5">
                    Toca el menú de 3 puntos <MoreVertical className="w-4 h-4 text-emerald-400 inline" /> arriba a la derecha en tu navegador.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Toca <strong>“Instalar aplicación”</strong> (o <strong>“Agregar a la pantalla principal”</strong>).
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Una vez instalada, cuando la abras desde el ícono de tu teléfono entrará directo a la App a pantalla completa sin mostrar esta portada.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="min-h-[48px] rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setInstallModalOpen(false);
                  onEnterApp();
                }}
                className="min-h-[48px] rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
              >
                Usar la App Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
