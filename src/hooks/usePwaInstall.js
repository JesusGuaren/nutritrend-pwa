import { useState, useEffect, useCallback } from 'react';

/**
 * Hook que detecta si la app ya corre instalada como PWA standalone (`display-mode: standalone`)
 * y captura el evento `beforeinstallprompt` del navegador para disparar la descarga/instalación
 * nativa mediante un botón propio dentro de la web.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isCapacitorNative =
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      window.location.protocol === 'capacitor:' ||
      window.navigator.userAgent.includes('Capacitor');
    return (
      isCapacitorNative ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  });
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDetected);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e) => {
      setIsStandalone(e.matches || window.navigator.standalone === true);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayChange);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return { status: outcome };
    }

    if (isIOS) {
      setShowIOSGuide(true);
      return { status: 'ios-guide' };
    }

    return { status: 'manual-guide' };
  }, [deferredPrompt, isIOS]);

  return {
    isStandalone,
    canInstallNatively: Boolean(deferredPrompt),
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    triggerInstall
  };
}

