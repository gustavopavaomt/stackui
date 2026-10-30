# StackUI

**Build dynamic and elegant PWA applications for iOS and Android with React.**

StackUI gives a React app the look and feel of a native mobile app: screens that slide, sheets you drag to close,
grouped lists, segmented pickers, toasts that queue, search that hides on scroll, lists of 20,000 rows that stay
smooth, light and dark mode. Install it, import the components, and ship a Progressive Web App that feels at home
on the phone, no app store needed.

Created by [Gustavo Pavão](https://github.com/gustavopavaomt).

**See it live:** [gustavopavaomt.github.io/stackui-site](https://gustavopavaomt.github.io/stackui-site/), every component running inside a phone.

- **Simple.** Layout with `VStack`, `HStack` and `Spacer`; a screen is a `NavigationBar` and a `List`.
- **Own CSS, no setup.** One stylesheet, themed with CSS variables. No Tailwind, no CSS-in-JS, no build plugin.
- **Small and safe.** React is the only dependency. No install scripts. Published from CI with provenance.
- **Accessible.** Real buttons, links, dialogs and radio groups; focus management; reduced motion respected.
- **Router agnostic.** Links take `href` or your router's link component (`as`).

> 🚧 Early development: 0.1.0 is the first release.

## Install

```sh
npm install stackui-kit
```

React 19 (`react` and `react-dom`) is the only requirement.

## A first screen

```tsx
import "stackui-kit/styles.css";
import { App, List, NavigationBar, Row, Section, Toggle } from "stackui-kit";
import { useState } from "react";

export function Settings() {
  const [alerts, setAlerts] = useState(true);
  return (
    <App>
      <NavigationBar title="Settings" />
      <List>
        <Section header="General" footer="You can change this at any time.">
          <Row title="Notifications" accessory={<Toggle isOn={alerts} onChange={setAlerts} label="Notifications" />} />
          <Row title="Language" value="English" href="/settings/language" />
        </Section>
      </List>
    </App>
  );
}
```

## Navigation

`NavigationStack` animates between screens like a native app: pushing slides the new screen in, popping slides it
back, switching tabs crossfades. It works with any router: give it the current location and a function that draws a
location.

```tsx
import { NavigationStack, TabBar } from "stackui-kit";
import { Link, Routes, Route, useLocation } from "react-router";

function Shell() {
  const { pathname } = useLocation();
  return (
    <>
      <NavigationStack
        location={pathname}
        render={(location) => (
          <Routes location={location}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<Order />} />
          </Routes>
        )}
      />
      <TabBar
        selection={pathname.split("/")[1]}
        hidden={pathname.split("/").length > 2}
        items={[
          { id: "orders", label: "Orders", icon: <FolderIcon />, as: Link, props: { to: "/orders" } },
          { id: "settings", label: "Settings", icon: <GearIcon />, as: Link, props: { to: "/settings" } },
        ]}
      />
    </>
  );
}
```

By default the transition comes from the path depth (`/orders` → `/orders/12` is a push); pass `transitionFor` to
decide it yourself. Scroll is remembered per location: going back returns to where the screen was.

## Components

| | |
|---|---|
| **Layout** | `App`, `View`, `VStack`, `HStack`, `ZStack`, `Spacer`, `Divider`, `Text` (the platform type scale: `largeTitle` … `caption2`) |
| **Navigation** | `NavigationStack`, `NavigationBar` (large title that shrinks into the bar), `ToolbarButton`, `ToolbarTextButton`, `TabBar` (floating, with a sliding pill and badges), `Menu` |
| **Lists** | `List`, `Section`, `Row` (icon, subtitle, value, accessory, chevron, link), `AppIcon`, `LazyList` (windowed, recycled cells), `Card` |
| **Controls** | `Button` (with `state`: idle → loading → done), `Toggle`, `Picker` (segmented), `Stepper`, `TextField` (floating label), `TextEditor`, `SearchField` (sticky, hides on scroll), `Badge` |
| **Choosing** | `PickerRow`, `ListPicker` (searchable, thousands of items), `OptionsSheet`, `OptionsList`, `DatePicker` (any locale), `TimePicker` (wheels) |
| **Presentation** | `Sheet` (drag to close, Android back gesture), `ConfirmationSheet`, `Alert` |
| **Feedback** | `ToastProvider` + `useToast` (a queue; update a toast in place), `ProgressView`, `Skeleton`, `SkeletonList`, `Redacted`, `ContentUnavailableView`, `Timeline`, `ProgressSteps`, `ErrorBoundary` |
| **Media** | `AsyncImage` (placeholder, fade, fallback), `Avatar` (monogram or photo) |
| **PWA** | `InstallGate`, `useStandalone`, `useEnvironment`, `useInstallPrompt`, `useIosKeyboardFix` |
| **Barcode** | `BarcodeScanner` from `stackui-kit/barcode` (its own entry: apps that never scan never download it) |

Every text a component shows has an English default and a prop to translate it.

### Examples

```tsx
// A button that shows its own progress
<Button state={saving} loadingLabel="Saving…" doneLabel="Saved" onClick={save}>Save</Button>

// A sheet
<Sheet isPresented={open} onDismiss={() => setOpen(false)} title="Share">…</Sheet>

// Confirm before saving
<ConfirmationSheet isPresented={confirming} onDismiss={close} onConfirm={send} state={state}
  title="Send order" items={[{ label: "Client", value: "Pão Quente" }]} confirmLabel="Send" />

// Toasts
const { show } = useToast();
const t = show("Sending…", "progress");
t.update("Sent", "success", { label: "View", onPress: openOrder });

// 20,000 rows
<LazyList items={clients} id={(c) => c.id} estimatedRowHeight={61}
  render={(c) => <Row leading={<Avatar name={c.name} />} title={c.name} subtitle={c.city} lineLimit={1} />} />

// Only run installed, and show how to install everywhere else
<InstallGate appName="Sales" icon={<img src="/icon-192.png" alt="" />}><MyApp /></InstallGate>
```

### Barcode scanner

```tsx
import { BarcodeScanner } from "stackui-kit/barcode";

<Sheet isPresented={scanning} onDismiss={stop} title="Scan">
  <BarcodeScanner onScan={(code) => find(code)} />
</Sheet>
```

It uses the device's own `BarcodeDetector` where it exists (Chrome on Android). For Safari, also install
`@zxing/browser` and `@zxing/library`: they load only when the camera opens.

## Theming

Every color is a CSS variable (`--st-*`). Most apps change only the accent:

```css
:root { --st-tint: #0e8a4a; }
```

Light and dark follow the system. Force one with `<html data-theme="light">` or `<html data-theme="dark">`.

## Develop

| folder | what |
|---|---|
| `packages/react` | the `stackui` package |
| `apps/playground` | a small app with every component, for development |

```sh
npm install
npm run dev      # the playground
npm test
npm run build
```

## Security

Install scripts are off in this repository, CI audits dependencies, and releases are published from GitHub Actions
with npm provenance. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Gustavo Pavão
