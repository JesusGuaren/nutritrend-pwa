import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * RNF-03: Ciclo de vida seguro de cámara con html5-qrcode.
 * Usa `facingMode: "environment"`, emite vibración háptica `navigator.vibrate?.(50)`
 * y apaga obligatoriamente el stream de video al decodificar o desmontar el modal.
 */
export function useBarcodeScanner({ elementId, isOpen, onDetected }) {
  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);
  const hasDetectedRef = useRef(false);

  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = useCallback(async () => {
    const instance = scannerRef.current;
    if (!instance || isStoppingRef.current) return;

    isStoppingRef.current = true;
    try {
      const state = instance.getState?.();
      // En html5-qrcode: 2 = SCANNING, 3 = PAUSED
      if (state === 2 || state === 3) {
        await instance.stop();
      }
      await instance.clear();
    } catch {
      // Ignorar errores benignos cuando el nodo DOM ya fue desmontado
    } finally {
      scannerRef.current = null;
      isStoppingRef.current = false;
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    hasDetectedRef.current = false;
    setCameraError(null);
    setIsInitializing(true);

    let cancelled = false;

    const timer = setTimeout(async () => {
      const container = document.getElementById(elementId);
      if (!container || cancelled) {
        setIsInitializing(false);
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 12,
            qrbox: { width: 250, height: 140 },
            aspectRatio: 1.333334
          },
          async (decodedText) => {
            if (hasDetectedRef.current || cancelled) return;
            hasDetectedRef.current = true;

            // Vibración háptica RNF-03
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(50);
            }

            await stopScanner();
            if (onDetected) {
              onDetected(String(decodedText).trim());
            }
          },
          () => {
            // Frame sin código detectado (silencioso)
          }
        );

        if (!cancelled) {
          setIsScanning(true);
          setIsInitializing(false);
        } else {
          await stopScanner();
        }
      } catch (err) {
        if (!cancelled) {
          setIsInitializing(false);
          setIsScanning(false);
          setCameraError(
            err?.message ||
              'No se pudo acceder a la cámara trasera. Puedes escribir el código EAN manualmente abajo.'
          );
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, elementId, onDetected, stopScanner]);

  return {
    isInitializing,
    isScanning,
    cameraError,
    stopScanner
  };
}

