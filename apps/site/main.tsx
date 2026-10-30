import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "@stackui/react/styles.css";
import { App, Button, type ButtonState, List, NavigationBar, NavigationStack, Row, Section, Sheet, TabBar, Text, ToolbarButton, VStack } from "@stackui/react";

/* Tiny inline icons for the demo (the library takes any icon element). */
const icone = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
const WIFI = icone("M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 19.5h.01");
const SINO = icone("M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0");
const LUA = icone("M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z");
const ESCUDO = icone("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");

const ENGRENAGEM = icone("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z");
const QUADRADOS = icone("M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z");
const MAIS = icone("M12 5v14M5 12h14");

/** A tiny hash router for the demo: the library works with any router. */
function useHash() {
  const ler = () => location.hash.slice(1) || "/settings";
  const [caminho, setCaminho] = useState(ler);
  useEffect(() => {
    const mudou = () => setCaminho(ler());
    window.addEventListener("hashchange", mudou);
    return () => window.removeEventListener("hashchange", mudou);
  }, []);
  return caminho;
}

const DETALHES: Record<string, string> = { wifi: "Wi-Fi", notifications: "Notifications", focus: "Focus", privacy: "Privacy & Security" };

function Ajustes() {
  return (
    <>
      <NavigationBar title="Settings" subtitle="Build dynamic and elegant PWA applications for iOS and Android with React." trailing={<ToolbarButton label="Add" icon={MAIS} prominent />} />
      <List>
        <Section header="Connections">
          <Row icon={WIFI} iconColor="var(--st-blue)" title="Wi-Fi" value="Home" href="#/settings/wifi" />
          <Row icon={SINO} iconColor="var(--st-red)" title="Notifications" href="#/settings/notifications" />
          <Row icon={LUA} iconColor="var(--st-indigo)" title="Focus" value="Off" href="#/settings/focus" />
        </Section>
        <Section header="Privacy" footer="Your data stays on this device until you choose to share it.">
          <Row icon={ESCUDO} iconColor="var(--st-gray)" title="Privacy & Security" subtitle="Location, camera and microphone" href="#/settings/privacy" />
          <Row title="Version" value="0.0.0" />
        </Section>
        <Section>
          <Row title="Sign out" centered onClick={() => undefined} />
          <Row title="Delete all data" centered destructive onClick={() => undefined} />
        </Section>
      </List>
    </>
  );
}

function Detalhe({ id }: { id: string }) {
  const titulo = DETALHES[id] ?? id;
  return (
    <>
      <NavigationBar title={titulo} backHref="#/settings" />
      <List>
        {Array.from({ length: 4 }, (_, s) => (
          <Section key={s} header={`Group ${s + 1}`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Row key={i} title={`${titulo} option ${i + 1}`} value={i % 2 ? "On" : "Off"} />
            ))}
          </Section>
        ))}
      </List>
    </>
  );
}

function Componentes() {
  const [estado, setEstado] = useState<ButtonState>("idle");
  const [folha, setFolha] = useState(false);
  const salvar = () => {
    setEstado("loading");
    window.setTimeout(() => setEstado("done"), 900);
    window.setTimeout(() => setEstado("idle"), 2600);
  };
  return (
    <>
      <NavigationBar title="Components" />
      <List>
        <Section header="Buttons">
          <VStack spacing={12} style={{ padding: 16 }}>
            <Button state={estado} onClick={salvar} loadingLabel="Saving…" doneLabel="Saved">
              Save changes
            </Button>
            <Button variant="bordered" onClick={() => setFolha(true)}>
              Open a sheet
            </Button>
            <Button variant="destructive">Delete account</Button>
            <Button variant="plain">Plain</Button>
          </VStack>
        </Section>
        <Section header="Text">
          <VStack spacing={6} style={{ padding: 16 }}>
            <Text font="title">Title</Text>
            <Text font="headline">Headline</Text>
            <Text>Body text that wraps across lines like any paragraph would.</Text>
            <Text color="secondary" font="footnote">
              Footnote in the secondary color
            </Text>
          </VStack>
        </Section>
      </List>
      <Sheet isPresented={folha} onDismiss={() => setFolha(false)} title="Share" description="Drag the handle down, tap outside or press Esc to close.">
        <List>
          <Section>
            <Row title="Copy link" onClick={() => setFolha(false)} />
            <Row title="Send by email" onClick={() => setFolha(false)} />
          </Section>
        </List>
      </Sheet>
    </>
  );
}

const ABAS = [
  { id: "settings", label: "Settings", icon: ENGRENAGEM, href: "#/settings" },
  { id: "components", label: "Components", icon: QUADRADOS, href: "#/components" },
];

function tela(caminho: string) {
  const [, aba, detalhe] = caminho.split("/");
  if (aba === "components") return <Componentes />;
  if (detalhe) return <Detalhe id={detalhe} />;
  return <Ajustes />;
}

/** The demo: every component, imported exactly as an app would. It grows with each phase. */
function Demo() {
  const caminho = useHash();
  const aba = caminho.split("/")[1] || "settings";
  return (
    <App>
      <NavigationStack location={caminho} render={(l) => <div style={{ paddingBottom: 120 }}>{tela(l)}</div>} />
      <TabBar items={ABAS} selection={aba} hidden={caminho.split("/").filter(Boolean).length > 1} />
    </App>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
