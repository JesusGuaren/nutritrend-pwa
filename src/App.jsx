import React, { useState } from 'react';
import { MobileLayout } from './components/layout/MobileLayout';
import { LandingShowcase } from './components/layout/LandingShowcase';
import { DashboardView } from './features/dashboard/DashboardView';
import { WeightView } from './features/weight/WeightView';
import { CatalogView } from './features/catalog/CatalogView';
import { useDailyNutrition } from './hooks/useDailyNutrition';
import { usePwaInstall } from './hooks/usePwaInstall';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [enteredWebApp, setEnteredWebApp] = useState(false);

  const {
    isStandalone,
    canInstallNatively,
    isIOS,
    triggerInstall
  } = usePwaInstall();

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

  const renderAppContent = (isEmbeddedPreview = false) => (
    <MobileLayout
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      isSyncing={isSyncing}
      isEmbeddedPreview={isEmbeddedPreview}
      showInstallBanner={!isStandalone}
      onInstallApp={triggerInstall}
      onBackToShowcase={() => setEnteredWebApp(false)}
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

  // Si la app ya fue descargada e iniciada desde el ícono del teléfono (modo standalone)
  // o el usuario decidió entrar al modo pantalla completa, renderizar directo la App:
  if (isStandalone || enteredWebApp) {
    return renderAppContent(false);
  }

  // Si entra desde el navegador web (PC o móvil sin instalar), mostrar la Landing Page
  // profesional con botón de descarga directa y el teléfono interactivo al costado:
  return (
    <LandingShowcase
      canInstallNatively={canInstallNatively}
      isIOS={isIOS}
      onInstallClick={triggerInstall}
      onEnterApp={() => setEnteredWebApp(true)}
    >
      {renderAppContent(true)}
    </LandingShowcase>
  );
}
