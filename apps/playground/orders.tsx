import { useMemo, useState } from "react";

import {
  Alert,
  AsyncImage,
  Avatar,
  ConfirmationSheet,
  DatePicker,
  LazyList,
  List,
  ListPicker,
  Menu,
  NavigationBar,
  OptionsSheet,
  PickerRow,
  Row,
  SearchField,
  Section,
  Sheet,
  Timeline,
  TimePicker,
  ToolbarButton,
  normalizeSearch,
  useToast,
  type ButtonState,
} from "stackui-kit";

const icone = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
const MAIS = icone("M12 5v14M5 12h14");
const FILTRO = icone("M4 6h16M7 12h10M10 18h4");
const RETICENCIAS = icone("M5 12h.01M12 12h.01M19 12h.01");
const COPIAR = icone("M8 8h12v12H8zM4 16V4h12");
const LIXO = icone("M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3");
const PACOTE = icone("M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 9l8-4.5M12 12L4 7.5M12 12v9");

const NOMES = ["Mercadinho do Zé", "Pão Quente", "Casa Verde", "Mercado Central", "Super Bom", "Empório Sul", "Padaria Real", "Atacadão Norte"];
const CIDADES = ["São Paulo", "Santos", "Campinas", "Sorocaba", "Jundiaí", "Bauru", "Marília", "Ribeirão Preto", "Franca", "Piracicaba"];
type Pedido = { id: string; cliente: string; total: number; status: "open" | "sent" };
/** 5,000 orders: the LazyList keeps scrolling smooth. */
const PEDIDOS: Pedido[] = Array.from({ length: 5000 }, (_, i) => ({ id: String(10001 + i), cliente: NOMES[i % NOMES.length], total: ((i * 7919) % 90000) / 100 + 25, status: i % 3 ? "sent" : "open" }));
const moeda = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function Pedidos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"all" | "open" | "sent">("all");
  const [filtrando, setFiltrando] = useState(false);
  const visiveis = useMemo(() => {
    const t = normalizeSearch(busca);
    return PEDIDOS.filter((p) => (filtro === "all" || p.status === filtro) && (!t || normalizeSearch(`${p.cliente} ${p.id}`).includes(t)));
  }, [busca, filtro]);
  return (
    <>
      <NavigationBar
        title="Orders"
        trailing={
          <>
            <ToolbarButton label="Filter" icon={FILTRO} dot={filtro !== "all"} onClick={() => setFiltrando(true)} />
            <Menu label="Add" icon={MAIS} prominent items={[{ label: "New order", icon: MAIS, href: "#/orders/new" }, { label: "New quote", icon: COPIAR, href: "#/orders/new" }]} />
          </>
        }
      />
      <SearchField sticky value={busca} onChange={setBusca} label="Search orders" />
      <List>
        <Section header={`${visiveis.length.toLocaleString("en-US")} orders`} plain>
          <LazyList
            items={visiveis}
            id={(p) => p.id}
            estimatedRowHeight={64}
            render={(p) => <Row leading={<Avatar name={p.cliente} />} title={p.cliente} subtitle={`#${p.id} · ${p.status === "open" ? "Open" : "Sent"}`} value={moeda(p.total)} href={`#/orders/${p.id}`} lineLimit={1} />}
          />
        </Section>
      </List>
      <OptionsSheet
        isPresented={filtrando}
        onDismiss={() => setFiltrando(false)}
        title="Show"
        selection={filtro}
        onChange={setFiltro}
        options={[
          { value: "all", label: "All orders" },
          { value: "open", label: "Open", description: "Still on this device" },
          { value: "sent", label: "Sent", description: "Already with the company" },
        ]}
      />
    </>
  );
}

export function DetalhePedido({ id }: { id: string }) {
  const pedido = PEDIDOS.find((p) => p.id === id) ?? PEDIDOS[0];
  const { show } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [estado, setEstado] = useState<ButtonState>("idle");
  const [apagando, setApagando] = useState(false);
  const [escolhendo, setEscolhendo] = useState(false);
  const [cidade, setCidade] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const enviar = () => {
    setEstado("loading");
    window.setTimeout(() => setEstado("done"), 1200);
    window.setTimeout(() => {
      setConfirmando(false);
      setEstado("idle");
      show("Order sent");
    }, 2200);
  };

  return (
    <>
      <NavigationBar
        title={`Order ${pedido.id}`}
        backHref="#/orders"
        trailing={<Menu label="More" icon={RETICENCIAS} items={[{ label: "Duplicate", icon: COPIAR, onPress: () => show("Order duplicated") }, { label: "Delete", icon: LIXO, destructive: true, onPress: () => setApagando(true) }]} />}
      />
      <List>
        <Section>
          <div style={{ padding: 16 }}>
            <AsyncImage src={`https://picsum.photos/seed/${pedido.id}/800/450`} alt="Products of this order" aspectRatio="16 / 9" width="100%" radius={16} fit="cover" showProgress fallback={PACOTE} />
          </div>
          <Row title="Client" value={pedido.cliente} />
          <Row title="Total" value={moeda(pedido.total)} />
        </Section>
        <Section header="Delivery">
          <PickerRow label="City" value={cidade} onClick={() => setEscolhendo(true)} />
          <Row title="Date" accessory={<DatePicker value={data} onChange={setData} title="Delivery date" locale="en-US" />} />
          <Row title="Time" accessory={<TimePicker value={hora} onChange={setHora} title="Delivery time" />} />
        </Section>
        <Section header="Progress">
          <Timeline
            steps={[
              { title: "Saved on the phone", detail: "Today, 9:12", state: "done" },
              { title: "Sent", detail: pedido.status === "sent" ? "Today, 9:13" : "Goes up when there is signal", state: pedido.status === "sent" ? "done" : "current" },
              { title: "Received by the company", state: pedido.status === "sent" ? "current" : "upcoming" },
              { title: "Invoiced", state: "upcoming" },
            ]}
          />
        </Section>
        <Section>
          <Row title="Send order" centered onClick={() => setConfirmando(true)} />
        </Section>
      </List>

      <ConfirmationSheet
        isPresented={confirmando}
        onDismiss={() => setConfirmando(false)}
        onConfirm={enviar}
        state={estado}
        title="Send order"
        description="Check the order before it goes to the company."
        items={[
          { label: "Client", value: pedido.cliente },
          { label: "City", value: cidade || "Not set" },
          { label: "Total", value: moeda(pedido.total) },
        ]}
        confirmLabel="Send"
        loadingLabel="Sending…"
        doneLabel="Sent"
      />
      <Sheet isPresented={escolhendo} onDismiss={() => setEscolhendo(false)} title="City">
        <ListPicker
          label="City"
          options={CIDADES.map((c) => ({ value: c, label: c }))}
          selection={cidade}
          onChange={(c) => {
            setCidade(c);
            setEscolhendo(false);
          }}
        />
      </Sheet>
      <Alert isPresented={apagando} onDismiss={() => setApagando(false)} title="Delete this order?" message="It leaves this device and cannot be recovered." actions={[{ label: "Cancel", role: "cancel" }, { label: "Delete", role: "destructive", onPress: () => show("Order deleted") }]} />
    </>
  );
}
