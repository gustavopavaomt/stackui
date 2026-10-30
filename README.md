# StackUI

**Build dynamic and elegant PWA applications for iOS and Android with React.**

StackUI gives a React app the look and feel of a native mobile app: navigation that slides, sheets you drag to
close, grouped lists, segmented pickers, toasts, search that hides on scroll, light and dark mode. Install it,
import the components, and ship a Progressive Web App that feels at home on the phone.

> 🚧 Early development. The first release (0.1.0) is on its way.

## Install

```sh
npm install @stackui/react
```

React 19 (`react` and `react-dom`) is the only requirement.

## Use

```tsx
import "@stackui/react/styles.css";
import { App, Text, VStack } from "@stackui/react";

export function Hello() {
  return (
    <App>
      <VStack spacing={8} style={{ padding: 16 }}>
        <Text font="largeTitle">Hello</Text>
        <Text color="secondary">My first StackUI app.</Text>
      </VStack>
    </App>
  );
}
```

## Theming

Every color is a CSS variable. Most apps change only the accent:

```css
:root { --st-tint: #0e8a4a; }
```

Light and dark follow the system. Force one with `<html data-theme="light">` or `<html data-theme="dark">`.

## Develop

This repository holds the library and its showcase site:

| folder | what |
|---|---|
| `packages/react` | the `@stackui/react` package |
| `apps/site` | the showcase site, using the library like any app would |

```sh
npm install
npm run dev      # the showcase site, with every component
npm test
npm run build
```

## License

[MIT](LICENSE)
