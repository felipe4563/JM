import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MessageCircle, Home, Store, Building2, Users, BadgeCheck, Wrench, Headset, UserCheck,
  Package, Tag, Percent, Truck, Gift, Phone, MapPin, Clock, Menu, X, Check, ShieldCheck, Handshake, Lock,
  ChevronRight, Settings2, Smartphone, Cctv, HardDrive,
} from 'lucide-react';
import { api, bs, conDescuento } from '../api';
import { EMPRESA, waLink } from '../config';
import { useApi, FotoProducto, IconoServicio } from '../components/ui';
import ProductoModal from '../components/ProductoModal';

const NAV = [
  ['#catalogo', 'Catálogo'], ['#kits', 'Kits'], ['#accesorios', 'Accesorios'],
  ['#servicios', 'Servicios'], ['#promociones', 'Promociones'], ['#contacto', 'Contacto'],
];

export default function Catalogo() {
  const [verId, setVerId] = useState(null);
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <QuienesSomos />
      <SeccionCatalogo onVer={setVerId} />
      <SeccionKits />
      <SeccionAccesorios onVer={setVerId} />
      <SeccionServicios />
      <SeccionPromociones />
      <SeccionApps />
      <SeccionContacto />
      <Footer />
      <a href={waLink('Hola JM, quiero información sobre cámaras de seguridad.')} target="_blank" rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
        aria-label="Escribir por WhatsApp">
        <MessageCircle size={28} />
      </a>
      <ProductoModal id={verId} onClose={() => setVerId(null)} />
    </div>
  );
}

// ================= Navegación =================
function Navbar() {
  const [abierto, setAbierto] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-marino-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#inicio" className="flex items-center gap-3">
          <img src="/logo.png" alt="JM" className="h-11 w-11 rounded-full ring-2 ring-azul-500/60" />
          <div className="leading-tight">
            <p className="font-display text-base font-extrabold text-white">JM</p>
            <p className="text-[11px] font-medium tracking-wide text-plata-300">Seguridad y Tecnología</p>
          </div>
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(([href, t]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-plata-300 transition hover:bg-white/5 hover:text-white">{t}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={waLink('Hola JM, quiero una cotización.')} target="_blank" rel="noreferrer" className="btn-wa hidden sm:inline-flex">
            <MessageCircle size={18} /> Cotizar
          </a>
          <button className="rounded-lg p-2 text-white lg:hidden" onClick={() => setAbierto(!abierto)} aria-label="Menú">
            {abierto ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {abierto && (
        <nav className="border-t border-white/10 px-4 pb-4 lg:hidden">
          {NAV.map(([href, t]) => (
            <a key={href} href={href} onClick={() => setAbierto(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-plata-300 hover:bg-white/5">{t}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

// ================= Portada =================
function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-marino-900 text-white">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-azul-600/25 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cian-400/30 bg-cian-400/10 px-3 py-1 text-xs font-semibold text-cian-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cian-400" /> Catálogo 2026
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Cámaras de seguridad <span className="bg-gradient-to-r from-azul-500 to-cian-400 bg-clip-text text-transparent">y equipos tecnológicos</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-plata-300">
            Tu seguridad es nuestra prioridad. Venta, instalación y soporte técnico para hogares, negocios y empresas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalogo" className="btn-primary px-6 py-3 text-base">Ver catálogo <ChevronRight size={18} /></a>
            <a href={waLink('Hola JM, quiero asesoría para instalar cámaras.')} target="_blank" rel="noreferrer" className="btn border border-white/20 px-6 py-3 text-base text-white hover:bg-white/10">
              <MessageCircle size={18} /> Pedir asesoría
            </a>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-4 gap-2">
            {[[Home, 'Hogares'], [Store, 'Negocios'], [Building2, 'Oficinas'], [Users, 'Comunidades']].map(([I, t]) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-center">
                <I className="mx-auto text-cian-400" size={22} />
                <p className="mt-1.5 text-xs font-medium text-plata-300">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="glow-ring absolute inset-[-15%] rounded-full" />
          <img src="/logo.png" alt="JM Cámaras de Seguridad" className="relative w-full rounded-full shadow-2xl shadow-azul-600/40 ring-4 ring-white/10" />
        </div>
      </div>
    </section>
  );
}

function QuienesSomos() {
  const items = [
    [BadgeCheck, 'Productos de alta calidad', 'Equipos confiables y con garantía.'],
    [Wrench, 'Instalación profesional', 'Trabajo limpio, ordenado y seguro.'],
    [Headset, 'Soporte técnico', 'Te acompañamos después de la compra.'],
    [UserCheck, 'Asesoría personalizada', 'Te ayudamos a elegir lo que necesitas.'],
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-5 lg:items-center">
        <div className="lg:col-span-2">
          <p className="eyebrow">¿Quiénes somos?</p>
          <h2 className="section-title mt-2">¡Tu tranquilidad es nuestra meta!</h2>
          <p className="mt-4 text-marino-700/80">
            En JM somos una empresa dedicada a la venta e instalación de cámaras de seguridad y equipos tecnológicos.
            Brindamos soluciones a medida para hogares, negocios y empresas, con productos de alta calidad, precios
            accesibles y un servicio técnico confiable.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {items.map(([I, t, d]) => (
            <div key={t} className="card flex gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-azul-50 text-azul-600"><I size={22} /></div>
              <div>
                <h3 className="font-bold text-marino-900">{t}</h3>
                <p className="mt-0.5 text-sm text-marino-700/70">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================= Catálogo con búsqueda y filtros =================
function SeccionCatalogo({ onVer }) {
  const { data: categorias } = useApi('/public/categorias');
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('camara');
  const [categoria, setCategoria] = useState('');
  const [productos, setProductos] = useState(null);
  const buscando = q.trim() !== '';

  // Con búsqueda se busca en todo el catálogo; sin búsqueda, por pestaña y categoría
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (buscando) p.set('q', q.trim());
      else if (categoria) p.set('categoria', categoria);
      else p.set('tipo', tipo);
      api(`/public/productos?${p}`).then(setProductos).catch(() => setProductos([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q, tipo, categoria]);

  const delTipo = categorias?.filter((c) => c.tipo === tipo && c.total > 0) ?? [];
  const totalTipo = (t) => categorias?.filter((c) => c.tipo === t).reduce((s, c) => s + c.total, 0) ?? 0;
  const cambiarTipo = (t) => { setTipo(t); setCategoria(''); setQ(''); };
  const actual = categorias?.find((c) => String(c.id) === categoria);

  const Pestana = ({ valor, icono: I, children }) => (
    <button onClick={() => cambiarTipo(valor)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition sm:flex-none sm:px-6 ${tipo === valor && !buscando ? 'bg-marino-900 text-white shadow-lg shadow-marino-900/20' : 'text-marino-700 hover:bg-white'}`}>
      <I size={18} className={tipo === valor && !buscando ? 'text-cian-400' : 'text-azul-600'} />
      <span>{children}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${tipo === valor && !buscando ? 'bg-white/15' : 'bg-plata-300/50'}`}>{totalTipo(valor)}</span>
    </button>
  );

  const Chip = ({ id, children, total }) => (
    <button onClick={() => setCategoria(id)}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${categoria === id ? 'bg-azul-600 text-white shadow shadow-azul-600/30' : 'bg-white text-marino-800 ring-1 ring-plata-300 hover:text-azul-700 hover:ring-azul-500'}`}>
      {children}
      {total != null && <span className={`text-xs ${categoria === id ? 'text-white/70' : 'text-marino-700/40'}`}>{total}</span>}
    </button>
  );

  return (
    <section id="catalogo" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className="section-title mt-2">{tipo === 'camara' ? 'Tipos de cámaras de seguridad' : 'Accesorios y materiales'}</h2>
            <p className="mt-2 text-marino-700/70">Características técnicas y precios actualizados.</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marino-700/50" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o modelo…" className="input py-3 pl-10" />
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-fondo p-2 ring-1 ring-plata-300/60 sm:p-3">
          <div className="flex gap-1 sm:gap-2">
            <Pestana valor="camara" icono={Cctv}>Cámaras</Pestana>
            <Pestana valor="accesorio" icono={HardDrive}>
              <span className="sm:hidden">Accesorios</span>
              <span className="hidden sm:inline">Accesorios y materiales</span>
            </Pestana>
          </div>

          {buscando ? (
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 pt-4 text-sm">
              <p className="text-marino-700/80">Resultados de <b className="text-marino-900">“{q.trim()}”</b> en todo el catálogo</p>
              <button onClick={() => setQ('')} className="flex items-center gap-1 font-semibold text-azul-600 hover:underline"><X size={16} /> Limpiar búsqueda</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 px-1 pb-1 pt-4">
              <Chip id="">Todas</Chip>
              {delTipo.map((c) => <Chip key={c.id} id={String(c.id)} total={c.total}>{c.nombre.replace('Cámara ', '')}</Chip>)}
            </div>
          )}
        </div>

        {actual && !buscando && (
          <p className="mt-4 flex items-center gap-2 text-sm text-marino-700/70">
            <span className="h-1.5 w-1.5 rounded-full bg-azul-500" />{actual.descripcion}
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productos === null && [1, 2, 3].map((i) => <div key={i} className="card h-96 animate-pulse bg-plata-100" />)}
          {productos?.map((p) => <TarjetaProducto key={p.id} p={p} onVer={onVer} />)}
        </div>
        {productos?.length === 0 && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-plata-300 py-16 text-center text-marino-700/70">
            No encontramos productos con esa búsqueda.
          </div>
        )}
      </div>
    </section>
  );
}

function Precio({ precio, descuento, grande }) {
  const final = conDescuento(precio, descuento);
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-display font-extrabold text-azul-700 ${grande ? 'text-3xl' : 'text-2xl'}`}>{bs(final)}</span>
      {descuento > 0 && <span className="text-sm text-marino-700/50 line-through">{bs(precio)}</span>}
    </div>
  );
}

function TarjetaProducto({ p, onVer }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl hover:shadow-azul-600/10">
      <button onClick={() => onVer(p.id)} className="relative aspect-[16/10] overflow-hidden bg-plata-100 sm:aspect-[4/3]">
        <div className="absolute inset-3 sm:inset-4">
          <FotoProducto src={p.imagen} alt={p.nombre} tipo={p.tipo} className="rounded-xl transition group-hover:scale-105" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-marino-900 px-3 py-1 text-xs font-semibold text-white">{p.categoria}</span>
        {p.descuento > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-cian-400 px-3 py-1 text-xs font-bold text-marino-950">-{p.descuento}%</span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-marino-900">{p.nombre}</h3>
        {p.modelo && <p className="text-xs font-semibold tracking-wider text-azul-600">{p.modelo}</p>}
        <ul className="mt-3 flex-1 space-y-1.5">
          {p.caracteristicas?.slice(0, 4).map((c) => (
            <li key={c.id} className="flex gap-2 text-sm text-marino-700/80">
              <Check size={16} className="mt-0.5 shrink-0 text-azul-500" />
              <span><span className="font-medium text-marino-800">{c.nombre}:</span> {c.valor}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-plata-100 pt-4">
          <Precio precio={p.precio} descuento={p.descuento} />
          <div className="flex gap-2">
            <button onClick={() => onVer(p.id)} className="btn-ghost px-3 py-2">Ver</button>
            <a href={waLink(`Hola JM, quiero consultar por: ${p.nombre}${p.modelo ? ` (${p.modelo})` : ''}.`)} target="_blank" rel="noreferrer" className="btn-wa px-3 py-2" aria-label="Consultar por WhatsApp">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ================= Kits =================
function SeccionKits() {
  const { data: kits } = useApi('/public/kits');
  return (
    <section id="kits" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Paquetes completos</p>
          <h2 className="section-title mt-2">Kits de cámaras</h2>
          <p className="mt-2 text-marino-700/70">Todo lo necesario para empezar a proteger tu espacio.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kits?.map((k, i) => (
            <article key={k.id} className={`relative flex flex-col overflow-hidden rounded-2xl p-6 ${i === 1 ? 'bg-marino-900 text-white shadow-xl shadow-marino-900/30 ring-2 ring-azul-500' : 'card'}`}>
              {i === 1 && <span className="absolute right-4 top-4 rounded-full bg-cian-400 px-2.5 py-0.5 text-[11px] font-bold text-marino-950">MÁS ELEGIDO</span>}
              {k.imagen
                ? <img src={k.imagen} alt={k.nombre} className="mb-4 aspect-video w-full rounded-xl object-cover" />
                : <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${i === 1 ? 'bg-azul-600' : 'bg-azul-50 text-azul-600'}`}><Package size={28} /></div>}
              <h3 className="text-xl font-extrabold">{k.nombre}</h3>
              <p className={`text-sm font-semibold ${i === 1 ? 'text-cian-400' : 'text-azul-600'}`}>{k.cantidad_camaras} cámaras</p>
              <p className={`mt-3 text-sm ${i === 1 ? 'text-plata-300' : 'text-marino-700/70'}`}>{k.descripcion}</p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {k.detalles?.map((d, j) => (
                  <li key={j} className="flex gap-2"><Check size={16} className={`mt-0.5 shrink-0 ${i === 1 ? 'text-cian-400' : 'text-azul-500'}`} /> {d.cantidad} × {d.nombre}</li>
                ))}
              </ul>
              <div className="mt-6">
                {k.descuento > 0 && <p className={`text-sm line-through ${i === 1 ? 'text-plata-300/60' : 'text-marino-700/50'}`}>{bs(k.precio)}</p>}
                <p className={`font-display text-3xl font-black ${i === 1 ? 'text-white' : 'text-azul-700'}`}>{bs(conDescuento(k.precio, k.descuento))}</p>
                <a href={waLink(`Hola JM, me interesa el ${k.nombre} (${k.cantidad_camaras} cámaras).`)} target="_blank" rel="noreferrer" className={`mt-4 w-full ${i === 1 ? 'btn-primary' : 'btn-ghost'}`}>
                  <MessageCircle size={18} /> Consultar
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-azul-50 px-6 py-4 text-center font-semibold text-marino-800">
          <Settings2 size={20} className="text-azul-600" /> ¡También armamos kits personalizados según tu necesidad!
        </div>
      </div>
    </section>
  );
}

// ================= Accesorios =================
function SeccionAccesorios({ onVer }) {
  const { data } = useApi('/public/productos?tipo=accesorio');
  return (
    <section id="accesorios" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow">Complementos</p>
        <h2 className="section-title mt-2">Materiales y accesorios</h2>
        <p className="mt-2 text-marino-700/70">Todo lo que necesitas en un solo lugar.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {data?.map((p) => (
            <button key={p.id} onClick={() => onVer(p.id)} className="card group overflow-hidden text-left transition hover:-translate-y-0.5 hover:ring-azul-500">
              <div className="aspect-square overflow-hidden bg-plata-100 p-3"><FotoProducto src={p.imagen} alt={p.nombre} tipo="accesorio" className="rounded-lg" /></div>
              <div className="p-4">
                <p className="text-sm font-bold leading-snug text-marino-900">{p.nombre}</p>
                <p className="mt-1 font-display text-lg font-extrabold text-azul-700">{bs(conDescuento(p.precio, p.descuento))}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================= Servicios =================
function SeccionServicios() {
  const { data } = useApi('/public/servicios');
  return (
    <section id="servicios" className="scroll-mt-20 relative overflow-hidden bg-marino-900 py-20 text-white">
      <div className="grid-bg absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow !text-cian-400">Nuestros servicios</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">¡Nos encargamos de todo por ti!</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-azul-500/60 hover:bg-white/[0.07]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-azul-600 text-white shadow-lg shadow-azul-600/40">
                <IconoServicio nombre={s.icono} size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.nombre}</h3>
              <p className="mt-1.5 text-sm text-plata-300">{s.descripcion}</p>
              {s.precio_referencial && <p className="mt-3 text-sm font-semibold text-cian-400">Desde {bs(s.precio_referencial)}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================= Promociones =================
function SeccionPromociones() {
  const { data } = useApi('/public/promociones');
  const iconos = [Percent, Truck, Gift, Home, Tag];
  if (data && data.length === 0) return null;
  return (
    <section id="promociones" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow">Ofertas</p>
        <h2 className="section-title mt-2">Promociones</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {data?.map((pr, i) => {
            const I = iconos[i % iconos.length];
            return (
              <div key={pr.id} className="card flex gap-5 p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azul-600 to-cian-400 text-white"><I size={26} /></div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-marino-900">{pr.titulo}</h3>
                    {pr.descuento > 0 && <span className="rounded-full bg-cian-400/15 px-2.5 py-0.5 text-xs font-bold text-azul-700">-{pr.descuento}%</span>}
                  </div>
                  <p className="mt-1 text-sm text-marino-700/75">{pr.descripcion}</p>
                  {(pr.producto || pr.kit) && <p className="mt-2 text-xs font-semibold text-azul-600">Aplica a: {pr.producto || pr.kit}</p>}
                  {pr.fecha_fin && <p className="mt-1 text-xs text-marino-700/50">Válido hasta el {new Date(pr.fecha_fin + 'T00:00').toLocaleDateString('es-BO')}</p>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-azul-700 to-azul-500 px-8 py-6 text-white sm:flex-row">
          <p className="font-display text-lg font-bold">¡Aprovecha nuestras ofertas y protege lo que más te importa!</p>
          <a href={waLink('Hola JM, quiero saber más sobre las promociones.')} target="_blank" rel="noreferrer" className="btn bg-white text-azul-700 hover:bg-azul-50">
            <MessageCircle size={18} /> Quiero la promo
          </a>
        </div>
      </div>
    </section>
  );
}

// ================= Apps compatibles =================
function SeccionApps() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Aplicaciones compatibles</p>
          <h2 className="section-title mt-2">Tu mundo en tus manos</h2>
          <p className="mt-2 text-marino-700/70">Visualiza tus cámaras desde tu celular, estés donde estés.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Transmisión en tiempo real', 'Reproducción de grabaciones', 'Alertas de movimiento', 'Disponible para Android y iOS'].map((t) => (
              <li key={t} className="flex items-center gap-2 font-medium text-marino-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-azul-600 text-white"><Check size={14} /></span>{t}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[['DMSS', 'Dahua'], ['Hik-Connect', 'Hikvision']].map(([app, marca]) => (
            <div key={app} className="card flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-marino-900 text-cian-400"><Smartphone size={28} /></div>
              <div><p className="font-display text-lg font-extrabold text-marino-900">{app}</p><p className="text-sm text-marino-700/60">{marca}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================= Contacto =================
function SeccionContacto() {
  return (
    <section id="contacto" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="card grid overflow-hidden lg:grid-cols-2">
          <div className="p-6 sm:p-10">
            <p className="eyebrow">Contáctanos</p>
            <h2 className="section-title mt-2">¡Estamos listos para ayudarte!</h2>
            <ul className="mt-8 space-y-5">
              <Dato I={Phone} t="WhatsApp / Teléfono" v={EMPRESA.telefono} />
              <Dato I={MapPin} t={EMPRESA.direccion} v={EMPRESA.cobertura} />
              <Dato I={Clock} t="Horario de atención" v={EMPRESA.horario} />
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waLink('Hola JM, quiero más información.')} target="_blank" rel="noreferrer" className="btn-wa px-6 py-3 text-base"><MessageCircle size={20} /> Escríbenos por WhatsApp</a>
              <a href={EMPRESA.facebook} target="_blank" rel="noreferrer" className="btn-ghost px-3" aria-label="Facebook"><Facebook size={20} /></a>
              <a href={EMPRESA.instagram} target="_blank" rel="noreferrer" className="btn-ghost px-3" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center overflow-hidden bg-marino-900 p-8 text-center text-white sm:p-10">
            <div className="glow-ring absolute inset-0" />
            <img src="/logo.png" alt="JM" className="relative h-40 w-40 rounded-full ring-4 ring-white/10" />
            <p className="relative mt-6 font-display text-2xl font-extrabold">Protege lo que más quieres con JM</p>
            <p className="relative mt-2 text-plata-300">Tecnología, confianza y seguridad para tu hogar y negocio.</p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-plata-300">
              <span className="flex items-center gap-1.5"><ShieldCheck size={18} className="text-cian-400" /> Calidad</span>
              <span className="flex items-center gap-1.5"><Handshake size={18} className="text-cian-400" /> Confianza</span>
              <span className="flex items-center gap-1.5"><Lock size={18} className="text-cian-400" /> Seguridad</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dato({ I, t, v }) {
  return (
    <li className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-azul-50 text-azul-600"><I size={20} /></div>
      <div><p className="font-semibold text-marino-900">{t}</p><p className="text-sm text-marino-700/70">{v}</p></div>
    </li>
  );
}

function Footer() {
  return (
    <footer className="bg-marino-950 py-8 text-sm text-plata-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} {EMPRESA.nombre}. Precios referenciales en bolivianos.</p>
        <Link to="/admin" className="text-plata-300/60 hover:text-white">Acceso administrativo</Link>
      </div>
    </footer>
  );
}

// Íconos de redes sociales (lucide-react ya no incluye logos de marcas)
function Facebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8v2.4H8v3h2.5V21h3Z" />
    </svg>
  );
}
function Instagram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
