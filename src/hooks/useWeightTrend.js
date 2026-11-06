import { useState, useEffect, useMemo, useCallback } from 'react';
import { weightService } from '../services/weightService';
import { calculateWeightTrendEMA } from '../utils/emaCalculator';
import { getLocalDateString } from '../utils/dateUtils';

/**
 * Hook para gestión de historial de peso corporal y cálculo en tiempo real
 * de la Media Móvil Exponencial de 7 días (EMA 7d).
 */
export function useWeightTrend() {
  const [weights, setWeights] = useState(() => weightService.getCachedWeights());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRemoteWeights() {
      setIsLoading(true);
      try {
        const data = await weightService.getWeightHistory();
        if (isMounted) {
          setWeights(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al cargar historial de peso');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadRemoteWeights();
    return () => {
      isMounted = false;
    };
  }, []);

  // Serie enriquecida [{ fecha, peso_kg, ema_kg, notas }] y métricas semanales
  const { series, stats } = useMemo(
    () => calculateWeightTrendEMA(weights),
    [weights]
  );

  /**
   * Registra o sobrescribe (UPSERT) el peso de una fecha con Optimistic UI
   */
  const recordWeight = useCallback(async ({ fecha, peso_kg, notas = '' }) => {
    setError(null);
    const targetDate = fecha || getLocalDateString();
    const numericWeight = Number(Number(peso_kg).toFixed(2));

    if (Number.isNaN(numericWeight) || numericWeight <= 20 || numericWeight >= 300) {
      const msg = 'Ingresa un peso válido entre 20.1 kg y 299.9 kg.';
      setError(msg);
      throw new Error(msg);
    }

    // Actualización optimista inmediata
    setWeights((prev) => {
      const exists = prev.some((w) => w.fecha === targetDate);
      const updated = exists
        ? prev.map((w) =>
            w.fecha === targetDate
              ? { ...w, peso_kg: numericWeight, notas: String(notas || '').trim() }
              : w
          )
        : [
            ...prev,
            {
              id: `temp-w-${Date.now()}`,
              fecha: targetDate,
              peso_kg: numericWeight,
              notas: String(notas || '').trim()
            }
          ];
      return updated.sort((a, b) => a.fecha.localeCompare(b.fecha));
    });

    const saved = await weightService.upsertWeight({
      fecha: targetDate,
      peso_kg: numericWeight,
      notas
    });

    setWeights((prev) =>
      prev
        .map((w) => (w.fecha === targetDate ? saved : w))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
    );

    return saved;
  }, []);

  /**
   * Elimina un registro de peso
   */
  const removeWeight = useCallback(async (idOrFecha) => {
    setWeights((prev) =>
      prev.filter((w) => w.id !== idOrFecha && w.fecha !== idOrFecha)
    );
    await weightService.deleteWeight(idOrFecha);
  }, []);

  return {
    weights,
    series,
    stats,
    isLoading,
    error,
    recordWeight,
    removeWeight
  };
}

