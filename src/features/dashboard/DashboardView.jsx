import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ScanBarcode,
  Trash2,
  Check,
  Utensils,
  Search
} from 'lucide-react';
import { CalorieRing } from '../../components/ui/CalorieRing';
import { MacroProgressBar } from '../../components/ui/MacroProgressBar';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { QuickAddGrid } from './QuickAddGrid';
import { BarcodeModal } from './BarcodeModal';
import {
  getLocalDateString,
  formatHumanDate,
  addDaysToDateString
} from '../../utils/dateUtils';
import { calculatePortionMacros } from '../../utils/macroCalculator';

const MEAL_BLOCKS = ['Desayuno', 'Almuerzo', 'Once/Cena', 'Snacks/Post-Entreno', 'General'];

/**
 * Vista Principal del Dashboard Diario de Nutrición:
 * - Selector de fecha local (sin desfase UTC)
 * - Alternador rápido de Fase Calórica (Déficit / Mantenimiento / Entreno Pesado)
 * - Anillo calórico y 3 barras de progreso (Proteínas, Carbohidratos, Grasas)
 * - Quick-Add en 1 toque + BottomSheet numérico para variar porción
 * - FAB de Escáner de Código de Barras (EAN-13/EAN-8)
 * - Registro detallado de comidas del día con borrado optimista
 */
export function DashboardView({
  selectedDate,
  onSelectDate,
  metas = [],
  metaActiva,
  onSwitchPhase,
  favoritos = [],
  alimentos = [],
  combos = [],
  registrosHoy = [],
  summary,
  onLogFood,
  onLogCombo,
  onRemoveLog,
  onCreateFood
}) {
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [customGrams, setCustomGrams] = useState('100');
  const [customBlock, setCustomBlock] = useState('General');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackToast, setFeedbackToast] = useState(null);

  const todayStr = getLocalDateString();
  const isToday = selectedDate === todayStr;

  const showToast = (text) => {
    setFeedbackToast(text);
    setTimeout(() => {
      setFeedbackToast((prev) => (prev === text ? null : prev));
    }, 1800);
  };

  // Paso 2.2: Registro Rápido en 1 Toque
  const handleQuickAddOneTap = async (food, grams) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    showToast(`+ ${grams}g ${food.nombre}`);
    await onLogFood(food, grams, 'General');
  };

  // Paso 2.3: Abrir BottomSheet con input numérico pre-llenado en `porcion_habitual_g`
  const handleOpenCustomPortion = (food) => {
    setSelectedFoodForModal(food);
    setCustomGrams(String(food.porcion_habitual_g || 100));
    setCustomBlock('General');
  };

  const handleConfirmCustomPortion = async (e) => {
    e.preventDefault();
    if (!selectedFoodForModal) return;
    const grams = Math.max(1, Number(customGrams) || 100);
    const targetFood = selectedFoodForModal;
    setSelectedFoodForModal(null);
    showToast(`+ ${grams}g ${targetFood.nombre}`);
    await onLogFood(targetFood, grams, customBlock);
  };

  // RF-05: Ejecutar combo en 1 toque
  const handleQuickAddCombo = async (combo) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }
    showToast(`Combo registrado: ${combo.nombre}`);
    await onLogCombo(combo, 'General');
  };

  // Escáner: Crear alimento nuevo y registrarlo inmediatamente
  const handleCreateAndLogFromBarcode = async (foodPayload, grams, block) => {
    const newFood = await onCreateFood(foodPayload);
    showToast(`+ ${grams}g ${newFood.nombre}`);
    await onLogFood(newFood, grams, block);
  };

  const modalPortionPreview = selectedFoodForModal
    ? calculatePortionMacros(selectedFoodForModal, Number(customGrams) || 0)
    : null;

  const filteredSearchFoods = alimentos.filter((f) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      f.nombre.toLowerCase().includes(q) ||
      (f.marca && f.marca.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Toast flotante de confirmación <16ms */}
      {feedbackToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4 stroke-[3px]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* CABECERA: Selector de Fecha Local (RF-01) */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-100">
            NutriTrend
          </h1>
          <p className="text-xs text-slate-400">
            {isToday ? 'Hoy · ' : ''}
            {formatHumanDate(selectedDate)}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => onSelectDate(addDaysToDateString(selectedDate, -1))}
            aria-label="Día anterior"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-800 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(todayStr)}
            className={`px-2.5 min-h-[40px] rounded-xl text-xs font-bold transition ${
              isToday
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isToday ? 'HOY' : selectedDate.slice(5)}
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(addDaysToDateString(selectedDate, 1))}
            aria-label="Día siguiente"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-800 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SELECTOR DE FASE CALÓRICA / DÍA (Patrón Strategy) */}
      <section aria-label="Selector de fase calórica">
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90">
          {metas.map((meta) => {
            const isSelected = meta.id === metaActiva?.id;
            return (
              <button
                key={meta.id}
                type="button"
                onClick={() => onSwitchPhase(meta.id)}
                className={`min-h-[48px] rounded-xl px-2 py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 font-semibold'
                }`}
              >
                <span className="text-[11px] leading-tight truncate max-w-full">
                  {meta.nombre_perfil}
                </span>
                <span
                  className={`text-[10px] tabular-nums mt-0.5 ${
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {meta.kcal_objetivo} kcal
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ANILLO DE CALORÍAS + BARRAS DE MACRONUTRIENTES */}
      <section className="space-y-2.5">
        <CalorieRing
          consumed={summary.consumido.kcal}
          target={summary.meta.kcal}
          remaining={summary.restante.kcal}
          phaseName={metaActiva?.nombre_perfil}
        />

        <div className="grid grid-cols-3 gap-2">
          <MacroProgressBar
            label="Proteínas"
            shortLabel="Proteína"
            consumed={summary.consumido.p}
            target={summary.meta.p}
            remaining={summary.restante.p}
            colorClass="bg-sky-500"
            textClass="text-sky-400"
          />
          <MacroProgressBar
            label="Carbohidratos"
            shortLabel="Carbos"
            consumed={summary.consumido.c}
            target={summary.meta.c}
            remaining={summary.restante.c}
            colorClass="bg-amber-500"
            textClass="text-amber-400"
          />
          <MacroProgressBar
            label="Grasas"
            shortLabel="Grasas"
            consumed={summary.consumido.g}
            target={summary.meta.g}
            remaining={summary.restante.g}
            colorClass="bg-rose-500"
            textClass="text-rose-400"
          />
        </div>
      </section>

      {/* ACCIONES RÁPIDAS: BUSCADOR DE CATÁLOGO Y ESCÁNER EAN */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="min-h-[48px] rounded-2xl bg-slate-900 border border-slate-800 px-3.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 active:scale-95 transition"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          Buscar Alimento
        </button>

        <button
          type="button"
          onClick={() => setIsBarcodeOpen(true)}
          className="min-h-[48px] rounded-2xl bg-emerald-500/15 border border-emerald-500/40 px-3.5 flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 active:scale-95 transition"
        >
          <ScanBarcode className="w-4 h-4 text-emerald-400" />
          Escanear Código EAN
        </button>
      </div>

      {/* GRILLA DE REGISTRO RÁPIDO EN 1 TOQUE (Quick-Add) */}
      <QuickAddGrid
        favoritos={favoritos}
        combos={combos}
        onQuickAddFood={handleQuickAddOneTap}
        onOpenCustomPortion={handleOpenCustomPortion}
        onQuickAddCombo={handleQuickAddCombo}
      />

      {/* HISTORIAL DEL DÍA (LOG DIARIO) */}
      <section className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
            Registros del Día ({registrosHoy.length})
          </h2>
        </div>

        {registrosHoy.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-400">
              Aún no has registrado alimentos en esta fecha. Toca cualquier favorito arriba para agregar en 1 segundo.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {registrosHoy.map((log) => {
              const food = log.alimentos || {};
              const m = calculatePortionMacros(food, log.gramos);
              return (
                <div
                  key={log.id}
                  className="bg-slate-900/90 border border-slate-800/80 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {food.nombre || 'Alimento'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                        {log.bloque_comida || 'General'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                      <strong className="text-emerald-400">{log.gramos}g</strong> ·{' '}
                      <strong className="text-slate-200">{m.kcal} kcal</strong> · P:{m.proteina_g}g C:{m.carbos_g}g G:{m.grasas_g}g
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveLog(log.id)}
                    aria-label="Eliminar registro"
                    className="min-w-[48px] min-h-[48px] -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTÓN FLOTANTE (FAB) DE ESCÁNER DE CÓDIGO DE BARRAS (Algoritmo Paso 3.1) */}
      <button
        type="button"
        onClick={() => setIsBarcodeOpen(true)}
        aria-label="Escanear código de barras"
        className="fixed bottom-20 right-4 z-30 min-w-[56px] min-h-[56px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center transition"
      >
        <ScanBarcode className="w-6 h-6 stroke-[2.25px]" />
      </button>

      {/* BOTTOM-SHEET PARA AJUSTAR GRAMOS CON TECLADO NUMÉRICO (Paso 2.3 & RNF-02) */}
      <BottomSheet
        isOpen={Boolean(selectedFoodForModal)}
        onClose={() => setSelectedFoodForModal(null)}
        title={selectedFoodForModal?.nombre || 'Ajustar Porción'}
        subtitle={`Porción habitual: ${selectedFoodForModal?.porcion_habitual_g || 100}g (${selectedFoodForModal?.unidad_nombre || 'g'})`}
      >
        {selectedFoodForModal && (
          <form onSubmit={handleConfirmCustomPortion} className="space-y-4">
            {/* Vista previa en vivo de calorías y macros según los gramos escritos */}
            {modalPortionPreview && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-around text-center">
                <div>
                  <span className="block text-[10px] uppercase text-slate-400">Calorías</span>
                  <span className="text-lg font-black text-emerald-400 tabular-nums">
                    {modalPortionPreview.kcal}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <span className="block text-[10px] uppercase text-sky-400">Proteína</span>
                  <span className="text-sm font-bold text-slate-100 tabular-nums">
                    {modalPortionPreview.proteina_g}g
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-amber-400">Carbos</span>
                  <span className="text-sm font-bold text-slate-100 tabular-nums">
                    {modalPortionPreview.carbos_g}g
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-rose-400">Grasas</span>
                  <span className="text-sm font-bold text-slate-100 tabular-nums">
                    {modalPortionPreview.grasas_g}g
                  </span>
                </div>
              </div>
            )}

            {/* RNF-02: Input numérico directo con auto-foco */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Gramos / ml consumidos
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                autoFocus
                required
                value={customGrams}
                onChange={(e) => setCustomGrams(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full min-h-[54px] bg-slate-950 border border-emerald-500/60 rounded-2xl px-4 text-2xl font-black text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Multiplicadores rápidos para el pulgar */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[0.5, 1, 1.5, 2].map((mult) => {
                  const base = Number(selectedFoodForModal.porcion_habitual_g) || 100;
                  const val = Math.round(base * mult);
                  return (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setCustomGrams(String(val))}
                      className="min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:border-emerald-500/50 active:scale-95"
                    >
                      {mult}x ({val}g)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Bloque de Comida */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Bloque de Comida
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {MEAL_BLOCKS.map((block) => (
                  <button
                    key={block}
                    type="button"
                    onClick={() => setCustomBlock(block)}
                    className={`min-h-[42px] px-2 rounded-xl text-xs font-semibold border transition ${
                      customBlock === block
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {block}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5px]" />
              Confirmar Registro ({customGrams || 0}g)
            </button>
          </form>
        )}
      </BottomSheet>

      {/* BOTTOM-SHEET DE BÚSQUEDA EN CATÁLOGO COMPLETO */}
      <BottomSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Buscar en Catálogo"
        subtitle="Selecciona cualquier alimento para registrar"
      >
        <div className="space-y-3">
          <input
            type="text"
            autoFocus
            placeholder="Filtrar por nombre o marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filteredSearchFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  handleOpenCustomPortion(food);
                }}
                className="w-full min-h-[52px] bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl px-3.5 py-2 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">{food.nombre}</div>
                  <div className="text-[11px] text-slate-400">
                    {food.marca || 'Genérico'} · Porción: {food.porcion_habitual_g}g
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 tabular-nums">
                  {food.kcal_100g} kcal/100g
                </span>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* MODAL DE ESCÁNER DE CÓDIGO DE BARRAS (Algoritmo Paso 3) */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        onConfirmExistingFood={async (food, grams, block) => {
          showToast(`+ ${grams}g ${food.nombre}`);
          await onLogFood(food, grams, block);
        }}
        onCreateAndLogFood={handleCreateAndLogFromBarcode}
      />
    </div>
  );
}

