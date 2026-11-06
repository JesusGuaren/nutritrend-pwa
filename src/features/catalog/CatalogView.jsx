import React, { useState } from 'react';
import {
  Star,
  Plus,
  Check,
  Apple,
  Layers,
  Target
} from 'lucide-react';
import { ComboBuilder } from './ComboBuilder';
import { BottomSheet } from '../../components/ui/BottomSheet';

/**
 * Vista de Gestión de Catálogo de Alimentos, Combos y Perfiles de Metas Nutricionales.
 */
export function CatalogView({
  alimentos = [],
  combos = [],
  metas = [],
  onCreateFood,
  onToggleFavorite,
  onCreateCombo,
  onDeleteCombo,
  onLogCombo,
  onUpdateMetaProfile
}) {
  const [subTab, setSubTab] = useState('alimentos'); // 'alimentos' | 'combos' | 'metas'
  const [isNewFoodOpen, setIsNewFoodOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const [foodForm, setFoodForm] = useState({
    nombre: '',
    marca: '',
    codigo_barras: '',
    kcal_100g: '',
    proteina_100g: '',
    carbos_100g: '',
    grasas_100g: '',
    porcion_habitual_g: '100',
    unidad_nombre: 'g',
    es_favorito: true
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const handleCreateFoodSubmit = async (e) => {
    e.preventDefault();
    if (!foodForm.nombre.trim()) return;

    await onCreateFood({
      nombre: foodForm.nombre.trim(),
      marca: foodForm.marca.trim(),
      codigo_barras: foodForm.codigo_barras.trim() || null,
      kcal_100g: Number(foodForm.kcal_100g) || 0,
      proteina_100g: Number(foodForm.proteina_100g) || 0,
      carbos_100g: Number(foodForm.carbos_100g) || 0,
      grasas_100g: Number(foodForm.grasas_100g) || 0,
      porcion_habitual_g: Number(foodForm.porcion_habitual_g) || 100,
      unidad_nombre: foodForm.unidad_nombre.trim() || 'g',
      es_favorito: foodForm.es_favorito
    });

    setFoodForm({
      nombre: '',
      marca: '',
      codigo_barras: '',
      kcal_100g: '',
      proteina_100g: '',
      carbos_100g: '',
      grasas_100g: '',
      porcion_habitual_g: '100',
      unidad_nombre: 'g',
      es_favorito: true
    });
    setIsNewFoodOpen(false);
    triggerToast('Alimento guardado en el catálogo');
  };

  const filteredAlimentos = alimentos.filter((a) => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      a.nombre.toLowerCase().includes(q) ||
      (a.marca && a.marca.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
          <Check className="w-4 h-4 stroke-[3px]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabecera */}
      <header className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-100">
            Catálogo, Combos & Metas
          </h1>
          <p className="text-xs text-slate-400">
            Personaliza tus alimentos favoritos, comidas armadas y fases
          </p>
        </div>
      </header>

      {/* Sub-navegación interna */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setSubTab('alimentos')}
          className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            subTab === 'alimentos'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Apple className="w-4 h-4" />
          Alimentos
        </button>

        <button
          type="button"
          onClick={() => setSubTab('combos')}
          className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            subTab === 'combos'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Combos
        </button>

        <button
          type="button"
          onClick={() => setSubTab('metas')}
          className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            subTab === 'metas'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          Metas
        </button>
      </div>

      {/* PESTAÑA 1: CATÁLOGO DE ALIMENTOS */}
      {subTab === 'alimentos' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar alimento o marca..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1 min-h-[48px] bg-slate-900 border border-slate-800 rounded-2xl px-3.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setIsNewFoodOpen(true)}
              className="min-h-[48px] px-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5px]" />
              Nuevo
            </button>
          </div>

          <div className="space-y-2">
            {filteredAlimentos.map((food) => (
              <div
                key={food.id}
                className="bg-slate-900/90 border border-slate-800/80 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {food.nombre}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {food.marca || 'Genérico'} · Hab: {food.porcion_habitual_g}g ({food.unidad_nombre})
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold tabular-nums mt-0.5">
                    100g: {food.kcal_100g} kcal · P:{food.proteina_100g}g C:{food.carbos_100g}g G:{food.grasas_100g}g
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(food.id, !food.es_favorito)}
                  aria-label="Alternar favorito Quick-Add"
                  className={`min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center border transition active:scale-90 ${
                    food.es_favorito
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <Star className={`w-5 h-5 ${food.es_favorito ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GESTIÓN DE COMBOS / COMIDAS ARMADAS */}
      {subTab === 'combos' && (
        <ComboBuilder
          alimentos={alimentos}
          combos={combos}
          onCreateCombo={async (name, items) => {
            await onCreateCombo(name, items);
            triggerToast('Combo creado exitosamente');
          }}
          onDeleteCombo={onDeleteCombo}
          onExecuteComboToday={async (combo) => {
            await onLogCombo(combo, 'General');
            triggerToast(`Combo "${combo.nombre}" cargado en Hoy`);
          }}
        />
      )}

      {/* PESTAÑA 3: PERFILES DE METAS NUTRICIONALES */}
      {subTab === 'metas' && (
        <div className="space-y-3">
          {metas.map((meta) => (
            <MetaProfileCard
              key={meta.id}
              meta={meta}
              onSave={async (id, values) => {
                await onUpdateMetaProfile(id, values);
                triggerToast(`Perfil ${meta.nombre_perfil} actualizado`);
              }}
            />
          ))}
        </div>
      )}

      {/* BOTTOM-SHEET PARA CREAR ALIMENTO MANUAL */}
      <BottomSheet
        isOpen={isNewFoodOpen}
        onClose={() => setIsNewFoodOpen(false)}
        title="Crear Nuevo Alimento"
        subtitle="Ingresa la información nutricional por cada 100 gramos"
      >
        <form onSubmit={handleCreateFoodSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Nombre del Alimento *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Atún Lomitos en Agua"
              value={foodForm.nombre}
              onChange={(e) => setFoodForm({ ...foodForm, nombre: e.target.value })}
              className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Marca
              </label>
              <input
                type="text"
                placeholder="Ej: Robinson Crusoe"
                value={foodForm.marca}
                onChange={(e) => setFoodForm({ ...foodForm, marca: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Código EAN (Opcional)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="780..."
                value={foodForm.codigo_barras}
                onChange={(e) => setFoodForm({ ...foodForm, codigo_barras: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Kcal por 100g *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={foodForm.kcal_100g}
                onChange={(e) => setFoodForm({ ...foodForm, kcal_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm font-bold text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Porción Habitual (g) *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={foodForm.porcion_habitual_g}
                onChange={(e) => setFoodForm({ ...foodForm, porcion_habitual_g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm font-bold text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-sky-400 mb-1">
                Proteína / 100g *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={foodForm.proteina_100g}
                onChange={(e) => setFoodForm({ ...foodForm, proteina_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm font-bold text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                Carbos / 100g *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={foodForm.carbos_100g}
                onChange={(e) => setFoodForm({ ...foodForm, carbos_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm font-bold text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                Grasas / 100g *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={foodForm.grasas_100g}
                onChange={(e) => setFoodForm({ ...foodForm, grasas_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm font-bold text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[52px] rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[2.5px]" />
            Guardar en Catálogo
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}

function MetaProfileCard({ meta, onSave }) {
  const [kcal, setKcal] = useState(String(meta.kcal_objetivo));
  const [p, setP] = useState(String(meta.proteina_g));
  const [c, setC] = useState(String(meta.carbos_g));
  const [g, setG] = useState(String(meta.grasas_g));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(meta.id, {
      kcal_objetivo: Number(kcal),
      proteina_g: Number(p),
      carbos_g: Number(c),
      grasas_g: Number(g)
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-slate-100">
          Fase: {meta.nombre_perfil}
        </span>
        {meta.activo && (
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
            Activa Hoy
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-emerald-400 mb-1">
            Kcal
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs font-bold text-slate-100 tabular-nums"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-sky-400 mb-1">
            Prot (g)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs font-bold text-slate-100 tabular-nums"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-amber-400 mb-1">
            Carb (g)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs font-bold text-slate-100 tabular-nums"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-rose-400 mb-1">
            Grasa (g)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={g}
            onChange={(e) => setG(e.target.value)}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs font-bold text-slate-100 tabular-nums"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition active:scale-98"
      >
        Guardar Metas de {meta.nombre_perfil}
      </button>
    </form>
  );
}

