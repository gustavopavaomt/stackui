import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Alert, AsyncImage, ConfirmationSheet, DatePicker, environmentOf, InstallGate, LazyList, ListPicker, Menu, OptionsSheet, Timeline, TimePicker } from "../index";

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
const botao = (texto: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent === texto)!;

function digitar(input: HTMLInputElement, texto: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input, texto);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("ConfirmationSheet", () => {
  it("shows the receipt, confirms, and locks closing while saving", () => {
    const confirmar = vi.fn();
    const fechar = vi.fn();
    desenhar(<ConfirmationSheet isPresented onDismiss={fechar} onConfirm={confirmar} title="Send order" items={[{ label: "Client", value: "Pão Quente" }]} confirmLabel="Send" />);
    expect(document.querySelector(".st-receipt dd")!.textContent).toBe("Pão Quente");
    act(() => botao("Send").click());
    expect(confirmar).toHaveBeenCalledOnce();

    desenhar(<ConfirmationSheet isPresented onDismiss={fechar} onConfirm={confirmar} title="Send order" confirmLabel="Send" state="loading" />);
    expect(botao("Go back and review").disabled).toBe(true);
  });
});

describe("OptionsSheet", () => {
  it("marks the chosen option; choosing reports and closes", () => {
    const mudar = vi.fn();
    const fechar = vi.fn();
    desenhar(
      <OptionsSheet
        isPresented
        onDismiss={fechar}
        title="Sort by"
        selection="name"
        onChange={mudar}
        options={[
          { value: "name", label: "Name" },
          { value: "date", label: "Date" },
        ]}
      />,
    );
    const opcoes = document.querySelectorAll<HTMLButtonElement>("[role=option]");
    expect(opcoes[0].getAttribute("aria-selected")).toBe("true");
    act(() => opcoes[1].click());
    expect(mudar).toHaveBeenCalledWith("date");
    expect(fechar).toHaveBeenCalledOnce();
  });
});

describe("Alert", () => {
  it("is an alert dialog; a button runs its action and closes; Esc closes", () => {
    const apagar = vi.fn();
    const fechar = vi.fn();
    desenhar(<Alert isPresented onDismiss={fechar} title="Delete order?" message="This cannot be undone." actions={[{ label: "Cancel", role: "cancel" }, { label: "Delete", role: "destructive", onPress: apagar }]} />);
    const d = document.querySelector("[role=alertdialog]")!;
    expect(document.getElementById(d.getAttribute("aria-describedby")!)!.textContent).toBe("This cannot be undone.");
    act(() => botao("Delete").click());
    expect(apagar).toHaveBeenCalledOnce();
    expect(fechar).toHaveBeenCalledTimes(1);
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(fechar).toHaveBeenCalledTimes(2);
  });
});

describe("Menu", () => {
  it("opens a menu of items; choosing runs it and closes", () => {
    const novo = vi.fn();
    desenhar(<Menu label="More" icon="…" items={[{ label: "Duplicate", onPress: novo }, { label: "Delete", destructive: true }]} />);
    const b = document.querySelector<HTMLButtonElement>("[aria-label=More]")!;
    act(() => b.click());
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelectorAll("[role=menuitem]")).toHaveLength(2);
    act(() => document.querySelector<HTMLButtonElement>("[role=menuitem]")!.click());
    expect(novo).toHaveBeenCalledOnce();
    expect(document.querySelector("[role=menu]")).toBeNull();
  });

  it("a prominent menu with one item runs it directly", () => {
    const novo = vi.fn();
    desenhar(<Menu label="Add" icon="+" prominent items={[{ label: "New order", onPress: novo }]} />);
    act(() => document.querySelector<HTMLButtonElement>("[aria-label='New order']")!.click());
    expect(novo).toHaveBeenCalledOnce();
  });
});

describe("LazyList and ListPicker", () => {
  it("LazyList draws a short list whole", () => {
    desenhar(<LazyList items={["a", "b", "c"]} id={(x) => x} estimatedRowHeight={44} render={(x) => <span>{x}</span>} />);
    expect(caixa.querySelectorAll("li")).toHaveLength(3);
  });

  it("ListPicker searches ignoring accents and says when nothing matches", () => {
    const opcoes = ["São Paulo", "Santos", "Campinas", "Sorocaba", "Jundiaí", "Bauru", "Marília"].map((n) => ({ value: n, label: n }));
    desenhar(<ListPicker label="City" options={opcoes} selection="" onChange={vi.fn()} />);
    expect(caixa.querySelector(".st-list-picker__count")!.textContent).toBe("7 items");
    digitar(caixa.querySelector("input")!, "sao");
    expect(caixa.querySelectorAll("[role=option]")).toHaveLength(1);
    expect(caixa.querySelector(".st-list-picker__count")!.textContent).toBe("1 of 7");
    digitar(caixa.querySelector("input")!, "xyz");
    expect(caixa.querySelector(".st-list-picker__count")!.textContent).toBe("Nothing with that name");
  });
});

describe("DatePicker and TimePicker", () => {
  it("DatePicker picks a day in the calendar and blocks days after max", () => {
    vi.setSystemTime(new Date(2026, 9, 30, 10));
    const mudar = vi.fn();
    desenhar(<DatePicker value="2026-10-15" onChange={mudar} max="2026-10-30" locale="en-US" />);
    act(() => caixa.querySelector<HTMLButtonElement>(".st-date-button")!.click());
    const dias = [...document.querySelectorAll<HTMLButtonElement>(".st-calendar__day")];
    expect(dias.find((d) => d.textContent === "31")!.disabled).toBe(true);
    expect(dias.find((d) => d.textContent === "15")!.getAttribute("aria-selected")).toBe("true");
    act(() => dias.find((d) => d.textContent === "20")!.click());
    expect(mudar).toHaveBeenCalledWith("2026-10-20");
    act(() => caixa.querySelector<HTMLButtonElement>(".st-date-button")!.click());
    act(() => botao("Yesterday").click());
    expect(mudar).toHaveBeenLastCalledWith("2026-10-29");
  });

  it("TimePicker: Now and Clear", () => {
    vi.setSystemTime(new Date(2026, 9, 30, 9, 5));
    const mudar = vi.fn();
    desenhar(<TimePicker value="" onChange={mudar} />);
    expect(caixa.querySelector(".st-date-button")!.textContent).toBe("--:--");
    act(() => caixa.querySelector<HTMLButtonElement>(".st-date-button")!.click());
    act(() => botao("Now").click());
    expect(mudar).toHaveBeenLastCalledWith("09:05");
    act(() => caixa.querySelector<HTMLButtonElement>(".st-date-button")!.click());
    act(() => botao("Clear").click());
    expect(mudar).toHaveBeenLastCalledWith("");
  });
});

describe("Timeline and AsyncImage", () => {
  it("Timeline marks the current step", () => {
    desenhar(
      <Timeline
        steps={[
          { title: "Saved", state: "done" },
          { title: "Sent", state: "current", detail: "Sending…" },
          { title: "Received", state: "upcoming" },
        ]}
      />,
    );
    expect(caixa.querySelector("[aria-current=step]")!.textContent).toContain("Sent");
    expect(caixa.querySelectorAll(".st-timeline__marker--done")).toHaveLength(1);
  });

  it("AsyncImage shows the fallback when there is no image or it fails", () => {
    desenhar(<AsyncImage alt="" fallback={<span>no photo</span>} />);
    expect(caixa.textContent).toBe("no photo");
    desenhar(<AsyncImage src="x.png" alt="Rice" fallback={<span>no photo</span>} />);
    act(() => caixa.querySelector("img")!.dispatchEvent(new Event("error")));
    expect(caixa.textContent).toBe("no photo");
  });
});

describe("PWA", () => {
  const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
  const WHATSAPP_ANDROID = "Mozilla/5.0 (Linux; Android 14; SM-S911B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0 Mobile Safari/537.36 WhatsApp/2.24";
  const IPAD = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

  it("reads the environment from the user agent", () => {
    expect(environmentOf({ userAgent: IPHONE, maxTouchPoints: 5, displayStandalone: false })).toMatchObject({ platform: "ios", iosBrowser: "safari", iosVersion: 17.4, inAppBrowser: false, standalone: false });
    expect(environmentOf({ userAgent: WHATSAPP_ANDROID, maxTouchPoints: 5, displayStandalone: false })).toMatchObject({ platform: "android", inAppBrowser: true });
    expect(environmentOf({ userAgent: IPAD, maxTouchPoints: 5, displayStandalone: false }).platform).toBe("ios");
    expect(environmentOf({ userAgent: IPHONE, maxTouchPoints: 5, iosStandalone: true, displayStandalone: false }).standalone).toBe(true);
  });

  it("InstallGate shows how to install in a browser, and lets the app through with bypass", () => {
    desenhar(
      <InstallGate appName="Sales">
        <p>the app</p>
      </InstallGate>,
    );
    expect(caixa.querySelector("h1")!.textContent).toBe("Install the app: Sales");
    desenhar(
      <InstallGate appName="Sales" bypass>
        <p>the app</p>
      </InstallGate>,
    );
    expect(caixa.textContent).toBe("the app");
  });
});
