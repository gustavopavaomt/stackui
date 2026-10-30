import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Button, List, Row, Section } from "../index";

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
  vi.useRealTimers();
});

const desenhar = (no: React.ReactNode) => act(() => raiz.render(no));
const botao = () => caixa.querySelector("button")!;

describe("Button", () => {
  it("is a full-width prominent button by default", () => {
    desenhar(<Button>Save</Button>);
    expect(botao().className).toBe("st-button st-button--prominent st-button--large");
    expect(botao().textContent).toBe("Save");
    expect(botao().type).toBe("button");
  });

  it("goes idle → loading → done without accepting taps while busy, and keeps loading visible a minimum time", () => {
    vi.useFakeTimers();
    const toque = vi.fn();
    desenhar(
      <Button state="loading" onClick={toque} loadingLabel="Saving…" doneLabel="Saved">
        Save
      </Button>,
    );
    act(() => vi.advanceTimersByTime(0));
    expect(botao().disabled).toBe(true);
    expect(botao().getAttribute("aria-busy")).toBe("true");
    expect(botao().querySelector("[role=progressbar]")).not.toBeNull();

    desenhar(
      <Button state="done" onClick={toque} loadingLabel="Saving…" doneLabel="Saved">
        Save
      </Button>,
    );
    act(() => vi.advanceTimersByTime(100));
    expect(botao().textContent).toBe("Saving…"); // still within the minimum
    act(() => vi.advanceTimersByTime(400));
    expect(botao().textContent).toBe("Saved");
    expect(botao().className).toContain("st-button--done");
  });
});

describe("List, Section and Row", () => {
  it("draws the header, the card and the footer", () => {
    desenhar(
      <List>
        <Section header="General" footer="Applies to every device." id="geral">
          <Row title="About" />
        </Section>
      </List>,
    );
    const secao = caixa.querySelector("section")!;
    expect(secao.getAttribute("aria-labelledby")).toBe("geral-header");
    expect(secao.querySelector(".st-section__title")!.textContent).toBe("General");
    expect(secao.querySelector(".st-section__card .st-row")).not.toBeNull();
    expect(secao.querySelector(".st-section__footer")!.textContent).toBe("Applies to every device.");
  });

  it("a row with href is a link with the chevron; with onClick a button; otherwise static", () => {
    const toque = vi.fn();
    desenhar(
      <Section>
        <Row title="Wi-Fi" value="Home" href="/wifi" />
        <Row title="Sign out" centered onClick={toque} />
        <Row title="Version" value="1.0" />
      </Section>,
    );
    const [link, acao, fixa] = caixa.querySelectorAll(".st-row");
    expect(link.tagName).toBe("A");
    expect(link.querySelector(".st-row__chevron")).not.toBeNull();
    expect(link.querySelector(".st-row__value")!.textContent).toBe("Home");
    expect(acao.tagName).toBe("BUTTON");
    expect(acao.querySelector(".st-row__title--tint")).not.toBeNull();
    act(() => (acao as HTMLButtonElement).click());
    expect(toque).toHaveBeenCalledOnce();
    expect(fixa.tagName).toBe("DIV");
    expect(fixa.querySelector(".st-row__chevron")).toBeNull();
  });

  it("navigates with the app's router link through `as`", () => {
    function LinkDoRoteador({ to, ...props }: { to: string } & React.HTMLAttributes<HTMLAnchorElement>) {
      return <a data-to={to} {...props} />;
    }
    desenhar(<Row title="Profile" as={LinkDoRoteador} to="/profile" />);
    const linha = caixa.querySelector(".st-row")!;
    expect(linha.getAttribute("data-to")).toBe("/profile");
    expect(linha.querySelector(".st-row__chevron")).not.toBeNull();
  });
});
