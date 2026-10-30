import { useEffect, useState } from "react";

/** Chromium's `beforeinstallprompt` (Android, Chrome and Edge on desktop). */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export type InstallState = "waiting" | "available" | "unavailable" | "installing" | "dismissed" | "installed";

let guardado: InstallEvent | null = null;
let ouvindo = false;
const avisar = new Set<() => void>();

/**
 * Starts listening for the install prompt. The browser may fire it before React mounts: call this in your entry
 * file, before `createRoot` (the hook calls it too, in case you did not).
 */
export function captureInstallPrompt() {
  if (ouvindo || typeof window === "undefined") return;
  ouvindo = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    guardado = e as InstallEvent;
    avisar.forEach((f) => f());
  });
}

/** How long to wait for the prompt before assuming it will not come (it may still come later). */
const ESPERA_MS = 1500;

/**
 * The install button's brain: `available` means `install()` opens the browser's own dialog. The absence of the
 * prompt does NOT prove the browser cannot install (Chrome also holds it when the app is installed or was just
 * declined): show the manual instruction then.
 */
export function useInstallPrompt() {
  captureInstallPrompt();
  const [state, setState] = useState<InstallState>(() => (guardado ? "available" : "waiting"));

  useEffect(() => {
    const chegou = () => setState((e) => (e === "waiting" || e === "unavailable" || e === "dismissed" ? "available" : e));
    const instalou = () => setState("installed");
    avisar.add(chegou);
    window.addEventListener("appinstalled", instalou);
    const relogio = window.setTimeout(() => setState((e) => (e === "waiting" ? "unavailable" : e)), ESPERA_MS);
    return () => {
      avisar.delete(chegou);
      window.removeEventListener("appinstalled", instalou);
      window.clearTimeout(relogio);
    };
  }, []);

  const install = async () => {
    const evento = guardado;
    if (!evento) return;
    setState("installing");
    try {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      // The event works once; the browser sends another when it wants.
      guardado = null;
      if (outcome === "dismissed") setState("dismissed");
    } catch {
      guardado = null;
      setState("unavailable");
    }
  };

  return { state, install };
}
