# Cómo actualizar tasas bancarias — Albania y Kosovo

> Para actualizar datos cada 2 semanas sin necesidad de saber programar.

---

## Cada 2 semanas

1. Abre el archivo del país que quieres actualizar en `src/data/`
2. Busca el marcador `_____EDIT_BANK_RATES_BELOW_____` — es tu punto de inicio
3. Edita las tasas de cada banco en el array `banks`
4. Actualiza `_____LAST_UPDATE_DATE_____` con la fecha de hoy (formato `YYYY-MM-DD`)
5. Guarda el archivo
6. Corre `npm run validate:json` para verificar que no haya errores
7. Haz `git add . && git commit -m "data: update bank rates YYYY-MM-DD" && git push`
8. Cloudflare Pages detecta el push y despliega automáticamente en ~2 minutos

---

## Qué editar de cada banco

```json
{
  "name": "Raiffeisen Bank",
  "shortName": "Raiffeisen",
  "mortgageRatePct": 5.5,   ← tasa hipotecaria (%)
  "loanRatePct": 12.0,      ← tasa de préstamo personal (%)
  "featured": true,
  "url": "https://www.raiffeisen.al"
}
```

**Regla de oro:** Solo cambias los números después de `:`. Nunca cambies el nombre del campo ni las comillas.

---

## Fuentes oficiales por país

| País | Dónde buscar las tasas | Frecuencia de cambio |
|------|------------------------|----------------------|
| **Albania** | [AMF — Autoritatea de Supraveghere Financiare](https://www.amf.gov.al) · páginas oficiales de cada banco | Mensual |
| **Kosovo** | [BQK — Banka Qendrore e Kosovës](https://www.bqk-kos.org) · páginas oficiales de cada banco | Mensual |

---

## Archivos a editar por país

| País | Archivo |
|------|---------|
| Albania | `src/data/albania.json` |
| Kosovo | `src/data/kosovo.json` |

---

## Reglas importantes

| Regla | Por qué |
|-------|---------|
| NO borrar los marcadores `_____EDIT_BANK_RATES_BELOW_____` | Son guías visuales para la próxima persona |
| NO tocar nada fuera de la sección entre marcadores | Podrías romper los cálculos de impuestos o elegibilidad |
| Mantener las comas correctas | JSON es estricto — una coma mal puesta rompe todo |
| Siempre correr `npm run validate:json` antes del push | Detecta errores antes de que lleguen a producción |

---

## Ejemplo: cambiar la tasa de Raiffeisen Albania

**Antes:**
```json
{
  "name": "Raiffeisen Bank",
  "mortgageRatePct": 5.5,
  "loanRatePct": 12.0,
```

**Después (si la nueva tasa hipotecaria es 5.25%):**
```json
{
  "name": "Raiffeisen Bank",
  "mortgageRatePct": 5.25,
  "loanRatePct": 12.0,
```

Solo cambias el número. Nada más.

---

## Si algo se rompe

1. **Corre** `npm run validate:json` — te dice exactamente qué está mal
2. **No hagas push** hasta que la validación pase sin errores
3. Si no puedes arreglarlo, abre una rama nueva (`git checkout -b fix/tasas-FECHA`) y pide revisión

---

## Verificación rápida después de actualizar

```bash
npm run validate:json    # debe decir "✅ All validations passed"
npm run build            # debe terminar sin errores
```

Si ambos pasan: haz push. Si alguno falla: busca el error y corrígelo antes de publicar.

---

## Automatización semanal (GitHub Actions)

El workflow `.github/workflows/update-rates.yml` corre cada jueves a las 07:00 UTC y:
1. Valida los JSON automáticamente
2. Comprueba que `_____LAST_UPDATE_DATE_____` no tenga más de 14 días de antigüedad
3. Si está desactualizado, lo indica en el log de GitHub Actions

Las tasas bancarias **NO se actualizan solas** (no hay API pública de bancos albaneses).
El workflow es un recordatorio + validación, no un scraper.
