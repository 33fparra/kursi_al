# leku.al — Guía de Arquitectura

> Última actualización: junio 2026  
> Conversor de divisas y plataforma de herramientas financieras para Albania y su diáspora.

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Cómo Fluye la Información](#cómo-fluye-la-información)
5. [Sistema de URLs](#sistema-de-urls)
6. [Sistema de Idiomas (i18n)](#sistema-de-idiomas-i18n)
7. [Sección de País (Albania / Kosovo)](#sección-de-país-albania--kosovo)
8. [Ditari — Sistema de Artículos](#ditari--sistema-de-artículos)
9. [Conversor de Divisas](#conversor-de-divisas)
10. [Dark Mode](#dark-mode)
11. [Navegación (Nav)](#navegación-nav)
12. [Google Analytics 4](#google-analytics-4)
13. [Despliegue (Cloudflare Pages)](#despliegue-cloudflare-pages)
14. [Reglas de Código](#reglas-de-código)
15. [Checklist antes de publicar](#checklist-antes-de-publicar)

---

## Visión General

leku.al es un **sitio estático** (Astro SSG) sin servidor ni base de datos activa en producción. Todo se genera en build time y se sirve desde la CDN de Cloudflare Pages.

```
Usuario abre leku.al
        ↓
Cloudflare Pages (CDN global)
        ↓
Sirve HTML + CSS + JS ya generados en build
        ↓
React hidrata solo los componentes interactivos (conversor, calculadoras)
        ↓
El usuario interactúa — sin llamadas a servidor para los cálculos
```

**Dominio real:** `leku.al` (no `kursi.al` — este era el nombre anterior del proyecto)

**Público objetivo:** albaneses en Albania + diáspora en Italia, UK, Grecia, Alemania (70%+ tráfico mobile).

**Monetización:** afiliados Wise (~€15/registro), Remitly (~€10/registro), Google AdSense.

---

## Stack Tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| **Framework** | Astro (SSG) | `output: static`, páginas pre-renderizadas |
| **UI interactivo** | React (islas) | Solo conversor, calculadoras, nav |
| **Estilos** | CSS variables custom | Design system en `Base.astro` |
| **Íconos** | Tabler Icons (outline) | CDN webfont, nunca filled |
| **Tipografía** | Playfair Display + DM Sans | Google Fonts, preconnect en head |
| **Gráficos** | Chart.js | Solo en página `/historiku` |
| **Base de datos** | Supabase (PostgreSQL) | Tasas de cambio diarias, fees de proveedores |
| **Edge functions** | Supabase Edge Functions | Cron diario 06:00 UTC para tasas |
| **Deploy** | Cloudflare Pages | Auto-deploy desde GitHub en cada push |
| **Analytics** | Google Analytics 4 | Snippet en `Base.astro`, ID en placeholder |
| **Node** | 23.7.0 local / 22 en Cloudflare | `.nvmrc` fuerza Node 22 en CI |

---

## Estructura de Carpetas

```
kursi/                              ← raíz del proyecto
│
├── public/
│   ├── logo.svg                    ← Logo "leku.al" con punto rojo
│   ├── 404.webp                    ← Imagen de fondo para página 404
│   ├── robots.txt
│   └── ditari/
│       └── images/                 ← Imágenes de artículos (.webp)
│           ├── fintech-vs-banca-tradicionale-ballkan.webp
│           └── ...
│
├── src/
│   ├── layouts/
│   │   └── Base.astro              ← ★ Layout raíz: head, nav, footer, CSS global
│   │
│   ├── components/
│   │   ├── Nav.jsx                 ← Barra de navegación (React, client:load)
│   │   ├── LangSwitch.jsx          ← Selector de idioma
│   │   ├── Converter.jsx           ← Conversor ALL↔EUR/USD/GBP/CHF
│   │   ├── RateChart.jsx           ← Gráfico histórico 30 días (Chart.js)
│   │   ├── RateTable.jsx           ← Tabla de tasas del día
│   │   ├── Remittance.jsx          ← Calculadora de remesas Wise/Remitly/banco
│   │   ├── SalaryCalc.jsx          ← Calculadora de salario neto (AL + XK)
│   │   ├── MortgageCalc.jsx        ← Calculadora de hipoteca
│   │   ├── LoanCalc.jsx            ← Calculadora de crédito personal
│   │   ├── BankTable.jsx           ← Tabla comparativa de bancos
│   │   ├── DitariCard.astro        ← Tarjeta de artículo en listados
│   │   ├── DitariFilters.astro     ← Filtros de tipo (Astro, hydratado con JS inline)
│   │   ├── DitariSidebar.astro     ← Sidebar de artículos relacionados
│   │   └── MortgageSummary.astro   ← Resumen fijo de hipoteca en páginas de país
│   │
│   ├── content/
│   │   └── ditari/                 ← Colección de artículos (Astro Content Collections)
│   │       ├── sq/                 ← Albanés (idioma por defecto)
│   │       │   ├── edukim/         ← Educación financiera
│   │       │   ├── lajme/          ← Noticias
│   │       │   ├── teknologji/     ← Carpeta física (type debe ser "tech", no "teknologji")
│   │       │   └── ...
│   │       └── en/                 ← Inglés
│   │           ├── edukim/
│   │           ├── lajme/
│   │           ├── teknologji/     ← Mismo aviso: type="tech"
│   │           └── ...
│   │
│   ├── pages/
│   │   ├── index.astro             ← / (home SQ: conversor principal)
│   │   ├── home.astro              ← Alias de home
│   │   ├── change/                 ← Sección conversor
│   │   │   ├── index.astro         ← /kursi (conversor)
│   │   │   ├── tabela.astro        ← /kursi/tabela
│   │   │   ├── historiku.astro     ← /kursi/historiku
│   │   │   └── remitanca.astro     ← /kursi/remitanca
│   │   ├── albania/                ← Herramientas financieras Albania
│   │   │   ├── index.astro
│   │   │   ├── paga.astro          ← Calculadora salario neto
│   │   │   ├── bankat.astro        ← Bancos
│   │   │   ├── hipoteka.astro      ← Hipoteca
│   │   │   ├── kredia.astro        ← Crédito
│   │   │   └── kualifikim.astro    ← Elegibilidad hipoteca
│   │   ├── kosova/                 ← Herramientas financieras Kosovo
│   │   │   └── (misma estructura que albania/)
│   │   ├── ditari/                 ← Listados de artículos SQ
│   │   │   ├── [...page].astro     ← /ditari (listado paginado)
│   │   │   ├── artikull/[type]/[slug].astro ← Artículo individual
│   │   │   ├── edukim/[...page].astro
│   │   │   ├── lajme/[...page].astro
│   │   │   ├── tech/[...page].astro
│   │   │   ├── ai/[...page].astro
│   │   │   └── int/[...page].astro
│   │   ├── en/                     ← Espejo EN de todas las páginas anteriores
│   │   │   ├── ditari/
│   │   │   ├── albania/
│   │   │   └── kosova/
│   │   ├── it/                     ← Italiano (solo conversor)
│   │   ├── el/                     ← Griego (solo conversor)
│   │   ├── api/                    ← Endpoints JSON generados en build
│   │   │   ├── rates.json.ts       ← Tasas actuales desde Supabase
│   │   │   ├── history.json.ts     ← Histórico 30 días
│   │   │   └── fees.json.ts        ← Comisiones de proveedores
│   │   └── 404.astro               ← Página de error siempre en albanés
│   │
│   ├── i18n/
│   │   ├── sq.json                 ← Todos los textos en albanés (idioma por defecto)
│   │   ├── en.json                 ← Inglés
│   │   ├── it.json                 ← Italiano
│   │   └── el.json                 ← Griego
│   │
│   ├── lib/
│   │   ├── supabase.ts             ← Cliente Supabase (PUBLIC_* vars)
│   │   ├── rates.ts                ← Helpers: fetch tasas, conversión ALL↔divisa
│   │   └── i18n.ts                 ← Función t(lang, key): lee src/i18n/*.json
│   │
│   └── content.config.ts           ← Schema de la colección "ditari"
│
├── supabase/functions/
│   ├── fetch-rates/index.ts        ← Cron 06:00 UTC: Frankfurter → daily_rates
│   └── fetch-fees/index.ts         ← Cron lunes 07:00: scraping fees Wise/Remitly
│
├── .nvmrc                          ← "22" — fuerza Node 22 en Cloudflare Pages
├── astro.config.mjs
└── package.json
```

---

## Cómo Fluye la Información

```
1. DATOS (Supabase)
   Tabla daily_rates: fecha / par / tasa / fuente
   Tabla provider_fees: wise / remitly / banco / comisión
   Tabla affiliate_clicks: registro de clics de afiliado

2. BUILD TIME (npm run build)
   src/pages/api/*.json.ts consulta Supabase → genera JSON estáticos
   Astro lee los JSON → pasa datos a cada página
   Astro pre-renderiza todo el HTML con los datos del día

3. RUNTIME (navegador del usuario)
   React hidrata Converter, RateTable, Remittance, SalaryCalc
   Usuario interactúa → cálculos en memoria, sin llamadas al servidor
   Clic afiliado → POST silencioso a affiliate_clicks → redirige a Wise/Remitly

4. ACTUALIZACIÓN DIARIA (Supabase Edge Function)
   06:00 UTC: fetch-rates consulta api.frankfurter.app → inserta en daily_rates
   Lunes 07:00: fetch-fees actualiza provider_fees
   El siguiente npm run build usará estos datos frescos
```

---

## Sistema de URLs

```
Albanés (SQ, canónico — sin prefijo):
  /                           → Home / conversor principal
  /kursi                      → Conversor de divisas
  /kursi/tabela               → Tabla de tasas
  /kursi/historiku            → Histórico 30 días
  /kursi/remitanca            → Calculadora de remesas
  /albania                    → Hub herramientas Albania
  /albania/paga               → Salario neto Albania
  /albania/bankat             → Bancos Albania
  /albania/hipoteka           → Hipoteca Albania
  /kosova                     → Hub herramientas Kosovo
  /kosova/paga                → Salario neto Kosovo (ley TAP 2026)
  /ditari                     → Listado de artículos
  /ditari/artikull/{type}/{slug} → Artículo individual

Inglés (prefijo /en/):
  /en/                        → Home EN
  /en/kursi                   → Converter
  /en/albania/salary          → Salary calculator Albania
  /en/ditari/artikull/{type}/{slug} → Article

Italiano (prefijo /it/) — solo conversor:
  /it/kursi, /it/kursi/tabela, /it/kursi/historiku, /it/kursi/remitanca

Griego (prefijo /el/) — solo conversor:
  /el/kursi, ...
```

---

## Sistema de Idiomas (i18n)

**Regla fundamental:** todo texto visible al usuario va en `src/i18n/*.json`, nunca hardcodeado.

```typescript
// src/lib/i18n.ts
export function t(lang: string, key: string): string {
  return translations[lang]?.[key] ?? translations['sq'][key] ?? key;
}

// Uso en Astro:
const lang = 'sq';
t(lang, 'ditari.heading')  // → "Ditari i Lekut"

// Uso en React (Nav.jsx importa los JSON directamente):
import sqData from '../i18n/sq.json';
function t(lang, key) { return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.sq[key] ?? key; }
```

**Fallback:** si la clave no existe en el idioma pedido, cae a albanés (`sq`). Si tampoco existe, devuelve la propia clave como texto.

**Idiomas soportados:**
- `sq` — albanés (default, sin prefijo en URL)
- `en` — inglés (`/en/`)
- `it` — italiano (`/it/`) — solo sección conversor
- `el` — griego (`/el/`) — solo sección conversor

---

## Sección de País (Albania / Kosovo)

Las páginas de herramientas financieras por país (`/albania/*`, `/kosova/*`) están en `src/pages/albania/` y `src/pages/kosova/`.

**Datos de cada país:** archivos JSON en `src/data/` (p.ej. `src/data/albania.json`, `src/data/kosovo.json`) con:
- Tramos impositivos (TAP/TATIM)
- Cotizaciones sociales
- Lista de bancos con tasas hipotecarias y de crédito
- Salario mínimo

**Kosovo — Ley TAP 2026 (importante):**
```
Base imponible = bruto − Trusti (5%)
Tramos sobre base:
  0 – €250:    0%
  €250 – €450: 4%
  > €450:      10%
```
⚠️ La ley anterior (0/80/250/450 sobre bruto) ya NO aplica.

**Hipoteca:** calculadora en `src/components/MortgageCalc.jsx`. Usa los datos de bancos del JSON del país. NEI (APR real) se calcula sumando comisiones de apertura, seguros y cuota mensual.

---

## Ditari — Sistema de Artículos

Ditari ("el diario") es la sección de contenido del sitio. Usa **Astro Content Collections**.

### Schema del artículo (`src/content.config.ts`)

```typescript
type: z.enum(['edukim', 'lajme', 'tech', 'ai', 'int'])
// edukim = educación financiera
// lajme  = noticias
// tech   = tecnología / fintech
// ai     = inteligencia artificial
// int    = internacional / Ndërkombëtare
```

⚠️ **Regla crítica:** el campo `type` en el frontmatter DEBE ser exactamente uno de esos 5 valores. Un valor no reconocido (ej: `"teknologji"`) hace que Astro ignore el artículo silenciosamente — sin error, sin advertencia.

### Frontmatter de un artículo

```yaml
---
title: "Título del artículo"
description: "Descripción breve para SEO y cards"
type: "tech"                        # uno de: edukim | lajme | tech | ai | int
category: "Fintech & Ekonomi"       # etiqueta libre visible en la UI
author: "F.A Parretti"
coAuthor: ""                        # dejar vacío si no hay coautor
country: "Albania / Kosovo"         # o "Albania" o "Kosovo" o ""
translationKey: "slug-unico"        # DEBE coincidir entre SQ y EN para linking
date: 2026-06-13
image: "/ditari/images/nombre.webp" # archivo en public/ditari/images/
imageAlt: "Descripción de la imagen"
readMinutes: 5
lang: "sq"                          # "sq" o "en" — debe coincidir con la carpeta
---
```

### Convenciones de nombre de archivo

```
src/content/ditari/sq/lajme/2026-06-03-titulo-del-articulo.md
                   ↑  ↑     ↑          ↑
                   lang tipo fecha      slug
```

La extensión `.md` es obligatoria. Falta la extensión → Astro no la encuentra.

### Cómo se generan las URLs

```
src/content/ditari/sq/lajme/2026-06-03-letra-e-vogel-e-hipotekave-kosove.md
→ /ditari/artikull/lajme/letra-e-vogel-e-hipotekave-kosove/

src/content/ditari/en/tech/2026-06-13-goodbye-queues-fintech-albania-kosovo.md
→ /en/ditari/artikull/tech/goodbye-queues-fintech-albania-kosovo/
```

La página template extrae el slug así:
```typescript
entry.id.split('/').pop()!.replace(/^\d{4}-\d{2}-\d{2}-/, '')
// "en/teknologji/2026-06-13-goodbye-queues-..." → "goodbye-queues-..."
```

### Imágenes de artículos

- Carpeta: `public/ditari/images/`
- Formato: `.webp`
- Deben añadirse a git con `git add --force` si están en `.gitignore`
- Cada versión de idioma puede tener su propia imagen (nombres distintos en frontmatter)
- Si la imagen falta en git → el artículo se ve en local pero no en producción

### Tipos y colores de badge

```css
.ditari-badge--edukim  → rojo albanés (--red-soft / --red-albania)
.ditari-badge--lajme   → rojo albanés
.ditari-badge--tech    → violeta (#EDE9FE / #7C3AED)
.ditari-badge--ai      → verde (#ECFDF5 / #059669)
.ditari-badge--int     → ámbar (#FEF3C7 / #D97706)
```

### Filtro de búsqueda en listados

El filtro en `/ditari` usa el atributo HTML `hidden` + JS inline. **CSS gotcha crítico:**
```css
/* En Base.astro — OBLIGATORIO en el reset */
[hidden] { display: none !important; }
/* Sin !important, `.ditari-card { display: flex }` gana por especificidad */
```

---

## Conversor de Divisas

**Componente:** `src/components/Converter.jsx`  
**Datos:** `src/pages/api/rates.json.ts` → lee Supabase `daily_rates`  
**Pares soportados:** ALL↔EUR, ALL↔USD, ALL↔GBP, ALL↔CHF

**Fuente de tasas:** Frankfurter API (datos del BCE), actualizado diariamente a las 06:00 UTC vía Supabase Edge Function `fetch-rates`.

**Tabla de tasas:** `src/components/RateTable.jsx` — muestra todos los pares con variación 24h.

**Remesas:** `src/components/Remittance.jsx` — compara cuánto llega con Wise vs Remitly vs banco tradicional. Los botones de afiliado registran el clic en `affiliate_clicks` antes de redirigir.

---

## Dark Mode

El dark mode soporta dos rutas simultáneamente:

```css
/* 1. Sistema operativo */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* variables oscuras */ }
}

/* 2. Toggle manual del usuario */
[data-theme="dark"] { /* variables oscuras */ }
[data-theme="light"] { /* variables claras */ }
```

**Sin parpadeo al cargar** (flash of wrong theme): script `is:inline` en `<head>` ANTES de cualquier CSS:
```html
<script is:inline>
  const t = localStorage.getItem('kursi-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', t);
</script>
```

---

## Navegación (Nav)

**Componente:** `src/components/Nav.jsx` (React, `client:load`)

El nav tiene 3 modos según `getSection(pathname)`:

```
'home'    → HOME_LINKS    — links generales: Kreu, Albania, Kosovo, Konvertuesi, Ditari
'change'  → CHANGE_LINKS  — links del conversor: tabela, historiku, remitanca
'country' → COUNTRY_TOP   — links de país: Kreu, Albania, Kosovo, Lajme
            + COUNTRY_TOOLS (subtabs): paga, bankat, hipoteka, kredia, kualifikim
```

**Lógica de detección:**
```javascript
function getSection(pathname) {
  const p = pathname.replace(/^\/(en|it|el)/, '') || '/';
  if (p === '/' || p === '/home') return 'home';
  if (p.startsWith('/kursi') || ...) return 'change';
  if (p.startsWith('/albania') || p.startsWith('/kosova')) return 'country';
  return 'home';  // /ditari/* también cae aquí → usa HOME_LINKS
}
```

`pathname` viene de `Astro.url.pathname` (la URL real), no del prop `currentPath`.

---

## Google Analytics 4

Snippet en `src/layouts/Base.astro` dentro del `<head>`:

```html
<script is:inline async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Pendiente:** reemplazar `G-XXXXXXXXXX` con el Measurement ID real desde Google Analytics → Admin → Data Streams.

---

## Despliegue (Cloudflare Pages)

```
git push origin main
        ↓
Cloudflare Pages detecta el push (webhook)
        ↓
npm run build  (Node 22, forzado por .nvmrc)
        ↓
/dist → CDN global
        ↓
Sitio actualizado en ~2 minutos
```

**Configuración en Cloudflare Pages:**

| Setting | Valor |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` (vía `.nvmrc` o env var `NODE_VERSION=22`) |
| Framework preset | Astro |

**Variables de entorno en Cloudflare:**
```
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Caché CDN:** Cloudflare cachea cada URL como HTML estático. Si se ve contenido antiguo en una URL específica después de un deploy, hacer "Purge cache" manual desde el panel de Cloudflare Pages.

---

## Reglas de Código

- **TypeScript** en todo: `.ts`, `.tsx`, `.astro`
- **ES modules**: `import/export`, nunca `require()`
- **CSS**: variables del design system (`--red-albania`, `--ink`, etc.), nunca colores hardcodeados
- **Dark mode**: siempre `[data-theme="dark"]` + `prefers-color-scheme`, nunca solo uno
- **React**: solo para interactividad real (conversor, calculadoras, nav)
- **Textos**: SIEMPRE en `src/i18n/*.json`, nunca hardcodeados en componentes
- **Imágenes ditari**: añadir con `git add --force` si `.gitignore` las excluye
- **Números EN**: coma como separador de miles (`4,800`) y decimales (`.`); en SQ: punto como separador de miles (`4.800`)

### Design system — colores clave

```css
--red-albania:   #E41E20   /* CTA, logo — nunca para errores */
--ink:           #1A1A1A   /* Títulos */
--ink-secondary: #4A4A4A   /* Párrafos */
--green-result:  #1A6B3C   /* El número resultado del conversor */
--bg-page:       #F7F6F3   /* Fondo de página */
--bg-card:       #FFFFFF   /* Tarjetas */
```

---

## Checklist antes de publicar

- [ ] `npx astro check` sin errores de TypeScript
- [ ] El campo `type` del artículo es uno de: `edukim | lajme | tech | ai | int`
- [ ] El campo `lang` del artículo coincide con la carpeta (`sq/` → `lang: "sq"`)
- [ ] El `translationKey` coincide exactamente entre versión SQ y EN
- [ ] La imagen del artículo está en `public/ditari/images/` Y en git (`git add --force`)
- [ ] Extensión `.md` presente en el nombre del archivo de artículo
- [ ] Ningún texto hardcodeado — todo en `src/i18n/*.json`
- [ ] Vista mobile (375px) correcta
- [ ] Dark mode funciona visualmente
- [ ] No aparece "kursi.al" en el frontend — debe decir "leku.al"

---

*Arquitectura diseñada con el principio:*  
**"El albanés no técnico en mobile debe poder convertir en menos de 3 segundos."**
