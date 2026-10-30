import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "../components/button";

/** Product codes (EAN-13 is the one on most packages). */
const FORMATOS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];

type DetectorNativo = { detect: (fonte: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type ClasseDetector = new (opcoes: { formats: string[] }) => DetectorNativo;

export type BarcodeScannerTexts = {
  aim: string;
  slow: string;
  deniedTitle: string;
  deniedDescription: string;
  failedTitle: string;
  failedDescription: string;
  unsupportedDescription: string;
  retry: string;
};

const PADRAO: BarcodeScannerTexts = {
  aim: "Point at the barcode.",
  slow: "Not reading? Move closer, with more light, or type the code.",
  deniedTitle: "Allow the camera",
  deniedDescription: "To read the barcode, the app needs the camera. Tap Try again and allow it.",
  failedTitle: "The camera did not open",
  failedDescription: "Close other apps that may be using the camera and try again.",
  unsupportedDescription: "This browser does not let the app use the camera.",
  retry: "Try again",
};

/** Without reading anything for this long, the hint suggests getting closer or typing the code. */
const DEMORA_MS = 8_000;

export type BarcodeScannerProps = {
  /** Called once with the code read (the device vibrates). */
  onScan: (code: string) => void;
  texts?: Partial<BarcodeScannerTexts>;
};

/**
 * The camera reading a barcode, offline. Uses the device's own `BarcodeDetector` where it exists (Chrome on
 * Android); elsewhere (Safari) it loads ZXing only when the camera opens. Install `@zxing/browser` and
 * `@zxing/library` to support Safari. Put it in a `Sheet`.
 */
export function BarcodeScanner({ onScan, texts }: BarcodeScannerProps) {
  const t = { ...PADRAO, ...texts };
  const video = useRef<HTMLVideoElement>(null);
  const [erro, setErro] = useState<{ title: string; description: string } | null>(null);
  const [tentativa, setTentativa] = useState(0);
  // The attempt in which the time ran out: "Try again" starts counting again without resetting anything by hand.
  const [demorouNa, setDemorouNa] = useState<number | null>(null);
  const leu = useRef(false);
  const aoLer = useRef(onScan);
  useLayoutEffect(() => {
    aoLer.current = onScan;
  });

  useEffect(() => {
    const relogio = window.setTimeout(() => setDemorouNa(tentativa), DEMORA_MS);
    return () => window.clearTimeout(relogio);
  }, [tentativa]);

  useEffect(() => {
    let vivo = true;
    let fluxo: MediaStream | null = null;
    let parar: (() => void) | undefined;
    const entregar = (codigo: string) => {
      if (leu.current || !vivo) return;
      leu.current = true;
      navigator.vibrate?.(40);
      aoLer.current(codigo);
    };

    void (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setErro({ title: t.failedTitle, description: t.unsupportedDescription });
      try {
        fluxo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch (e) {
        const negou = e instanceof DOMException && e.name === "NotAllowedError";
        return setErro(negou ? { title: t.deniedTitle, description: t.deniedDescription } : { title: t.failedTitle, description: t.failedDescription });
      }
      const el = video.current;
      if (!vivo || !el) return fluxo.getTracks().forEach((x) => x.stop());
      el.srcObject = fluxo;
      await el.play().catch(() => undefined);

      const Nativo = (window as unknown as { BarcodeDetector?: ClasseDetector }).BarcodeDetector;
      if (Nativo) {
        const detector = new Nativo({ formats: FORMATOS });
        let quadro = 0;
        const olhar = async () => {
          if (!vivo || leu.current) return;
          const [achado] = await detector.detect(el).catch(() => []);
          if (achado?.rawValue) entregar(achado.rawValue);
          else quadro = window.setTimeout(() => void olhar(), 150);
        };
        void olhar();
        parar = () => window.clearTimeout(quadro);
        return;
      }
      try {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
        if (!vivo) return;
        const dicas = new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.CODE_128]]]);
        const controle = await new BrowserMultiFormatReader(dicas).decodeFromVideoElement(el, (r) => {
          if (r) entregar(r.getText());
        });
        parar = () => controle.stop();
      } catch {
        if (vivo) setErro({ title: t.failedTitle, description: t.unsupportedDescription });
      }
    })();

    return () => {
      vivo = false;
      parar?.();
      fluxo?.getTracks().forEach((x) => x.stop());
    };
    // Texts are read when the camera opens; a new attempt reads them again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tentativa]);

  if (erro)
    return (
      <div className="st-scanner st-scanner--error" role="alert">
        <h3 className="st-scanner__title">{erro.title}</h3>
        <p className="st-scanner__description">{erro.description}</p>
        <Button
          onClick={() => {
            setErro(null);
            setTentativa((n) => n + 1);
          }}
        >
          {t.retry}
        </Button>
      </div>
    );
  return (
    <div className="st-scanner">
      <div className="st-scanner__frame">
        <video ref={video} playsInline muted autoPlay className="st-scanner__video" />
        {/* The aim: the wide, low band of a barcode. */}
        <div aria-hidden className="st-scanner__aim" />
      </div>
      <p className="st-scanner__hint" aria-live="polite">
        {demorouNa === tentativa ? t.slow : t.aim}
      </p>
    </div>
  );
}
