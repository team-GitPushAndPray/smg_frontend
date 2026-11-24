# CLAUDE.md

## Proyecto
Sistema Integral de Gestión de Maquinaria (Grupo GitPushAndPray).
Plataforma para empresas de alquiler, venta y mantenimiento de maquinaria pesada.
Proyecto de la materia Trabajo Final, Tecnicatura en Desarrollo Web (UNComa).

Componentes:
- Portal público y catálogo comercial (sin autenticación; el login admin va discreto en el footer)
- Módulo operativo de campo vía QR (checklists y fotos, sin login, mobile)
- Dashboard administrativo (con autenticación y roles)
- Transversal: modo claro/oscuro, módulo de configuración

## Mi rol
Soy P.M. y desarrollador front-end. Esta sesión/repo es de front-end.
Las issues te las paso por escrito al iniciar cada sesión.

## Stack front-end
- React (SPA)
- Tailwind CSS
- React Bits (componentes visuales reutilizables)
- React Router


## Diseño
- Estilo: glassmorfismo premium inspirado en el ecosistema Apple (vidrio translúcido, profundidad por capas, bordes finos, sombras suaves). Debe verse profesional, sobrio y de valor, no recargado.
- Antes de crear o modificar cualquier componente visual, usá la skill `estilo-glass`. Los tokens y las clases `.glass` viven en `src/index.css`: reutilizalos, no hardcodees valores.
- La legibilidad manda sobre el efecto: contraste AA en modo claro y oscuro.
- Paleta: rojo, negro, blanco
- Modo claro y oscuro desde el inicio, en todos los componentes
- Módulo de campo (QR): mobile-first, interfaz muy simple
- Dashboard: desktop-first
- Usá los colores de la paleta, no los default de Tailwind

## Preguntas
- Si hay algo que quedo inconcluso o no es del todo claro, es de suma importancia que me preguntes antes de tomar una decision a la deriva.

## ANTES DE EMPEZAR CUALQUIER ISSUE: verificá la rama
1. Ejecutá `git branch --show-current` (es solo lectura, está permitido).
2. Si estás en `main`, `master` o `develop`: NO empieces la tarea. Avisame que tengo que pasarte a la rama de trabajo y esperá.
3. Si el comando falla o estás en detached HEAD: frená y avisame.
4. Nunca cambies de rama vos ni crees una: la rama la asigno yo.

## REGLAS DE GIT (críticas)
- NUNCA ejecutes `git add`, `git commit`, `git push`, ni crees ramas.
- Al terminar una issue, usá la skill `entrega-commits` y entregame todo EN TEXTO.
- Idioma de commits y PR: español.