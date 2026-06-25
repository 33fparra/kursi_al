# Ditari i Lekut — guidë për shtimin e artikujve

Kjo dosje përmban artikujt e seksionit "Ditari i Lekut" (`/ditari` dhe `/en/ditari`).
Sistemi mbështet 5 tipe: **edukim**, **lajme**, **tech**, **ai**, **int**, dhe mund
të përballojë mijëra artikuj — çdo skedar `.md` është i pavarur.

## Struktura e dosjeve

Brenda çdo tipi, artikujt grupohen në nëndosje **muaji** (`AAAA-MM`) sipas fushës
`date` të frontmatter-it — kjo i mban dosjet të rregulluara ndërsa rritet numri i
artikujve.

```
src/content/ditari/
  sq/
    edukim/2026-06/AAAA-MM-DD-slug-i-shkurter.md
    lajme/2026-06/AAAA-MM-DD-slug-i-shkurter.md
    tech/2026-06/...
    ai/2026-06/...
    int/2026-06/...
  en/
    edukim/2026-06/AAAA-MM-DD-slug-i-shkurter.md
    lajme/2026-06/AAAA-MM-DD-slug-i-shkurter.md
    tech/2026-06/...
    ai/2026-06/...
    int/2026-06/...

public/ditari/images/
  2026-06/
    emri-i-imazhit.webp
```

- Emri i skedarit fillon me datën (`AAAA-MM-DD-`) për renditje të lehtë në dosje,
  por **nuk shfaqet** në URL — URL-ja përdor vetëm pjesën e fundit (slug).
- Dosja e muajit (`2026-06`, `2026-07`, ...) **nuk shfaqet** në URL — ky thjesht
  organizon skedarët në disk. Astro i gjen artikujt me `**/*.md` (glob recursiv),
  pavarësisht thellësisë së dosjeve.
- Çdo artikull duhet të ketë një imazh `.webp` te `public/ditari/images/AAAA-MM/`,
  në të njëjtin muaj si `date`-i i artikullit.
- Një artikull mund të ekzistojë vetëm në `sq`, vetëm në `en`, ose në të dyja
  (si dy skedarë të veçantë me të njëjtin `image`).

## Frontmatter (metadata)

```yaml
---
title: "Titulli i artikullit"
description: "Përshkrim i shkurtër (1-2 fjali) për listim dhe SEO."
type: "edukim"        # "edukim" | "lajme" | "tech" | "ai" | "int"
category: "Kursi Valutor"
date: 2026-06-10
image: "/ditari/images/2026-06/emri-i-imazhit.webp"
imageAlt: "Përshkrim i imazhit për qorrët"
readMinutes: 4
lang: "sq"             # "sq" ose "en"
---
```

Pas `---` të dytë shkruhet përmbajtja në Markdown normal (`##` për nëntituj,
lista me `-`, **bold** me `**...**`, lidhje me `[tekst](url)`).

⚠️ **E rëndësishme:** `type` duhet të jetë saktësisht një nga 5 vlerat e mësipërme.
Një vlerë tjetër (p.sh. `"teknologji"`) bën që Astro ta injorojë artikullin në
heshtje — pa gabim, pa paralajmërim.

## Hapat për të shtuar një artikull të ri

1. Ngarko imazhin `.webp` (i optimizuar) te `public/ditari/images/AAAA-MM/`
   (krijo dosjen e muajit nëse nuk ekziston).
2. Krijo skedarin `.md` te
   `src/content/ditari/{sq|en}/{edukim|lajme|tech|ai|int}/AAAA-MM/AAAA-MM-DD-slug.md`.
3. Plotëso frontmatter-in sipas shembullit më sipër.
4. Shkruaj përmbajtjen në Markdown.
5. Bëj build/deploy — faqja e re shfaqet automatikisht në `/ditari` dhe te
   listimi i tipit përkatës (`/ditari/edukim`, `/ditari/tech`, ...), si dhe në
   `/en/ditari/...` nëse `lang: "en"`, pa nevojë të ndryshohet asnjë komponent.
