import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatShortDate } from '../../utils/dateUtils';

function CustomWeightTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const diff = Number((point.peso_kg - point.ema_kg).toFixed(2));

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-xl text-xs space-y-1">
      <div className="font-bold text-slate-300 border-b border-slate-800 pb-1">
        Fecha: {point.fecha}
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Peso Báscula (Real):</span>
        <span className="font-bold text-sky-400 tabular-nums">{point.peso_kg} kg</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Tendencia EMA 7d:</span>
        <span className="font-extrabold text-emerald-400 tabular-nums">{point.ema_kg} kg</span>
      </div>
      <div className="text-[11px] text-slate-500 pt-0.5">
        Fluctuación hídrica/glucógeno: {diff > 0 ? `+${diff}` : diff} kg
      </div>
      {point.notas && (
        <div className="text-[11px] text-amber-300 italic pt-0.5">
          “{point.notas}”
        </div>
      )}
    </div>
  );
}

/**
 * Algoritmo Paso 4.5: Gráfico Recharts (`ComposedChart`) comparativo:
 * - Serie 1 (`peso_kg`): Línea punteada tenue + Scatter para el ruido diario de báscula.
 * - Serie 2 (`ema_kg`): Línea curva sólida verde esmeralda (`#10b981`, grosor 3px) para la tendencia real.
 */
export function WeightChart({ series = [] }) {
  if (!series || series.length === 0) {
    return (
      <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center p-6 text-center">
        <p className="text-xs text-slate-400">
          Registra tu primer pesaje en ayunas para calcular tu curva de Peso Tendencial EMA.
        </p>
      </div>
    );
  }

  const allValues = series.flatMap((d) => [d.peso_kg, d.ema_kg]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const domainMin = Number((minVal - 0.5).toFixed(1));
  const domainMax = Number((maxVal + 0.5).toFixed(1));

  const chartData = series.map((item) => ({
    ...item,
    fechaCorta: formatShortDate(item.fecha)
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Peso Real vs. Tendencia EMA (7 Días)
          </h2>
          <p className="text-[11px] text-slate-500">
            Filtra retención de líquidos y glucógeno (k = 0.25)
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            Báscula
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-3 h-1 rounded-full bg-emerald-400 inline-block" />
            EMA 7d
          </span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="fechaCorta"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomWeightTooltip />} />

            {/* Línea punteada tenue que conecta los pesajes diarios reales */}
            <Line
              type="monotone"
              dataKey="peso_kg"
              name="Peso Real"
              stroke="#38bdf8"
              strokeWidth={1.25}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* Puntos Scatter de Peso Real (ruido diario) */}
            <Scatter
              dataKey="peso_kg"
              name="Puntos Báscula"
              fill="#38bdf8"
              isAnimationActive={false}
            />

            {/* Línea curva sólida verde esmeralda (#10b981, grosor 3px) para EMA 7 días */}
            <Line
              type="monotone"
              dataKey="ema_kg"
              name="Tendencia EMA"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#020617', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

