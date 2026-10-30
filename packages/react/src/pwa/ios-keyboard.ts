import { useEffect } from "react";

const CAMPO = "input, textarea, select, [contenteditable='true']";
const ehCampo = (el: EventTarget | null) => !!(el as HTMLElement | null)?.matches?.(CAMPO);

/**
 * Fixes a WebKit bug of the INSTALLED app on iPhone: the first time the keyboard opens, the window shrinks and
 * never grows back (a dark band at the bottom, the tab bar lifted). Nothing makes WebKit measure again except
 * hiding and showing an element the size of the window, so when a field loses focus and the window is shorter
 * than the tallest seen, the root "blinks" in a synchronous reflow (no frame painted in between). It also gives
 * back the scroll the keyboard took. Returns the cleanup.
 */
export function fixIosKeyboardViewport(root: HTMLElement) {
  // Installed, the app fills the screen: the right height is the screen's, not the first one WebKit reports.
  let maior = Math.max(window.innerHeight, screen.height);
  let rolagemAntes: number | null = null;
  const aoRedimensionar = () => {
    maior = Math.max(maior, window.innerHeight);
  };
  const curar = () => {
    // Moved from one field to another: the keyboard is still open.
    if (ehCampo(document.activeElement)) return;
    if (maior - window.innerHeight > 4) {
      root.style.display = "none";
      void root.offsetHeight;
      root.style.display = "";
    }
    // The iPhone scrolls the page to show the field and does not undo it when the keyboard closes.
    if (rolagemAntes !== null && window.scrollY !== rolagemAntes) window.scrollTo(0, rolagemAntes);
  };
  const aoEntrar = (e: FocusEvent) => {
    if (ehCampo(e.target) && rolagemAntes === null) rolagemAntes = window.scrollY;
  };
  const aoSair = (e: FocusEvent) => {
    if (!ehCampo(e.target)) return;
    // Twice: halfway through and at the end of the keyboard closing.
    window.setTimeout(curar, 140);
    window.setTimeout(() => {
      curar();
      if (!ehCampo(document.activeElement)) rolagemAntes = null;
    }, 450);
  };
  // A short window at launch is also only cured by the blink: try after mounting and when the app comes back.
  const curarAbertura = () => {
    window.setTimeout(curar, 300);
    window.setTimeout(curar, 1000);
  };
  const aoVoltar = () => {
    if (document.visibilityState === "visible") curarAbertura();
  };
  curarAbertura();
  document.addEventListener("visibilitychange", aoVoltar);
  window.addEventListener("resize", aoRedimensionar);
  document.addEventListener("focusout", aoSair, true);
  document.addEventListener("focusin", aoEntrar, true);
  return () => {
    document.removeEventListener("visibilitychange", aoVoltar);
    window.removeEventListener("resize", aoRedimensionar);
    document.removeEventListener("focusout", aoSair, true);
    document.removeEventListener("focusin", aoEntrar, true);
  };
}

/** `fixIosKeyboardViewport` as a hook, on the element with this id (default "root"); only on an installed iPhone app. */
export function useIosKeyboardFix(rootId = "root") {
  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const root = document.getElementById(rootId);
    if (!root || nav.standalone !== true) return;
    return fixIosKeyboardViewport(root);
  }, [rootId]);
}
