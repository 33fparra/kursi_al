# Arquitectura de Monlen — Guía Completa

> Última actualización: junio 2026  
> Plataforma de herramientas financieras para el Caribe y Latinoamérica.

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Archivos Clave](#archivos-clave)
5. [Cómo Fluye la Información](#cómo-fluye-la-información)
6. [Sistema de URLs](#sistema-de-urls)
7. [Sistema de Idiomas](#sistema-de-idiomas)
8. [Datos por País](#datos-por-país)
9. [Componentes React (Calculadoras)](#componentes-react-calculadoras)
10. [Cómo Agregar un País Nuevo](#cómo-agregar-un-país-nuevo)
11. [Actualización de Datos Bancarios](#actualización-de-datos-bancarios)
12. [Despliegue](#despliegue)
13. [Variables de Entorno](#variables-de-entorno)

---

## Visión General

Monlen es un **sitio estático** (no hay servidor, no hay base de datos) que se construye una vez y se sirve desde una CDN global (Cloudflare Pages). Cuando el usuario abre una página, recibe HTML + CSS + JavaScript ya generados — extremadamente rápido.

```
Usuario abre monlen.com
        ↓
Cloudflare Pages (CDN global)
        ↓
Sirve archivos estáticos ya construidos (HTML, CSS, JS)
        ↓
React hidrata los componentes interactivos en el navegador
        ↓
Usuario interactúa con calculadoras (todo corre en el navegador, sin servidor)
```

**¿Por qué estático?**
- Carga instantánea en cualquier parte del mundo
- Costo casi cero (Cloudflare Pages es gratis en el tier básico)
- Seguridad: no hay servidor que hackear
- SEO perfecto: Google indexa el HTML real

---

## Stack Tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **Framework** | Astro 5.x | Genera HTML estático con islas de interactividad |
| **UI interactivo** | React 19 | Las calculadoras necesitan estado en tiempo real |
| **Estilos** | Tailwind CSS 4.x | Utilidades CSS, sin CSS personalizado extenso |
| **Íconos** | Lucide React | SVG consistentes, sin emojis |
| **Tipografía** | Plus Jakarta Sans + Instrument Serif | Display editorial + body moderno |
| **Deploy** | Cloudflare Pages | CDN global, gratis, auto-deploy desde GitHub |
| **Edge Functions** | Cloudflare Pages Functions | Solo para `/api/geo` (geolocalización) |
| **Datos** | JSON estático | Un archivo por país, actualizado por scripts |

### La diferencia entre Astro y React en este proyecto

```
Astro → construye el HTML en tiempo de BUILD (cuando haces npm run build)
         Maneja: layouts, SEO, rutas, páginas estáticas

React → corre en el NAVEGADOR del usuario
         Maneja: calculadoras interactivas (estado, inputs, recálculo en tiempo real)
```

Un componente React dentro de Astro se llama **"isla"** — el resto de la página es HTML estático.

---

## Estructura de Carpetas

```
monlen/
│
├── public/                    ← Archivos servidos directamente (sin procesar)
│   ├── faviconLogo.ico        ← Favicon del navegador
│   ├── faviconLogo.svg        ← Logo SVG (usado en el header)
│   ├── money-stack.svg        ← Animación SVG de la página principal
│   ├── robots.txt             ← Instrucciones para crawlers de Google
│   ├── _headers               ← Headers HTTP de Cloudflare (cache, seguridad)
│   ├── _redirects             ← Redirecciones 301 de Cloudflare
│   └── og-default.png.svg     ← Imagen para redes sociales (Open Graph)
│
├── functions/                 ← Cloudflare Pages Functions (edge, serverless)
│   └── api/
│       └── geo.ts             ← Detecta el país del visitante (gratis, sin API externa)
│
├── src/
│   ├── styles/
│   │   └── global.css         ← Estilos globales: colores, tipografía, body
│   │
│   ├── lib/                   ← Lógica central (sin UI)
│   │   ├── registry.ts        ← ★ ARCHIVO MÁS IMPORTANTE: lista de países activos
│   │   ├── types.ts           ← Tipos TypeScript para los datos de países
│   │   ├── formulas.ts        ← Cálculos: salario neto, hipoteca, préstamo
│   │   ├── i18n.ts            ← Función t() para traducir textos EN/ES
│   │   ├── country.ts         ← Helpers para leer el país/idioma desde la URL
│   │   └── schema.ts          ← Generadores de JSON-LD (SEO: FAQPage, BreadcrumbList)
│   │
│   ├── data/
│   │   └── countries/         ← Un JSON por país con todos sus datos
│   │       ├── pr.json        ← Puerto Rico
│   │       ├── pa.json        ← Panamá
│   │       ├── jm.json        ← Jamaica
│   │       └── do.json        ← República Dominicana
│   │
│   ├── layouts/
│   │   └── Layout.astro       ← Marco HTML de todas las páginas (SEO, meta tags, fonts)
│   │
│   ├── components/
│   │   ├── Header.astro       ← Barra superior: logo, nav, selector de países, idioma
│   │   ├── Footer.astro       ← Pie de página: links de países y herramientas
│   │   ├── CountrySelector.astro  ← Página principal: hero + SVG + cards de países
│   │   ├── CountryHero.astro  ← Hero de cada página de país (bandera, stats, nombre)
│   │   ├── AdSlot.astro       ← Placeholder para publicidad (desactivado, listo para activar)
│   │   └── calculators/       ← Componentes React (interactivos)
│   │       ├── SalaryCalc.tsx        ← Calculadora de salario neto
│   │       ├── MortgageCalc.tsx      ← Calculadora de hipoteca + amortización
│   │       ├── LoanCalc.tsx          ← Calculadora de préstamo personal
│   │       ├── BankComparison.tsx    ← Tabla comparativa de bancos
│   │       ├── SalaryComparison.tsx  ← Gráficas de comparación salarial
│   │       ├── ExchangeRates.tsx     ← Divisas en tiempo real (/change)
│   │       └── FormattedInput.tsx    ← Input con formato de miles (1,000,000)
│   │
│   └── pages/                 ← Cada archivo = una URL del sitio
│       ├── index.astro        ← /  (página principal, inglés)
│       ├── sitemap.xml.ts     ← /sitemap.xml (auto-generado)
│       ├── change.astro       ← /change (divisas)
│       ├── pr/                ← Puerto Rico (inglés)
│       │   ├── index.astro    ← /pr/
│       │   ├── salary.astro   ← /pr/salary
│       │   ├── mortgage.astro ← /pr/mortgage
│       │   ├── loan.astro     ← /pr/loan
│       │   ├── banks.astro    ← /pr/banks
│       │   ├── comparison.astro ← /pr/comparison
│       │   └── salary/[profession].astro ← /pr/salary/doctor, /pr/salary/engineer...
│       ├── pa/                ← Panamá (inglés) — misma estructura
│       ├── jm/                ← Jamaica (inglés) — misma estructura
│       ├── do/                ← Rep. Dominicana (inglés) — misma estructura
│       └── es/                ← Versiones en español
│           ├── index.astro    ← /es/
│           ├── change.astro   ← /es/change
│           ├── pr/            ← /es/pr/salario, /es/pr/hipoteca...
│           ├── pa/            ← /es/pa/...
│           └── do/            ← /es/do/...
│
├── scripts/                   ← Scripts de actualización de datos (Node.js)
│   ├── run-update.ts          ← Script maestro: actualiza todos los países
│   ├── checkStale.ts          ← Verifica si los datos están desactualizados
│   ├── fetchers/
│   │   ├── fetchBankRates.ts  ← Obtiene tasas bancarias (FRED API + scrapers)
│   │   └── fetchExchangeRates.ts ← Obtiene tipos de cambio (Frankfurter API)
│   └── builders/
│       └── validateCountryJson.ts ← Valida que los JSON de países sean correctos
│
├── docs/
│   └── COMO-ACTUALIZAR-TASAS.md ← Guía para actualizar tasas bancarias (no-developers)
│
├── .github/
│   └── workflows/
│       └── update-data.yml    ← GitHub Actions: actualiza datos el 1ro de cada mes
│
├── astro.config.mjs           ← Configuración de Astro (output: static, React, Tailwind)
├── package.json               ← Dependencias del proyecto
└── .env.example               ← Plantilla de variables de entorno
```

---

## Archivos Clave

### `src/lib/registry.ts` — El archivo más importante

Define **qué países existen** en el sitio. Todo lo demás (sitemap, header, footer, selector de países) lo lee de aquí.

```typescript
// Para activar Jamaica: cambiar active: false → true
// El sitemap, header y footer se actualizan solos en el próximo build
{
  code: 'jm',
  name: { en: 'Jamaica' },
  currency: 'JMD',
  langs: ['en'],        // Jamaica solo tiene inglés
  active: true,         // ← aquí
  tools: {
    salary: true,
    mortgage: true,
    comparison: false,  // ← Jamaica no tiene comparación aún
  }
}
```

### `src/lib/formulas.ts` — Los cálculos financieros

Funciones puras (sin UI). Reciben números, devuelven números.

```typescript
calcNetSalary(gross, ssRate, hiRate, otherRates, brackets)  → { net, incomeTax, ... }
calcMortgage(amount, annualRatePct, years, includeAmort)     → { monthly, totalPaid, ... }
calcLoan(amount, annualRatePct, months)                      → { monthly, totalInterest, ... }
fmtCurrency(value, currencyCode, symbol)                     → "RD$42,000"
```

### `src/lib/i18n.ts` — Traducciones

Sistema minimalista: inglés siempre primero, español como fallback.

```typescript
t(lang, 'Net Salary', 'Salario Neto')   // → "Net Salary" o "Salario Neto"
tMap(lang, { en: 'Doctor', es: 'Médico' }) // → el texto en el idioma correcto
```

### `src/layouts/Layout.astro` — El marco de todas las páginas

Contiene el `<head>` de HTML con:
- Meta tags SEO (title, description, canonical)
- Open Graph (vista previa en redes sociales)
- hreflang (le dice a Google qué versión mostrar por idioma)
- JSON-LD schemas (FAQPage, BreadcrumbList, Organization)
- Links a fuentes (Plus Jakarta Sans, Instrument Serif)
- Verificación de Google Search Console y Bing

### `src/lib/schema.ts` — SEO avanzado

Genera el JSON-LD que Google usa para mostrar Rich Results:
- `FAQPage` → en páginas de profesión (ej: `/pr/salary/doctor`)
- `BreadcrumbList` → migas de pan en todas las páginas
- `WebApplication` → en páginas de calculadoras
- `Organization` → en todas las páginas

---

## Cómo Fluye la Información

```
1. DATOS (JSON)
   src/data/countries/pr.json
   └─ taxBrackets, banks, minWage, professions...

2. REGISTRO
   src/lib/registry.ts
   └─ qué países están activos, qué herramientas tiene cada uno

3. BUILD TIME (cuando haces npm run build)
   Astro lee el registry → genera las URLs correctas
   Astro importa el JSON → pasa los datos a cada página
   Astro renderiza el HTML → incluye los datos pre-computados

4. RUNTIME (en el navegador del usuario)
   React hidrata las calculadoras
   Usuario escribe un salario → React recalcula en tiempo real
   No hay llamadas a ningún servidor para los cálculos
```

---

## Sistema de URLs

```
Inglés (canónico, sin prefijo):    /pr/salary     /pa/mortgage    /do/loan
Español (prefijo /es/):            /es/pr/salario  /es/pa/hipoteca /es/do/prestamo

Página principal:
  /         → Selector de países (inglés)
  /es/      → Selector de países (español)

Página de divisas:
  /change   → Tipos de cambio en tiempo real (inglés)
  /es/change → (español)

Páginas SEO de profesión (auto-generadas desde los datos):
  /pr/salary/doctor    /pr/salary/engineer    /pr/salary/nurse...
  /es/pr/salario/medico  /es/pr/salario/ingeniero...
```

El mapa de slugs inglés → español está en `Header.astro` (`EN_TO_ES`):
```
salary ↔ salario  |  mortgage ↔ hipoteca  |  loan ↔ prestamo
banks ↔ bancos    |  comparison ↔ comparacion
```

---

## Sistema de Idiomas

**Regla fundamental:** inglés primero, siempre.

- Las URLs en inglés son las canónicas (las que Google indexa como principales)
- Las URLs en español tienen el prefijo `/es/`
- Jamaica solo tiene inglés (`langs: ['en']`) → no tiene `/es/jm/`
- Al cambiar de idioma, el Header detecta la página actual y te lleva al equivalente correcto

```typescript
// Ejemplo: estás en /pr/salary/doctor → cambias a ES → vas a /es/pr/salario/doctor
// El profession ID (doctor, engineer) es el mismo en ambos idiomas
```

---

## Datos por País

Cada país tiene un JSON en `src/data/countries/XX.json` con esta estructura:

```json
{
  "code": "pr",
  "currency": { "code": "USD", "symbol": "$", "usdRate": 1 },

  "salary": {
    "minWage": 1658,
    "socialSecurity": 0.062,          ← 6.2%
    "healthInsurance": 0.0145,         ← 1.45%
    "incomeTax": {
      "annualOrMonthly": "annual",
      "brackets": [...]               ← tablas fiscales progresivas
    }
  },

  "_____EDIT_BANK_RATES_BELOW_____": "⬇️ EDITAR AQUÍ CADA 2 SEMANAS",

  "banks": [
    {
      "name": "Banco Popular",
      "mortgageRateUSD": 6.75,        ← tasa hipotecaria
      "loanRatePct": 12.99,           ← tasa de préstamo personal
      "featured": true                ← aparece primero y resaltado
    }
  ],

  "_____END_OF_BANK_RATES_____": "⬆️ FIN DE LA SECCIÓN EDITABLE",

  "comparison": {
    "professions": [...]              ← datos para páginas SEO de profesión
  },

  "_meta": {
    "lastVerified": "2026-05",
    "nextReviewDue": "2027-01",
    "sources": { ... }               ← URLs de fuentes oficiales
  }
}
```

Los marcadores `_____EDIT_BANK_RATES_BELOW_____` son guías visuales para editar sin romper la estructura.

---

## Componentes React (Calculadoras)

Todos los componentes React están en `src/components/calculators/`. Se montan en las páginas Astro con `client:load`:

```astro
<!-- Astro renderiza el HTML vacío en build time -->
<!-- React hidrata e interactúa en el navegador del usuario -->
<SalaryCalc client:load data={prData} lang="en" />
```

### `FormattedInput.tsx`
Input especial que muestra números con separadores de miles mientras el usuario escribe:
- Tipo: `text` + `inputMode="numeric"` (teclado numérico en móvil)
- Límites: salario máx 100M, hipoteca máx 20M, préstamo máx 10M
- Padding dinámico según el símbolo (`$` → 1.8rem, `J$` → 2.4rem, `RD$` → 2.9rem)

### `MortgageCalc.tsx` y `LoanCalc.tsx`
Usan `useRef` para el input de tasa — patrón más robusto que input controlado de React para evitar el bug de actualización al cambiar banco.

### `ExchangeRates.tsx`
Fetch a `api.exchangerate-api.com/v4/latest/{base}` al cargar la página (solo 1 vez). Muestra timestamp exacto de cuándo se consultó. Refresh manual disponible.

---

## Cómo Agregar un País Nuevo

**Tiempo estimado: 4–8 horas (la mayoría buscando datos reales)**

```
□ 1. Crear src/data/countries/XX.json
      Copiar estructura de pr.json, llenar con datos reales
      Mínimo: 3 bancos, tramos fiscales, salario mínimo

□ 2. Agregar en src/lib/registry.ts
      active: false inicialmente (aparece como "próximamente")

□ 3. Crear páginas en inglés: src/pages/XX/
      index, salary, mortgage, loan, banks, comparison,
      salary/[profession] (auto-genera páginas SEO)

□ 4. Crear páginas en español (si aplica): src/pages/es/XX/
      index, salario, hipoteca, prestamo, bancos, comparacion,
      salario/[profesion]

□ 5. Actualizar scripts:
      fetchExchangeRates.ts → agregar XX: 'CÓDIGO_MONEDA'
      run-update.ts → agregar 'XX' al array de países

□ 6. npm run validate:json -- --country XX
      Verifica que el JSON tiene todos los campos requeridos

□ 7. npm run build
      Verifica que no hay errores de compilación

□ 8. registry.ts: cambiar active: false → true

□ 9. git push → Cloudflare despliega automáticamente
```

---

## Actualización de Datos Bancarios

Ver `docs/COMO-ACTUALIZAR-TASAS.md` para guía completa.

**Resumen:** Editar los números en `src/data/countries/XX.json` entre los marcadores, luego hacer `git push`.

**Fuentes oficiales por país:**

| País | Fuente tasas hipotecarias | Fuente tasas préstamos |
|------|--------------------------|----------------------|
| Puerto Rico | bankrate.com/mortgages/puerto-rico | Misma |
| Panamá | superbancos.gob.pa/tasas-de-interes | Misma |
| Jamaica | boj.org.jm/statistics | Misma |
| Rep. Dominicana | bancentral.gov.do | Misma |

**Automatización mensual (GitHub Actions):**
El 1ro de cada mes, `.github/workflows/update-data.yml` ejecuta `scripts/run-update.ts`. Si los datos cambiaron, crea un Pull Request para revisión humana antes de publicar.

---

## Despliegue

```
Flujo normal:
git push origin main
       ↓
GitHub recibe el commit
       ↓
Cloudflare Pages detecta el push
       ↓
Ejecuta: npm run build
       ↓
Sube el contenido de /dist a la CDN global
       ↓
Sitio actualizado en ~2 minutos
```

**Configuración en Cloudflare Pages:**

| Setting | Valor |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `20` (agregar `NODE_VERSION=20` en env vars) |

**No se necesita adaptador.** El archivo `astro.config.mjs` tiene `output: 'static'` sin ningún adaptador — es el modo correcto para Cloudflare Pages estático.

La función de geolocalización (`functions/api/geo.ts`) la detecta Cloudflare automáticamente de la carpeta `functions/` — no requiere configuración adicional.

---

## Variables de Entorno

Configurar en Cloudflare Pages → Settings → Environment variables:

```bash
# Obligatorio para el build
NODE_VERSION=20

# SEO — verificación de buscadores (opcionales)
PUBLIC_GSC_VERIFY=tu_codigo_de_google_search_console
PUBLIC_BING_VERIFY=tu_codigo_de_bing_webmaster

# Publicidad — activar cuando estés listo
PUBLIC_ADS_ACTIVE=false   # cambiar a "true" para mostrar ads

# Scripts de actualización de datos (local o en GitHub Actions)
FRED_API_KEY=tu_api_key_gratuita_de_fred.stlouisfed.org
```

Para desarrollo local, copiar `.env.example` a `.env` y llenar los valores.

---

## Comandos Útiles

```bash
# Desarrollo local
npm run dev              # Servidor en http://localhost:4321

# Build y preview
npm run build            # Genera /dist
npm run preview          # Preview del build en localhost

# Validación de datos
npm run validate:json    # Verifica todos los JSON de países
npm run check:stale      # Alerta si algún dato está vencido

# Actualización de datos
npx tsx scripts/run-update.ts --all          # Actualiza todos los países
npx tsx scripts/run-update.ts --country pr   # Solo Puerto Rico
```

---

*Arquitectura diseñada con el principio:*  
**"Agregar un país nuevo nunca debe requerir tocar el núcleo — solo datos y conexión."**
