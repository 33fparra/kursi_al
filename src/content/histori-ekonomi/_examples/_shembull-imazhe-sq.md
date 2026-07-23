---

---

<!--
  KY SKEDAR ËSHTË VETËM SHEMBULL — nuk shfaqet në sitin live sepse emri i tij
  fillon me "_". Shërben si referencë e shpejtë për 4 mënyrat e vendosjes së
  imazheve. Shiko README.md për shpjegimin e plotë.
-->

## 1. Imazh i thjeshtë brenda tekstit

![Përshkrim shembull](/histori-ekonomi/images/2026-07/shembull-1.webp)

Zë gjithë gjerësinë e kolonës automatikisht, pa nevojë për klasë shtesë.

## 2. Imazh "hero" me titull nën të

<figure class="histori-full">
  <img src="/histori-ekonomi/images/2026-07/shembull-2.webp" alt="Përshkrim shembull" />
  <figcaption>Ky është titulli nën imazhin e plotë</figcaption>
</figure>

## 3. Dy kolona: imazh + tekst krah për krah

<div class="histori-split">
  <div class="histori-split-media">
    <img src="/histori-ekonomi/images/2026-07/shembull-3.webp" alt="Përshkrim shembull" />
    <figcaption>Titull opsional nën imazhin</figcaption>
  </div>
  <div class="histori-split-text">

  Ky është teksti që shkon krah imazhit. Në ekran të gjerë (tablet/desktop)
  shfaqet krah për krah 50/50; në mobile bie automatikisht poshtë imazhit.
  Mund të ketë disa paragrafë normalë të Markdown-it këtu.

  Ky është paragrafi i dytë, brenda të njëjtës kolonë teksti.

  </div>
</div>

Për ta pasur imazhin në të djathtë në vend të majtas, shto
`histori-split--reverse` te `<div class="histori-split ...">`.

## 4. Galeri me disa imazhe krah për krah

<div class="histori-gallery">
  <figure>
    <img src="/histori-ekonomi/images/2026-07/shembull-4.webp" alt="Përshkrim 1" />
    <figcaption>Titull 1</figcaption>
  </figure>
  <figure>
    <img src="/histori-ekonomi/images/2026-07/shembull-5.webp" alt="Përshkrim 2" />
    <figcaption>Titull 2</figcaption>
  </figure>
</div>
