import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Sheet } from "../index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let raiz: Root;
let caixa: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers();
  caixa = document.createElement("div");
  document.body.append(caixa);
  raiz = createRoot(caixa);
});

afterEach(() => {
  act(() => raiz.unmount());
  caixa.remove();
  vi.useRealTimers();
});

const dialogo = () => document.querySelector<HTMLElement>("[role=dialog]");
const desenhar = (props: Partial<React.ComponentProps<typeof Sheet>> & { onDismiss: () => void }) =>
  act(() =>
    raiz.render(
      <Sheet isPresented title="Options" {...props}>
        <p>content</p>
      </Sheet>,
    ),
  );

describe("Sheet", () => {
  it("opens in a portal as a modal dialog titled by its title, and locks the page scroll", () => {
    desenhar({ onDismiss: vi.fn() });
    const d = dialogo()!;
    expect(d.getAttribute("aria-modal")).toBe("true");
    expect(document.getElementById(d.getAttribute("aria-labelledby")!)!.textContent).toBe("Options");
    expect(caixa.contains(d)).toBe(false); // portal to <body>
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("Esc, a tap outside and the close button ask to dismiss", () => {
    const fechar = vi.fn();
    desenhar({ onDismiss: fechar });
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    act(() => document.querySelector<HTMLElement>(".st-sheet-backdrop")!.click());
    act(() => document.querySelector<HTMLButtonElement>("[aria-label=Close]")!.click());
    expect(fechar).toHaveBeenCalledTimes(3);
  });

  it("a tap inside does not close it", () => {
    const fechar = vi.fn();
    desenhar({ onDismiss: fechar });
    act(() => dialogo()!.click());
    expect(fechar).not.toHaveBeenCalled();
  });

  it("while interactiveDismissDisabled, nothing closes it", () => {
    const fechar = vi.fn();
    desenhar({ onDismiss: fechar, interactiveDismissDisabled: true });
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    act(() => document.querySelector<HTMLElement>(".st-sheet-backdrop")!.click());
    expect(fechar).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLButtonElement>("[aria-label=Close]")!.disabled).toBe(true);
  });

  it("stays on screen while sliding out, then unmounts and gives the page scroll back", () => {
    desenhar({ onDismiss: vi.fn() });
    act(() =>
      raiz.render(
        <Sheet isPresented={false} title="Options" onDismiss={vi.fn()}>
          <p>content</p>
        </Sheet>,
      ),
    );
    expect(dialogo()).not.toBeNull();
    act(() => vi.advanceTimersByTime(400));
    expect(dialogo()).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("shows a back button when there is an inner screen behind", () => {
    const voltar = vi.fn();
    desenhar({ onDismiss: vi.fn(), onBack: voltar, backLabel: "Voltar" });
    act(() => document.querySelector<HTMLButtonElement>("[aria-label=Voltar]")!.click());
    expect(voltar).toHaveBeenCalledOnce();
  });
});
