import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Avatar, Card, ErrorBoundary, initials, ProgressSteps, Redacted, ToastProvider, useToast, type ToastHandle } from "../index";

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

const desenhar = (no: React.ReactNode) => act(() => raiz.render(no));
const passar = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const toast = () => caixa.querySelector(".st-toast:not(.st-toast--leaving)");

describe("Toast", () => {
  let show: ReturnType<typeof useToast>["show"];
  function Pega() {
    const t = useToast();
    useEffect(() => {
      show = t.show;
    });
    return null;
  }
  const montar = () =>
    desenhar(
      <ToastProvider>
        <Pega />
      </ToastProvider>,
    );

  it("shows one at a time: the next waits for the current one to leave", () => {
    montar();
    act(() => void show("Saved"));
    act(() => void show("Synced", "info"));
    expect(toast()!.textContent).toBe("Saved");
    expect(caixa.querySelectorAll(".st-toast")).toHaveLength(1);
    // With someone waiting, the current one shortens (2.5 s), then the gap, then the next.
    passar(2500);
    expect(toast()).toBeNull();
    passar(700);
    expect(toast()!.textContent).toBe("Synced");
    expect(toast()!.getAttribute("role")).toBe("status");
  });

  it("progress stays until updated in place; an error is an alert with its action", () => {
    montar();
    let h!: ToastHandle;
    act(() => void (h = show("Sending…", "progress")));
    passar(20000);
    expect(toast()!.textContent).toBe("Sending…");

    const ver = vi.fn();
    act(() => h.update("Not accepted", "error", { label: "View", onPress: ver }));
    expect(toast()!.getAttribute("role")).toBe("alert");
    act(() => caixa.querySelector<HTMLButtonElement>(".st-toast__action")!.click());
    expect(ver).toHaveBeenCalledOnce();
    passar(400);
    expect(caixa.querySelector(".st-toast")).toBeNull();
  });

  it("the same toast twice is shown once", () => {
    montar();
    act(() => void show("Saved"));
    act(() => void show("Saved"));
    passar(4000 + 700);
    expect(caixa.querySelector(".st-toast")).toBeNull();
  });
});

describe("Redacted", () => {
  it("waits before showing the placeholder, and a quick load never shows it", () => {
    const ph = <p>loading</p>;
    desenhar(
      <Redacted isLoading placeholder={ph}>
        <p>data</p>
      </Redacted>,
    );
    expect(caixa.textContent).toBe("");
    passar(250);
    expect(caixa.textContent).toBe("loading");
    desenhar(
      <Redacted isLoading={false} placeholder={ph}>
        <p>data</p>
      </Redacted>,
    );
    expect(caixa.querySelector(".st-fade-in")!.textContent).toBe("data");
  });
});

describe("Avatar, Card, ProgressSteps, ErrorBoundary", () => {
  it("initials skip connecting words and non letters", () => {
    expect(initials("Mercadinho do Zé")).toBe("MZ");
    expect(initials("(REDE MARIA")).toBe("RM");
    expect(initials("Ana")).toBe("AN");
    expect(initials("  ")).toBe("?");
  });

  it("Avatar falls back to the monogram when the photo fails", () => {
    desenhar(<Avatar name="Pão Quente" src="x.png" />);
    act(() => caixa.querySelector("img")!.dispatchEvent(new Event("error")));
    expect(caixa.textContent).toBe("PQ");
  });

  it("Card is a link with href, a button with onClick, a plain surface otherwise", () => {
    desenhar(<Card href="/x">a</Card>);
    expect(caixa.querySelector("a.st-card--interactive")!.getAttribute("href")).toBe("/x");
    desenhar(<Card onClick={() => undefined}>b</Card>);
    expect(caixa.querySelector("button.st-card")!.getAttribute("type")).toBe("button");
    desenhar(<Card>c</Card>);
    expect(caixa.querySelector("div.st-card")!.className).toBe("st-card");
  });

  it("ProgressSteps is an ordered list", () => {
    desenhar(<ProgressSteps steps={[{ text: "Tap Share" }, { text: "Add to Home Screen" }]} />);
    expect(caixa.querySelectorAll("ol > li")).toHaveLength(2);
  });

  it("ErrorBoundary shows a way out and reports the error", () => {
    const relatar = vi.fn();
    let quebrar = true;
    function Tela() {
      if (quebrar) throw new Error("boom");
      return <p>ok</p>;
    }
    const erro = vi.spyOn(console, "error").mockImplementation(() => undefined);
    desenhar(
      <ErrorBoundary onError={relatar}>
        <Tela />
      </ErrorBoundary>,
    );
    expect(caixa.querySelector("[role=alert] h2")!.textContent).toBe("Something went wrong");
    expect(relatar).toHaveBeenCalledOnce();
    quebrar = false;
    act(() => caixa.querySelector("button")!.click());
    expect(caixa.textContent).toBe("ok");
    erro.mockRestore();
  });
});
