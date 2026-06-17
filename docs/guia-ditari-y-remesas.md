# Guía rápida — Ditari i Lekut, cambio de divisas y remesas

> Documento de referencia para añadir contenido (artículos, traducciones) y entender/extender las herramientas de cambio de divisas y remesas de kursi.al / leku.al.

---

## 1. Qué se arregló en esta sesión (selector de idioma)

**Problema:** en artículos de `/ditari/artikull/...` cuando la traducción al otro idioma tenía un slug distinto al original (ej. `parate-e-tua-po-zvogelohen` en sq vs `your-money-is-shrinking` en en), el selector de idioma del nav se mostraba "vacío" o "escondido" al abrirlo, y no dejaba cambiar de sq ↔ en.

**Causa:** la página restringía `allowedLangs` a un solo idioma cuando no encontraba una traducción con el **mismo slug**. Eso dejaba la lista de "otros idiomas" del selector completamente vacía → el menú se abría sin ninguna opción dentro.

**Solución aplicada:**
- Las páginas de artículo (`src/pages/ditari/artikull/[type]/[slug].astro` y `src/pages/en/ditari/artikull/[type]/[slug].astro`) ahora **siempre** permiten `sq` y `en` (`allowedLangs = ['sq', 'en']`).
- Se añadió una nueva prop `langLinks` que calcula el **destino real** para cada idioma:
  - Si existe una traducción (mismo `type` + slug equivalente), apunta directo a esa URL.
  - Si **no** existe traducción, apunta al listado (`/ditari` o `/en/ditari`) en vez de a una URL inexistente (evita 404).
- `LangSwitch.jsx` ahora usa `langLinks[targetLang]` si está disponible; si no, mantiene el comportamiento anterior (prefijo `/en/...`).

**Archivos tocados:** `src/layouts/Base.astro`, `src/components/Nav.jsx`, `src/components/LangSwitch.jsx`, `src/pages/ditari/artikull/[type]/[slug].astro`, `src/pages/en/ditari/artikull/[type]/[slug].astro`.

> ⚠️ Esto está corregido en el código local. Para que se vea en `leku.al` hace falta desplegar (build + deploy a Cloudflare Pages).

---

## 2. Ditari i Lekut — cómo añadir artículos nuevos

### 2.1 Dónde van los archivos

```
src/content/ditari/
  sq/
    edukim/2026-06-01-si-funksionon-kursi-kembimit.md
    lajme/2026-06-05-bce-rrit-normat-interesi.md
  en/
    edukim/2026-06-01-how-exchange-rates-work.md
    lajme/2026-06-05-ecb-raises-interest-rates.md

public/ditari/images/
  si-funksionon-kursi-kembimit.webp   ← imágenes .webp subidas a mano aquí
```

- Carpeta `sq/` o `en/` según idioma.
- Subcarpeta `edukim/` o `lajme/` según `type`.
- Nombre de archivo: `AAAA-MM-DD-slug-en-minusculas.md`. La fecha es solo para orden/unicidad — **no aparece en la URL final**.

### 2.2 Frontmatter obligatorio

```yaml
---
title: "Título del artículo"
description: "Resumen corto para meta description y tarjetas de listado."
type: "edukim"        # o "lajme" — son los DOS únicos valores válidos (schema en src/content.config.ts)
category: "Kursi Valutor"
date: 2026-06-01
image: "/ditari/images/nombre-imagen.webp"
imageAlt: "Texto alternativo de la imagen"
readMinutes: 4
lang: "sq"             # o "en"
---

Contenido en markdown normal...
```

⚠️ Si pones un `type` distinto a `edukim` o `lajme` (por ejemplo `"remitanca"`, `"pronat"`), el build falla con `InvalidContentEntryDataError`. Si necesitas una categoría nueva, usa el campo `category` (texto libre), no `type`.

### 2.3 URLs resultantes

```
/ditari/artikull/edukim/si-funksionon-kursi-kembimit          (sq)
/en/ditari/artikull/edukim/how-exchange-rates-work            (en)

/ditari                → listado mixto, paginado
/ditari/edukim         → solo Edukim
/ditari/lajme          → solo Lajme
/en/ditari, /en/ditari/edukim, /en/ditari/lajme  → mismas vistas en inglés
```

El slug de la URL = nombre del archivo **sin** la fecha (`AAAA-MM-DD-`) y sin `.md`.

### 2.4 Traducciones — cómo emparejar sq ↔ en

- **Ideal:** usa el **mismo slug** en sq y en (mismo nombre de archivo, sin la fecha) y el mismo `type`. Así el selector de idioma salta directo al artículo equivalente.
- **Si los slugs son distintos** (porque el título en cada idioma da lugar a un slug distinto), **no pasa nada** — gracias al fix de esta sesión:
  - El sistema busca, dentro del mismo `type`, un artículo en el otro idioma con slug equivalente.
  - Si lo encuentra, el selector de idioma lleva directo a ese artículo (aunque el slug sea distinto).
  - Si no existe ninguna traducción todavía, el selector de idioma lleva al listado general (`/ditari` o `/en/ditari`) — nunca a una página rota.
- **Recomendación práctica:** cuando escribas un artículo en sq y luego su versión en en (o viceversa), intenta que el slug final sea lo más parecido posible (aunque no sea idéntico) para que sea fácil identificar el par a simple vista en el repo.

### 2.5 Imágenes

- Formato `.webp` siempre.
- Se suben **manualmente** a `public/ditari/images/` (no hay procesamiento automático de Astro Image — pensado para escalar a miles de artículos sin coste de build).
- El campo `image` del frontmatter debe apuntar exactamente a esa ruta: `/ditari/images/archivo.webp`.
- Si la imagen no existe físicamente, la página da 404 al cargar la imagen (pero el artículo en sí se sigue generando).

---

## 3. Cambio de divisas — herramientas existentes

| Página | Componente | Qué hace |
|---|---|---|
| `/kursi` | `Converter.jsx` | Conversor interactivo entre `ALL`, `EUR`, `USD`, `GBP`, `CHF` |
| `/kursi/tabela` | `RateTable.jsx` | Tabla comparativa de tasas actuales (compra/venta, variación 24h) |
| `/kursi/historiku` | `RateChart.jsx` | Gráfico de los últimos 30 días por par de divisas |

- Monedas soportadas: **ALL** (base, lek albanés), **EUR**, **USD**, **GBP**, **CHF**.
- Fuente de datos: tabla `daily_rates` en Supabase, alimentada por la Edge Function `fetch-rates` (cron diario desde Frankfurter API / BCE).
- Estos componentes son React islands (`client:load`) — solo se hidratan donde hay interactividad real.

---

## 4. Remesas — proveedores y cómo funciona la calculadora (`/kursi/remitanca`)

### 4.1 Proveedores configurados hoy

Definidos en `src/components/Remittance.jsx`, array `PROVIDERS`:

| Proveedor | Comisión EUR | Comisión GBP | Comisión USD | Spread oculto | Notas |
|---|---|---|---|---|---|
| **Wise** | 0.95% | 0.85% | 1.2% | 0% | Usa el tipo de cambio real (mid-market) |
| **Remitly** | €3.99 fijo | £2.99 fijo | $3.99 fijo | 0.3% | Comisión fija + spread pequeño |
| **Western Union** | €4.90 fijo | £3.90 fijo | $4.90 fijo | 2.0% | Comisión fija + spread alto (red muy amplia, útil para diáspora sin cuenta bancaria) |
| **WorldRemit** | €2.99 fijo | £1.99 fijo | $2.99 fijo | 0.5% | Comisión fija + spread bajo |

Estos son los proveedores más relevantes para la diáspora albanesa (Italia, Grecia, Reino Unido, Alemania, Suiza → Albania/Kosovo), porque:
- **Wise** y **Remitly** ya están integrados como afiliados (ver `specs/kursi-specs.md`, sección 11).
- **Western Union** tiene la red de puntos de retiro en efectivo más grande en Albania/Kosovo (relevante para usuarios sin cuenta bancaria o que reciben en efectivo).
- **WorldRemit** es una alternativa digital popular con buen balance comisión/spread.

> Otros proveedores usados en la región pero **no incluidos todavía**: MoneyGram, Ria Money Transfer, Intermex, transferencias bancarias SEPA directas (relevantes tras la noticia de Albania uniéndose a SEPA — ver artículo `2026-06-11-shqiperia-ne-sepa-cfare-do-te-thote.md`).

### 4.2 ¿Es "seleccionable" el cálculo / el proveedor?

- **No hay un selector de proveedor.** La calculadora **muestra los 4 proveedores a la vez**, todos calculados con el mismo monto y la misma divisa de envío, ordenados visualmente y marcando con `★ Más e mira` (best deal) al que entrega más lekë a la familia.
- **Lo que el usuario sí puede elegir:**
  - **Monto a enviar** (campo numérico libre + botones rápidos: 100, 200, 500, 1000).
  - **Divisa de envío**: `EUR`, `GBP` o `USD` (selector tipo dropdown, `RemitPicker`).
  - El destino siempre es `ALL` (lekë albanés) — no es seleccionable, es el público objetivo del sitio.
- **No existe un campo "número de personas / destinatarios".** El cálculo es **por transacción** (un monto → un resultado por proveedor), no por persona. Si en el futuro se quisiera ofrecer "comisión por X personas" (ej. varios envíos), habría que:
  1. Añadir un input `numPeople` (o `numTransfers`) en `Remittance.jsx`.
  2. Multiplicar la comisión fija (`fixed`) por ese número, pero **no** el porcentaje (`pct`) — ya que el porcentaje ya escala con el monto total.
  3. Decidir si el monto introducido es "por persona" o "total a repartir" y ajustar `numAmount` en consecuencia.

### 4.3 Cómo añadir un nuevo proveedor (ej. MoneyGram)

En `src/components/Remittance.jsx`, añade una entrada al array `PROVIDERS`:

```js
{
  id: 'moneygram',
  nameKey: 'MoneyGram',
  logo: '/moneygram01.webp',          // subir a public/
  tagCls: 'tag-muted',
  fees: {
    EUR: { pct: 0,    fixed: 3.50 },
    GBP: { pct: 0,    fixed: 2.50 },
    USD: { pct: 0,    fixed: 3.50 },
  },
  rateSpread: 0.015,                  // 1.5% de spread oculto
  affiliateUrl: 'https://www.moneygram.com',
  btnKey: 'btnMoneyGram',
  tagKey: 'tagMoneyGram',
}
```

Y añade las claves `btnMoneyGram` / `tagMoneyGram` al objeto `UI` (en `sq`, `en`, `it`, `el`) con las etiquetas traducidas. El cálculo (`calcArrives`) y el ranking de "mejor oferta" funcionan automáticamente para cualquier proveedor del array — no hace falta tocar la lógica.

---

## 5. Cómo enlazar/insertar estas herramientas desde un artículo de Ditari

Los artículos de Ditari son **Markdown puro** (`.md`, no `.mdx`), así que **no se pueden incrustar componentes React directamente** dentro del cuerpo del artículo.

Formas recomendadas de conectar un artículo con las herramientas:

1. **Enlace simple en el texto** (lo más usado hoy, ver artículos existentes sobre remesas/hipotecas):
   ```md
   Calcula cuánto recibe tu familia en [leku.al/kursi/remitanca](/kursi/remitanca).
   ```

2. **Banner CTA reutilizable** (`.remit-banner`, ya definido en el design system) — si se necesita un bloque visual destacado, se puede añadir como componente Astro (`DitariRemitBanner.astro`) que se renderiza **alrededor** del `<Content />` en `[type]/[slug].astro`, no dentro del markdown. Por ejemplo, mostrarlo automáticamente al final de todo artículo con `category` relacionada con remesas.

3. **Migrar a MDX** (cambio mayor, no hecho): permitiría usar `<Remittance client:visible lang={lang} />` directamente dentro del artículo. Solo valorar esto si hay necesidad real de calculadoras embebidas en el contenido — implica cambiar el `loader` en `content.config.ts` y el patrón de archivos a `.mdx`.

Por ahora, la opción 1 (enlace a `/kursi`, `/kursi/remitanca`, `/kursi/tabela`, `/kursi/historiku`) es la más simple y no requiere cambios de código.
