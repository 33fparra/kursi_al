# Historia dhe Ekonomia — guidë për shtimin e kapitujve

Kjo dosje përmban kapitujt e seksionit "Historia dhe Ekonomia e Shqipërisë"
(`/histori-ekonomi` dhe `/en/histori-ekonomi`). Sistemi ndjek të njëjtin patern
si `/ditari`, por artikujt janë të organizuar në **8 blloqe historike** (jo tipe
lajmesh), secili duke mbuluar një periudhë të historisë shqiptare, dhe janë
menduar si një sagë me kapituj në rend, jo si feed lajmesh.

## Blloqet e disponueshme (`type` në frontmatter)

| `type`             | Blloku                                             |
|---------------------|-----------------------------------------------------|
| `para-ilire`         | Bloku 0: Para Ilirëve                               |
| `iliret`             | Bloku 1: Farkëtimi i Ilirëve                        |
| `mesjeta`            | Bloku 2: Mesjeta dhe Uragani i Pushtimeve            |
| `skenderbeu`         | Bloku 3: Epopeja e Skënderbeut                      |
| `pushtimi-otoman`    | Bloku 4: Pesë Shekujt nën Gjysmëhënë                |
| `pavaresia`          | Bloku 5: Rilindja dhe Kaosi i Pavarësisë             |
| `komunizmi`          | Bloku 6: Eksperimenti i Izolimit Ekstrem             |
| `postkomunizmi`      | Bloku 7: Rrëzimi, 1997 dhe Shekulli XXI              |

(Shiko `src/lib/historiBlocks.ts` për titujt e plotë dhe përshkrimet në sq/en.)

## Struktura e dosjeve

```
src/content/histori-ekonomi/
  sq/
    para-ilire/AAAA-MM/AAAA-MM-DD-slug-i-shkurter.md
    iliret/AAAA-MM/...
    mesjeta/AAAA-MM/...
    ...
  en/
    para-ilire/AAAA-MM/AAAA-MM-DD-slug-i-shkurter.md
    iliret/AAAA-MM/...
    ...

public/histori-ekonomi/images/
  AAAA-MM/
    emri-i-imazhit.webp
```

- Emri i skedarit fillon me datën (`AAAA-MM-DD-`) për renditje të lehtë në
  dosje, por **nuk shfaqet** në URL — URL-ja përdor vetëm pjesën e fundit
  (slug).
- Dosja e muajit **nuk shfaqet** në URL, thjesht organizon skedarët në disk.
- Çdo kapitull duhet të ketë një imazh kryesor `.webp` te
  `public/histori-ekonomi/images/AAAA-MM/` (përdoret për kartën/listimin).
  **Brenda tekstit** të kapitullit mund të vendosësh sa imazhe shtesë të duash,
  thjesht me sintaksën normale të Markdown: `![përshkrim](/histori-ekonomi/images/AAAA-MM/tjeter.webp)`
  — nuk ka limit dhe nuk kërkohet ndryshim skeme.
- Një kapitull mund të ekzistojë vetëm në `sq`, vetëm në `en`, ose në të dyja
  (si dy skedarë të veçantë me të njëjtin `translationKey` dhe `image`).
- Dosja `_examples/` dhe çdo skedar/dosje që fillon me `_` **injorohen nga
  ndërtimi, gjithmonë** — nuk shfaqen kurrë në sitin live, as edhe nëse dikush
  fshin njërin prej dy parashtesave (emrin e skedarit ose emrin e dosjes) —
  mbrojtja e dytë mbetet. Përdoren vetëm si shembuj/draft, shiko seksionin
  "Shembull" më poshtë.

## Teksti i justifikuar dhe imazhet brenda kapitullit

**Justifikimi automatik:** nuk duhet të bësh asgjë — çdo paragraf del
automatikisht i justifikuar në të dy anët (si në një libër historie), sepse
faqja e artikullit e mbështjell përmbajtjen me klasën `histori-content`.
Titujt (`##`/`###`) dhe listat mbeten të rreshtuara majtas, siç duhet.

Ka **4 mënyra** të gatshme për të vendosur imazhe brenda tekstit — të katërta
janë "responsive" vetiu (mobile → 1 kolonë, tablet/desktop → siç përshkruhet
më poshtë) dhe **nuk prishin skemën** ngado që i ngjisësh, sepse janë të
izoluara nga pjesa tjetër e `histori-content`.

### 1. Një imazh i thjeshtë brenda tekstit (Markdown normal)

```markdown
![Përshkrim i imazhit](/histori-ekonomi/images/AAAA-MM/imazhi.webp)
```

Del automatikisht i kufizuar në gjerësinë e kolonës, me qoshe të rrumbullakosura.

### 2. Imazh që zë GJITHË gjerësinë e kolonës (me titull nën të)

```html
<figure class="histori-full">
  <img src="/histori-ekonomi/images/AAAA-MM/imazhi.webp" alt="Përshkrimi" />
  <figcaption>Titull i shkurtër nën imazhin</figcaption>
</figure>
```

Njësoj si opsioni 1, por me `<figcaption>` opsionale dhe garanci stili — mirë
për imazhe "hero" brenda kapitullit (harta, foto panoramike, etj).

### 3. Dy kolona: gjysma imazh + gjysma tekst (krah për krah)

```html
<div class="histori-split">
  <div class="histori-split-media">
    <img src="/histori-ekonomi/images/AAAA-MM/imazhi.webp" alt="Përshkrimi" />
    <figcaption>Titull opsional</figcaption>
  </div>
  <div class="histori-split-text">

  Teksti shkon këtu — mund të ketë disa paragrafë, listë, etj. Del i
  justifikuar automatikisht, njësoj si pjesa tjetër e kapitullit.

  </div>
</div>
```

- Në **mobile**: bie automatikisht në 1 kolonë (imazhi sipër, teksti poshtë).
- Në **tablet/desktop** (≥768px): 2 kolona krah për krah, 50/50.
- Për të vendosur imazhin **në të djathtë** në vend të majtas, shto klasën
  `histori-split--reverse` te `<div class="histori-split ...">`.
- ⚠️ Lëre një rresht bosh menjëherë pas `<div class="histori-split-text">`
  dhe para `</div>` — kështu Markdown brenda e njeh tekstin si paragrafë
  normalë (nëse gjithçka ngjitet ngjitur pa rresht bosh, mund të mos
  procesohet si Markdown).

### 4. Galeri me 2 ose 3 imazhe krah për krah

```html
<div class="histori-gallery">
  <figure>
    <img src="/histori-ekonomi/images/AAAA-MM/imazhi-1.webp" alt="Përshkrimi 1" />
    <figcaption>Titull i shkurtër</figcaption>
  </figure>
  <figure>
    <img src="/histori-ekonomi/images/AAAA-MM/imazhi-2.webp" alt="Përshkrimi 2" />
    <figcaption>Titull i shkurtër</figcaption>
  </figure>
</div>
```

Përshtatet automatikisht sipas gjerësisë së ekranit (1 kolonë në mobile, 2-3
në desktop, sipas numrit të `<figure>`).

## Shembull i plotë

Shiko `_examples/_shembull-imazhe-sq.md` (dhe `_examples/_example-images-en.md`)
për një skedar shembull të plotë me frontmatter dhe të katërta mënyrat e
vendosjes së imazheve. Për ta përdorur si bazë për një kapitull real:
kopjoje **jashtë** dosjes `_examples/` (te dosja e bllokut përkatës, p.sh.
`sq/iliret/`), hiqe `_`-në nga emri, vendos datën si parashtesë dhe plotëso
frontmatter-in me përmbajtjen e vërtetë. Nëse skedari mbetet brenda
`_examples/`, nuk do të shfaqet kurrë, edhe nëse i heq `_`-në nga emri.

## Frontmatter (metadata)

```yaml
---
title: "Titulli i kapitullit"
description: "Përshkrim i shkurtër (1-2 fjali) për listim dhe SEO."
type: "iliret"          # një nga 8 vlerat e tabelës më sipër
category: "Histori e Lashtë"
author: "F.A Parretti"
coAuthor: ""
country: "Albania"
translationKey: "iliret-1"   # lidh çiftin sq/en të të njëjtit kapitull
date: 2026-07-20
image: "/histori-ekonomi/images/2026-07/emri-i-imazhit.webp"
imageAlt: "Përshkrim i imazhit për qorrët"
readMinutes: 6
lang: "sq"              # "sq" ose "en"
order: 1                # radha e kapitullit brenda bllokut (1, 2, 3, ...)
---
```

⚠️ **E rëndësishme:**
- `type` duhet të jetë saktësisht një nga 8 vlerat e listës. Një vlerë tjetër
  bën që Astro ta injorojë kapitullin në heshtje.
- `order` përcakton renditjen e kapitujve brenda bllokut (1 = kapitulli i
  parë). Nëse mungon, renditja bie mbrapa te `date` (më e vjetra e para).

## Hapat për të shtuar një kapitull të ri

1. Ngarko imazhin kryesor `.webp` te `public/histori-ekonomi/images/AAAA-MM/`.
2. Krijo skedarin `.md` te
   `src/content/histori-ekonomi/{sq|en}/{blloku}/AAAA-MM/AAAA-MM-DD-slug.md`.
3. Plotëso frontmatter-in sipas shembullit më sipër, duke vendosur `order` të
   saktë brenda serisë.
4. Shkruaj përmbajtjen në Markdown — mund të përfshish sa imazhe shtesë të
   duash direkt në tekst.
5. Bëj build/deploy — kapitulli shfaqet automatikisht në accordion-in te
   `/histori-ekonomi`, te listimi i bllokut përkatës, dhe te
   `/en/histori-ekonomi/...` nëse `lang: "en"`, pa nevojë të ndryshohet asnjë
   komponent.
