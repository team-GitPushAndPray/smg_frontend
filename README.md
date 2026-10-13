# SGM · Frontend

## Estructura de directorios

El proyecto se organiza por tipo de archivo y, dentro de cada tipo, por módulo (portal público, módulo de campo y dashboard). El flujo es: `main.jsx` monta `App`, `App` monta el router, y cada ruta renderiza su layout con su página adentro.

```
sgm_frontend/
├── .env.example                # Variables de entorno de ejemplo (copiar a .env)
├── index.html                  # HTML base; aplica el tema claro/oscuro antes del primer render
├── vite.config.js              # Configuración de Vite + plugins de React y Tailwind
└── src/
    ├── main.jsx                # Punto de entrada: monta <App /> en el DOM
    ├── App.jsx                 # Componente raíz: monta el router
    ├── index.css               # Tailwind, paleta, tokens de vidrio, fondo global y clases .glass / .glass-strong
    │
    ├── config/                 # Configuración global
    │   └── env.js              # Lee y expone las variables de entorno (API_URL)
    │
    ├── router/                 # Definición de rutas
    │   └── index.jsx           # Rutas de cada módulo con su layout + 404
    │
    ├── context/                # Estado global
    │   ├── ThemeContext.js     # Contexto del tema claro/oscuro
    │   ├── ThemeProvider.jsx   # Aplica el tema y recuerda la elección en localStorage
    │   ├── VendedoresContext.js  # Contexto del equipo comercial
    │   └── VendedoresProvider.jsx # Carga el equipo comercial una vez para la home y el navbar
    │
    ├── data/                   # Contenido fijo del front (hasta que lo provea la API)
    │   └── empresa.js          # Textos institucionales: presentación, servicios, equipo comercial, ubicación, contacto y WhatsApp de cotizaciones
    │
    ├── hooks/                  # Lógica reutilizable
    │   ├── useTheme.js         # Acceso al tema actual y a toggleTheme
    │   ├── useHashScroll.js    # Scroll suave a la sección del ancla (#servicios, #contacto...)
    │   ├── useActiveSection.js # Sección visible en pantalla, para marcarla en el navbar
    │   ├── useCatalogo.js      # Carga los equipos del catálogo público, con estado de carga/error y reintento
    │   └── useVendedores.js    # Acceso al equipo comercial (estado, vendedores y reintento)
    │
    ├── layouts/                # Estructura común de cada módulo (navbar, sidebar, footer)
    │
    ├── pages/                  # Una página por ruta, separadas por módulo
    │   ├── NotFoundPage.jsx    # Página 404 compartida
    │   └── public/
    │       ├── HomePage.jsx    # Home con las secciones institucionales y el equipo comercial
    │       └── CatalogPage.jsx # Catálogo: tarjetas por equipo, búsqueda y filtro por tipo en tiempo real
    │
    ├── components/             # Piezas reutilizables entre páginas
    │   ├── ThemeToggle.jsx     # Botón de modo claro/oscuro (compartido)
    │   └── public/             # Componentes del portal público
    │       ├── NavBar.jsx          # Header con anclas a las secciones, enlace al catálogo y menú de celular
    │       ├── Footer.jsx          # Footer con el acceso discreto al login
    │       ├── SectionHeading.jsx  # Encabezado común de las secciones (h2, o h1 en páginas propias)
    │       ├── HeroSection.jsx     # Presentación con acceso al catálogo
    │       ├── ServicesSection.jsx # Texto institucional y tarjetas de servicios
    │       ├── SalesTeamSection.jsx # Equipo comercial: una tarjeta por vendedor activo
    │       ├── SalesRepCard.jsx    # Tarjeta de un vendedor (foto o iniciales, cargo, descripción y WhatsApp), y su versión de carga
    │       ├── LocationSection.jsx # Dirección y mapa embebido de Google Maps
    │       ├── ContactSection.jsx  # Teléfonos por área con enlace a WhatsApp
    │       ├── CatalogSearch.jsx   # Buscador del catálogo
    │       ├── CategoryFilter.jsx  # Filtro por tipo de equipo, con la cantidad de cada uno
    │       ├── EquipmentCard.jsx   # Tarjeta de un equipo con botón para cotizarlo por WhatsApp, y su versión de carga
    │       └── CatalogMessage.jsx  # Avisos de carga: error, sin equipos y sin resultados (catálogo y equipo comercial)
    │
    ├── services/               # Comunicación con el backend
    │   ├── api.js              # Cliente HTTP base (apiFetch) que usan todos los services
    │   ├── catalogoService.js  # GET /catalogo: equipos disponibles para el portal público
    │   └── vendedoresService.js # GET /vendedores/public: vendedores activos, ordenados por cargo
    │
    └── utils/                  # Funciones auxiliares
        ├── text.js             # Normaliza texto para buscar sin importar mayúsculas ni tildes
        ├── equipos.js          # Datos de un equipo listos para mostrar y categorías del listado
        └── vendedores.js       # Nombre del cargo, iniciales y enlace de WhatsApp de un vendedor
```

## Convenciones

- **Services por recurso:** un archivo por entidad del back (`maquinasService.js`, `alquileresService.js`, etc.), todos construidos sobre `apiFetch`. Ningún componente llama a `fetch` directamente.
- **Componentes por módulo:** si un componente lo usa un solo módulo, va en `components/public/`, `components/field/` o `components/dashboard/`. Los compartidos van en la raíz de `components/`.
- **Idioma:** nombres de archivos y código en inglés (`HomePage`, `FieldLayout`); textos visibles y rutas en español (`/campo`, `/admin`).
- **Contenido institucional:** los textos de la home se leen de `data/empresa.js`; los componentes no tienen textos de la empresa escritos adentro. Si el contenido pasa a la API, solo cambia ese archivo.
- **Nuevos directorios:** se crean cuando una issue los necesita, no antes. Los previstos son:
  - `assets/`: imágenes y logos importados desde el código.
  - `public/`: favicon y archivos estáticos.
