import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@stackui/react/styles.css";
import { App, Divider, HStack, Spacer, Text, VStack } from "@stackui/react";

/** The demo: every component, imported exactly as an app would. It grows with each phase. */
function Demo() {
  return (
    <App>
      <VStack spacing={24} style={{ padding: "64px 16px 32px" }}>
        <Text font="largeTitle">StackUI</Text>
        <Text color="secondary">Build dynamic and elegant PWA applications for iOS and Android with React.</Text>
        <VStack spacing={8}>
          <Text font="footnote" color="secondary">
            TEXT STYLES
          </Text>
          {(["title", "title2", "title3", "headline", "body", "callout", "subheadline", "footnote", "caption", "caption2"] as const).map((f) => (
            <Text key={f} font={f}>
              {f}
            </Text>
          ))}
        </VStack>
        <Divider />
        <HStack>
          <Text>Leading</Text>
          <Spacer />
          <Text color="tint">Trailing</Text>
        </HStack>
      </VStack>
    </App>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
