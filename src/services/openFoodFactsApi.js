/**
 * RF-04 & Patrón Adapter: Resolución de Código de Barras con Open Food Facts Chile
 * Convierte la respuesta heterogénea de la API pública de Open Food Facts al contrato exacto
 * de la tabla `alimentos`, asegurando valores numéricos por defecto (0) si algún macro viene vacío.
 */

const OFF_API_BASE = 'https://cl.openfoodfacts.org/api/v2/product';

function sanitizeNumeric(value, fallback = 0) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return Number(parsed.toFixed(1));
}

export const openFoodFactsApi = {
  /**
   * Consulta un código EAN-13 / EAN-8 en Open Food Facts Chile
   * @param {string} barcode
   * @returns {Promise<{ found: boolean, foodData: Object }>}
   */
  async fetchProduct(barcode) {
    const cleanCode = String(barcode || '').trim();
    const emptyTemplate = {
      nombre: '',
      marca: '',
      codigo_barras: cleanCode,
      kcal_100g: 0,
      proteina_100g: 0,
      carbos_100g: 0,
      grasas_100g: 0,
      porcion_habitual_g: 100,
      unidad_nombre: 'g',
      es_favorito: false
    };

    if (!cleanCode) {
      return { found: false, foodData: emptyTemplate };
    }

    try {
      const response = await fetch(`${OFF_API_BASE}/${encodeURIComponent(cleanCode)}.json`, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        return { found: false, foodData: emptyTemplate };
      }

      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        return { found: false, foodData: emptyTemplate };
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      const rawName =
        product.product_name_es ||
        product.product_name ||
        product.generic_name_es ||
        product.generic_name ||
        '';

      const rawBrand = product.brands
        ? String(product.brands).split(',')[0].trim()
        : '';

      // Extracción de calorías (soporta energy-kcal_100g o conversión desde kJ si falta)
      let kcal100 = sanitizeNumeric(nutriments['energy-kcal_100g'], -1);
      if (kcal100 < 0) {
        const kj100 = sanitizeNumeric(nutriments['energy-kj_100g'] || nutriments.energy_100g, 0);
        kcal100 = kj100 > 0 ? Math.round(kj100 / 4.184) : 0;
      } else {
        kcal100 = Math.round(kcal100);
      }

      const proteina100 = sanitizeNumeric(nutriments.proteins_100g, 0);
      const carbos100 = sanitizeNumeric(nutriments.carbohydrates_100g, 0);
      const grasas100 = sanitizeNumeric(nutriments.fat_100g, 0);

      // Intentar detectar porción habitual en gramos si viene informada
      let porcionG = 100;
      if (product.serving_quantity) {
        const parsedServing = Number(product.serving_quantity);
        if (!Number.isNaN(parsedServing) && parsedServing > 0 && parsedServing <= 1000) {
          porcionG = Math.round(parsedServing);
        }
      }

      return {
        found: true,
        foodData: {
          nombre: rawName.trim() || `Producto ${cleanCode}`,
          marca: rawBrand,
          codigo_barras: cleanCode,
          kcal_100g: kcal100,
          proteina_100g: proteina100,
          carbos_100g: carbos100,
          grasas_100g: grasas100,
          porcion_habitual_g: porcionG,
          unidad_nombre: product.serving_size ? String(product.serving_size).trim() : 'g',
          es_favorito: false
        }
      };
    } catch (error) {
      console.warn('Error consultando Open Food Facts:', error);
      return { found: false, foodData: emptyTemplate };
    }
  }
};

