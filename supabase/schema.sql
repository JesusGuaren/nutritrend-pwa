-- ============================================================================
-- ESQUEMA DE BASE DE DATOS Y SEMILLA INICIAL - PWA NUTRICIÓN, MACROS Y PESO EMA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================================

-- 1. Perfiles de metas nutricionales
create table metas_nutricionales (
  id uuid default gen_random_uuid() primary key,
  nombre_perfil text not null unique,
  kcal_objetivo numeric not null,
  proteina_g numeric not null,
  carbos_g numeric not null,
  grasas_g numeric not null,
  activo boolean default false
);

-- 2. Catálogo de alimentos base y escaneados
create table alimentos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  marca text default '',
  codigo_barras text unique,
  kcal_100g numeric not null check (kcal_100g >= 0),
  proteina_100g numeric not null check (proteina_100g >= 0),
  carbos_100g numeric not null check (carbos_100g >= 0),
  grasas_100g numeric not null check (grasas_100g >= 0),
  porcion_habitual_g numeric default 100 check (porcion_habitual_g > 0),
  unidad_nombre text default 'g',
  es_favorito boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. Registro diario de comidas
create table registros_diarios (
  id uuid default gen_random_uuid() primary key,
  fecha date not null,
  alimento_id uuid references alimentos(id) on delete restrict not null,
  gramos numeric not null check (gramos > 0),
  bloque_comida text default 'General' check (bloque_comida in ('Desayuno', 'Almuerzo', 'Once/Cena', 'Snacks/Post-Entreno', 'General')),
  created_at timestamp with time zone default now()
);

-- 4. Combos (Comidas armadas frecuentes)
create table combos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null
);

create table combo_items (
  id uuid default gen_random_uuid() primary key,
  combo_id uuid references combos(id) on delete cascade not null,
  alimento_id uuid references alimentos(id) on delete cascade not null,
  gramos numeric not null check (gramos > 0)
);

-- 5. Historial de peso corporal en ayunas
create table peso_corporal (
  id uuid default gen_random_uuid() primary key,
  fecha date unique not null,
  peso_kg numeric not null check (peso_kg > 20 and peso_kg < 300),
  notas text default ''
);

-- Índices de optimización
create index idx_registros_fecha on registros_diarios(fecha);
create index idx_alimentos_barcode on alimentos(codigo_barras);
create index idx_peso_fecha on peso_corporal(fecha asc);

-- DATOS SEMILLA (SEED DATA) PARA PRUEBA INMEDIATA
insert into metas_nutricionales (nombre_perfil, kcal_objetivo, proteina_g, carbos_g, grasas_g, activo) values
  ('Déficit', 2050, 165, 200, 65, true),
  ('Mantenimiento', 2450, 160, 290, 72, false),
  ('Entreno Pesado', 2600, 165, 330, 70, false);

insert into alimentos (nombre, marca, kcal_100g, proteina_100g, carbos_100g, grasas_100g, porcion_habitual_g, unidad_nombre, es_favorito) values
  ('Pechuga de Pollo (Cruda)', 'Genérico', 110, 23.0, 0.0, 1.2, 200, 'g', true),
  ('Huevo Entero Grande', 'Genérico', 143, 12.6, 0.7, 9.5, 60, 'unidad (60g)', true),
  ('Arroz Blanco (Cocido)', 'Genérico', 130, 2.7, 28.2, 0.3, 150, 'g', true),
  ('Avena Tradicional', 'Quaker', 367, 13.3, 60.0, 8.3, 60, 'g', true),
  ('Whey Protein Isolate/Concentrate', 'Suplemento', 390, 78.0, 6.5, 5.0, 32, 'scoop (32g)', true),
  ('Pan Marraqueta', 'Panadería', 267, 8.9, 55.2, 1.0, 100, 'unidad (100g)', true),
  ('Palta Hass', 'Genérico', 160, 2.0, 8.5, 14.7, 60, 'porción (60g)', true),
  ('Leche Descremada', 'Colun / Soprole', 33, 3.3, 4.8, 0.1, 250, 'ml', true);

