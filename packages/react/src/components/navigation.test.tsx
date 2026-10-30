import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { NavigationBar, NavigationStack, TabBar, ToolbarButton, transitionByDepth } from "../index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let raiz: Root;
let caixa: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
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

describe("NavigationBar", () => {
  it("a root screen has the large title as its heading and no back button", () => {
    desenhar(<NavigationBar title="Orders" />);
    expect(caixa.querySelector("h1")!.textContent).toBe("Orders");
    expect(caixa.querySelector("[aria-label=Back]")).toBeNull();
  });

  it("the back button calls onBack, or is a link with backHref", () => {
    const voltar = vi.fn();
    desenhar(<NavigationBar title="Order 12" onBack={voltar} />);
    act(() => caixa.querySelector<HTMLButtonElement>("[aria-label=Back]")!.click());
    expect(voltar).toHaveBeenCalledOnce();

    desenhar(<NavigationBar title="Order 12" backHref="/orders" backLabel="Voltar" />);
    expect(caixa.querySelector("a[aria-label=Voltar]")!.getAttribute("href")).toBe("/orders");
  });

  it("inline mode puts the heading in the bar; largeTitleContent replaces the visible title", () => {
    desenhar(<NavigationBar title="Settings" displayMode="inline" />);
    expect(caixa.querySelector(".st-navbar h1")!.textContent).toBe("Settings");
    expect(caixa.querySelector(".st-large-title")).toBeNull();

    desenhar(<NavigationBar title="Home" largeTitleContent={<img alt="" src="logo.png" />} />);
    const h1 = caixa.querySelector(".st-large-title h1")!;
    expect(h1.querySelector(".st-visually-hidden")!.textContent).toBe("Home");
    expect(h1.querySelector("img")).not.toBeNull();
  });

  it("ToolbarButton is labelled for screen readers and can be prominent with a dot", () => {
    desenhar(<ToolbarButton label="New order" icon="+" prominent dot />);
    const b = caixa.querySelector("button")!;
    expect(b.getAttribute("aria-label")).toBe("New order");
    expect(b.className).toContain("st-glass-button--prominent");
    expect(b.querySelector(".st-glass-button__dot")).not.toBeNull();
  });
});

describe("NavigationStack", () => {
  it("guesses the transition from the path depth", () => {
    expect(transitionByDepth("/orders", "/orders/12")).toBe("push");
    expect(transitionByDepth("/orders/12?tab=items", "/orders")).toBe("pop");
    expect(transitionByDepth("/orders", "/clients")).toBe("tab");
  });

  it("keeps the leaving screen with its own location while animating, then only the new one", () => {
    const tela = (l: string) => <p>screen {l}</p>;
    desenhar(<NavigationStack location="/orders" render={tela} />);
    desenhar(<NavigationStack location="/orders/12" render={tela} />);

    const telas = caixa.querySelectorAll(".st-navstack__screen");
    expect(telas).toHaveLength(2);
    expect(telas[0].textContent).toBe("screen /orders");
    expect(telas[0].className).toContain("--exit-push");
    expect(telas[0].hasAttribute("inert")).toBe(true);
    expect(telas[1].className).toContain("--enter-push");

    act(() => vi.advanceTimersByTime(400));
    const fim = caixa.querySelectorAll(".st-navstack__screen");
    expect(fim).toHaveLength(1);
    expect(fim[0].textContent).toBe("screen /orders/12");
    expect(fim[0].className).toBe("st-navstack__screen");
  });

  it("going back restores where the screen was scrolled; opening starts at the top", () => {
    const tela = (l: string) => <p>{l}</p>;
    desenhar(<NavigationStack location="/orders" render={tela} />);
    Object.defineProperty(window, "scrollY", { value: 480, configurable: true });
    desenhar(<NavigationStack location="/orders/12" render={tela} />);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
    act(() => vi.advanceTimersByTime(400));

    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    desenhar(<NavigationStack location="/orders" render={tela} />);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 480);
  });
});

describe("TabBar", () => {
  const itens = [
    { id: "home", label: "Home", icon: "H" },
    { id: "orders", label: "Orders", icon: "O", badge: 120 },
  ];

  it("marks the selected tab, shows only its name, and reports taps", () => {
    const escolher = vi.fn();
    desenhar(<TabBar items={itens} selection="home" onSelect={escolher} />);
    const botoes = caixa.querySelectorAll<HTMLButtonElement>(".st-tabbar__link");
    expect(botoes[0].getAttribute("aria-current")).toBe("page");
    expect(botoes[0].querySelector(".st-tabbar__label")!.textContent).toBe("Home");
    expect(botoes[1].querySelector(".st-visually-hidden")!.textContent).toBe("Orders");
    expect(botoes[1].querySelector(".st-tabbar__badge")!.textContent).toBe("99+");
    act(() => botoes[1].click());
    expect(escolher).toHaveBeenCalledWith("orders");
  });

  it("hidden slides out and takes the bar out of the tab order", () => {
    desenhar(<TabBar items={itens} selection="home" hidden />);
    const nav = caixa.querySelector("nav")!;
    expect(nav.className).toContain("st-tabbar--hidden");
    expect(nav.hasAttribute("inert")).toBe(true);
  });
});
