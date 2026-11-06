# MEMORIA DE SESIÓN Y DOCUMENTACIÓN TÉCNICA — NUTRITREND (PWA + ANDROID APK NATIVA)

> **Propósito de este documento:** Este archivo sirve como contexto maestro para futuras sesiones de desarrollo. Contiene la arquitectura exacta, los enlaces de producción, el flujo de compilación del `.APK` nativo y todo lo implementado hasta la fecha.

---

## 1. ENLACES DE PRODUCCIÓN Y REPOSITORIO
* **Repositorio GitHub:** [https://github.com/JesusGuaren/nutritrend-pwa](https://github.com/JesusGuaren/nutritrend-pwa) (Rama principal: `main`)
* **Equipo en Vercel:** `JesusProductions` (`jesus-productions`)
* **Web de Presentación y Descarga (Vercel):** `https://nutritrend-pwa.vercel.app`
* **Descarga Directa del APK hospedado en Vercel:** `https://nutritrend-pwa.vercel.app/NutriTrend.apk`
* **Descarga Directa del APK en GitHub Releases:** [https://github.com/JesusGuaren/nutritrend-pwa/releases/download/v1.0.0-apk/NutriTrend.apk](https://github.com/JesusGuaren/nutritrend-pwa/releases/download/v1.0.0-apk/NutriTrend.apk)

---

## 2. QUÉ SE HA CONSTRUIDO HASTA AHORA

### 2.1 MVP Completo (Según Especificación Técnica Estricta SRS)
1. **Manejo Estricto de Fecha Local (`src/utils/dateUtils.js`):**
   * Usa `getLocalDateString()` construyendo `YYYY-MM-DD` con métodos locales (`getFullYear`, `getMonth`, `getDate`), evitando el salto de día a las 20:00/21:00 hrs en Chile por desfase UTC.
2. **Fórmulas Nutricionales Exactas (`src/utils/macroCalculator.js`):**
   * Cálculo exacto por porción en gramos ($W$) sobre valores cada $100\text{g}$, totales consumidos, restantes y cálculo de combos completos.
3. **Algoritmo de Peso Tendencial EMA de 7 Días (`src/utils/emaCalculator.js`):**
   * Constante de suavizado $k = \frac{2}{7 + 1} = 0.25$.
   * Filtra retención de líquidos y glucógeno mostrando dos series en `Recharts` (`ComposedChart`): puntos/línea punteada celeste para el peso de báscula diario y curva sólida verde esmeralda (`#10b981`, `3px`) para la tendencia EMA.
4. **Dashboard Diario + Quick-Add en 1 Toque (`src/features/dashboard/`):**
   * Alternador instantáneo de Fase Calórica (`Déficit`, `Mantenimiento`, `Entreno Pesado`) bajo patrón *Strategy*.
   * Grilla de favoritos (`es_favorito = true`): tocar `[+]` registra la `porcion_habitual_g` en `<16ms` (Optimistic UI); tocar la tarjeta abre `BottomSheet` con teclado numérico directo (`inputMode="decimal"`) y multiplicadores rápidos (`0.5x`, `1x`, `1.5x`, `2x`).
   * Carga de **Combos en 1 Toque** mediante inserción masiva.
5. **Escáner de Código de Barras EAN-13 / EAN-8 (`src/features/dashboard/BarcodeModal.jsx` & `src/hooks/useBarcodeScanner.js`):**
   * Stream de cámara trasera (`facingMode: "environment"`), vibración háptica (`navigator.vibrate(50)`) y apagado limpio del hardware al cerrar.
   * **Fallback de Cámara Nativa:** Incluye botón *"Tomar Foto al Código con Cámara Nativa"* (`capture="environment"`) y entrada manual de código EAN.
   * **Patrón Adapter (`src/services/openFoodFactsApi.js`):** Busca primero en catálogo local/Supabase y, si no existe, consulta `https://cl.openfoodfacts.org/api/v2/product/{barcode}.json` normalizando los macronutrientes.
6. **Persistencia Híbrida (`src/services/nutritionService.js` & `src/services/weightService.js`):**
   * Funciona **100% Out-of-the-Box con `localStorage`** (0ms de espera en Cold Start con datos semilla incluidos) y sincroniza en segundo plano (*Stale-While-Revalidate*) con **Supabase** si están definidas las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
   * El esquema SQL completo y los datos semilla están en `supabase/schema.sql`.

---

### 2.2 Expansiones de Fase 2 Ya Implementadas
1. **Motor de Gasto Calórico Dinámico — TDEE Real 14 Días (`src/utils/emaCalculator.js` & `WeightView.jsx`):**
   * Cruza la ingesta calórica media de los últimos 14 días con la variación del Peso Tendencial EMA ($\Delta\text{EMA} \times 7700\text{ kcal}$) para mostrar el mantenimiento metabólico real y sugerir calorías para Déficit, Mantenimiento y Volumen Limpio.
2. **Ciclado Automático de Macros por Calendario (`CatalogView.jsx` & `useDailyNutrition.js`):**
   * Permite activar un calendario semanal (`Lunes` a `Domingo`) en la pestaña *Catálogo -> Metas* para que la app asigne automáticamente el perfil `Entreno Pesado`, `Déficit` o `Mantenimiento` según el día de la semana.
3. **Cola Offline en IndexedDB (`src/utils/offlineQueue.js`):**
   * Base de datos IndexedDB (`nutritrend_offline_db`) preparada para encolar mutaciones pendientes sin conexión.

---

### 2.3 Portal Web Estilo Aptoide + Empaquetado Android Nativo (`.APK`)
Para evitar que al instalar la app en Android aparezca el badge/loguito del navegador (Chrome/Brave) en la esquina del ícono:
1. **Portal de Descarga (`src/components/layout/LandingShowcase.jsx`):**
   * Cuando se abre la URL en un navegador web, presenta una página estilo tienda oficial (Aptoide) con ficha técnica, código QR de descarga directa, vista previa interactiva dentro de un chasis de teléfono y botón **"Descargar NutriTrend.apk (Instalador Nativo)"**.
   * Cuando la app se abre ya instalada como APK nativo (Capacitor) o en modo standalone, salta la portada y entra directo al Dashboard a pantalla completa (`src/hooks/usePwaInstall.js`).
2. **Compilación Automática de `.APK` con Ícono Oficial (`.github/workflows/build-apk.yml`):**
   * Usa **Capacitor 6** (`capacitor.config.json`, `com.jesusproductions.nutritrend`) + **JDK 21** + **Gradle** en GitHub Actions.
   * Genera todos los íconos nativos de Android (`mipmap-mdpi` a `mipmap-xxxhdpi` y Adaptive Icons con fondo `#020617`) a partir de `assets/icon.svg`, `assets/icon-foreground.svg` y `assets/icon-background.svg` mediante `@capacitor/assets`.
   * Inyecta permisos nativos `android.permission.CAMERA` y `android.permission.VIBRATE` en `AndroidManifest.xml`.
   * Publica el binario en GitHub Releases (`v1.0.0-apk`) y también se sirve directamente desde `public/NutriTrend.apk` con cabecera `application/vnd.android.package-archive` en `vercel.json`.

---

## 3. ESTRUCTURA ACTUAL DE ARCHIVOS CLAVE

```text
├── .github/workflows/
│   └── build-apk.yml               # Pipeline CI/CD que compila NutriTrend.apk con Capacitor + Gradle
├── assets/
│   ├── icon.svg                    # Logo maestro 1024x1024 para generación de mipmaps Android
│   ├── icon-foreground.svg         # Capa foreground para Adaptive Icon de Android
│   └── icon-background.svg         # Capa background (#020617) para Adaptive Icon de Android
├── public/
│   ├── NutriTrend.apk              # Instalador nativo Android servido directo desde Vercel
│   ├── favicon.svg
│   ├── icon-192.svg
│   └── icon-512.svg
├── supabase/
│   └── schema.sql                  # Tablas SQL, restricciones CHECK, índices y datos semilla
├── src/
│   ├── config/
│   │   └── supabaseClient.js       # Cliente Supabase (con fallback automático si no hay .env)
│   ├── utils/
│   │   ├── dateUtils.js            # Fecha local estricta YYYY-MM-DD (RF-01)
│   │   ├── macroCalculator.js      # Cálculo de porciones, totales y combos (RF-02)
│   │   ├── emaCalculator.js        # Algoritmo EMA 7 días (RF-03) + Motor TDEE Real 14d
│   │   └── offlineQueue.js         # Cola persistente en IndexedDB
│   ├── services/
│   │   ├── openFoodFactsApi.js     # Adaptador para API Open Food Facts Chile (RF-04)
│   │   ├── nutritionService.js     # CRUD Alimentos, Combos, Metas, Logs y Ciclado Semanal
│   │   └── weightService.js        # CRUD / UPSERT de peso corporal en ayunas
│   ├── hooks/
│   │   ├── useDailyNutrition.js    # Estado diario, Optimistic UI y Stale-While-Revalidate
│   │   ├── useWeightTrend.js       # Estado de peso y serie EMA calculada
│   │   ├── useBarcodeScanner.js    # Ciclo de vida seguro de cámara con html5-qrcode
│   │   └── usePwaInstall.js        # Detección de APK Capacitor / Standalone
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LandingShowcase.jsx # Portal web estilo Aptoide con descarga de NutriTrend.apk
│   │   │   └── MobileLayout.jsx    # Contenedor móvil OLED + Bottom Navigation (h-16)
│   │   └── ui/
│   │       ├── BottomSheet.jsx     # Modal deslizable inferior para uso con el pulgar
│   │       ├── CalorieRing.jsx     # Anillo SVG de calorías consumidas vs. restantes
│   │       └── MacroProgressBar.jsx# Barras individuales P / C / G
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── DashboardView.jsx   # Vista principal Hoy + Quick-Add + Log diario
│   │   │   ├── QuickAddGrid.jsx    # Grilla de 1 toque para favoritos y combos
│   │   │   └── BarcodeModal.jsx    # Escáner EAN en vivo + captura de foto nativa
│   │   ├── weight/
│   │   │   ├── WeightView.jsx      # Registro de peso, tarjetas EMA y panel TDEE Real
│   │   │   └── WeightChart.jsx     # Gráfico Recharts ComposedChart (Real vs. EMA 7d)
│   │   └── catalog/
│   │       ├── CatalogView.jsx     # Catálogo de alimentos, combos, metas y ciclado semanal
│   │       └── ComboBuilder.jsx    # Creador de comidas armadas (RF-05)
│   ├── App.jsx
│   └── main.jsx
├── capacitor.config.json           # Configuración nativa Android (com.jesusproductions.nutritrend)
├── vercel.json                     # Reglas de rutas SPA y cabeceras MIME para /NutriTrend.apk
└── vite.config.js                  # Configuración de Vite, chunks manuales y VitePWA
```

---

## 4. INSTRUCCIONES PARA LA PRÓXIMA SESIÓN
1. **Para actualizar la Web en Vercel:** Basta con hacer `git commit` y `git push origin main`. Vercel despliega automáticamente en ~25 segundos.
2. **Para actualizar el archivo `NutriTrend.apk`:**
   * Al hacer `git push origin main`, el workflow `.github/workflows/build-apk.yml` compila automáticamente el nuevo APK con todos los cambios y lo publica en el Release `v1.0.0-apk` de GitHub.
   * Si se desea actualizar también la copia estática alojada en `public/NutriTrend.apk`, descargar el artefacto desde `https://github.com/JesusGuaren/nutritrend-pwa/releases/download/v1.0.0-apk/NutriTrend.apk` hacia `public/NutriTrend.apk` y hacer push.
3. **Pendientes opcionales si el usuario los solicita:**
   * Conectar proyecto real de Supabase configurando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel.
   * Integración con Bot de Telegram / Webhook n8n (Sección 7.2 del SRS) para ingesta por audio o texto natural con IA.
