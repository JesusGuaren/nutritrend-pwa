/**
 * RF-03: Algoritmo de Peso Tendencial EMA de 7 Días (Exponential Moving Average)
 * Dada una lista de registros de peso ordenada por fecha ascendente P = [p_0, p_1, ..., p_n]:
 * - Constante de suavizado (N = 7): k = 2 / (7 + 1) = 0.25
 * - Para i = 0: EMA_0 = p_0.peso_kg
 * - Para i > 0: EMA_i = Number(((p_i.peso_kg * 0.25) + (EMA_{i-1} * 0.75)).toFixed(2))
 */

export function calculateWeightTrendEMA(registros = []) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return {
      series: [],
      stats: {
        pesoHoy: null,
        emaActual: null,
        cambio7d: 0,
        tendenciaEstado: 'Sin datos',
        kcalEquivalenteSemanal: 0
      }
    };
  }

  // Asegurar orden cronológico ascendente por fecha
  const sorted = [...registros].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const k = 2 / (7 + 1); // 0.25
  const oneMinusK = 1 - k; // 0.75

  const series = [];
  let prevEma = 0;

  for (let i = 0; i < sorted.length; i++) {
    const pesoKg = Number(Number(sorted[i].peso_kg).toFixed(2));
    let currentEma;

    if (i === 0) {
      currentEma = pesoKg;
    } else {
      currentEma = Number(((pesoKg * k) + (prevEma * oneMinusK)).toFixed(2));
    }

    prevEma = currentEma;

    series.push({
      ...sorted[i],
      peso_kg: pesoKg,
      ema_kg: currentEma
    });
  }

  const ultimo = series[series.length - 1];
  // Índice de hace 7 registros o el primero disponible si hay menos de 7
  const refIndex = Math.max(0, series.length - 1 - 7);
  const referencia7d = series[refIndex];

  const cambio7d = Number((ultimo.ema_kg - referencia7d.ema_kg).toFixed(2));

  let tendenciaEstado = 'Manteniendo';
  if (cambio7d < -0.05) {
    tendenciaEstado = 'Bajando';
  } else if (cambio7d > 0.05) {
    tendenciaEstado = 'Subiendo';
  }

  // Preparación Fase 2 (Sección 7.1): Delta EMA * 7700 kcal
  const kcalEquivalenteSemanal = Math.round(cambio7d * 7700);

  return {
    series,
    stats: {
      pesoHoy: ultimo.peso_kg,
      fechaUltimo: ultimo.fecha,
      emaActual: ultimo.ema_kg,
      emaReferencia7d: referencia7d.ema_kg,
      cambio7d,
      tendenciaEstado,
      kcalEquivalenteSemanal
    }
  };
}

/**
 * Preparación Arquitectónica Fase 2 (Sección 7.1):
 * Motor de Gasto Calórico Dinámico (TDEE Real) cruzando ingesta media de 14 días con Delta EMA.
 */
export function estimateDynamicTDEE(ingestaMediaDiariaKcal, deltaEma14DiasKg) {
  if (!ingestaMediaDiariaKcal || typeof deltaEma14DiasKg !== 'number') return null;
  const balanceEnergeticoDiario = (deltaEma14DiasKg * 7700) / 14;
  return Math.round(ingestaMediaDiariaKcal - balanceEnergeticoDiario);
}

