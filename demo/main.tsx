import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import "@stackui/react/styles.css";
import { App, Button, type ButtonState, List, Row, Section, Text, VStack } from "@stackui/react";

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

/** The demo: every component, imported exactly as an app would. It grows with each phase. */
function Demo() {
  const [estado, setEstado] = useState<ButtonState>("idle");
  const salvar = () => {
    setEstado("loading");
    window.setTimeout(() => setEstado("done"), 900);
    window.setTimeout(() => setEstado("idle"), 2600);
  };
  return (
    <App>
      <VStack spacing={4} style={{ padding: "56px 32px 0" }}>
        <Text font="largeTitle">Settings</Text>
        <Text color="secondary">Build dynamic and elegant PWA applications for iOS and Android with React.</Text>
      </VStack>
      <List>
        <Section header="Connections">
          <Row icon={WIFI} iconColor="var(--st-blue)" title="Wi-Fi" value="Home" href="#wifi" />
          <Row icon={SINO} iconColor="var(--st-red)" title="Notifications" href="#notifications" />
          <Row icon={LUA} iconColor="var(--st-indigo)" title="Focus" value="Off" href="#focus" />
        </Section>
        <Section header="Privacy" footer="Your data stays on this device until you choose to share it.">
          <Row icon={ESCUDO} iconColor="var(--st-gray)" title="Privacy & Security" subtitle="Location, camera and microphone" href="#privacy" />
          <Row title="Version" value="0.0.0" />
        </Section>
        <Section header="Buttons">
          <VStack spacing={12} style={{ padding: 16 }}>
            <Button state={estado} onClick={salvar} loadingLabel="Saving…" doneLabel="Saved">
              Save changes
            </Button>
            <Button variant="bordered">Bordered</Button>
            <Button variant="destructive">Delete account</Button>
            <Button variant="plain">Plain</Button>
          </VStack>
        </Section>
        <Section>
          <Row title="Sign out" centered onClick={() => undefined} />
          <Row title="Delete all data" centered destructive onClick={() => undefined} />
        </Section>
      </List>
    </App>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
