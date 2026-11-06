import React from 'react';

/**
 * Barra de progreso individual para Proteínas, Carbohidratos o Grasas.
 * Muestra gramos consumidos, meta y gramos restantes (o excedidos).
 */
export function MacroProgressBar({
  label,
  shortLabel,
  consumed = 0,
  target = 100,
  remaining = 0,
  colorClass = 'bg-emerald-500',
  textClass = 'text-emerald-400'
}) {
  const safeTarget = Math.max(1, Number(target) || 1);
  const rawPercent = (Number(consumed) / safeTarget) * 100;
  const clampedPercent = Math.min(100, Math.max(0, rawPercent));
  const isOver = remaining < 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {shortLabel || label}
        </span>
        <span className={`text-[11px] font-semibold ${isOver ? 'text-rose-400' : textClass}`}>
          {isOver ? `+${Math.abs(remaining).toFixed(1)}g` : `Faltan ${remaining.toFixed(0)}g`}
        </span>
      </div>

      <div className="flex items-baseline gap-1 my-0.5">
        <span className="text-lg font-extrabold text-slate-100 tabular-nums">
          {Number(consumed).toFixed(0)}
        </span>
        <span className="text-xs text-slate-400 tabular-nums">
          / {Number(target).toFixed(0)}g
        </span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver ? 'bg-rose-500' : colorClass
          }`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}

