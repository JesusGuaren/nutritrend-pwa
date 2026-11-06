import { useState, useEffect, useMemo, useCallback } from 'react';
import { getLocalDateString } from '../utils/dateUtils';
import { calculateDailySummary } from '../utils/macroCalculator';
import { nutritionService } from '../services/nutritionService';

/**
 * Hook de estado diario de nutrición con Optimistic UI (0ms Cold Start desde localStorage)
 * y sincronización Stale-While-Revalidate en paralelo con Supabase.
 */
export function useDailyNutrition() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  // Hidratación síncrona inicial desde caché local (0ms de espera visual)
  const initialCache = useMemo(
    () => nutritionService.getCachedSnapshot(selectedDate),
    [selectedDate]
  );

  const [metas, setMetas] = useState(initialCache.metas);
  const [alimentos, setAlimentos] = useState(initialCache.alimentos);
  const [registrosHoy, setRegistrosHoy] = useState(initialCache.registrosHoy);
  const [combos, setCombos] = useState(initialCache.combos);
  const [isSyncing, setIsSyncing] = useState(false);

  // Al cambiar de fecha, hidratar inmediatamente desde localStorage y luego revalidar con Supabase
  useEffect(() => {
    const snapshot = nutritionService.getCachedSnapshot(selectedDate);
    setMetas(snapshot.metas);
    setAlimentos(snapshot.alimentos);
    setRegistrosHoy(snapshot.registrosHoy);
    setCombos(snapshot.combos);

    let isMounted = true;
    async function revalidateFromRemote() {
      setIsSyncing(true);
      try {
        const [remoteMetas, remoteAlimentos, remoteLogs, remoteCombos] = await Promise.all([
          nutritionService.getMetas(),
          nutritionService.getAlimentos(),
          nutritionService.getDailyLogs(selectedDate),
          nutritionService.getCombos()
        ]);

        if (!isMounted) return;
        setMetas(remoteMetas);
        setAlimentos(remoteAlimentos);
        setRegistrosHoy(remoteLogs);
        setCombos(remoteCombos);
      } catch (err) {
        console.warn('Error sincronizando en segundo plano:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    revalidateFromRemote();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const metaActiva = useMemo(
    () => metas.find((m) => m.activo) || metas[0] || {
      id: 'default',
      nombre_perfil: 'Déficit',
      kcal_objetivo: 2050,
      proteina_g: 165,
      carbos_g: 200,
      grasas_g: 65,
      activo: true
    },
    [metas]
  );

  const favoritos = useMemo(
    () => alimentos.filter((a) => a.es_favorito),
    [alimentos]
  );

  const summary = useMemo(
    () => calculateDailySummary(registrosHoy, metaActiva),
    [registrosHoy, metaActiva]
  );

  /**
   * Patrón Strategy: Alternador rápido de fase calórica (Déficit / Mantenimiento / Entreno Pesado)
   */
  const switchPhase = useCallback(async (metaId) => {
    // Optimistic UI
    setMetas((prev) =>
      prev.map((m) => ({
        ...m,
        activo: m.id === metaId
      }))
    );

    const updated = await nutritionService.setActiveMeta(metaId);
    setMetas(updated);
  }, []);

  /**
   * Actualiza los objetivos de una fase calórica
   */
  const updatePhaseTargets = useCallback(async (metaId, newTargets) => {
    setMetas((prev) =>
      prev.map((m) => (m.id === metaId ? { ...m, ...newTargets } : m))
    );
    const updated = await nutritionService.updateMetaProfile(metaId, newTargets);
    setMetas(updated);
  }, []);

  /**
   * Registro rápido con Optimistic UI (<16ms de respuesta visual)
   */
  const logFood = useCallback(
    async (alimento, gramos, bloque_comida = 'General') => {
      const cleanGramos = Math.max(1, Number(gramos) || Number(alimento.porcion_habitual_g) || 100);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const optimisticEntry = {
        id: tempId,
        fecha: selectedDate,
        alimento_id: alimento.id,
        gramos: cleanGramos,
        bloque_comida,
        created_at: new Date().toISOString(),
        alimentos: alimento
      };

      // 1. Actualizar estado en memoria inmediatamente
      setRegistrosHoy((prev) => [optimisticEntry, ...prev]);

      // 2. Persistir en servicio / Supabase
      const savedEntry = await nutritionService.addDailyLog({
        fecha: selectedDate,
        alimento,
        gramos: cleanGramos,
        bloque_comida
      });

      // 3. Reemplazar el registro temporal por el definitivo
      setRegistrosHoy((prev) =>
        prev.map((item) => (item.id === tempId ? savedEntry : item))
      );

      return savedEntry;
    },
    [selectedDate]
  );

  /**
   * RF-05: Carga de Combo en 1 Toque con Optimistic UI
   */
  const logCombo = useCallback(
    async (combo, bloque_comida = 'General') => {
      const items = combo?.combo_items || [];
      if (items.length === 0) return [];

      const nowIso = new Date().toISOString();
      const tempEntries = items.map((item, idx) => ({
        id: `temp-combo-${Date.now()}-${idx}`,
        fecha: selectedDate,
        alimento_id: item.alimento_id,
        gramos: Math.max(1, Number(item.gramos) || 100),
        bloque_comida,
        created_at: nowIso,
        alimentos: item.alimentos || alimentos.find((a) => a.id === item.alimento_id)
      }));

      setRegistrosHoy((prev) => [...tempEntries, ...prev]);

      const savedEntries = await nutritionService.addComboToDailyLog({
        fecha: selectedDate,
        combo,
        bloque_comida
      });

      const tempIds = new Set(tempEntries.map((t) => t.id));
      setRegistrosHoy((prev) => [
        ...savedEntries,
        ...prev.filter((item) => !tempIds.has(item.id))
      ]);

      return savedEntries;
    },
    [selectedDate, alimentos]
  );

  /**
   * Elimina un registro del día con Optimistic UI
   */
  const removeDailyLog = useCallback(async (logId) => {
    setRegistrosHoy((prev) => prev.filter((item) => item.id !== logId));
    await nutritionService.deleteDailyLog(logId);
  }, []);

  /**
   * Crea un nuevo alimento en el catálogo y devuelve el registro creado
   */
  const createNewFood = useCallback(async (foodPayload) => {
    const created = await nutritionService.createFood(foodPayload);
    setAlimentos((prev) =>
      [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    return created;
  }, []);

  /**
   * Alterna si un alimento es favorito para el Quick-Add
   */
  const toggleFavorite = useCallback(async (foodId, esFavorito) => {
    setAlimentos((prev) =>
      prev.map((f) => (f.id === foodId ? { ...f, es_favorito: Boolean(esFavorito) } : f))
    );
    const updated = await nutritionService.toggleFavoriteFood(foodId, esFavorito);
    setAlimentos(updated);
  }, []);

  /**
   * Crea un combo compuesto
   */
  const createNewCombo = useCallback(async (nombre, items) => {
    const created = await nutritionService.createCombo(nombre, items);
    setCombos((prev) => [...prev, created]);
    return created;
  }, []);

  /**
   * Elimina un combo
   */
  const removeCombo = useCallback(async (comboId) => {
    setCombos((prev) => prev.filter((c) => c.id !== comboId));
    await nutritionService.deleteCombo(comboId);
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    metas,
    metaActiva,
    alimentos,
    favoritos,
    registrosHoy,
    combos,
    summary,
    isSyncing,
    switchPhase,
    updatePhaseTargets,
    logFood,
    logCombo,
    removeDailyLog,
    createNewFood,
    toggleFavorite,
    createNewCombo,
    removeCombo
  };
}

