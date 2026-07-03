# leku.al — Guía de SEO y Optimización para Buscadores

> Última actualización: julio 2026  
> Registro de todas las decisiones y cambios de SEO implementados en el sitio.

---

## Tabla de Contenidos

1. [Estado actual](#estado-actual)
2. [Sitemap](#sitemap)
3. [robots.txt](#robotstxt)
4. [GEO — llms.txt (para IAs)](#geo--llmstxt-para-ias)
5. [Idiomas y hreflang](#idiomas-y-hreflang)
6. [Structured Data (JSON-LD)](#structured-data-json-ld)
7. [Open Graph y Twitter Cards](#open-graph-y-twitter-cards)
8. [Redirects 301 y corrección de 404s](#redirects-301-y-corrección-de-404s)
9. [Trailing Slash — consistencia de URLs](#trailing-slash--consistencia-de-urls)
10. [Checklist SEO antes de publicar](#checklist-seo-antes-de-publicar)

---

## Estado actual

| Métrica | Estado |
|---|---|
| Sitemap auto-generado | ✅ `sitemap-index.xml` → `sitemap-0.xml` (119 URLs) |
| robots.txt | ✅ Allow: / para todos, IAs incluidas |
| llms.txt (GEO) | ✅ Curado para crawlers de IA |
| hreflang SQ↔EN | ✅ Por URL de artículo (no por índice) |
| og:image dinámico | ✅ Imagen propia por artículo (.webp) |
| FAQPage schema | ✅ Auto-generado en 38 de 40 artículos |
| Article / NewsArticle schema | ✅ En todas las páginas de artículo |
| Person schema (autor) | ✅ En páginas de colaboradores |
| 404s corregidos (GSC) | ✅ 38 URLs → redirects 301 |
| Cadenas de redirect | ✅ Reducidas a 1 hop |
| Trailing slash unificado | ✅ `trailingSlash: 'always'` |

---

## Sitemap

### Configuración

El sitemap se genera **automáticamente** en cada build vía `@astrojs/sitemap`.

```javascript
// astro.config.mjs
sitemap({
  i18n: {
    defaultLocale: 'sq',
    locales: { sq: 'sq-AL', en: 'en' },
  },
})
```

### Estructura generada

```
https://leku.al/sitemap-index.xml   ← referenciado en robots.txt
    └── https://leku.al/sitemap-0.xml  ← 119 URLs reales con hreflang
```

### Problema resuelto: sitemap.xml manual

**Antes:** existía `public/sitemap.xml` creado manualmente con URLs muertas:
- `/blog/`, `/en/blog/` → sección eliminada → 404
- `/it/kursi/` etc. → idioma eliminado → 301
- Artículos del blog que no existían → 404
- URLs sin trailing slash → cadenas de redirect

**Solución:** eliminado `public/sitemap.xml`. Google ahora solo ve el sitemap auto-generado, correcto y actualizado en cada deploy.

### Enviado a Google Search Console

URL a registrar: `https://leku.al/sitemap-index.xml`

---

## robots.txt

`public/robots.txt` — allow-by-default, ningún bloqueo problemático.

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_astro/

Sitemap: https://leku.al/sitemap-index.xml

User-agent: AhrefsBot
Crawl-delay: 10
User-agent: SemrushBot
Crawl-delay: 10
User-agent: MJ12bot
Crawl-delay: 20
User-agent: DotBot
Disallow: /
```

**Crawlers de IA permitidos** por defecto vía `Allow: /`:
GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended,
CCBot (Common Crawl), Amazonbot — todos sin bloqueos.

**Nota Cloudflare:** verificar que el toggle "Block AI Scrapers and Crawlers"
en Security → Bots esté **desactivado** — opera independiente de robots.txt.

---

## GEO — llms.txt (para IAs)

`public/llms.txt` — estándar [llmstxt.org](https://llmstxt.org/) que le dice a
los LLMs (ChatGPT, Claude, Perplexity, Gemini) qué páginas son las más
importantes del sitio sin tener que rastrear el sitemap completo.

Sirve en: `https://leku.al/llms.txt`

**Estructura:**
```
# leku.al
> [resumen en una línea]

Contexto del sitio...

## Secciones con links y descripciones
- [Título](https://leku.al/pagina/): descripción breve

## Optional
- [Páginas secundarias menos prioritarias](...)
```

**Para actualizar:** editar `public/llms.txt` cuando se añadan secciones
relevantes nuevas al sitio.

---

## Idiomas y hreflang

### Idiomas activos

| Código | Idioma | Prefijo URL | Scope |
|---|---|---|---|
| `sq` | Albanés | *(ninguno)* | Todo el sitio |
| `en` | Inglés | `/en/` | Todo el sitio |

Italiano (`/it/`) y Griego (`/el/`) fueron eliminados en julio 2026.
Sus URLs están cubiertas con 301 redirects en `public/_redirects`.

### Implementación en Base.astro

```html
<!-- Usa langLinks cuando existen (artículos), currentPath para el resto -->
<link rel="alternate" hreflang="sq"
  href={langLinks?.sq ? `${SITE}${langLinks.sq}` : `${SITE}${currentPath}`} />
<link rel="alternate" hreflang="en"
  href={langLinks?.en ? `${SITE}${langLinks.en}` : `${SITE}/en${currentPath}`} />
<link rel="alternate" hreflang="x-default"
  href={langLinks?.sq ? `${SITE}${langLinks.sq}` : `${SITE}${currentPath}`} />
```

### Bug corregido: hreflang en artículos

**Problema (causó que Google indexara solo 61/118 páginas):**

Los templates de artículo pasaban `currentPath="/ditari/"` en vez de la URL
real del artículo. Resultado: todos los artículos declaraban hreflang apuntando
al índice `/ditari/` → Google los consideraba duplicados del índice y los
descartaba.

**Causa raíz secundaria:** el matching SQ↔EN buscaba por slug idéntico en el
filename. Como los filenames son diferentes en albanés vs inglés, el match
siempre fallaba y `langLinks.en` caía al fallback `/en/ditari/`.

**Solución:**
1. Base.astro usa `langLinks` para hreflang cuando está disponible
2. Matching cambiado de slug → `translationKey` (campo compartido entre pares)

```typescript
// Antes (incorrecto — solo matcheaba si el filename era idéntico en ambos idiomas)
enEntries.find(e => e.id.split('/').pop().replace(/^\d{4}-\d{2}-\d{2}-/, '') === slug)

// Ahora (correcto — busca por campo compartido explícitamente)
enEntries.find(e => e.data.translationKey === entry.data.translationKey)
```

**Resultado:** Google descubrió las ~57 páginas de artículo que antes
ignoraba. Tiempo de indexación estimado: 2-4 semanas tras el fix.

---

## Structured Data (JSON-LD)

### 1. Organization + WebSite (todas las páginas)

Emitido en `Base.astro` vía `<script type="application/ld+json">`.

```json
{
  "@type": ["Organization", "FinancialService"],
  "name": "leku.al",
  "url": "https://leku.al",
  "knowsLanguage": ["sq", "en"],
  "serviceType": "Currency Exchange Calculator, Mortgage Calculator..."
}
```

### 2. Article / NewsArticle (páginas de artículo)

```json
{
  "@type": "Article",
  "headline": "Título del artículo",
  "image": "https://leku.al/ditari/images/2026-06/nombre.webp",
  "datePublished": "2026-06-03T00:00:00.000Z",
  "inLanguage": "sq",
  "publisher": { "@type": "Organization", "name": "leku.al" }
}
```

- `@type = "NewsArticle"` cuando `type: "lajme"`
- `@type = "Article"` para `edukim`, `tech`, `ai`, `int`

### 3. FAQPage (automático en artículos con preguntas frecuentes)

Generado en build time parseando el body del artículo con regex.
Detecta bloques `<details><summary><b>Pregunta</b></summary>Respuesta</details>`.

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Pregunta?",
      "acceptedAnswer": { "@type": "Answer", "text": "Respuesta..." }
    }
  ]
}
```

**Cobertura:** ~38 de 40 artículos tienen FAQPage generado automáticamente.
Permite a Google mostrar acordeones en los resultados de búsqueda (Rich Results).

**Para activar en un artículo nuevo:** simplemente usar el formato
`<details><summary><b>Pregunta</b></summary>` en el cuerpo del artículo.
El schema se genera sin tocar ningún componente.

### 4. Person (páginas de autor)

```json
{
  "@type": "Person",
  "name": "F.A. Parretti",
  "url": "https://leku.al/rreth-autorit/fa-parretti/",
  "sameAs": ["https://www.linkedin.com/in/felipe-andres-parra-alvarez/"],
  "jobTitle": "Inxhinier Softuerësh dhe Pedagog",
  "knowsLanguage": ["es", "en", "sq"],
  "worksFor": { "@type": "Organization", "name": "leku.al" }
}
```

Verificar con: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## Open Graph y Twitter Cards

### og:image dinámico por artículo

**Antes:** todos los artículos usaban `/og-image.svg` (archivo SVG que ni
siquiera existía → og:image roto en todas las páginas).

**Ahora:** cada artículo usa su propia imagen de portada.

```typescript
// Base.astro
const ogImageUrl  = ogImage ? `${SITE}${ogImage}` : `${SITE}/lekulogo.webp`;
const ogImageType = 'image/webp';
```

```astro
<!-- En los templates de artículo -->
<Base ogImage={image} ogType="article" ...>
```

| Tipo de página | og:image | og:type |
|---|---|---|
| Artículos del Ditari | Imagen propia del artículo (webp, absoluta) | `article` |
| Home, Albania, Kosovo... | `/lekulogo.webp` (logo del Lek, fallback) | `website` |
| Páginas de autor | `/lekulogo.webp` | `profile` |

**Dimensiones declaradas:** 1200×630 (estándar recomendado para social sharing).
Las imágenes de artículo son `.webp` — soporte universal en todas las
plataformas (Facebook, LinkedIn, WhatsApp, Twitter/X).

**Fallback (`/lekulogo.webp`):** logo del símbolo Lek albanés en azul,
formato cuadrado ~800×800px. Funciona para compartir en redes aunque no
es el formato ideal 1200×630 horizontal. Para mejores previews en páginas
no-artículo, reemplazar por una imagen 1200×630 real.

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://leku.al/ditari/images/.../nombre.webp">
```

---

## Redirects 301 y corrección de 404s

### Archivo `public/_redirects` (Cloudflare Pages)

Reglas procesadas **top-down**, primera coincidencia gana.
Siempre poner reglas explícitas ANTES de wildcards.

**86 reglas totales** cubriendo:

#### Grupo 1: Blog → Ditari (404s históricos)

El `sitemap.xml` manual antiguo tenía URLs de `/blog/` que Google rastreó.
La sección blog fue eliminada y reemplazada por `/ditari/`.

```
/blog                                                  → /ditari/
/blog/*                                                → /ditari/
/en/blog/*                                             → /en/ditari/
/blog/wise-ose-remitly-kush-eshte-me-i-lire-shqiperi  → /ditari/
/blog/bankate-me-te-mira-hipoteke-shqiperi-2025        → /ditari/
/blog/pagat-mesatare-sipas-profesionit-shqiperi-2025   → /ditari/
/en/blog/albania-vs-kosovo-cost-of-living-2025         → /en/ditari/
/en/blog/best-mortgage-rates-albania-2025              → /en/ditari/
```

#### Grupo 2: /it/ Albania y Kosovo → versión albanesa

El wildcard `/it/*` → `/en/:splat` mandaba erróneamente a `/en/albania/`.
Las reglas explícitas (antes del wildcard) corrigen el destino.

```
/it/albania        → /albania/
/it/albania/bankat → /albania/bankat/
/it/kosova         → /kosova/
... (todas con y sin trailing slash)
/it/blog           → /ditari/
/it/en/ditari      → /ditari/
```

#### Grupo 3: /el/ Albania y Kosovo → versión albanesa

Mismo fix que Grupo 2 para el griego.

```
/el/albania        → /albania/
/el/albania/bankat → /albania/bankat/
/el/kosova         → /kosova/
... (todas con y sin trailing slash)
/el/blog           → /ditari/
/el/en/ditari      → /ditari/
/en/en/ditari      → /en/ditari/   (URL rara que Google crawleó)
```

### Redirects en `astro.config.mjs`

Para rutas legacy de la estructura anterior del conversor:

```javascript
redirects: {
  '/tabela':     '/kursi/tabela/',    // trailing slash → evita segundo hop
  '/historiku':  '/kursi/historiku/',
  '/remitanca':  '/kursi/remitanca/',
  '/change':     '/kursi/',
  '/en/change':  '/en/kursi/',
  // ... etc.
}
```

### Cadenas de redirect resueltas

**Antes:** los destinos en `_redirects` no tenían trailing slash.
Con `trailingSlash: 'always'`, Cloudflare hacía un segundo salto:

```
ORIGEN → DESTINO sin slash → DESTINO con slash  (2 hops = cadena)
```

**Ahora:** todos los destinos tienen trailing slash explícito → 1 hop directo.

---

## Trailing Slash — consistencia de URLs

```javascript
// astro.config.mjs
trailingSlash: 'always'
```

Todas las URLs generadas terminan en `/`:
- `https://leku.al/ditari/` ✅
- `https://leku.al/albania/paga/` ✅
- `https://leku.al/ditari/artikull/lajme/titulo/` ✅

**Implicación para links internos:** todos los `href` en componentes y páginas
deben tener trailing slash. Los que no la tienen provocan un salto 301 extra
de Cloudflare antes de servir la página.

Audit realizado en julio 2026: ~150 href corregidos en Nav.jsx,
DitariCard, DitariFilters, DitariSidebar y todas las páginas .astro.

---

## Checklist SEO antes de publicar

### Artículo nuevo

- [ ] `type` es exactamente: `edukim | lajme | tech | ai | int`
- [ ] `lang` coincide con la carpeta (`sq/` → `lang: "sq"`)
- [ ] `translationKey` coincide exactamente entre SQ y EN (para hreflang)
- [ ] `image: "/ditari/images/AAAA-MM/nombre.webp"` y el archivo existe en git
- [ ] `date` coincide con el mes de la carpeta (ej. en `2026-07/` poner `date: 2026-07-XX`)
- [ ] Si tiene preguntas frecuentes: usar `<details><summary><b>Pregunta</b></summary>`
  para activar FAQPage schema automáticamente

### Verificación de structured data

Pegar la URL en: https://search.google.com/test/rich-results

Debe mostrar:
- `Article` o `NewsArticle` para artículos
- `FAQPage` si el artículo tiene preguntas frecuentes
- `Person` en páginas de colaboradores
- `Organization` en todas las páginas

### Verificación de hreflang

Para un artículo que tiene versión SQ y EN, la URL SQ debe apuntar a la EN y viceversa:

```html
<!-- En /ditari/artikull/lajme/qira-apo-kredi-ne-shqiperi/ -->
<link rel="alternate" hreflang="sq" href="https://leku.al/ditari/artikull/lajme/qira-apo-kredi-ne-shqiperi/">
<link rel="alternate" hreflang="en" href="https://leku.al/en/ditari/artikull/lajme/rent-or-mortgage-in-albania/">
```

Si los dos artículos tienen el mismo `translationKey`, el linking es automático.

### Agregar redirect nuevo

Si se elimina una página o se cambia una URL:
1. Abrir `public/_redirects`
2. Agregar regla **ANTES** de los wildcards (`/it/*`, `/el/*`, `/blog/*`)
3. Siempre incluir trailing slash en el destino: `→ /nueva-url/`
4. Incluir ambas variantes (con y sin slash en origen):
   ```
   /url-vieja    /nueva-url/   301
   /url-vieja/   /nueva-url/   301
   ```

### Solicitar re-indexación en GSC

Tras cada cambio importante de SEO:
1. Google Search Console → URL Inspection
2. Pegar la URL
3. → "Solicitar indexación"

Para acelerar después de corrección masiva de 404s:
1. GSC → Sitemaps → Enviar `https://leku.al/sitemap-index.xml`
2. GSC → Cobertura → marcar los errores resueltos como "Validar corrección"

---

*Documento creado en julio 2026. Actualizar cuando se implementen nuevas
optimizaciones de SEO.*
