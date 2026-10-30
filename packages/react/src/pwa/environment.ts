import { useEffect, useState } from "react";

/**
 * Where the app is running. Pure functions over the user agent and display mode, so the same code runs in tests
 * with real UA strings. The UA only picks the INSTRUCTION to show; capability (the install prompt, standalone)
 * decides what a button does.
 */
export type Platform = "ios" | "android" | "desktop";

export type Environment = {
  platform: Platform;
  /** Opened from the home screen icon (the current window; false does NOT mean "not installed"). */
  standalone: boolean;
  /** WhatsApp, Instagram, Facebook, TikTok, LinkedIn… or a generic Android webview: cannot install from there. */
  inAppBrowser: boolean;
  /** iOS only Safari could add to the home screen before 16.4; after it, Chrome/Edge/Firefox also can. */
  iosBrowser: "safari" | "chrome" | "firefox" | "edge" | "other";
  iosVersion: number;
};

export type WindowInfo = { userAgent: string; maxTouchPoints: number; iosStandalone?: boolean; displayStandalone: boolean };

export function readWindow(): WindowInfo {
  if (typeof navigator === "undefined") return { userAgent: "", maxTouchPoints: 0, displayStandalone: false };
  const nav = navigator as Navigator & { standalone?: boolean };
  const mm = (q: string) => (typeof matchMedia === "function" ? matchMedia(q).matches : false);
  return {
    userAgent: nav.userAgent ?? "",
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    iosStandalone: nav.standalone,
    displayStandalone: mm("(display-mode: standalone)") || mm("(display-mode: fullscreen)") || mm("(display-mode: minimal-ui)"),
  };
}

const APPS_INTERNOS = /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|TikTok|musical_ly|Line\/|MicroMessenger|LinkedInApp|Snapchat|Twitter|Pinterest/i;

export function environmentOf(w: WindowInfo): Environment {
  const ua = w.userAgent;
  // iPadOS 13+ says it is a Mac; touch gives it away.
  const platform: Platform = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && w.maxTouchPoints > 1) ? "ios" : /Android/i.test(ua) ? "android" : "desktop";
  const inAppBrowser =
    APPS_INTERNOS.test(ua) ||
    // Android webview: Chrome marks it with "; wv)".
    (platform === "android" && /;\s*wv\)/.test(ua)) ||
    // iOS: every real browser carries "Safari"; a third-party WKWebView does not.
    (platform === "ios" && !/Safari/i.test(ua));
  const iosBrowser = /CriOS/i.test(ua) ? "chrome" : /FxiOS/i.test(ua) ? "firefox" : /EdgiOS/i.test(ua) ? "edge" : /Safari/i.test(ua) ? "safari" : "other";
  const m = /OS (\d+)[._](\d+)/.exec(ua) ?? /Version\/(\d+)\.(\d+)/.exec(ua);
  return {
    platform,
    standalone: w.displayStandalone || w.iosStandalone === true,
    inAppBrowser,
    iosBrowser,
    iosVersion: platform === "ios" && m ? Number(`${m[1]}.${m[2]}`) : 0,
  };
}

/** The environment of this window (computed once; it does not change while the page lives). */
export function useEnvironment(): Environment {
  const [e] = useState(() => environmentOf(readWindow()));
  return e;
}

/** True when the app was opened from its home screen icon. */
export function useStandalone(): boolean {
  const [s, setS] = useState(() => environmentOf(readWindow()).standalone);
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const q = matchMedia("(display-mode: standalone)");
    const mudou = () => setS(environmentOf(readWindow()).standalone);
    q.addEventListener?.("change", mudou);
    return () => q.removeEventListener?.("change", mudou);
  }, []);
  return s;
}
