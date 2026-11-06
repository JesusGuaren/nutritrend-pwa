import { supabase, isSupabaseConfigured } from '../config/supabaseClient';

const STORAGE_KEYS = {
  METAS: 'nutritrend_metas_v1',
  ALIMENTOS: 'nutritrend_alimentos_v1',
  REGISTROS: 'nutritrend_registros_v1',
  COMBOS: 'nutritrend_combos_v1',
  WEEKLY_CYCLE: 'nutritrend_weekly_cycle_v1'
};

const SEED_METAS = [
  { id: 'meta-deficit', nombre_perfil: 'Déficit', kcal_objetivo: 2050, proteina_g: 165, carbos_g: 200, grasas_g: 65, activo: true },
  { id: 'meta-mantenimiento', nombre_perfil: 'Mantenimiento', kcal_objetivo: 2450, proteina_g: 160, carbos_g: 290, grasas_g: 72, activo: false },
  { id: 'meta-entreno', nombre_perfil: 'Entreno Pesado', kcal_objetivo: 2600, proteina_g: 165, carbos_g: 330, grasas_g: 70, activo: false }
];

const SEED_ALIMENTOS = [
  { id: 'food-pollo', nombre: 'Pechuga de Pollo (Cruda)', marca: 'Genérico', codigo_barras: '780000000001', kcal_100g: 110, proteina_100g: 23.0, carbos_100g: 0.0, grasas_100g: 1.2, porcion_habitual_g: 200, unidad_nombre: 'g', es_favorito: true },
  { id: 'food-huevo', nombre: 'Huevo Entero Grande', marca: 'Genérico', codigo_barras: '780000000002', kcal_100g: 143, proteina_100g: 12.6, carbos_100g: 0.7, grasas_100g: 9.5, porcion_habitual_g: 60, unidad_nombre: 'unidad (60g)', es_favorito: true },
  { id: 'food-arroz', nombre: 'Arroz Blanco (Cocido)', marca: 'Genérico', codigo_barras: '780000000003', kcal_100g: 130, proteina_100g: 2.7, carbos_100g: 28.2, grasas_100g: 0.3, porcion_habitual_g: 150, unidad_nombre: 'g', es_favorito: true },
  { id: 'food-avena', nombre: 'Avena Tradicional', marca: 'Quaker', codigo_barras: '780000000004', kcal_100g: 367, proteina_100g: 13.3, carbos_100g: 60.0, grasas_100g: 8.3, porcion_habitual_g: 60, unidad_nombre: 'g', es_favorito: true },
  { id: 'food-whey', nombre: 'Whey Protein Isolate/Concentrate', marca: 'Suplemento', codigo_barras: '780000000005', kcal_100g: 390, proteina_100g: 78.0, carbos_100g: 6.5, grasas_100g: 5.0, porcion_habitual_g: 32, unidad_nombre: 'scoop (32g)', es_favorito: true },
  { id: 'food-marraqueta', nombre: 'Pan Marraqueta', marca: 'Panadería', codigo_barras: '780000000006', kcal_100g: 267, proteina_100g: 8.9, carbos_100g: 55.2, grasas_100g: 1.0, porcion_habitual_g: 100, unidad_nombre: 'unidad (100g)', es_favorito: true },
  { id: 'food-palta', nombre: 'Palta Hass', marca: 'Genérico', codigo_barras: '780000000007', kcal_100g: 160, proteina_100g: 2.0, carbos_100g: 8.5, grasas_100g: 14.7, porcion_habitual_g: 60, unidad_nombre: 'porción (60g)', es_favorito: true },
  { id: 'food-leche', nombre: 'Leche Descremada', marca: 'Colun / Soprole', codigo_barras: '780000000008', kcal_100g: 33, proteina_100g: 3.3, carbos_100g: 4.8, grasas_100g: 0.1, porcion_habitual_g: 250, unidad_nombre: 'ml', es_favorito: true }
];

const SEED_COMBOS = [
  {
    id: 'combo-desayuno',
    nombre: 'Batido Proteico & Avena',
    combo_items: [
      { id: 'ci-1', combo_id: 'combo-desayuno', alimento_id: 'food-avena', gramos: 60 },
      { id: 'ci-2', combo_id: 'combo-desayuno', alimento_id: 'food-whey', gramos: 32 },
      { id: 'ci-3', combo_id: 'combo-desayuno', alimento_id: 'food-leche', gramos: 250 }
    ]
  },
  {
    id: 'combo-almuerzo',
    nombre: 'Pollo con Arroz Clásico',
    combo_items: [
      { id: 'ci-4', combo_id: 'combo-almuerzo', alimento_id: 'food-pollo', gramos: 200 },
      { id: 'ci-5', combo_id: 'combo-almuerzo', alimento_id: 'food-arroz', gramos: 150 }
    ]
  }
];

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Error guardando en localStorage:', err);
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

export const nutritionService = {
  /**
   * Lectura síncrona instantánea (0ms) desde caché local para Cold Start
   */
  getCachedSnapshot(fecha) {
    const metas = readLocal(STORAGE_KEYS.METAS, SEED_METAS);
    const alimentos = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const allRegistros = readLocal(STORAGE_KEYS.REGISTROS, []);
    const combosRaw = readLocal(STORAGE_KEYS.COMBOS, SEED_COMBOS);

    const foodMap = new Map(alimentos.map((f) => [f.id, f]));

    const registrosFecha = allRegistros
      .filter((r) => r.fecha === fecha)
      .map((r) => ({
        ...r,
        alimentos: r.alimentos || foodMap.get(r.alimento_id) || null
      }))
      .filter((r) => r.alimentos !== null);

    const combos = combosRaw.map((c) => ({
      ...c,
      combo_items: (c.combo_items || []).map((item) => ({
        ...item,
        alimentos: item.alimentos || foodMap.get(item.alimento_id) || null
      }))
    }));

    return {
      metas,
      metaActiva: metas.find((m) => m.activo) || metas[0] || SEED_METAS[0],
      alimentos,
      favoritos: alimentos.filter((a) => a.es_favorito),
      registrosHoy: registrosFecha,
      combos
    };
  },

  /**
   * Obtiene todos los perfiles de metas nutricionales
   */
  async getMetas() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('metas_nutricionales')
        .select('*')
        .order('kcal_objetivo', { ascending: true });

      if (!error && data && data.length > 0) {
        writeLocal(STORAGE_KEYS.METAS, data);
        return data;
      }
    }
    return readLocal(STORAGE_KEYS.METAS, SEED_METAS);
  },

  /**
   * Patrón Strategy: Cambia la fase calórica activa (Déficit, Mantenimiento, Entreno Pesado)
   */
  async setActiveMeta(metaId) {
    const currentMetas = readLocal(STORAGE_KEYS.METAS, SEED_METAS);
    const updatedMetas = currentMetas.map((m) => ({
      ...m,
      activo: m.id === metaId
    }));
    writeLocal(STORAGE_KEYS.METAS, updatedMetas);

    if (isSupabaseConfigured) {
      await supabase
        .from('metas_nutricionales')
        .update({ activo: false })
        .neq('id', metaId);

      await supabase
        .from('metas_nutricionales')
        .update({ activo: true })
        .eq('id', metaId);
    }

    return updatedMetas;
  },

  /**
   * Actualiza los valores de un perfil de meta nutricional
   */
  async updateMetaProfile(metaId, payload) {
    const cleanPayload = {
      kcal_objetivo: Math.round(Number(payload.kcal_objetivo) || 2000),
      proteina_g: Math.round(Number(payload.proteina_g) || 150),
      carbos_g: Math.round(Number(payload.carbos_g) || 200),
      grasas_g: Math.round(Number(payload.grasas_g) || 65)
    };

    const currentMetas = readLocal(STORAGE_KEYS.METAS, SEED_METAS);
    const updatedMetas = currentMetas.map((m) =>
      m.id === metaId ? { ...m, ...cleanPayload } : m
    );
    writeLocal(STORAGE_KEYS.METAS, updatedMetas);

    if (isSupabaseConfigured) {
      await supabase
        .from('metas_nutricionales')
        .update(cleanPayload)
        .eq('id', metaId);
    }

    return updatedMetas;
  },

  /**
   * Obtiene catálogo completo de alimentos
   */
  async getAlimentos() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('alimentos')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && data && data.length > 0) {
        writeLocal(STORAGE_KEYS.ALIMENTOS, data);
        return data;
      }
    }
    return readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
  },

  /**
   * Busca un alimento por código de barras EAN-13/EAN-8 en Supabase o caché local
   */
  async getFoodByBarcode(barcode) {
    const cleanCode = String(barcode || '').trim();
    if (!cleanCode) return null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('alimentos')
        .select('*')
        .eq('codigo_barras', cleanCode)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }

    const localFoods = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    return localFoods.find((f) => String(f.codigo_barras || '') === cleanCode) || null;
  },

  /**
   * Crea o actualiza un alimento en el catálogo
   */
  async createFood(foodData) {
    const newFood = {
      nombre: String(foodData.nombre || '').trim(),
      marca: String(foodData.marca || '').trim(),
      codigo_barras: foodData.codigo_barras ? String(foodData.codigo_barras).trim() : null,
      kcal_100g: Math.max(0, Number(foodData.kcal_100g) || 0),
      proteina_100g: Math.max(0, Number(foodData.proteina_100g) || 0),
      carbos_100g: Math.max(0, Number(foodData.carbos_100g) || 0),
      grasas_100g: Math.max(0, Number(foodData.grasas_100g) || 0),
      porcion_habitual_g: Math.max(1, Number(foodData.porcion_habitual_g) || 100),
      unidad_nombre: String(foodData.unidad_nombre || 'g').trim() || 'g',
      es_favorito: Boolean(foodData.es_favorito)
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('alimentos')
        .insert([newFood])
        .select()
        .single();

      if (!error && data) {
        const current = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
        writeLocal(STORAGE_KEYS.ALIMENTOS, [...current, data]);
        return data;
      }
    }

    const localEntry = {
      id: generateId(),
      ...newFood,
      created_at: new Date().toISOString()
    };
    const current = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    writeLocal(STORAGE_KEYS.ALIMENTOS, [...current, localEntry]);
    return localEntry;
  },

  /**
   * Alterna estado `es_favorito` de un alimento
   */
  async toggleFavoriteFood(foodId, esFavorito) {
    const current = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const updated = current.map((f) =>
      f.id === foodId ? { ...f, es_favorito: Boolean(esFavorito) } : f
    );
    writeLocal(STORAGE_KEYS.ALIMENTOS, updated);

    if (isSupabaseConfigured) {
      await supabase
        .from('alimentos')
        .update({ es_favorito: Boolean(esFavorito) })
        .eq('id', foodId);
    }

    return updated;
  },

  /**
   * Obtiene registros diarios para una fecha dada (YYYY-MM-DD) haciendo JOIN con alimentos
   */
  async getDailyLogs(fecha) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('registros_diarios')
        .select('*, alimentos(*)')
        .eq('fecha', fecha)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []).filter((r) => r.fecha !== fecha);
        writeLocal(STORAGE_KEYS.REGISTROS, [...data, ...allLocal]);
        return data;
      }
    }

    const alimentos = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const foodMap = new Map(alimentos.map((f) => [f.id, f]));
    const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []);

    return allLocal
      .filter((r) => r.fecha === fecha)
      .map((r) => ({
        ...r,
        alimentos: r.alimentos || foodMap.get(r.alimento_id) || null
      }))
      .filter((r) => r.alimentos !== null);
  },

  /**
   * Registra un alimento en `registros_diarios`
   */
  async addDailyLog({ fecha, alimento, gramos, bloque_comida = 'General' }) {
    const cleanGramos = Math.max(1, Number(gramos) || Number(alimento.porcion_habitual_g) || 100);
    const validBlocks = ['Desayuno', 'Almuerzo', 'Once/Cena', 'Snacks/Post-Entreno', 'General'];
    const cleanBloque = validBlocks.includes(bloque_comida) ? bloque_comida : 'General';

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('registros_diarios')
        .insert([
          {
            fecha,
            alimento_id: alimento.id,
            gramos: cleanGramos,
            bloque_comida: cleanBloque
          }
        ])
        .select('*, alimentos(*)')
        .single();

      if (!error && data) {
        const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []);
        writeLocal(STORAGE_KEYS.REGISTROS, [data, ...allLocal]);
        return data;
      }
    }

    const localLog = {
      id: generateId(),
      fecha,
      alimento_id: alimento.id,
      gramos: cleanGramos,
      bloque_comida: cleanBloque,
      created_at: new Date().toISOString(),
      alimentos: alimento
    };
    const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []);
    writeLocal(STORAGE_KEYS.REGISTROS, [localLog, ...allLocal]);
    return localLog;
  },

  /**
   * RF-05: Carga de Combos en 1 Toque (Insert masivo en registros_diarios)
   */
  async addComboToDailyLog({ fecha, combo, bloque_comida = 'General' }) {
    const items = combo?.combo_items || [];
    if (items.length === 0) return [];

    const validBlocks = ['Desayuno', 'Almuerzo', 'Once/Cena', 'Snacks/Post-Entreno', 'General'];
    const cleanBloque = validBlocks.includes(bloque_comida) ? bloque_comida : 'General';

    const rowsToInsert = items.map((item) => ({
      fecha,
      alimento_id: item.alimento_id,
      gramos: Math.max(1, Number(item.gramos) || 100),
      bloque_comida: cleanBloque
    }));

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('registros_diarios')
        .insert(rowsToInsert)
        .select('*, alimentos(*)');

      if (!error && data) {
        const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []);
        writeLocal(STORAGE_KEYS.REGISTROS, [...data, ...allLocal]);
        return data;
      }
    }

    const alimentos = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const foodMap = new Map(alimentos.map((f) => [f.id, f]));
    const nowIso = new Date().toISOString();

    const createdLogs = items.map((item) => ({
      id: generateId(),
      fecha,
      alimento_id: item.alimento_id,
      gramos: Math.max(1, Number(item.gramos) || 100),
      bloque_comida: cleanBloque,
      created_at: nowIso,
      alimentos: item.alimentos || foodMap.get(item.alimento_id)
    }));

    const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []);
    writeLocal(STORAGE_KEYS.REGISTROS, [...createdLogs, ...allLocal]);
    return createdLogs;
  },

  /**
   * Elimina un registro diario por ID
   */
  async deleteDailyLog(logId) {
    const allLocal = readLocal(STORAGE_KEYS.REGISTROS, []);
    const filtered = allLocal.filter((r) => r.id !== logId);
    writeLocal(STORAGE_KEYS.REGISTROS, filtered);

    if (isSupabaseConfigured) {
      await supabase.from('registros_diarios').delete().eq('id', logId);
    }

    return true;
  },

  /**
   * Obtiene todos los combos con sus items y alimentos anidados
   */
  async getCombos() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('combos')
        .select('*, combo_items(*, alimentos(*))');

      if (!error && data) {
        writeLocal(STORAGE_KEYS.COMBOS, data);
        return data;
      }
    }

    const alimentos = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const foodMap = new Map(alimentos.map((f) => [f.id, f]));
    const combosRaw = readLocal(STORAGE_KEYS.COMBOS, SEED_COMBOS);

    return combosRaw.map((c) => ({
      ...c,
      combo_items: (c.combo_items || []).map((item) => ({
        ...item,
        alimentos: item.alimentos || foodMap.get(item.alimento_id) || null
      }))
    }));
  },

  /**
   * Crea un nuevo combo con sus respectivos combo_items
   */
  async createCombo(nombre, items = []) {
    const cleanName = String(nombre || '').trim();
    if (!cleanName || items.length === 0) {
      throw new Error('El combo requiere un nombre y al menos un alimento.');
    }

    if (isSupabaseConfigured) {
      const { data: comboRow, error: comboErr } = await supabase
        .from('combos')
        .insert([{ nombre: cleanName }])
        .select()
        .single();

      if (!comboErr && comboRow) {
        const itemsPayload = items.map((it) => ({
          combo_id: comboRow.id,
          alimento_id: it.alimento_id,
          gramos: Math.max(1, Number(it.gramos) || 100)
        }));

        const { data: insertedItems } = await supabase
          .from('combo_items')
          .insert(itemsPayload)
          .select('*, alimentos(*)');

        const fullCombo = {
          ...comboRow,
          combo_items: insertedItems || []
        };

        const currentCombos = readLocal(STORAGE_KEYS.COMBOS, SEED_COMBOS);
        writeLocal(STORAGE_KEYS.COMBOS, [...currentCombos, fullCombo]);
        return fullCombo;
      }
    }

    const alimentos = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const foodMap = new Map(alimentos.map((f) => [f.id, f]));
    const comboId = generateId();

    const localCombo = {
      id: comboId,
      nombre: cleanName,
      combo_items: items.map((it) => ({
        id: generateId(),
        combo_id: comboId,
        alimento_id: it.alimento_id,
        gramos: Math.max(1, Number(it.gramos) || 100),
        alimentos: foodMap.get(it.alimento_id) || null
      }))
    };

    const currentCombos = readLocal(STORAGE_KEYS.COMBOS, SEED_COMBOS);
    writeLocal(STORAGE_KEYS.COMBOS, [...currentCombos, localCombo]);
    return localCombo;
  },

  /**
   * Elimina un combo por ID
   */
  async deleteCombo(comboId) {
    const currentCombos = readLocal(STORAGE_KEYS.COMBOS, SEED_COMBOS);
    const updated = currentCombos.filter((c) => c.id !== comboId);
    writeLocal(STORAGE_KEYS.COMBOS, updated);

    if (isSupabaseConfigured) {
      await supabase.from('combos').delete().eq('id', comboId);
    }

    return updated;
  },

  /**
   * Fase 2 (Sección 7.1): Obtiene la ingesta calórica media de los últimos 14 días
   * registrados para cruzarla con el Delta EMA y calcular el TDEE Real.
   */
  getAverageCaloriesLast14Days() {
    const alimentos = readLocal(STORAGE_KEYS.ALIMENTOS, SEED_ALIMENTOS);
    const foodMap = new Map(alimentos.map((f) => [f.id, f]));
    const allLogs = readLocal(STORAGE_KEYS.REGISTROS, []);

    const byDate = new Map();
    for (const log of allLogs) {
      const food = log.alimentos || foodMap.get(log.alimento_id);
      if (!food) continue;
      const kcal = Math.round(((Number(food.kcal_100g) || 0) * (Number(log.gramos) || 0)) / 100);
      byDate.set(log.fecha, (byDate.get(log.fecha) || 0) + kcal);
    }

    const dates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a)).slice(0, 14);
    if (dates.length === 0) {
      const metas = readLocal(STORAGE_KEYS.METAS, SEED_METAS);
      const active = metas.find((m) => m.activo) || metas[0];
      return {
        avgKcal: Number(active?.kcal_objetivo) || 2150,
        loggedDaysCount: 0
      };
    }

    const totalKcal = dates.reduce((sum, d) => sum + (byDate.get(d) || 0), 0);
    return {
      avgKcal: Math.round(totalKcal / dates.length),
      loggedDaysCount: dates.length
    };
  },

  /**
   * Fase 2 (Sección 7.4): Ciclado Automático de Macros por Calendario (Lunes=1 ... Domingo=0)
   */
  getWeeklyCycleConfig() {
    return readLocal(STORAGE_KEYS.WEEKLY_CYCLE, {
      enabled: false,
      days: {
        1: 'Entreno Pesado',
        2: 'Déficit',
        3: 'Entreno Pesado',
        4: 'Déficit',
        5: 'Entreno Pesado',
        6: 'Mantenimiento',
        0: 'Déficit'
      }
    });
  },

  saveWeeklyCycleConfig(config) {
    writeLocal(STORAGE_KEYS.WEEKLY_CYCLE, config);
    return config;
  }
};

