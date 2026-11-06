import React from 'react';
import {
  Download,
  Smartphone,
  ScanBarcode,
  TrendingDown,
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Flame,
  PackageCheck
} from 'lucide-react';

/**
 * Portal Web estilo Aptoide / APK Store oficial de NutriTrend:
 * - Al presionar el botón de descarga, baja directamente el archivo binario `NutriTrend.apk` (4.1 MB)
 *   hospedado dentro de la misma web (`/NutriTrend.apk`) con MIME type nativo de Android.
 * - Al instalar el APK en Android, queda como una aplicación 100% nativa (SIN loguito de Chrome ni Brave).
 */
export function LandingShowcase({ onEnterApp, children }) {
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://nutritrend-pwa.vercel.app';
  const apkDirectUrl = `${currentOrigin}/NutriTrend.apk`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=10b981&bgcolor=020617&data=${encodeURIComponent(
    apkDirectUrl
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Efectos de iluminación ambiental */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* BARRA SUPERIOR */}
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
              APK Oficial v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/NutriTrend.apk"
            download="NutriTrend.apk"
            className="min-h-[42px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4 stroke-[2.5px]" />
            <span>Descargar APK (4.1 MB)</span>
          </a>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* COLUMNA IZQUIERDA: FICHA DE DESCARGA ESTILO APTOIDE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instalador Android Nativo (.APK) · Sin Logo de Navegador</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 leading-[1.1]">
            Descarga{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
              NutriTrend APK
            </span>{' '}
            directo en tu teléfono.
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
            Olvídate de los accesos directos del navegador. Descarga el paquete nativo{' '}
            <code className="text-emerald-400 font-bold">NutriTrend.apk</code> desde esta misma web e instálalo como cualquier aplicación real en tu Android.
          </p>

          {/* TARJETA ESTILO TIENDA APTOIDE CON BOTÓN DE DESCARGA DIRECTA */}
          <div className="bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <img
                src="/icon-192.svg"
                alt="Ícono NutriTrend"
                className="w-16 h-16 rounded-2xl border border-slate-700 shadow-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-slate-100">NutriTrend Android</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificada
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paquete: <code className="text-slate-300">com.jesusproductions.nutritrend</code>
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>Tamaño: <strong className="text-slate-200">4.1 MB</strong></span>
                  <span>•</span>
                  <span>Android 7.0+</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">100% Gratis</span>
                </div>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL DE DESCARGA DEL ARCHIVO .APK */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/NutriTrend.apk"
                download="NutriTrend.apk"
                className="flex-1 min-h-[56px] px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition"
              >
                <Download className="w-5 h-5 stroke-[2.75px]" />
                <span>Descargar NutriTrend.apk (Instalador Nativo)</span>
              </a>

              <button
                type="button"
                onClick={onEnterApp}
                className="min-h-[56px] px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <span>Probar en Web</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Instrucciones claras estilo Aptoide */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4" />
                <span>¿Cómo instalar el APK sin el logo de Chrome/Brave?</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>
                  Borra de tu pantalla de inicio los accesos directos anteriores que tenían el loguito de Chrome o Brave.
                </li>
                <li>
                  Presiona el botón verde <strong className="text-slate-200">“Descargar NutriTrend.apk”</strong> arriba para bajar el archivo <code className="text-emerald-400">NutriTrend.apk</code>.
                </li>
                <li>
                  Abre el archivo descargado en tu barra de notificaciones y toca <strong className="text-slate-200">“Instalar”</strong> (si Play Protect pregunta, selecciona <em>“Más detalles” → “Instalar de todas formas”</em>).
                </li>
              </ol>
            </div>

            {/* Código QR para descargar el APK directo desde el PC */}
            <div className="hidden sm:flex items-center gap-4 pt-3 border-t border-slate-800/80">
              <img
                src={qrImageUrl}
                alt="QR Descarga Directa NutriTrend.apk"
                className="w-20 h-20 rounded-xl border border-slate-800 bg-slate-950 p-1 shrink-0"
              />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Escanea este QR con tu teléfono para bajar directo <code className="text-emerald-400">NutriTrend.apk</code>
                </div>
                <p className="text-xs text-slate-400">
                  Apunta con tu cámara al QR y empezará la descarga del instalador nativo inmediatamente.
                </p>
              </div>
            </div>
          </div>

          {/* GRILLA DE CARACTERÍSTICAS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <ScanBarcode className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100">Escáner EAN Chile</h3>
              <p className="text-[11px] text-slate-400">
                Permiso nativo de cámara para leer códigos de barras de supermercado.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <TrendingDown className="w-5 h-5 text-sky-400" />
              <h3 className="text-xs font-bold text-slate-100">Tendencia EMA + TDEE</h3>
              <p className="text-[11px] text-slate-400">
                Media móvil exponencial de 7 días y cálculo de gasto calórico real.
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-100">Quick-Add 1 Toque</h3>
              <p className="text-[11px] text-slate-400">
                Registra favoritos, combos y ciclado de macros por día de la semana.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PREVIEW INTERACTIVA */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Así se ve instalada dentro de tu teléfono</span>
          </div>

          <div className="w-full max-w-[390px] rounded-[44px] p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-700/80 shadow-[0_0_70px_-15px_rgba(16,185,129,0.25)] relative">
            <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-end px-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
            </div>

            <div className="w-full h-[680px] rounded-[34px] overflow-y-auto overflow-x-hidden bg-slate-950 border border-slate-800 relative no-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
