# leku.al — Guía de Arquitectura

> Última actualización: julio 2026  
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
9. [Páginas de Autor / Colaboradores](#páginas-de-autor--colaboradores)
10. [Conversor de Divisas](#conversor-de-divisas)
11. [Dark Mode](#dark-mode)
12. [Navegación (Nav)](#navegación-nav)
13. [SEO y GEO](#seo-y-geo)
14. [Google Analytics 4](#google-analytics-4)
15. [Despliegue (Cloudflare Pages)](#despliegue-cloudflare-pages)
16. [Reglas de Código](#reglas-de-código)
17. [Checklist antes de publicar](#checklist-antes-de-publicar)

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

**Dominio real:** `leku.al` (no `kursi.al` — nombre anterior del proyecto)

**Público objetivo:** albaneses en Albania + diáspora (Italia, UK, Grecia, Alemania). 70%+ tráfico mobile.

**Monetización:** afiliados Wise (~€15/registro), Remitly (~€10/registro), Google AdSense.

---

## Stack Tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| **Framework** | Astro 6.x (SSG) | `output: static`, `trailingSlash: 'always'` |
| **UI interactivo** | React (islas) | Solo conversor, calculadoras, nav |
| **Estilos** | CSS variables custom | Design system global en `Base.astro` |
| **Íconos** | Tabler Icons (outline) | CDN webfont, nunca filled |
| **Tipografía** | Playfair Display + DM Sans | Google Fonts, preconnect en head |
| **Gráficos** | Chart.js | Solo en `/kursi/historiku/` |
| **Base de datos** | Supabase (PostgreSQL) | Tasas de cambio diarias, fees de proveedores |
| **Edge functions** | Supabase Edge Functions | Cron diario 06:00 UTC para tasas |
| **Deploy** | Cloudflare Pages | Auto-deploy desde GitHub en cada push |
| **Redirects** | `public/_redirects` | 301s para IT/EL eliminados y otras rutas legacy |
| **Analytics** | Google Analytics 4 | Snippet en `Base.astro` |
| **GEO** | `public/llms.txt` | Índice curado para crawlers de IA (llmstxt.org) |
| **Node** | 23.7.0 local / 22 en Cloudflare | `.nvmrc` fuerza Node 22 en CI |

---

## Estructura de Carpetas

```
kursi/                              ← raíz del proyecto
│
├── public/
│   ├── logo.svg
│   ├── 404.webp                    ← Fondo para página de error
│   ├── robots.txt                  ← Allow: / para todos (incluye crawlers de IA)
│   ├── llms.txt                    ← Índice curado para LLMs (GEO)
│   ├── _redirects                  ← Redirects 301 para Cloudflare Pages
│   └── ditari/
│       └── images/
│           ├── 2026-06/            ← ★ Imágenes organizadas por MES
│           │   ├── kosove-euribor-nei.webp
│           │   └── ...
│           └── 2026-07/
│               ├── kosto-emigrim-rinor.webp
│               └── ...
│
├── src/
│   ├── layouts/
│   │   └── Base.astro              ← ★ Layout raíz: head, nav, footer, CSS global
│   │                                  Props: title, description, lang, currentPath,
│   │                                         ogType, wide, allowedLangs, langLinks
│   │
│   ├── components/
│   │   ├── Nav.jsx                 ← Barra de navegación (React, client:load)
│   │   ├── LangSwitch.jsx          ← Selector de idioma (solo SQ/EN)
│   │   ├── Converter.jsx           ← Conversor ALL↔EUR/USD/GBP/CHF
│   │   ├── RateChart.jsx           ← Gráfico histórico 30 días (Chart.js)
│   │   ├── RateTable.jsx           ← Tabla de tasas del día
│   │   ├── Remittance.jsx          ← Calculadora de remesas Wise/Remitly/banco
│   │   ├── SalaryCalc.jsx          ← Calculadora de salario neto (AL + XK)
│   │   ├── MortgageCalc.jsx        ← Calculadora de hipoteca
│   │   ├── LoanCalc.jsx            ← Calculadora de crédito personal
│   │   ├── BankTable.jsx           ← Tabla comparativa de bancos
│   │   ├── DitariCard.astro        ← Tarjeta de artículo en listados
│   │   ├── DitariFilters.astro     ← Filtros de tipo con trailing slash
│   │   ├── DitariSidebar.astro     ← Sidebar con artículos recientes
│   │   ├── DitariPagination.astro  ← Paginación (usa page.url.prev/next de Astro)
│   │   └── MortgageSummary.astro   ← Resumen de hipoteca en páginas de país
│   │
│   ├── content/
│   │   ├── ditari/                 ← Colección (Astro Content Collections + glob)
│   │   │   ├── README.md           ← Guía de contribución (albanés)
│   │   │   ├── sq/                 ← Albanés
│   │   │   │   ├── edukim/
│   │   │   │   │   └── 2026-06/   ← ★ Artículos organizados por MES
│   │   │   │   │       └── AAAA-MM-DD-slug.md
│   │   │   │   ├── lajme/
│   │   │   │   │   └── 2026-06/
│   │   │   │   ├── tech/           ← (antes "teknologji", renombrada)
│   │   │   │   │   └── 2026-06/
│   │   │   │   ├── ai/
│   │   │   │   │   └── 2026-06/
│   │   │   │   └── int/
│   │   │   │       └── 2026-06/
│   │   │   └── en/                 ← Inglés (misma estructura)
│   │   │       ├── edukim/2026-06/
│   │   │       ├── lajme/2026-06/
│   │   │       ├── tech/2026-06/
│   │   │       ├── ai/2026-06/
│   │   │       └── int/2026-06/
│   │   └── (glob recursivo **/*.md — la profundidad de subcarpetas no afecta URLs)
│   │
│   ├── pages/
│   │   ├── index.astro             ← / (home SQ)
│   │   ├── home.astro              ← Alias → /
│   │   ├── 404.astro               ← Siempre en albanés
│   │   ├── kursi/                  ← Conversor de divisas
│   │   │   ├── index.astro         ← /kursi/
│   │   │   ├── tabela.astro
│   │   │   ├── historiku.astro
│   │   │   └── remitanca.astro
│   │   ├── albania/                ← Herramientas Albania
│   │   │   ├── index.astro, paga, bankat, hipoteka, kredia, kualifikim
│   │   ├── kosova/                 ← Herramientas Kosovo (misma estructura)
│   │   ├── ditari/                 ← Listados SQ (container--wide en todos)
│   │   │   ├── [...page].astro     ← /ditari/ (índice, wide=true)
│   │   │   ├── artikull/[type]/[slug].astro  ← Artículo (NOT wide)
│   │   │   ├── edukim/[...page].astro
│   │   │   ├── lajme/[...page].astro
│   │   │   ├── tech/[...page].astro
│   │   │   ├── ai/[...page].astro
│   │   │   └── int/[...page].astro
│   │   ├── rreth-autorit/          ← ★ Sistema de colaboradores
│   │   │   ├── index.astro         ← /rreth-autorit/ (índice de autores)
│   │   │   └── fa-parretti.astro   ← /rreth-autorit/fa-parretti/
│   │   └── en/                     ← Espejo inglés (misma estructura)
│   │       ├── index.astro, kursi/, albania/, kosova/, ditari/
│   │       └── rreth-autorit/
│   │           ├── index.astro     ← /en/rreth-autorit/
│   │           └── fa-parretti.astro
│   │
│   ├── i18n/
│   │   ├── sq.json                 ← Albanés (idioma por defecto)
│   │   └── en.json                 ← Inglés
│   │   (it.json y el.json eliminados — IT y EL removidos en julio 2026)
│   │
│   ├── lib/
│   │   ├── supabase.ts             ← Cliente Supabase
│   │   ├── rates.ts                ← Helpers fetch tasas + conversión
│   │   └── i18n.ts                 ← t(lang, key), LANGS array
│   │                                  (localePath() eliminado por huérfano)
│   └── content.config.ts           ← Schema de la colección ditari
│
├── supabase/functions/
│   ├── fetch-rates/index.ts        ← Cron 06:00 UTC: Frankfurter → daily_rates
│   └── fetch-fees/index.ts         ← Cron lunes 07:00: fees Wise/Remitly
│
├── public/_redirects               ← 301s Cloudflare: /it/* → /en/:splat, /el/* → /en/:splat
├── public/llms.txt                 ← Índice GEO para crawlers de IA
├── .nvmrc                          ← "22"
├── astro.config.mjs
└── package.json
```

---

## Cómo Fluye la Información

```
1. DATOS (Supabase)
   daily_rates: fecha / par / tasa / fuente (actualizada diariamente)
   provider_fees: wise / remitly / banco / comisión
   affiliate_clicks: registro de clics de afiliado

2. BUILD TIME (npm run build)
   Astro descubre todos los .md via glob recursivo → genera páginas de artículo
   src/pages/api/*.json.ts consulta Supabase → genera JSON estáticos en /dist
   Astro pre-renderiza todo el HTML con los datos del día

3. RUNTIME (navegador)
   React hidrata: Converter, RateTable, Remittance, SalaryCalc
   Usuario interactúa → cálculos en memoria, sin servidor
   Clic afiliado → POST a affiliate_clicks → redirige

4. ACTUALIZACIÓN DIARIA (cron automático)
   06:00 UTC: fetch-rates → Frankfurter API → daily_rates en Supabase
   Cloudflare Pages build nightly (o en cada push) usa datos del día
```

---

## Sistema de URLs

Todas las URLs terminan en `/` (`trailingSlash: 'always'`).

```
Albanés (SQ — sin prefijo, canónico):
  /                               → Home / conversor
  /kursi/                         → Conversor ALL↔divisas
  /kursi/tabela/                  → Tabla de tasas
  /kursi/historiku/               → Histórico 30 días
  /kursi/remitanca/               → Calculadora de remesas
  /albania/                       → Hub Albania
  /albania/paga/                  → Salario neto Albania
  /albania/bankat/                → Bancos Albania
  /albania/hipoteka/              → Hipoteca Albania
  /albania/kredia/                → Crédito personal
  /albania/kualifikim/            → Elegibilidad hipoteca
  /kosova/                        → Hub Kosovo (misma estructura)
  /ditari/                        → Índice artículos (ancho completo)
  /ditari/{type}/                 → Artículos por tipo
  /ditari/artikull/{type}/{slug}/ → Artículo individual
  /rreth-autorit/                 → Índice colaboradores
  /rreth-autorit/fa-parretti/     → Perfil autor

Inglés (/en/ prefix):
  /en/                            → Home EN
  /en/kursi/, /en/kursi/tabela/, ...
  /en/albania/, /en/albania/salary/, ...
  /en/ditari/, /en/ditari/artikull/{type}/{slug}/
  /en/rreth-autorit/, /en/rreth-autorit/fa-parretti/

Italiano y Griego: ELIMINADOS (julio 2026)
  → Redirects 301 en public/_redirects: /it/* → /en/:splat, /el/* → /en/:splat
```

---

## Sistema de Idiomas (i18n)

**Solo SQ y EN.** El italiano (IT) y griego (EL) fueron eliminados en julio 2026.

```typescript
// src/lib/i18n.ts
export type Lang = 'sq' | 'en';

export function t(lang: Lang, key: string): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['sq'][key] ?? key;
}
```

**Fallback:** idioma pedido → albanés → la propia clave.

**En React** (Nav.jsx): importa directamente `sq.json` y `en.json` y define su propia función `t()` interna.

**hreflang** (Base.astro): genera `sq-AL`, `en` y `x-default`. Sin `it` ni `el`.

---

## Sección de País (Albania / Kosovo)

Páginas en `src/pages/albania/` y `src/pages/kosova/`. Datos en `src/data/albania.json` y `src/data/kosovo.json`.

**Kosovo — Ley TAP 2026 (IMPORTANTE — ley anterior ya no aplica):**
```
Base imponible = bruto − Trusti 5%
Tramos sobre la base:
  0 – €250:    0%
  €250 – €450: 4%
  > €450:      10%
```

**Albania — TAP 2026:**
```
Hasta 40.000 ALL/mes:   0%
40.001 – 100.000 ALL:   6.7%  (retención proporcional al tramo)
> 100.000 ALL:          tarifia progresiva
Cotizaciones: Sigurim Shoqëror 9.5% + Sigurim Shëndetësor 1.7% = 11.2%
```

---

## Ditari — Sistema de Artículos

### Schema (`src/content.config.ts`)

```typescript
type: z.enum(['edukim', 'lajme', 'tech', 'ai', 'int'])
```

⚠️ **Regla crítica:** si `type` no está en ese enum exacto, Astro ignora el artículo **silenciosamente** (sin error). `"teknologji"`, `"ia"` etc. no funcionan.

### Organización por mes (OBLIGATORIA)

```
src/content/ditari/{sq|en}/{type}/AAAA-MM/{AAAA-MM-DD-slug}.md
public/ditari/images/AAAA-MM/{nombre}.webp
```

El glob `**/*.md` de Astro encuentra los archivos a cualquier profundidad. La carpeta del mes **no afecta la URL** — solo organiza el disco. La URL siempre viene del slug (último segmento del path, sin la fecha).

### Frontmatter completo

```yaml
---
title: "Título"
description: "Para SEO y tarjetas"
type: "edukim"          # edukim | lajme | tech | ai | int
category: "Pagat"       # etiqueta libre visible en la UI (en albanés en artículos SQ)
author: "F.A Parretti"  # se enlaza automáticamente a /rreth-autorit/fa-parretti/
coAuthor: ""
country: "Albania"
translationKey: "slug-unico-compartido-sq-en"
date: 2026-06-21
image: "/ditari/images/2026-06/nombre.webp"
imageAlt: "Descripción accesible"
readMinutes: 5
lang: "sq"              # debe coincidir con la carpeta sq/ o en/
---
```

### Generación automática de FAQ Schema

Los artículos con `<details>/<summary>` en el cuerpo generan automáticamente un bloque `FAQPage` JSON-LD en el `<head>` al momento del build — sin tocar el `.md`. La extracción ocurre con regex en `[slug].astro`:

```typescript
const faqRegex = /<summary[^>]*><b>([\s\S]*?)<\/b><\/summary>([\s\S]*?)<\/details>/gi;
// → emite @type:"FAQPage" si encuentra preguntas
```

Cobertura actual: ~38 de 40 artículos.

### Byline del autor → enlace automático

En ambas plantillas `[slug].astro`, el nombre del autor aparece como `<a>` al perfil:

```astro
<!-- SQ → /rreth-autorit/fa-parretti/ -->
<!-- EN → /en/rreth-autorit/fa-parretti/ -->
<a href="/rreth-autorit/fa-parretti/" class="article-byline-author">
  {author}
</a>
```

### Listados: contenedor ancho en desktop

Las 12 páginas de listado (`ditari/[...page].astro` × tipos × idiomas) usan `wide` en Base:
```astro
<Base ... wide>
```
→ `container--wide` (max-width: 1280px, grid 3 columnas ≥1100px). Los artículos individuales NO son wide (860px, mejor lectura).

### Tipos y colores de badge

```css
.ditari-badge--edukim  → rojo albanés
.ditari-badge--lajme   → rojo albanés
.ditari-badge--tech    → violeta (#EDE9FE / #7C3AED)
.ditari-badge--ai      → verde (#ECFDF5 / #059669)
.ditari-badge--int     → ámbar (#FEF3C7 / #D97706)
```

### Filtro de búsqueda

```css
/* OBLIGATORIO en el reset de Base.astro */
[hidden] { display: none !important; }
/* Sin !important, display:flex del card sobreescribe el hidden */
```

---

## Páginas de Autor / Colaboradores

Sistema extendable para múltiples autores y revisores.

### Estructura de URLs

```
/rreth-autorit/              → índice de todos los colaboradores (SQ)
/rreth-autorit/{slug}/       → perfil individual (ej: /rreth-autorit/fa-parretti/)
/en/rreth-autorit/           → índice EN
/en/rreth-autorit/{slug}/    → perfil EN
```

### Cómo agregar un nuevo colaborador

1. Crear `src/pages/rreth-autorit/{inicials-apellido}.astro` copiando `fa-parretti.astro`
2. Crear `src/pages/en/rreth-autorit/{inicials-apellido}.astro` (versión EN)
3. Agregar un objeto al array `contributors` en ambos archivos `index.astro`
4. Foto de perfil: usar iniciales en el avatar circular (no se requiere imagen real)

### Convención de slug

`iniciales-apellido` en minúscula sin tildes: `fa-parretti`, `ad-koci`, etc.

### Schema Person (JSON-LD)

Cada perfil emite automáticamente:
```json
{ "@type": "Person", "jobTitle": "...", "sameAs": ["linkedin-url"], "worksFor": { "@type": "Organization", "name": "leku.al" } }
```

---

## Conversor de Divisas

**Componente:** `src/components/Converter.jsx`  
**Datos:** `public/data/rates.json` (generado en build desde Supabase)  
**Pares:** ALL↔EUR, ALL↔USD, ALL↔GBP, ALL↔CHF

**Fuente:** Frankfurter API (BCE). La `date` en `rates.json` es la fecha de mercado del BCE — puede tener 1 día de desfase respecto al calendario (comportamiento normal del BCE).

**Remesas:** `src/components/Remittance.jsx` — compara Wise vs Remitly vs banco. Registra clics en `affiliate_clicks` antes de redirigir.

---

## Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* variables oscuras */ }
}
[data-theme="dark"] { /* toggle manual */ }
[data-theme="light"] { /* override manual a claro */ }
```

**Sin parpadeo:** script `is:inline` en `<head>` antes de cualquier CSS:
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

```javascript
function getSection(pathname) {
  const p = pathname.replace(/^\/en/, '') || '/';   // solo SQ/EN
  if (p === '/' || p === '/home') return 'home';
  if (p.startsWith('/kursi') || ...) return 'change';
  if (p.startsWith('/albania') || p.startsWith('/kosova')) return 'country';
  return 'home';   // /ditari/*, /rreth-autorit/* → HOME_LINKS
}
```

| Sección | Links |
|---|---|
| `home` | Kreu, Albania, Kosovo, Konvertuesi, Ditari |
| `change` | Konvertuesi, Tabela, Historiku, Remitanca |
| `country` | Kreu, Albania, Kosovo, Lajme + subtabs por país |

`pathname` = `Astro.url.pathname` (URL real con trailing slash). No es el prop `currentPath`.

---

## SEO y GEO

### robots.txt

`Allow: /` para `User-agent: *` — cubre GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot automáticamente. `DotBot: Disallow: /`. Crawl-delay para AhrefsBot y SemrushBot.

### sitemap.xml

Generado por `@astrojs/sitemap` en cada build. Solo hreflang `sq-AL` y `en`. Todas las URLs con trailing slash.

### llms.txt (GEO — Generative Engine Optimization)

`public/llms.txt` — índice en formato [llmstxt.org](https://llmstxt.org/) que le dice a los LLMs qué páginas son las más importantes del sitio. Se sirve en `https://leku.al/llms.txt`.

Para actualizar cuando se añadan secciones relevantes: editar `public/llms.txt` directamente.

### FAQPage Schema

Generado automáticamente en artículos con preguntas frecuentes (ver sección Ditari). Permite a Google mostrar acordeones en resultados de búsqueda (Rich Results).

---

## Google Analytics 4

Snippet en `Base.astro` dentro del `<head>` con `is:inline`:

```html
<script is:inline async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX');
</script>
```

Reemplazar `G-XXXXXXXXXX` con el Measurement ID real: Google Analytics → Admin → Data Streams.

---

## Despliegue (Cloudflare Pages)

```
git push origin main
        ↓
Cloudflare detecta el push
        ↓
npm run build  (Node 22, forzado por .nvmrc)
        ↓
/dist → CDN global (~2 min)
```

| Setting | Valor |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` (vía `.nvmrc`) |
| Framework preset | Astro |

**Variables de entorno en Cloudflare:**
```
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Caché CDN:** si una URL muestra contenido antiguo tras un deploy → "Purge cache" en el panel de Cloudflare Pages.

**Bot blocking:** verificar que "Block AI Scrapers and Crawlers" esté **desactivado** en Cloudflare Security → Bots (ese toggle opera independiente del robots.txt).

---

## Reglas de Código

- **TypeScript** en todo: `.ts`, `.tsx`, `.astro`
- **ES modules**: `import/export`, nunca `require()`
- **CSS**: variables del design system (`--red-albania`, `--ink`, etc.), nunca colores hardcodeados
- **Dark mode**: siempre `[data-theme="dark"]` + `prefers-color-scheme`, nunca solo uno
- **React**: solo para interactividad real (conversor, calculadoras, nav)
- **Textos**: SIEMPRE en `src/i18n/{sq|en}.json`, nunca hardcodeados
- **Números**: EN usa coma como separador de miles (`4,800`); SQ usa punto (`4.800`)
- **Imágenes ditari**: siempre en `public/ditari/images/AAAA-MM/` y commiteadas con `git add`
- **Trailing slash**: todas las `href` internas terminan en `/` — el build las valida
- **Autor articles**: `author: "F.A Parretti"` (sin punto después de A)

### Design system — colores clave

```css
--red-albania:   #E41E20   /* CTA, logo — nunca para errores */
--ink:           #1A1A1A   /* Títulos */
--ink-secondary: #4A4A4A   /* Párrafos */
--green-result:  #1A6B3C   /* Número resultado del conversor */
--bg-page:       #F7F6F3   /* Fondo de página */
--bg-card:       #FFFFFF   /* Tarjetas */
```

### Base.astro — props disponibles

```typescript
interface Props {
  title: string;
  description?: string;
  keywords?: string;
  lang?: 'sq' | 'en';
  currentPath?: string;    // para hreflang (ej: "/kosova/paga/")
  ogType?: string;         // default: 'website'. Usar 'profile' en páginas de autor
  wide?: boolean;          // default: false. true → container 1280px (listados ditari)
  allowedLangs?: ('sq' | 'en')[] | null;
  langLinks?: Partial<Record<'sq' | 'en', string>> | null;
}
```

---

## Checklist antes de publicar

**Artículo nuevo:**
- [ ] `type` es exactamente uno de: `edukim | lajme | tech | ai | int`
- [ ] `lang` coincide con la carpeta (`sq/` → `lang: "sq"`)
- [ ] `translationKey` coincide exactamente entre versión SQ y EN
- [ ] Archivo en `{type}/AAAA-MM/` con nombre `AAAA-MM-DD-slug.md`
- [ ] Imagen en `public/ditari/images/AAAA-MM/` y commiteada en git
- [ ] `image:` en frontmatter apunta a `/ditari/images/AAAA-MM/nombre.webp`
- [ ] Extensión `.md` presente (obvio pero crítico)
- [ ] `category:` en albanés para artículos SQ (no en español)

**Página nueva:**
- [ ] `currentPath` con trailing slash (`"/mi-pagina/"`)
- [ ] `langLinks` con trailing slash en ambas URLs
- [ ] Si tiene FAQs: formato `<details><summary><b>Pregunta</b></summary>Respuesta</details>`
- [ ] Si es perfil de autor: `ogType="profile"` en Base
- [ ] Si es listado de artículos: prop `wide` en Base

**General:**
- [ ] `npx astro check` → 0 errores
- [ ] `npm run build` completa sin errores
- [ ] Vista mobile (375px) correcta
- [ ] Dark mode funciona
- [ ] No aparece "kursi.al" en el frontend — siempre "leku.al"
- [ ] No hay texto hardcodeado fuera de `src/i18n/*.json`

---

**Agregar colaborador nuevo:**
1. `src/pages/rreth-autorit/{slug}.astro` (copiar `fa-parretti.astro`)
2. `src/pages/en/rreth-autorit/{slug}.astro` (versión EN)
3. Añadir objeto al array `contributors` en ambos `index.astro`

---

*Principio rector:*  
**"El albanés no técnico en mobile debe poder convertir en menos de 3 segundos."**
