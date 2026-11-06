import React from 'react';
import { Plus, SlidersHorizontal, Zap } from 'lucide-react';
import { calculatePortionMacros, calculateComboMacros } from '../../utils/macroCalculator';

/**
 * Grilla de botones de 1 toque (Quick-Add) para alimentos favoritos (`es_favorito = true`)
 * y combos frecuentes.
 * - Tocar el botón `+` registra inmediatamente su `porcion_habitual_g` (Optimistic UI < 16ms).
 * - Tocar el cuerpo de la tarjeta abre el `BottomSheet` para variar los gramos con teclado numérico.
 */
export function QuickAddGrid({
  favoritos = [],
  combos = [],
  onQuickAddFood,
  onOpenCustomPortion,
  onQuickAddCombo
}) {
  return (
    <div className="space-y-4">
      {/* Sección Combos en 1 Toque (RF-05) */}
      {combos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Combos en 1 Toque
            </h2>
            <span className="text-[11px] text-slate-500">Carga múltiple instantánea</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {combos.map((combo) => {
              const macros = calculateComboMacros(combo.combo_items || []);
              return (
                <button
                  key={combo.id}
                  type="button"
                  onClick={() => onQuickAddCombo(combo)}
                  className="shrink-0 min-h-[56px] bg-slate-900/95 hover:bg-slate-800/90 active:scale-95 border border-amber-500/30 rounded-2xl px-3.5 py-2.5 text-left transition flex items-center gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100 line-clamp-1">
                      {combo.nombre}
                    </div>
                    <div className="text-[11px] text-amber-400 font-semibold tabular-nums mt-0.5">
                      {macros.kcal} kcal · {macros.proteina_g}P / {macros.carbos_g}C / {macros.grasas_g}G
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grilla de Favoritos Quick-Add (Algoritmo Paso 2) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registro Rápido (Favoritos)
          </h2>
          <span className="text-[11px] text-slate-500">
            Toca tarjeta = ajustar g · [+] = 1 toque
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {favoritos.map((food) => {
            const habitualG = Number(food.porcion_habitual_g) || 100;
            const portion = calculatePortionMacros(food, habitualG);

            return (
              <div
                key={food.id}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-slate-700 transition"
              >
                {/* Cuerpo de la tarjeta: abre BottomSheet para ajustar gramos (Paso 2.3) */}
                <button
                  type="button"
                  onClick={() => onOpenCustomPortion(food)}
                  className="flex-1 min-h-[48px] text-left pr-1 focus:outline-none active:opacity-80"
                >
                  <div className="text-xs font-bold text-slate-100 leading-snug line-clamp-1">
                    {food.nombre}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{habitualG}g</span>
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      · {portion.kcal} kcal
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                    P:{portion.proteina_g}g C:{portion.carbos_g}g G:{portion.grasas_g}g
                  </div>
                </button>

                {/* Botón + de 1 toque (Mínimo 48x48px para el pulgar - RNF-01 & Paso 2.2) */}
                <button
                  type="button"
                  onClick={() => onQuickAddFood(food, habitualG)}
                  aria-label={`Agregar ${habitualG}g de ${food.nombre}`}
                  className="min-w-[48px] min-h-[48px] rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-90 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 transition"
                >
                  <Plus className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

