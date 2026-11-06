/**
 * RF-02: Cálculo Nutricional por Porción y Totales Diarios
 * Fórmulas matemáticas estrictas:
 * - Kcal = Math.round((K_100 * W) / 100)
 * - Proteína = Number(((P_100 * W) / 100).toFixed(1))
 * - Carbos = Number(((C_100 * W) / 100).toFixed(1))
 * - Grasas = Number(((G_100 * W) / 100).toFixed(1))
 */

export function calculatePortionMacros(alimento, gramos) {
  const w = Number(gramos) || 0;
  const k100 = Number(alimento?.kcal_100g) || 0;
  const p100 = Number(alimento?.proteina_100g) || 0;
  const c100 = Number(alimento?.carbos_100g) || 0;
  const g100 = Number(alimento?.grasas_100g) || 0;

  return {
    kcal: Math.round((k100 * w) / 100),
    proteina_g: Number(((p100 * w) / 100).toFixed(1)),
    carbos_g: Number(((c100 * w) / 100).toFixed(1)),
    grasas_g: Number(((g100 * w) / 100).toFixed(1))
  };
}

/**
 * Calcula los totales consumidos del día y los restantes frente a la meta activa.
 * @param {Array} registros - Lista de registros_diarios con objeto anidado `alimentos`
 * @param {Object} metaActiva - Perfil activo de metas_nutricionales
 */
export function calculateDailySummary(registros = [], metaActiva = null) {
  const rawTotals = registros.reduce(
    (acc, item) => {
      const food = item.alimentos || item.alimento || {};
      const portion = calculatePortionMacros(food, item.gramos);
      return {
        kcal: acc.kcal + portion.kcal,
        p: acc.p + portion.proteina_g,
        c: acc.c + portion.carbos_g,
        g: acc.g + portion.grasas_g
      };
    },
    { kcal: 0, p: 0, c: 0, g: 0 }
  );

  const consumido = {
    kcal: Math.round(rawTotals.kcal),
    p: Number(rawTotals.p.toFixed(1)),
    c: Number(rawTotals.c.toFixed(1)),
    g: Number(rawTotals.g.toFixed(1))
  };

  const meta = {
    kcal: Number(metaActiva?.kcal_objetivo) || 2050,
    p: Number(metaActiva?.proteina_g) || 165,
    c: Number(metaActiva?.carbos_g) || 200,
    g: Number(metaActiva?.grasas_g) || 65
  };

  const restante = {
    kcal: Math.round(meta.kcal - consumido.kcal),
    p: Number((meta.p - consumido.p).toFixed(1)),
    c: Number((meta.c - consumido.c).toFixed(1)),
    g: Number((meta.g - consumido.g).toFixed(1))
  };

  return {
    consumido,
    meta,
    restante
  };
}

/**
 * Calcula los macronutrientes totales de un Combo completo
 * @param {Array} comboItems - Lista de items con { gramos, alimentos }
 */
export function calculateComboMacros(comboItems = []) {
  const totals = comboItems.reduce(
    (acc, item) => {
      const food = item.alimentos || item.alimento || {};
      const m = calculatePortionMacros(food, item.gramos);
      return {
        kcal: acc.kcal + m.kcal,
        proteina_g: acc.proteina_g + m.proteina_g,
        carbos_g: acc.carbos_g + m.carbos_g,
        grasas_g: acc.grasas_g + m.grasas_g,
        gramos_totales: acc.gramos_totales + (Number(item.gramos) || 0)
      };
    },
    { kcal: 0, proteina_g: 0, carbos_g: 0, grasas_g: 0, gramos_totales: 0 }
  );

  return {
    kcal: Math.round(totals.kcal),
    proteina_g: Number(totals.proteina_g.toFixed(1)),
    carbos_g: Number(totals.carbos_g.toFixed(1)),
    grasas_g: Number(totals.grasas_g.toFixed(1)),
    gramos_totales: Math.round(totals.gramos_totales)
  };
}

