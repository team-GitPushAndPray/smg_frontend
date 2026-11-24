---
name: entrega-commits
description: Usar cuando se termina una issue o un conjunto de issues, para entregar EN TEXTO los git add, títulos y descripciones breves de cada commit, y el título y descripción del PR. No ejecuta ningún comando git relacionado a los commits.
---

# Entrega de commits y PR

## Regla principal
NUNCA ejecutes comandos git (add, commit, push, etc.). Solo entregame el texto para que yo lo corra.

## Cuándo se usa
Al terminar una issue (o varias en la misma sesión). Primero entregás los commits; cuando se terminaron todas las issues de la sesión, entregás el PR.

## Formato de títulos de commit
Todo título empieza con uno de estos tres prefijos, sin excepciones:
- `Nuevo:` archivos o funcionalidades que no existían.
- `Modificado:` cambios sobre algo que ya existía.
- `Eliminado:` archivos o funcionalidades que se quitaron.

Después del prefijo, una frase corta y concreta de lo que se hizo.
Ejemplo: `Nuevo: componente Navbar con menú responsive`

## Cómo agrupar los commits
1. Cada commit tiene UN solo propósito. Los archivos de un commit deben tener sentido juntos.
2. No mezcles tipos de cambio: estilos con variables de entorno, configuración con features, dependencias con componentes, etc.
3. Si el prefijo no alcanza para describir el commit, es señal de que hay que dividirlo en dos.
4. Para un archivo eliminado, `git add <ruta>` también registra la eliminación.

## Orden de los commits
Cronológico: del primero que se hizo al último. Numerá los commits en ese orden. Si un commit depende de otro (ej: el componente usa una variable de configuración), el que es base va primero.

## Formato de entrega por commit
    Commit N
    git add <archivo1> <archivo2> ...
    Título: <Nuevo|Modificado|Eliminado>: <frase corta>
    Descripción: <1 o 2 líneas de qué se hizo y por qué>

La descripción es breve. No repitas la lista de archivos ni expliques código que se ve en el diff.

## Formato del PR
Se entrega una sola vez, al terminar todas las issues de la sesión:

    Título del PR: <frase corta que resuma el conjunto de issues>
    Descripción:
    - Issue <número o nombre>: <qué se hizo, 1-2 líneas>
    - Issue <número o nombre>: <qué se hizo, 1-2 líneas>
    Notas: <solo si hay algo que el revisor deba saber: decisiones, pendientes, cosas a probar>

El PR puede usar prefijos distintos a los de commit si lo ves más claro, pero mantené el mismo estilo en español y directo.

## Ejemplo completo

Commit 1
git add src/styles/theme.css tailwind.config.js
Título: Nuevo: tema con paleta y soporte para modo claro/oscuro
Descripción: Define variables de color de la paleta del proyecto y configura Tailwind para usarlas en ambos modos.

Commit 2
git add src/components/Navbar.jsx
Título: Nuevo: componente Navbar con menú responsive
Descripción: Barra de navegación del portal público con menú colapsable en mobile.

Commit 3
git add src/components/Footer.jsx
Título: Nuevo: componente Footer con acceso administrativo discreto
Descripción: Pie de página con enlace al login de gestión, sin protagonismo para el cliente final.

Commit 4
git add src/App.jsx
Título: Modificado: App integra Navbar y Footer en el layout principal
Descripción: Se incorporan ambos componentes al layout base del portal.

Título del PR: Estructura base del portal público (layout, tema y navegación)
Descripción:
- Issue 1: se configuró el tema con paleta y modo claro/oscuro, y se armaron Navbar y Footer integrados en el layout principal.
Notas: el enlace de login del footer todavía no apunta a una ruta real.