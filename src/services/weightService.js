import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getLocalDateString, addDaysToDateString } from '../utils/dateUtils';

const WEIGHT_STORAGE_KEY = 'nutritrend_peso_corporal_v1';

/**
 * Genera una serie inicial realista de 14 días en caso de que el usuario aún no tenga
 * registros en localStorage ni Supabase, permitiendo visualizar el filtro de ruido EMA inmediato.
 */
function buildDefaultWeightSeed() {
  const today = getLocalDateString();
  const sampleWeights = [
    { offset: -13, peso_kg: 76.4, notas: 'Inicio registro' },
    { offset: -12, peso_kg: 76.1, notas: '' },
    { offset: -11, peso_kg: 76.5, notas: 'Cena alta en sodio' },
    { offset: -10, peso_kg: 76.0, notas: '' },
    { offset: -9, peso_kg: 75.8, notas: '' },
    { offset: -8, peso_kg: 76.2, notas: 'Entreno piernas' },
    { offset: -7, peso_kg: 75.7, notas: '' },
    { offset: -6, peso_kg: 75.5, notas: '' },
    { offset: -5, peso_kg: 75.9, notas: 'Retención hídrica' },
    { offset: -4, peso_kg: 75.4, notas: '' },
    { offset: -3, peso_kg: 75.2, notas: '' },
    { offset: -2, peso_kg: 75.5, notas: 'Refeed carbohidratos' },
    { offset: -1, peso_kg: 75.1, notas: '' }
  ];

  return sampleWeights.map((item, idx) => ({
    id: `seed-weight-${idx}`,
    fecha: addDaysToDateString(today, item.offset),
    peso_kg: item.peso_kg,
    notas: item.notas
  }));
}

function readLocalWeights() {
  try {
    const raw = localStorage.getItem(WEIGHT_STORAGE_KEY);
    if (!raw) {
      const seed = buildDefaultWeightSeed();
      localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return buildDefaultWeightSeed();
  }
}

function writeLocalWeights(list) {
  try {
    const sorted = [...list].sort((a, b) => a.fecha.localeCompare(b.fecha));
    localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Error guardando peso en localStorage:', err);
  }
}

export const weightService = {
  /**
   * Lectura síncrona inmediata desde localStorage
   */
  getCachedWeights() {
    return readLocalWeights().sort((a, b) => a.fecha.localeCompare(b.fecha));
  },

  /**
   * Obtiene historial de peso corporal ordenado por fecha ASC
   */
  async getWeightHistory() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('peso_corporal')
        .select('*')
        .order('fecha', { ascending: true });

      if (!error && data && data.length > 0) {
        writeLocalWeights(data);
        return data;
      }
    }

    return readLocalWeights().sort((a, b) => a.fecha.localeCompare(b.fecha));
  },

  /**
   * Registra o sobrescribe (UPSERT) el peso corporal de una fecha (validando 20 < peso_kg < 300)
   */
  async upsertWeight({ fecha, peso_kg, notas = '' }) {
    const numPeso = Number(Number(peso_kg).toFixed(2));
    if (Number.isNaN(numPeso) || numPeso <= 20 || numPeso >= 300) {
      throw new Error('El peso corporal debe ser mayor a 20 kg y menor a 300 kg.');
    }

    const cleanFecha = fecha || getLocalDateString();
    const cleanNotas = String(notas || '').trim();

    // Actualización optimista en localStorage
    const current = readLocalWeights();
    const existingIndex = current.findIndex((w) => w.fecha === cleanFecha);
    let localRecord;

    if (existingIndex >= 0) {
      localRecord = {
        ...current[existingIndex],
        peso_kg: numPeso,
        notas: cleanNotas
      };
      current[existingIndex] = localRecord;
    } else {
      localRecord = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}`,
        fecha: cleanFecha,
        peso_kg: numPeso,
        notas: cleanNotas
      };
      current.push(localRecord);
    }

    writeLocalWeights(current);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('peso_corporal')
        .upsert(
          [{ fecha: cleanFecha, peso_kg: numPeso, notas: cleanNotas }],
          { onConflict: 'fecha' }
        )
        .select()
        .single();

      if (!error && data) {
        const refreshed = readLocalWeights().map((w) =>
          w.fecha === cleanFecha ? data : w
        );
        writeLocalWeights(refreshed);
        return data;
      }
    }

    return localRecord;
  },

  /**
   * Elimina un registro de peso corporal por ID o Fecha
   */
  async deleteWeight(idOrFecha) {
    const current = readLocalWeights();
    const filtered = current.filter(
      (w) => w.id !== idOrFecha && w.fecha !== idOrFecha
    );
    writeLocalWeights(filtered);

    if (isSupabaseConfigured) {
      await supabase
        .from('peso_corporal')
        .delete()
        .or(`id.eq.${idOrFecha},fecha.eq.${idOrFecha}`);
    }

    return filtered;
  }
};

