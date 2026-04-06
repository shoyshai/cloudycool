import { useCallback, useEffect, useMemo, useState } from "react";

interface DeferredPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const detectIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsIOS(detectIOS());
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || ((window.navigator as Navigator & { standalone?: boolean }).standalone === true));

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
    return true;
  }, [deferredPrompt]);

  const canInstall = !!deferredPrompt && !installed && !isStandalone;
  const showIosHint = useMemo(
    () => isIOS && !isStandalone && !canInstall,
    [isIOS, isStandalone, canInstall],
  );

  return {
    canInstall,
    showIosHint,
    promptInstall,
  };
}
