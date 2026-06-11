# Ditari i Lekut — guidë për shtimin e artikujve

Kjo dosje përmban artikujt e seksionit "Ditari i Lekut" (`/ditari` dhe `/en/ditari`).
Sistemi mbështet **edukim** (mësim) dhe **lajme** (lajme ekonomike), dhe mund të
përballojë mijëra artikuj — çdo skedar `.md` është i pavarur.

## Struktura e dosjeve

```
src/content/ditari/
  sq/
    edukim/AAAA-MM-DD-slug-i-shkurter.md
    lajme/AAAA-MM-DD-slug-i-shkurter.md
  en/
    edukim/AAAA-MM-DD-slug-i-shkurter.md
    lajme/AAAA-MM-DD-slug-i-shkurter.md

public/ditari/images/
  emri-i-imazhit.webp
```

- Emri i skedarit fillon me datën (`AAAA-MM-DD-`) për renditje të lehtë në dosje,
  por **nuk shfaqet** në URL — URL-ja përdor vetëm pjesën e fundit (slug).
- Çdo artikull duhet të ketë një imazh `.webp` në `public/ditari/images/`.
- Një artikull mund të ekzistojë vetëm në `sq`, vetëm në `en`, ose në të dyja
  (si dy skedarë të veçantë me të njëjtin `image`).

## Frontmatter (metadata)

```yaml
---
title: "Titulli i artikullit"
description: "Përshkrim i shkurtër (1-2 fjali) për listim dhe SEO."
type: "edukim"        # "edukim" ose "lajme"
category: "Kursi Valutor"
date: 2026-06-10
image: "/ditari/images/emri-i-imazhit.webp"
imageAlt: "Përshkrim i imazhit për qorrët"
readMinutes: 4
lang: "sq"             # "sq" ose "en"
---
```

Pas `---` të dytë shkruhet përmbajtja në Markdown normal (`##` për nëntituj,
lista me `-`, **bold** me `**...**`, lidhje me `[tekst](url)`).

## Hapat për të shtuar një artikull të ri

1. Ngarko imazhin `.webp` (i optimizuar) te `public/ditari/images/`.
2. Krijo skedarin `.md` te `src/content/ditari/{sq|en}/{edukim|lajme}/AAAA-MM-DD-slug.md`.
3. Plotëso frontmatter-in sipas shembullit më sipër.
4. Shkruaj përmbajtjen në Markdown.
5. Bëj build/deploy — faqja e re shfaqet automatikisht në `/ditari`,
   `/ditari/edukim` ose `/ditari/lajme` (dhe në `/en/ditari/...` nëse `lang: "en"`),
   pa nevojë të ndryshohet asnjë komponent tjetër.
