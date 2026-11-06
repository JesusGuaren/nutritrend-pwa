import React, { useState } from 'react';
import { Plus, Trash2, Check, Layers, Zap } from 'lucide-react';
import { calculateComboMacros, calculatePortionMacros } from '../../utils/macroCalculator';

/**
 * Constructor y Gestor de Combos (Comidas armadas frecuentes)
 * Agrupa múltiples alimentos con sus respectivos gramos bajo un único nombre
 * para insertarlos todos juntos en el registro diario con un solo toque (RF-05).
 */
export function ComboBuilder({
  alimentos = [],
  combos = [],
  onCreateCombo,
  onDeleteCombo,
  onExecuteComboToday
}) {
  const [nombreCombo, setNombreCombo] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState(() => alimentos[0]?.id || '');
  const [itemGrams, setItemGrams] = useState('100');
  const [draftItems, setDraftItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddDraftItem = () => {
    const food = alimentos.find((a) => a.id === selectedFoodId);
    if (!food) return;

    const cleanGrams = Math.max(1, Number(itemGrams) || Number(food.porcion_habitual_g) || 100);
    setDraftItems((prev) => [
      ...prev,
      {
        tempId: `${food.id}-${Date.now()}`,
        alimento_id: food.id,
        gramos: cleanGrams,
        alimentos: food
      }
    ]);
    setErrorMsg('');
  };

  const handleRemoveDraftItem = (tempId) => {
    setDraftItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleSaveCombo = async (e) => {
    e.preventDefault();
    if (!nombreCombo.trim()) {
      setErrorMsg('Ingresa un nombre para el combo (Ej: Desayuno Clásico).');
      return;
    }
    if (draftItems.length === 0) {
      setErrorMsg('Agrega al menos un alimento al combo.');
      return;
    }

    await onCreateCombo(nombreCombo.trim(), draftItems);
    setNombreCombo('');
    setDraftItems([]);
    setErrorMsg('');
  };

  const draftMacros = calculateComboMacros(draftItems);

  return (
    <div className="space-y-4">
      {/* Formulario Creador de Combo */}
      <form
        onSubmit={handleSaveCombo}
        className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 space-y-3.5"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Armar Nuevo Combo
          </h3>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Nombre del Combo *
          </label>
          <input
            type="text"
            placeholder="Ej: Desayuno Clásico / Batido Post-Entreno"
            value={nombreCombo}
            onChange={(e) => setNombreCombo(e.target.value)}
            className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Selector de ingrediente + gramos (RNF-02) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Agregar Ingrediente al Combo
          </span>

          <select
            value={selectedFoodId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedFoodId(id);
              const found = alimentos.find((a) => a.id === id);
              if (found) setItemGrams(String(found.porcion_habitual_g || 100));
            }}
            className="w-full min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {alimentos.map((food) => (
              <option key={food.id} value={food.id}>
                {food.nombre} ({food.kcal_100g} kcal/100g)
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="Gramos"
              value={itemGrams}
              onChange={(e) => setItemGrams(e.target.value)}
              className="flex-1 min-h-[48px] bg-slate-900 border border-slate-800 rounded-xl px-3.5 text-sm font-bold text-slate-100 tabular-nums focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddDraftItem}
              className="min-h-[48px] px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Añadir Item
            </button>
          </div>
        </div>

        {/* Lista de ingredientes actuales en el borrador */}
        {draftItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 px-1">
              <span>Total Combo ({draftItems.length} items):</span>
              <span className="tabular-nums">
                {draftMacros.kcal} kcal · P:{draftMacros.proteina_g}g C:{draftMacros.carbos_g}g G:{draftMacros.grasas_g}g
              </span>
            </div>

            <div className="space-y-1.5">
              {draftItems.map((it) => {
                const m = calculatePortionMacros(it.alimentos, it.gramos);
                return (
                  <div
                    key={it.tempId}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{it.alimentos?.nombre}</span>
                      <span className="text-slate-400 ml-2 tabular-nums">
                        {it.gramos}g ({m.kcal} kcal)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftItem(it.tempId)}
                      className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full min-h-[50px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
        >
          <Check className="w-5 h-5 stroke-[2.5px]" />
          Guardar Combo
        </button>
      </form>

      {/* Listado de Combos Guardados */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Combos Guardados ({combos.length})
        </h3>

        {combos.map((combo) => {
          const macros = calculateComboMacros(combo.combo_items || []);
          return (
            <div
              key={combo.id}
              className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{combo.nombre}</h4>
                  <p className="text-xs text-amber-400 font-semibold tabular-nums mt-0.5">
                    {macros.kcal} kcal · P:{macros.proteina_g}g · C:{macros.carbos_g}g · G:{macros.grasas_g}g
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onExecuteComboToday(combo)}
                    className="min-h-[44px] px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Cargar Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCombo(combo.id)}
                    aria-label="Eliminar combo"
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2 space-y-1">
                {(combo.combo_items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-[11px] text-slate-400"
                  >
                    <span>• {item.alimentos?.nombre || 'Alimento'}</span>
                    <span className="tabular-nums font-semibold text-slate-300">
                      {item.gramos}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

