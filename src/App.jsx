import React, { useState } from 'react';
import { MobileLayout } from './components/layout/MobileLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { WeightView } from './features/weight/WeightView';
import { CatalogView } from './features/catalog/CatalogView';
import { useDailyNutrition } from './hooks/useDailyNutrition';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    selectedDate,
    setSelectedDate,
    metas,
    metaActiva,
    alimentos,
    favoritos,
    registrosHoy,
    combos,
    summary,
    isSyncing,
    switchPhase,
    updatePhaseTargets,
    logFood,
    logCombo,
    removeDailyLog,
    createNewFood,
    toggleFavorite,
    createNewCombo,
    removeCombo
  } = useDailyNutrition();

  return (
    <MobileLayout
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      isSyncing={isSyncing}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          metas={metas}
          metaActiva={metaActiva}
          onSwitchPhase={switchPhase}
          favoritos={favoritos}
          alimentos={alimentos}
          combos={combos}
          registrosHoy={registrosHoy}
          summary={summary}
          onLogFood={logFood}
          onLogCombo={logCombo}
          onRemoveLog={removeDailyLog}
          onCreateFood={createNewFood}
        />
      )}

      {activeTab === 'weight' && <WeightView />}

      {activeTab === 'catalog' && (
        <CatalogView
          alimentos={alimentos}
          combos={combos}
          metas={metas}
          onCreateFood={createNewFood}
          onToggleFavorite={toggleFavorite}
          onCreateCombo={createNewCombo}
          onDeleteCombo={removeCombo}
          onLogCombo={logCombo}
          onUpdateMetaProfile={updatePhaseTargets}
        />
      )}
    </MobileLayout>
  );
}

