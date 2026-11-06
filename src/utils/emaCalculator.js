/**
 * RF-03 & Fase 2 (Sección 7.1):
 * Algoritmo de Peso Tendencial EMA de 7 Días (Exponential Moving Average)
 * y Motor de Gasto Calórico Dinámico (TDEE Real de 14 días).
 */

export function calculateWeightTrendEMA(registros = []) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return {
      series: [],
      stats: {
        pesoHoy: null,
        emaActual: null,
        cambio7d: 0,
        cambio14d: 0,
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
  const refIndex7d = Math.max(0, series.length - 1 - 7);
  const refIndex14d = Math.max(0, series.length - 1 - 14);
  const referencia7d = series[refIndex7d];
  const referencia14d = series[refIndex14d];

  const cambio7d = Number((ultimo.ema_kg - referencia7d.ema_kg).toFixed(2));
  const cambio14d = Number((ultimo.ema_kg - referencia14d.ema_kg).toFixed(2));
  const diasTramo14 = Math.max(1, series.length - 1 - refIndex14d);

  let tendenciaEstado = 'Manteniendo';
  if (cambio7d < -0.05) {
    tendenciaEstado = 'Bajando';
  } else if (cambio7d > 0.05) {
    tendenciaEstado = 'Subiendo';
  }

  const kcalEquivalenteSemanal = Math.round(cambio7d * 7700);

  return {
    series,
    stats: {
      pesoHoy: ultimo.peso_kg,
      fechaUltimo: ultimo.fecha,
      emaActual: ultimo.ema_kg,
      emaReferencia7d: referencia7d.ema_kg,
      emaReferencia14d: referencia14d.ema_kg,
      cambio7d,
      cambio14d,
      diasTramo14,
      tendenciaEstado,
      kcalEquivalenteSemanal
    }
  };
}

/**
 * Fase 2 (Sección 7.1): Motor de Gasto Calórico Dinámico (TDEE Real)
 * Cruza la ingesta calórica media de los últimos 14 días con el delta del Peso Tendencial EMA
 * (Delta EMA * 7700 kcal) para calcular el mantenimiento metabólico real del usuario
 * y sugerir ajustes de calorías automáticos.
 */
export function calculateDynamicTDEE({
  avgIntakeKcal14d,
  deltaEmaKg,
  daysCount = 14
}) {
  const safeDays = Math.max(1, Number(daysCount) || 14);
  const intake = Number(avgIntakeKcal14d) || 0;
  const deltaKg = Number(deltaEmaKg) || 0;

  if (intake <= 0) {
    return null;
  }

  // Delta energético diario = (Delta_EMA_kg * 7700 kcal) / días
  const dailyEnergyDelta = Math.round((deltaKg * 7700) / safeDays);
  const tdeeReal = Math.round(intake - dailyEnergyDelta);

  return {
    avgIntakeKcal: Math.round(intake),
    deltaEmaKg: Number(deltaKg.toFixed(2)),
    dailyEnergyDelta,
    tdeeReal,
    sugerencias: {
      deficitModerado: Math.max(1200, Math.round(tdeeReal - 450)),
      mantenimiento: Math.round(tdeeReal),
      superavitLimpio: Math.round(tdeeReal + 250)
    }
  };
}
