import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Badge, normalizeSearch, Picker, SearchField, Stepper, TextField, Toggle } from "../index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let raiz: Root;
let caixa: HTMLDivElement;

beforeEach(() => {
  caixa = document.createElement("div");
  document.body.append(caixa);
  raiz = createRoot(caixa);
});

afterEach(() => {
  act(() => raiz.unmount());
  caixa.remove();
});

const desenhar = (no: React.ReactNode) => act(() => raiz.render(no));

/** Types into a controlled input the way React listens to it. */
function digitar(input: HTMLInputElement, texto: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input, texto);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("Toggle", () => {
  it("is a labelled switch that flips, and ignores taps while busy", () => {
    const mudar = vi.fn();
    desenhar(<Toggle isOn={false} onChange={mudar} label="Notifications" />);
    const s = caixa.querySelector<HTMLButtonElement>("[role=switch]")!;
    expect(s.getAttribute("aria-checked")).toBe("false");
    expect(s.getAttribute("aria-label")).toBe("Notifications");
    act(() => s.click());
    expect(mudar).toHaveBeenCalledWith(true);

    desenhar(<Toggle isOn onChange={mudar} label="Notifications" busy />);
    expect(s.disabled).toBe(true);
    expect(s.getAttribute("aria-busy")).toBe("true");
  });
});

describe("Picker", () => {
  const opcoes = [
    { value: "delivery", label: "Delivery" },
    { value: "pickup", label: "Pickup" },
  ] as const;

  it("is a radio group; tapping another option reports it, tapping the chosen one does not", () => {
    const mudar = vi.fn();
    desenhar(<Picker selection="pickup" onChange={mudar} options={[...opcoes]} label="Mode" />);
    const radios = caixa.querySelectorAll<HTMLButtonElement>("[role=radio]");
    expect(caixa.querySelector("[role=radiogroup]")!.getAttribute("aria-label")).toBe("Mode");
    expect(radios[1].getAttribute("aria-checked")).toBe("true");
    expect(caixa.querySelector<HTMLElement>(".st-segmented")!.style.getPropertyValue("--st-seg-i")).toBe("1");
    act(() => radios[1].click());
    act(() => radios[0].click());
    expect(mudar).toHaveBeenCalledOnce();
    expect(mudar).toHaveBeenCalledWith("delivery");
  });
});

describe("TextField", () => {
  it("labels its input and describes the error", () => {
    desenhar(<TextField label="Email" error="Invalid email" defaultValue="x" />);
    const input = caixa.querySelector("input")!;
    expect(caixa.querySelector(`label[for="${input.id}"]`)!.textContent).toBe("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)!.textContent).toBe("Invalid email");
  });
});

describe("Stepper", () => {
  it("steps within min and max, accepts a typed comma, and ignores an empty field", () => {
    const mudar = vi.fn();
    desenhar(<Stepper value={0} onChange={mudar} label="Quantity" max={5} />);
    const [menos, mais] = caixa.querySelectorAll<HTMLButtonElement>("button");
    expect(menos.disabled).toBe(true);
    act(() => mais.click());
    expect(mudar).toHaveBeenLastCalledWith(1);

    const input = caixa.querySelector("input")!;
    digitar(input, "2,5");
    expect(mudar).toHaveBeenLastCalledWith(2.5);
    digitar(input, "9");
    expect(mudar).toHaveBeenLastCalledWith(5);
    mudar.mockClear();
    digitar(input, "");
    expect(mudar).not.toHaveBeenCalled();
  });
});

describe("Badge and SearchField", () => {
  it("Badge carries its tone", () => {
    desenhar(<Badge tone="warning">Pending</Badge>);
    expect(caixa.querySelector(".st-badge--warning")!.textContent).toBe("Pending");
  });

  it("SearchField types and clears", () => {
    const mudar = vi.fn();
    desenhar(<SearchField value="" onChange={mudar} label="Search clients" />);
    expect(caixa.querySelector("[aria-label='Clear search']")).toBeNull();
    digitar(caixa.querySelector("input")!, "ana");
    expect(mudar).toHaveBeenLastCalledWith("ana");

    desenhar(<SearchField value="ana" onChange={mudar} label="Search clients" />);
    act(() => caixa.querySelector<HTMLButtonElement>("[aria-label='Clear search']")!.click());
    expect(mudar).toHaveBeenLastCalledWith("");
  });

  it("normalizeSearch ignores accents and case", () => {
    expect(normalizeSearch("  São JOÃO ")).toBe("sao joao");
  });
});
