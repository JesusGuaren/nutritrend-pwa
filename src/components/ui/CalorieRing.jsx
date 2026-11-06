import React from 'react';

/**
 * Indicador circular SVG principal de calorías consumidas vs. objetivo y restantes.
 */
export function CalorieRing({ consumed = 0, target = 2050, remaining = 2050, phaseName = 'Déficit' }) {
  const safeTarget = Math.max(1, Number(target) || 2050);
  const ratio = Math.min(1, Math.max(0, Number(consumed) / safeTarget));
  const isOver = remaining < 0;

  const size = 132;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-lg">
      {/* Anillo SVG */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={isOver ? '#f43f5e' : '#10b981'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            {isOver ? 'Exceso' : 'Restantes'}
          </span>
          <span
            className={`text-2xl font-black tabular-nums leading-none mt-0.5 ${
              isOver ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {Math.abs(remaining)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">kcal</span>
        </div>
      </div>

      {/* Desglose numérico lateral */}
      <div className="flex-1 space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">
            Fase: {phaseName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">
              Consumido
            </span>
            <span className="text-base font-extrabold text-slate-100 tabular-nums">
              {consumed} <small className="text-[10px] font-normal text-slate-400">kcal</small>
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">
              Meta Día
            </span>
            <span className="text-base font-extrabold text-slate-100 tabular-nums">
              {target} <small className="text-[10px] font-normal text-slate-400">kcal</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

