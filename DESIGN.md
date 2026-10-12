---
name: Sala Geek
description: Guía de programación diaria de cine, series, anime y videojuegos.
colors:
  paper: "#d9d6cc"
  ink: "#16181d"
  rule: "#2c2e33"
  quiet: "#5c564c"
  coupon: "#f4f1e8"
  cine: "#c0392b"
  series: "#1b4f72"
  anime: "#d35400"
  gaming: "#1e6b45"
  tecnologia: "#4a3f6b"
  on-air: "#f4d35e"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.4rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Barlow, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0"
spacing:
  sheet: "4vw"
  cell: "0.7rem"
components:
  button-watch:
    backgroundColor: "{colors.coupon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.4rem 0.9rem"
  button-coupon:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.coupon}"
    rounded: "{rounded.none}"
    padding: "0.4rem 0.8rem"
---

## Overview

Sala Geek v3 es una guía de programación. La home abre con lo que está en antena y deja Geeky Weekly como un cupón para recortar. Seed 67d285a9, dirección 4.

## Colors

El papel es `#d9d6cc` y la tinta `#16181d`. Cada canal tiene una barra: cine, series, anime, videojuegos y tecnología. `#f4d35e` solo marca En antena.

## Typography

Barlow Condensed lleva horarios y títulos. Barlow lleva el texto. Los woff2 están en `web/public/fonts`.

## Layout

La celda de horario estelar ocupa el primer viewport. Debajo, cada canal es una fila de tres celdas. Bajo 800 px todo se apila.

## Elevation & Depth

La guía es plana. La separación la hacen las reglas de tinta, no las sombras.

## Shapes

Esquinas rectas. El cupón de Geeky Weekly usa un borde discontinuo.

## Components

Ver esta nota es el botón claro. Quiero el resumen es el botón de tinta. El logo no se altera.

## Do's and Don'ts

Sí: una sola hoja, el título dentro de la celda, una sola marca En antena.

No: portal azul marino con dorado, retícula blanca de miniaturas, cifras de audiencia no confirmadas, HubSpot ni PWA.
