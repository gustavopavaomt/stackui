import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { App, Divider, HStack, Spacer, Text, VStack } from "../index";

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

describe("Text", () => {
  it("renders the platform style and keeps titles as headings", () => {
    desenhar(
      <>
        <Text font="largeTitle">Settings</Text>
        <Text font="footnote" color="secondary">
          Version 1.0
        </Text>
      </>,
    );
    const [titulo, nota] = caixa.children;
    expect(titulo.tagName).toBe("H1");
    expect(titulo.className).toBe("st-text st-text--largeTitle");
    expect(nota.tagName).toBe("P");
    expect(nota.className).toBe("st-text st-text--footnote st-text--secondary");
  });

  it("truncates to one line and can render as another element", () => {
    desenhar(
      <Text as="span" lineLimit={1}>
        A very long name
      </Text>,
    );
    expect(caixa.firstElementChild!.tagName).toBe("SPAN");
    expect(caixa.firstElementChild!.className).toContain("st-text--lineLimit");
  });
});

describe("stacks", () => {
  it("VStack and HStack set direction, spacing and alignment", () => {
    desenhar(
      <VStack spacing={8} alignment="leading">
        <HStack spacing={4}>
          <Text>A</Text>
          <Spacer />
          <Text>B</Text>
        </HStack>
        <Divider />
      </VStack>,
    );
    const v = caixa.firstElementChild as HTMLElement;
    expect(v.className).toBe("st-stack st-vstack");
    expect(v.style.gap).toBe("8px");
    expect(v.style.alignItems).toBe("flex-start");
    const h = v.firstElementChild as HTMLElement;
    expect(h.className).toBe("st-stack st-hstack");
    expect(h.style.alignItems).toBe("center"); // HStack centers by default
    expect(h.querySelector(".st-spacer")).not.toBeNull();
    expect(v.querySelector("hr.st-divider--horizontal")).not.toBeNull();
  });
});

describe("App", () => {
  it("wraps the app with the root class and keeps the caller's class", () => {
    desenhar(<App className="minha">x</App>);
    expect(caixa.firstElementChild!.className).toBe("st-app minha");
  });
});
