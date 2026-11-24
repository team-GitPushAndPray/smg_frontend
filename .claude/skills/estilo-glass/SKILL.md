---
name: estilo-glass
description: Usar al crear o modificar cualquier componente, layout o página visual del front-end. Define el estilo glassmorfismo premium del proyecto (vidrio, profundidad, estilo ecosistema Apple), con sus tokens, recetas, reglas de legibilidad y checklist.
---

# Estilo visual: glassmorfismo premium

## Dirección
El sitio debe verse profesional, sobrio y de valor, inspirado en el lenguaje visual de iOS/macOS: vidrio translúcido, profundidad por capas, bordes finos, sombras suaves y esquinas redondeadas. Lo "caro" sale de la contención: pocos elementos, bien alineados y con aire. Si un efecto no aporta, se saca.

## Fuente de verdad en el código
Los tokens y las clases de vidrio viven en `src/index.css`. Leelos ahí antes de crear estilos y reutilizalos. Si falta un valor, agregalo ahí; no lo hardcodees en el componente. Los colores salen de la paleta del CLAUDE.md, nunca de los default de Tailwind.

## Fondo
El vidrio solo se nota si hay algo detrás. El fondo global es un gradiente suave de 2 o 3 manchas difusas de la paleta, fijo al hacer scroll, diseñado por separado para modo claro y oscuro. Sin un fondo con color, el blur no se ve.

## Capas de profundidad (máximo 3)
- Nivel 0: fondo.
- Nivel 1: superficies de contenido (cards, paneles) con `.glass`.
- Nivel 2: elementos flotantes (navbar, modales, menús, popovers) con `.glass-strong`: más opaco y con más sombra.
Nunca apiles más de 2 capas de vidrio una sobre otra.

## Tokens base
Ajustá el tinte a la paleta del proyecto; estos valores son el punto de partida.

```css
:root {
  --glass-bg: rgb(255 255 255 / 0.55);
  --glass-bg-strong: rgb(255 255 255 / 0.72);
  --glass-border: rgb(255 255 255 / 0.55);
  --glass-highlight: inset 0 1px 0 rgb(255 255 255 / 0.6);
  --glass-shadow: 0 8px 32px rgb(31 38 135 / 0.12), 0 1px 2px rgb(0 0 0 / 0.04);
  --glass-blur: 20px;
  --glass-saturate: 160%;
  --radius-card: 1.5rem;
  --radius-control: 0.875rem;
}

.dark {
  --glass-bg: rgb(30 30 40 / 0.45);
  --glass-bg-strong: rgb(30 30 40 / 0.65);
  --glass-border: rgb(255 255 255 / 0.12);
  --glass-highlight: inset 0 1px 0 rgb(255 255 255 / 0.10);
  --glass-shadow: 0 8px 32px rgb(0 0 0 / 0.45), 0 1px 2px rgb(0 0 0 / 0.3);
}
```

## Receta
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-highlight), var(--glass-shadow);
  border-radius: var(--radius-card);
}

.glass-strong {
  /* igual que .glass pero con var(--glass-bg-strong) y blur mayor */
}

/* Navegadores sin soporte, o usuario que pidió menos transparencia */
@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-strong { background: var(--glass-bg-strong); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass, .glass-strong { background: var(--glass-bg-strong); backdrop-filter: none; }
}
```
Definilas como clases reutilizables (`@layer components` o `@utility`, según la versión de Tailwind). No repitas cadenas largas de utilidades en cada componente.

## Reglas
1. **Legibilidad primero.** Texto sobre vidrio con contraste AA (4.5:1) en claro y oscuro, probado sobre el peor fondo posible. Si falla, subí la opacidad (`.glass-strong`); no lo arregles con sombras al texto.
2. **Rendimiento.** `backdrop-filter` es caro. En celular bajá el blur a 12px. No lo uses en cada ítem de listas largas; reservalo para contenedores y elementos clave.
3. **Esquinas.** Radios generosos y consistentes (16 a 28px en superficies, 12 a 16px en controles). En elementos anidados, radio interno = radio externo menos el padding.
4. **Bordes y sombras.** Borde de 1px semitransparente más brillo interno superior. Sombras suaves y de varias capas. Nada de bordes negros ni sombras duras.
5. **Color.** Vidrio neutro (blanco o negro translúcido) con tinte sutil. Un solo acento de la paleta para acciones y estados activos. Evitá vidrios muy saturados: se ven baratos.
6. **Tipografía.** Pila de sistema Apple: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif`. Pesos 400, 500 y 600; títulos con tracking apenas negativo; jerarquía clara.
7. **Movimiento.** Transiciones de 200 a 300ms con `cubic-bezier(0.22, 1, 0.36, 1)`. Hover: leve elevación. Press: `scale(0.98)`. Respetar `prefers-reduced-motion`.
8. **Interacción.** Cada elemento interactivo define hover, active, focus-visible y disabled. El foco se ve con un anillo del acento; nunca se quita el outline sin reemplazarlo. Áreas táctiles de al menos 44px.
9. **Modo claro y oscuro.** Se diseñan los dos por separado; el oscuro no es el claro invertido.
10. **Íconos.** Una sola librería de trazo fino, con tamaños y grosor consistentes.

## Por módulo
- **Portal público y catálogo:** es donde más se luce. Cards con vidrio liviano; si hay muchas, blur bajo o fondo tintado sin blur.
- **Dashboard:** vidrio en contenedores, sidebar y tarjetas de métricas. Tablas y formularios sobre superficie más opaca para que los datos se lean bien.
- **Módulo de campo (QR):** legibilidad y rendimiento primero. Acá NO va vidrio. Ver la sección siguiente.

## Módulo de campo (/c/:token y /campo)
El usuario es un mecánico u operario al aire libre, con el celular en una mano, a veces con guantes o las manos sucias y sin ganas de leer. Un solo camino, hacia adelante: Inicio (equipo y tipo de checklist) → Horas (solo máquinas) → Ítems → Cierre (observaciones, fotos, nombre y apellido) → Enviar → Listo.

Pantalla:
- Sin distracciones: no usa el layout del panel ni del portal (sin navbar, footer, link al login ni menú). Solo el paso actual.
- Una acción principal por pantalla: botón grande, fijo abajo (`MainAction` dentro de `FieldScreen`). "Atrás" chico arriba a la izquierda (`WizardHeader`).
- Progreso visible: "Paso X de N" más barra.
- Áreas táctiles de 48 × 48 px como mínimo y separación entre opciones.
- Legible al sol: sin vidrio, fondos sólidos, alto contraste, texto de 16 px como mínimo (por debajo iOS hace zoom en los inputs). Siempre en modo claro: `FieldLayout` lo fuerza. Usar las clases `campo-*` de `index.css` (sin variantes `dark:`).
- El estado no depende solo del color: Normal, Anormal y No aplica llevan color, ícono y texto (✓ / ✕ / —). Normal usa el verde de estado `ok-*` de `index.css`, la única excepción a la paleta: solo para ese estado, nunca como acento.
- Teclados correctos: horas con `inputMode="numeric"`, nombre con mayúscula automática.
- Nada depende del hover. Diseñado a 360 px; en desktop se ve igual, centrado.

Seguridad del dato:
- Borrador automático en localStorage (`checklist:<token>:<tipo>`, todo con try/catch). Al volver a abrir el QR se ofrece "Seguir donde quedaste".
- El Atrás del celular retrocede un paso (`useAtrasDelFlujo`); nunca saca del formulario. Salir con datos cargados pide confirmación.
- No se avanza con errores: el botón principal queda deshabilitado y dice qué falta ("Faltan 3 ítems").
- Un error de red nunca borra lo cargado: "Reintentar" con los datos intactos. El botón de enviar se bloquea mientras se envía.

Textos: cortos, en segunda persona y sin jerga. "Elegí qué revisión vas a hacer", no "Seleccione tipo de checklist".

## Anti-patrones
- Blur grande en todos los elementos.
- Opacidad menor a 0.3 con texto encima.
- Vidrio sobre un fondo liso.
- Brillos y neón excesivos.
- Mezclar radios de esquina sin criterio.
- Más de 2 capas de vidrio apiladas.

## Checklist antes de dar por terminado un componente
- [ ] Se ve bien en modo claro y oscuro.
- [ ] Contraste AA verificado.
- [ ] Responsive en celular, tablet y computadora.
- [ ] Tiene fallback sin `backdrop-filter`.
- [ ] Estados hover, focus y disabled definidos.
- [ ] Usa tokens y clases de `index.css`, sin valores hardcodeados.