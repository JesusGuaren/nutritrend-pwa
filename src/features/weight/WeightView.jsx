import React, { useState } from 'react';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Check,
  Trash2,
  Calendar,
  Flame,
  Sparkles
} from 'lucide-react';
import { useWeightTrend } from '../../hooks/useWeightTrend';
import { WeightChart } from './WeightChart';
import { getLocalDateString, formatHumanDate } from '../../utils/dateUtils';
import { calculateDynamicTDEE } from '../../utils/emaCalculator';
import { nutritionService } from '../../services/nutritionService';

/**
 * Algoritmo Interacción 3 (Paso 4) & RF-03:
 * Vista de control de peso corporal en ayunas y cálculo de Peso Tendencial EMA (7 días).
 * Incluye las 3 tarjetas superiores: "Peso Hoy", "Tendencia Actual (EMA)" y "Cambio 7 días".
 */
export function WeightView() {
  const { series, stats, error, recordWeight, removeWeight } = useWeightTrend();

  const todayStr = getLocalDateString();
  const [fechaInput, setFechaInput] = useState(todayStr);
  const [pesoInput, setPesoInput] = useState(() =>
    stats.pesoHoy ? String(stats.pesoHoy) : ''
  );
  const [notasInput, setNotasInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmitWeight = async (e) => {
    e.preventDefault();
    if (!pesoInput) return;

    try {
      await recordWeight({
        fecha: fechaInput,
        peso_kg: Number(pesoInput),
        notas: notasInput
      });
      setNotasInput('');
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 1800);
    } catch {
      // El hook useWeightTrend ya expone el mensaje en `error`
    }
  };

  const renderTrendBadge = () => {
    if (stats.tendenciaEstado === 'Bajando') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
          <TrendingDown className="w-3.5 h-3.5" />
          Bajando
        </span>
      );
    }
    if (stats.tendenciaEstado === 'Subiendo') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          Subiendo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-sky-400 text-[11px] font-bold">
        <Minus className="w-3.5 h-3.5" />
        Estable
      </span>
    );
  };

  const reversedHistory = [...series].reverse();

  // Fase 2 (Sección 7.1): Motor de Gasto Calórico Dinámico (TDEE Real de 14 días)
  const { avgKcal } = nutritionService.getAverageCaloriesLast14Days();
  const dynamicTdee = calculateDynamicTDEE({
    avgIntakeKcal14d: avgKcal,
    deltaEmaKg: stats.cambio14d ?? stats.cambio7d,
    daysCount: stats.diasTramo14 || 14
  });

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <header className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            Tracker de Peso & EMA
          </h1>
          <p className="text-xs text-slate-400">
            Tendencia exponencial de 7 días estilo MacroFactor
          </p>
        </div>
      </header>

      {/* TARJETAS SUPERIORES OBLIGATORIAS (Algoritmo Paso 4.5) */}
      <section className="grid grid-cols-3 gap-2.5">
        {/* Tarjeta 1: Peso Hoy */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Peso Hoy
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-sky-400 tabular-nums">
              {stats.pesoHoy !== null ? stats.pesoHoy : '--'}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
            Báscula en ayunas
          </span>
        </div>

        {/* Tarjeta 2: Tendencia Actual (EMA) */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Tendencia (EMA)
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400 tabular-nums">
              {stats.emaActual !== null ? stats.emaActual : '--'}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <span className="block text-[10px] text-slate-400 mt-0.5 truncate">
            Peso real filtrado
          </span>
        </div>

        {/* Tarjeta 3: Cambio 7 días */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cambio 7 días
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-100 tabular-nums">
              {stats.cambio7d > 0 ? `+${stats.cambio7d}` : stats.cambio7d}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <div className="mt-0.5">{renderTrendBadge()}</div>
        </div>
      </section>

      {/* GRÁFICO RECHARTS: Puntos = Peso Real, Línea Esmeralda = EMA 7d */}
      <WeightChart series={series} />

      {/* FASE 2 (Sección 7.1): MOTOR DE GASTO CALÓRICO DINÁMICO (TDEE REAL) */}
      {dynamicTdee && (
        <section className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Motor TDEE Real (Algoritmo MacroFactor)
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 14 días
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Ingesta Media</span>
              <span className="text-sm font-extrabold text-slate-100 tabular-nums">
                {dynamicTdee.avgIntakeKcal} kcal
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Δ EMA (14d)</span>
              <span className="text-sm font-extrabold text-sky-400 tabular-nums">
                {dynamicTdee.deltaEmaKg > 0 ? `+${dynamicTdee.deltaEmaKg}` : dynamicTdee.deltaEmaKg} kg
              </span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-2.5">
              <span className="block text-[10px] text-emerald-300 uppercase font-bold">TDEE Real</span>
              <span className="text-base font-black text-emerald-400 tabular-nums">
                {dynamicTdee.tdeeReal} kcal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 py-1.5 px-2">
              <span className="block text-slate-400">Déficit Sugerido</span>
              <strong className="text-emerald-400 tabular-nums">{dynamicTdee.sugerencias.deficitModerado} kcal</strong>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 py-1.5 px-2">
              <span className="block text-slate-400">Mantenimiento</span>
              <strong className="text-slate-200 tabular-nums">{dynamicTdee.sugerencias.mantenimiento} kcal</strong>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 py-1.5 px-2">
              <span className="block text-slate-400">Volumen Limpio</span>
              <strong className="text-amber-400 tabular-nums">{dynamicTdee.sugerencias.superavitLimpio} kcal</strong>
            </div>
          </div>
        </section>
      )}

      {/* FORMULARIO DE REGISTRO / UPSERT MATUTINO (RNF-02) */}
      <form
        onSubmit={handleSubmitWeight}
        className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Registrar Peso en Ayunas (UPSERT)
          </h2>
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Peso Corporal (kg) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              required
              placeholder="Ej: 75.2"
              value={pesoInput}
              onChange={(e) => setPesoInput(e.target.value)}
              className="w-full min-h-[50px] bg-slate-950 border border-emerald-500/50 rounded-2xl px-3.5 text-lg font-black text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              Fecha
            </label>
            <input
              type="date"
              required
              value={fechaInput}
              onChange={(e) => setFechaInput(e.target.value)}
              className="w-full min-h-[50px] bg-slate-950 border border-slate-800 rounded-2xl px-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Nota opcional (Ej: Post refeed, cena alta en sodio...)"
            value={notasInput}
            onChange={(e) => setNotasInput(e.target.value)}
            className="w-full min-h-[46px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-[50px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
        >
          <Check className="w-5 h-5 stroke-[2.5px]" />
          Registrar Peso
        </button>
      </form>

      {/* BITÁCORA DE PESAJES CON CÁLCULO EMA POR DÍA */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Historial de Pesajes ({reversedHistory.length})
        </h2>

        <div className="space-y-2">
          {reversedHistory.map((item) => (
            <div
              key={item.id || item.fecha}
              className="bg-slate-900/90 border border-slate-800/80 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    {formatHumanDate(item.fecha)}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    ({item.fecha})
                  </span>
                </div>
                <div className="text-xs mt-0.5 tabular-nums flex items-center gap-3">
                  <span className="text-sky-400 font-bold">
                    Báscula: {item.peso_kg} kg
                  </span>
                  <span className="text-emerald-400 font-extrabold">
                    EMA: {item.ema_kg} kg
                  </span>
                </div>
                {item.notas && (
                  <p className="text-[11px] text-slate-400 italic mt-0.5">
                    {item.notas}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeWeight(item.id || item.fecha)}
                aria-label={`Eliminar pesaje del ${item.fecha}`}
                className="min-w-[48px] min-h-[48px] -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

