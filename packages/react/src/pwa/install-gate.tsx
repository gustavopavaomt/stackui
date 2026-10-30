import { useState, type ReactNode } from "react";

import { Button } from "../components/button";
import { ProgressSteps } from "../components/progress-steps";
import { useEnvironment } from "./environment";
import { useInstallPrompt } from "./install-prompt";

export type InstallGateTexts = {
  title: string;
  description: string;
  install: string;
  installing: string;
  iosSteps: string[];
  androidSteps: string[];
  inAppTitle: string;
  inAppDescription: string;
  copyLink: string;
  copied: string;
  desktopDescription: string;
};

const PADRAO: InstallGateTexts = {
  title: "Install the app",
  description: "It opens from the home screen, full screen, like any app.",
  install: "Install",
  installing: "Installing…",
  iosSteps: ["Tap the Share button", "Choose Add to Home Screen", "Open the app from the new icon"],
  androidSteps: ["Open the browser menu (⋮)", "Choose Install app", "Open the app from the new icon"],
  inAppTitle: "Open in your browser",
  inAppDescription: "This window cannot install apps. Copy the link and paste it in Safari or Chrome.",
  copyLink: "Copy link",
  copied: "Link copied",
  desktopDescription: "Open this address on your phone to install it there.",
};

export type InstallGateProps = {
  appName: string;
  /** The app icon (an <img> or any element). */
  icon?: ReactNode;
  /** Let it through anyway (development, or a desktop version of the app). */
  bypass?: boolean;
  /** Translate or rewrite any text. */
  texts?: Partial<InstallGateTexts>;
  children: ReactNode;
};

/**
 * The app only runs installed: opened from the icon it renders `children`; in a browser it shows how to install,
 * the right way for each place (the install button where the browser offers it, the steps on iPhone, "open in
 * your browser" inside WhatsApp and the like).
 */
export function InstallGate({ appName, icon, bypass = false, texts, children }: InstallGateProps) {
  const env = useEnvironment();
  if (env.standalone || bypass) return children;
  return <InstallPage appName={appName} icon={icon} t={{ ...PADRAO, ...texts }} />;
}

function InstallPage({ appName, icon, t }: { appName: string; icon?: ReactNode; t: InstallGateTexts }) {
  const env = useEnvironment();
  const { state, install } = useInstallPrompt();
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };
  const podeInstalar = state === "available" || state === "installing";

  return (
    <main className="st-install">
      {icon && <span className="st-install__icon">{icon}</span>}
      <h1 className="st-install__title">{env.inAppBrowser ? t.inAppTitle : `${t.title}: ${appName}`}</h1>
      <p className="st-install__description">{env.inAppBrowser ? t.inAppDescription : env.platform === "desktop" && !podeInstalar ? t.desktopDescription : t.description}</p>
      <div className="st-install__body">
        {env.inAppBrowser ? (
          <Button size="large" onClick={copiar}>
            {copiado ? t.copied : t.copyLink}
          </Button>
        ) : podeInstalar ? (
          <Button size="large" state={state === "installing" ? "loading" : "idle"} loadingLabel={t.installing} onClick={() => void install()}>
            {t.install}
          </Button>
        ) : env.platform === "ios" ? (
          <ProgressSteps steps={t.iosSteps.map((text) => ({ text }))} />
        ) : env.platform === "android" ? (
          <ProgressSteps steps={t.androidSteps.map((text) => ({ text }))} />
        ) : (
          <p className="st-install__url">{location.href}</p>
        )}
      </div>
    </main>
  );
}
