import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ScanLine, Check, AlertCircle, Loader2, Search, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { nutritionService } from '../../services/nutritionService';
import { openFoodFactsApi } from '../../services/openFoodFactsApi';
import { calculatePortionMacros } from '../../utils/macroCalculator';

const MEAL_BLOCKS = ['Desayuno', 'Almuerzo', 'Once/Cena', 'Snacks/Post-Entreno', 'General'];

/**
 * Algoritmo Interacción 2 & RF-04:
 * Modal de escaneo de código de barras EAN-13/EAN-8 con cámara trasera (`html5-qrcode`),
 * búsqueda primero en Supabase y fallback automático a Open Food Facts Chile.
 */
export function BarcodeModal({ isOpen, onClose, onConfirmExistingFood, onCreateAndLogFood }) {
  // Estados del flujo: 'scanning' | 'loading' | 'existing_food' | 'new_product_form'
  const [step, setStep] = useState('scanning');
  const [manualCode, setManualCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [foundFood, setFoundFood] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  // Estado para cuando el alimento ya existe en Supabase
  const [portionGrams, setPortionGrams] = useState('100');
  const [mealBlock, setMealBlock] = useState('General');

  // Estado para formulario de confirmación/creación (Open Food Facts o manual)
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    codigo_barras: '',
    kcal_100g: '0',
    proteina_100g: '0',
    carbos_100g: '0',
    grasas_100g: '0',
    porcion_habitual_g: '100',
    gramos_consumir_hoy: '100',
    es_favorito: true
  });

  useEffect(() => {
    if (isOpen) {
      setStep('scanning');
      setManualCode('');
      setStatusMessage('');
      setFoundFood(null);
      setPhotoError('');
    }
  }, [isOpen]);

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    setStep('loading');
    setStatusMessage('Analizando código de barras en la foto...');

    try {
      const tempDivId = 'nutritrend-file-qr-temp';
      let tempEl = document.getElementById(tempDivId);
      if (!tempEl) {
        tempEl = document.createElement('div');
        tempEl.id = tempDivId;
        tempEl.style.display = 'none';
        document.body.appendChild(tempEl);
      }
      const fileScanner = new Html5Qrcode(tempDivId);
      const decodedText = await fileScanner.scanFile(file, false);
      await fileScanner.clear();

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      await handleBarcodeLookup(decodedText);
    } catch {
      setStep('scanning');
      setPhotoError(
        'No se detectó nítidamente el código en la foto. Acerca más la cámara al código de barras o escríbelo abajo.'
      );
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleBarcodeLookup = useCallback(async (rawCode) => {
    const code = String(rawCode || '').trim();
    if (!code) return;

    setStep('loading');
    setStatusMessage(`Buscando código ${code} en tu catálogo...`);

    try {
      // 1. Buscar primero en la tabla `alimentos` de Supabase (RF-04 Paso 1)
      const existing = await nutritionService.getFoodByBarcode(code);

      if (existing) {
        setFoundFood(existing);
        setPortionGrams(String(existing.porcion_habitual_g || 100));
        setStep('existing_food');
        return;
      }

      // 2. Si no existe en Supabase, consultar Open Food Facts Chile (RF-04 Paso 2)
      setStatusMessage('Consultando Open Food Facts Chile...');
      const { found, foodData } = await openFoodFactsApi.fetchProduct(code);

      setFormData({
        nombre: foodData.nombre || '',
        marca: foodData.marca || '',
        codigo_barras: code,
        kcal_100g: String(foodData.kcal_100g ?? 0),
        proteina_100g: String(foodData.proteina_100g ?? 0),
        carbos_100g: String(foodData.carbos_100g ?? 0),
        grasas_100g: String(foodData.grasas_100g ?? 0),
        porcion_habitual_g: String(foodData.porcion_habitual_g || 100),
        gramos_consumir_hoy: String(foodData.porcion_habitual_g || 100),
        es_favorito: true,
        offFound: found
      });
      setStep('new_product_form');
    } catch (err) {
      console.warn('Error resolviendo código de barras:', err);
      setFormData({
        nombre: '',
        marca: '',
        codigo_barras: code,
        kcal_100g: '0',
        proteina_100g: '0',
        carbos_100g: '0',
        grasas_100g: '0',
        porcion_habitual_g: '100',
        gramos_consumir_hoy: '100',
        es_favorito: true,
        offFound: false
      });
      setStep('new_product_form');
    }
  }, []);

  const { isInitializing, cameraError } = useBarcodeScanner({
    elementId: 'nutritrend-barcode-reader',
    isOpen: isOpen && step === 'scanning',
    onDetected: handleBarcodeLookup
  });

  const handleConfirmExisting = async (e) => {
    e.preventDefault();
    if (!foundFood) return;
    const g = Math.max(1, Number(portionGrams) || 100);
    await onConfirmExistingFood(foundFood, g, mealBlock);
    onClose();
  };

  const handleSaveNewProduct = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    const foodPayload = {
      nombre: formData.nombre.trim(),
      marca: formData.marca.trim(),
      codigo_barras: formData.codigo_barras.trim(),
      kcal_100g: Math.max(0, Number(formData.kcal_100g) || 0),
      proteina_100g: Math.max(0, Number(formData.proteina_100g) || 0),
      carbos_100g: Math.max(0, Number(formData.carbos_100g) || 0),
      grasas_100g: Math.max(0, Number(formData.grasas_100g) || 0),
      porcion_habitual_g: Math.max(1, Number(formData.porcion_habitual_g) || 100),
      unidad_nombre: 'g',
      es_favorito: Boolean(formData.es_favorito)
    };

    const gramosHoy = Math.max(1, Number(formData.gramos_consumir_hoy) || foodPayload.porcion_habitual_g);
    await onCreateAndLogFood(foodPayload, gramosHoy, mealBlock);
    onClose();
  };

  const previewPortion = foundFood
    ? calculatePortionMacros(foundFood, Number(portionGrams) || 0)
    : null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'scanning'
          ? 'Escanear Código de Barras'
          : step === 'existing_food'
          ? 'Producto en tu Catálogo'
          : 'Confirmar Producto Escaneado'
      }
      subtitle={
        step === 'scanning'
          ? 'Apunta al código EAN-13 o EAN-8 del envase'
          : step === 'new_product_form'
          ? `Código EAN: ${formData.codigo_barras}`
          : foundFood?.marca
      }
    >
      {/* PASO 1: VISOR DE CÁMARA + INPUT MANUAL DE RESPALDO */}
      {step === 'scanning' && (
        <div className="space-y-4">
          <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 min-h-[220px] flex items-center justify-center">
            <div id="nutritrend-barcode-reader" className="w-full" />
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 gap-2">
                <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                <span className="text-xs">Iniciando cámara trasera...</span>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {photoError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{photoError}</span>
            </div>
          )}

          {/* Captura nativa por foto de cámara (Funciona en cualquier celular incluso sin HTTPS) */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[48px] rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Camera className="w-4 h-4 text-sky-400" />
              Tomar Foto al Código con Cámara Nativa
            </button>
          </div>

          {/* Ingreso manual de código EAN */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBarcodeLookup(manualCode);
            }}
            className="space-y-2"
          >
            <label className="block text-xs font-semibold text-slate-400">
              ¿Cámara sin luz o código dañado? Ingresa el EAN manualmente:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="Ej: 7802900000123"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="min-h-[48px] px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 active:scale-95 transition"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASO 2: CARGANDO DESDE SUPABASE / OPEN FOOD FACTS */}
      {step === 'loading' && (
        <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-200">{statusMessage}</p>
        </div>
      )}

      {/* PASO 3A: EL PRODUCTO YA EXISTE EN SUPABASE -> REGISTRAR GRAMOS DIRECTO */}
      {step === 'existing_food' && foundFood && (
        <form onSubmit={handleConfirmExisting} className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
            <div className="text-sm font-bold text-slate-100">{foundFood.nombre}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {foundFood.marca || 'Catálogo propio'} · Por 100g: {foundFood.kcal_100g} kcal
            </div>
            {previewPortion && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold">{previewPortion.kcal} kcal</span>
                <span className="text-slate-300 tabular-nums">
                  P: {previewPortion.proteina_g}g · C: {previewPortion.carbos_g}g · G: {previewPortion.grasas_g}g
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Cantidad a consumir hoy (gramos / ml)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              autoFocus
              required
              value={portionGrams}
              onChange={(e) => setPortionGrams(e.target.value)}
              className="w-full min-h-[52px] bg-slate-950 border border-emerald-500/60 rounded-2xl px-4 text-xl font-extrabold text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Bloque de comida
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {MEAL_BLOCKS.map((block) => (
                <button
                  key={block}
                  type="button"
                  onClick={() => setMealBlock(block)}
                  className={`min-h-[42px] px-2 rounded-xl text-xs font-semibold border transition ${
                    mealBlock === block
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
            Registrar en Hoy ({portionGrams || 0}g)
          </button>
        </form>
      )}

      {/* PASO 3B: PRODUCTO NUEVO (OPEN FOOD FACTS O MANUAL) -> GUARDAR EN CATÁLOGO Y REGISTRAR */}
      {step === 'new_product_form' && (
        <form onSubmit={handleSaveNewProduct} className="space-y-3.5">
          <div
            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
              formData.offFound
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <ScanLine className="w-4 h-4 shrink-0" />
            <span>
              {formData.offFound
                ? 'Datos recuperados de Open Food Facts Chile. Confirma para guardar.'
                : 'No encontrado en Open Food Facts. Completa los datos del envase (por 100g).'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Yogurt Protein Soprole"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Marca
              </label>
              <input
                type="text"
                placeholder="Ej: Soprole"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Kcal por 100g *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={formData.kcal_100g}
                onChange={(e) => setFormData({ ...formData, kcal_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm font-bold text-slate-100 tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-sky-400 mb-1">
                Proteína / 100g
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={formData.proteina_100g}
                onChange={(e) => setFormData({ ...formData, proteina_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm font-bold text-slate-100 tabular-nums focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                Carbos / 100g
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={formData.carbos_100g}
                onChange={(e) => setFormData({ ...formData, carbos_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm font-bold text-slate-100 tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                Grasas / 100g
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={formData.grasas_100g}
                onChange={(e) => setFormData({ ...formData, grasas_100g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm font-bold text-slate-100 tabular-nums focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Porción habitual (g)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={formData.porcion_habitual_g}
                onChange={(e) => setFormData({ ...formData, porcion_habitual_g: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-sm font-bold text-slate-100 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Comer ahora (g)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={formData.gramos_consumir_hoy}
                onChange={(e) => setFormData({ ...formData, gramos_consumir_hoy: e.target.value })}
                className="w-full min-h-[48px] bg-slate-950 border border-emerald-500/60 rounded-xl px-3.5 text-sm font-extrabold text-emerald-300 tabular-nums"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[52px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Check className="w-5 h-5 stroke-[2.5px]" />
            Guardar Alimento y Registrar Hoy
          </button>
        </form>
      )}
    </BottomSheet>
  );
}

