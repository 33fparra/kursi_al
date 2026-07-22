---
title: "Example: Placing Images"
description: "Example file showing the 4 ways to place images inside a chapter."
type: "para-ilire"
category: "Example"
author: "F.A Parretti"
coAuthor: ""
country: "Albania"
translationKey: "example-images"
date: 2026-07-20
image: "/histori-ekonomi/images/2026-07/example-cover.webp"
imageAlt: "Example cover image"
readMinutes: 2
lang: "en"
order: 99
---

<!--
  THIS FILE IS AN EXAMPLE ONLY — it does not appear on the live site because
  its filename starts with "_". It's a quick reference for the 4 ways to
  place images. See README.md for the full explanation.
-->

## 1. Simple inline image

![Example description](/histori-ekonomi/images/2026-07/example-1.webp)

Fills the full column width automatically, no extra class needed.

## 2. "Hero" image with a caption underneath

<figure class="histori-full">
  <img src="/histori-ekonomi/images/2026-07/example-2.webp" alt="Example description" />
  <figcaption>This is the caption under the full-width image</figcaption>
</figure>

## 3. Two columns: image + text side by side

<div class="histori-split">
  <div class="histori-split-media">
    <img src="/histori-ekonomi/images/2026-07/example-3.webp" alt="Example description" />
    <figcaption>Optional caption under the image</figcaption>
  </div>
  <div class="histori-split-text">

  This is the text that sits next to the image. On wide screens
  (tablet/desktop) it shows side by side 50/50; on mobile it automatically
  stacks below the image. It can have several normal Markdown paragraphs.

  This is the second paragraph, inside the same text column.

  </div>
</div>

To put the image on the right instead of the left, add `histori-split--reverse`
to `<div class="histori-split ...">`.

## 4. Gallery with several images side by side

<div class="histori-gallery">
  <figure>
    <img src="/histori-ekonomi/images/2026-07/example-4.webp" alt="Description 1" />
    <figcaption>Caption 1</figcaption>
  </figure>
  <figure>
    <img src="/histori-ekonomi/images/2026-07/example-5.webp" alt="Description 2" />
    <figcaption>Caption 2</figcaption>
  </figure>
</div>
