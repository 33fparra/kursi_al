# Ditari — Estructura de contenido y triggers automáticos

## 1. Campos del frontmatter (`.md`)

Cada artículo del Ditari vive en `src/content/ditari/<lang>/<type>/<fecha>-<slug>.md`
y su frontmatter se valida contra el schema de `src/content.config.ts`. Si un campo
no cumple, **el build entero falla**.

```yaml
---
title: "Sa kushton një kredi në Shqipëri në 2026?"
description: "Çmimet e pronave u rritën fort. Këtu janë shifrat reale."
type: "lajme"
category: "Kredi"
author: "F.A Parretti"
country: "Albania"
date: 2026-06-12
translationKey: "bank-credit-albania"
image: "/ditari/images/kredi-bankare-shqiperi-2026.webp"
imageAlt: "Ilir duke parë me kujdes kontratën e kredisë bankare"
readMinutes: 4
lang: "sq"
---
```

| Campo            | Tipo                            | Obligatorio | Detalle |
|-------------------|---------------------------------|-------------|---------|
| `title`           | string (máx. 120)               | Sí  | Título visible y en `<title>`/schema. |
| `description`     | string (máx. 200)               | Sí  | Meta description y texto del card. |
| `type`            | `"edukim"` \| `"lajme"`         | Sí | Define en qué sección aparece (`/ditari/edukim` o `/ditari/lajme`). |
| `category`        | string libre                    | Sí  | Etiqueta corta mostrada sobre el título (ej. "Kredi", "Financa Personale"). |
| `author`          | string                          | No  | Se usa **"F.A Parretti"** en todos los artículos. Se muestra en el card y en el header del artículo. |
| `country`         | string                          | No  | `"Albania"` o `"Kosovo"`. Activa el badge de color y el filtro por país en `/ditari`. |
| `date`            | fecha YAML (`YYYY-MM-DD`)       | Sí  | Orden de publicación. Se usa en el schema JSON-LD. |
| `translationKey`  | string                          | Sí  | Clave compartida entre la versión `sq` y `en` del mismo artículo — así el selector de idioma encuentra la traducción correcta. |
| `image`           | ruta desde `/public/` (string)  | Sí  | Ruta pública, ej. `/ditari/images/nombre.webp`. Los archivos viven en `public/ditari/images/`. |
| `imageAlt`        | string                          | Sí  | Alt text descriptivo de la imagen. |
| `readMinutes`     | número entero positivo          | Sí  | Minutos de lectura mostrados en la metadata. |
| `lang`            | `"sq"` \| `"en"`               | Sí  | Idioma del artículo. Determina en qué carpeta vive. |

### Dónde se muestra el `author`
1. **Card del listado** (`DitariCard.astro`) — línea pequeña bajo la descripción.
2. **Bajo el `<h1>`** del artículo — texto chico.

Si `author` no está presente, no se renderiza (es opcional, no rompe nada).

### `translationKey` — cómo enlaza los pares sq/en

Los artículos que son traducción el uno del otro comparten exactamente el mismo valor de `translationKey`:

| `translationKey`          | Archivo sq                                    | Archivo en                                      |
|---------------------------|-----------------------------------------------|------------------------------------------------|
| `western-union-problem`   | `sq/lajme/2026-06-10-western_union_problem`   | `en/lajme/2026-06-10-western_union_problem`    |
| `albania-sepa`            | `sq/lajme/2026-06-11-shqiperia-ne-sepa-...`  | `en/lajme/2026-06-11-albania-joins-sepa-...`   |
| `rent-or-mortgage-albania`| `sq/lajme/2026-06-11-qira-apo-kredi-...`     | `en/lajme/2026-06-11-rent-or-mortgage-...`     |
| `bank-credit-albania`     | `sq/lajme/2026-06-12-kredi-bankare-...`       | `en/lajme/2026-06-12-bank-credit-albania-...`  |
| `inflation-savings`       | `sq/edukim/2026-06-11-parate-e-tua-...`       | `en/edukim/2026-06-11-your-money-is-shrinking` |

**Regla:** cada vez que publiques un artículo nuevo en ambos idiomas, usa el mismo `translationKey` en los dos. Si por ahora solo existe en un idioma, ponle el `translationKey` de todas formas — cuando se traduzca, el otro artículo usará el mismo valor.

---

## 2. Triggers automáticos (GitHub Actions)

El sitio tiene **dos workflows separados** porque los datos de tasas de cambio (FX) y las
tasas bancarias cambian a ritmos muy distintos.

### `.github/workflows/update-fx.yml` — diario
```yaml
on:
  schedule:
    - cron: '0 6 * * *'   # todos los días, 06:00 UTC
  workflow_dispatch:
```
- Corre `node scripts/fetch-rates.mjs`
- Actualiza `public/data/rates.json` y `public/data/history.json` con tasas EUR/ALL/USD/GBP/CHF
- Fuente: `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api` (gratis, sin API key)
- Hace commit directo a `main` **solo si hubo cambio real** — usa `git diff --cached --quiet` como guardia para no generar commits vacíos.
- Si Supabase está configurado (`PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_KEY` en secrets de GitHub), también inserta en la tabla `daily_rates`.

### `.github/workflows/update-rates.yml` — semanal (jueves)
```yaml
on:
  schedule:
    - cron: '0 7 * * 4'   # todos los jueves, 07:00 UTC
  workflow_dispatch:
```
- Corre `node scripts/validate-json.mjs` — valida que `albania.json` y `kosovo.json` sean correctos
- Comprueba que `_____LAST_UPDATE_DATE_____` no tenga más de 14 días de antigüedad
- **No actualiza tasas bancarias automáticamente** — los bancos albaneses no tienen API pública.
  Las tasas bancarias se actualizan manualmente (ver `COMO-ACTUALIZAR-TASAS.md`).

### Por qué se separó en dos workflows
1. **Dos triggers independientes**: el tipo de cambio (FX) es volátil y vale la pena revisarlo cada día.
   Las tasas bancarias casi no cambian semana a semana — verificarlas diariamente sería ruido innecesario.
2. **Commit directo a `main`** en vez de Pull Request, con la condición `git diff --cached --quiet`
   antes de comitear — si no hubo cambios reales en el JSON, el workflow termina sin crear ningún commit.

---

## 3. Cómo publicar un artículo nuevo

```
1. Crear el archivo:
   src/content/ditari/<lang>/<type>/<YYYY-MM-DD>-<slug>.md

2. Rellenar el frontmatter con TODOS los campos obligatorios
   (ver tabla de la sección 1)

3. Elegir un translationKey único para este tema
   (ej. "mortgage-rates-albania-2026")

4. Si tienes la traducción, crear también el archivo en el otro idioma
   con el mismo translationKey

5. Subir la imagen a: public/ditari/images/<nombre>.webp

6. Verificar:
   npx astro check   # no debe haber errores de TypeScript
   npm run build     # el build debe completarse sin errores

7. git push → Cloudflare despliega automáticamente
```

---

## 4. Errores conocidos (para no repetirlos)

- **`type` con valor incorrecto**: el schema solo acepta `"edukim"` o `"lajme"`. Si pones otro valor (ej. `"education"`, `"news"`), el build entero falla. Siempre en albanés.
- **`translationKey` ausente**: desde la actualización del schema, `translationKey` es obligatorio. Si un artículo no lo tiene, el build falla. Todos los artículos existentes ya lo tienen.
- **Imagen no encontrada**: la ruta en `image` es relativa a `/public/`. Verifica que el archivo exista en `public/ditari/images/` antes de hacer push.
- **`description` mayor de 200 caracteres**: el schema lo rechaza. Google también penaliza meta descriptions largas.
