/**
 * RF-01: Manejo Estricto de Fecha Local (YYYY-MM-DD sin desfase UTC)
 * Evita que a partir de las 20:00 / 21:00 hrs en Chile (UTC-3/UTC-4) salte al día siguiente.
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una cadena YYYY-MM-DD a formato legible en español (Ej: "Vie 6 Nov")
 */
export function formatHumanDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Formatea una cadena YYYY-MM-DD a formato corto para ejes de gráficos (Ej: "06/11")
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * Suma o resta días a una fecha YYYY-MM-DD manteniendo la zona horaria local
 */
export function addDaysToDateString(dateStr, daysDelta) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() + daysDelta);
  return getLocalDateString(dateObj);
}

