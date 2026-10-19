# SGM · Frontend

## Estructura de directorios

El proyecto se organiza por tipo de archivo y, dentro de cada tipo, por módulo (portal público, módulo de campo y panel de gestión). El flujo es: `main.jsx` monta `App`, `App` monta el router, y cada ruta renderiza su layout con su página adentro.

```
sgm_frontend/
├── .env.example                # Variables de entorno de ejemplo (copiar a .env)
├── index.html                  # HTML base; aplica el tema claro/oscuro antes del primer render
├── vite.config.js              # Configuración de Vite + plugins de React y Tailwind
└── src/
    ├── main.jsx                # Punto de entrada: monta <App /> en el DOM
    ├── App.jsx                 # Componente raíz: monta el tema, la sesión y el router
    ├── index.css               # Tailwind, paleta, tokens de vidrio, fondo global, clases .glass / .glass-strong y botones
    │
    ├── config/                 # Configuración global
    │   ├── env.js              # Lee y expone las variables de entorno (API_URL)
    │   └── rutasPanel.js       # Única fuente de verdad del panel: códigos de módulo (MODULOS) y secciones (RUTAS_PANEL) para sidebar, Inicio y rutas protegidas
    │
    ├── router/                 # Definición de rutas
    │   ├── index.jsx           # Rutas de cada módulo con su layout, login del panel (sin layout) + 404. Las del panel se generan desde RUTAS_PANEL
    │   ├── RutaPrivada.jsx     # Exige sesión en todo /admin: loader mientras se restaura, si no hay sesión va al login guardando el origen; verifica el token en cada cambio de sección
    │   └── RutaModulo.jsx      # Exige el módulo de la sección; si el rol no lo tiene, muestra la 403
    │
    ├── context/                # Estado global
    │   ├── ThemeContext.js     # Contexto del tema claro/oscuro
    │   ├── ThemeProvider.jsx   # Aplica el tema y recuerda la elección en localStorage
    │   ├── AuthContext.js      # Contexto de la sesión del panel
    │   ├── AuthProvider.jsx    # Login, logout, restauración de la sesión con /auth/me, permisos por módulo y aviso ante un 403 de la API
    │   ├── ToastContext.js     # Contexto de los avisos (toasts)
    │   ├── ToastProvider.jsx   # Pila de avisos no bloqueantes de toda la app (showToast)
    │   ├── VendedoresContext.js  # Contexto del equipo comercial
    │   └── VendedoresProvider.jsx # Carga el equipo comercial una vez para la home, el detalle de equipo y el navbar
    │
    ├── data/                   # Contenido fijo del front (hasta que lo provea la API)
    │   └── empresa.js          # Textos institucionales: presentación, servicios, equipo comercial, ubicación, contacto, WhatsApp de cotizaciones y consulta por equipo
    │
    ├── hooks/                  # Lógica reutilizable
    │   ├── useTheme.js         # Acceso al tema actual y a toggleTheme
    │   ├── useAuth.js          # Acceso a la sesión: usuario, cargando, login, logout, tieneModulo y puedeEditar
    │   ├── useToast.js         # Acceso a showToast(mensaje, { tipo: 'error' | 'info' })
    │   ├── useHashScroll.js    # Scroll suave a la sección del ancla (#servicios, #contacto...)
    │   ├── useActiveSection.js # Sección visible en pantalla, para marcarla en el navbar
    │   ├── useCatalogo.js      # Carga los equipos del catálogo público, con estado de carga/error y reintento
    │   ├── useEquipo.js        # Carga un equipo del catálogo por id, con estado de carga/no encontrado/error y reintento
    │   └── useVendedores.js    # Acceso al equipo comercial (estado, vendedores y reintento)
    │
    ├── layouts/                # Estructura común de cada módulo (navbar, sidebar, footer)
    │   ├── PublicLayout.jsx    # Portal público: header + footer
    │   ├── AdminLayout.jsx     # Panel de gestión (/admin): sidebar + topbar + contenido (siempre con sesión)
    │   └── FieldLayout.jsx     # Módulo de campo (/campo), mobile-first
    │
    ├── pages/                  # Una página por ruta, separadas por módulo
    │   ├── NotFoundPage.jsx    # Página 404 compartida
    │   ├── admin/              # Panel de gestión (por ahora, placeholders)
    │   │   ├── LoginPage.jsx   # /admin/login: pantalla completa, sin sidebar; formulario de inicio de sesión (con sesión activa redirige a la sección de origen o a /admin)
    │   │   ├── AdminHomePage.jsx # /admin: saludo y una tarjeta por cada sección que el rol tiene
    │   │   ├── ForbiddenPage.jsx # 403 dentro del panel: sección que el rol no incluye
    │   │   ├── MachinesPage.jsx  # /admin/maquinas: placeholder con el nivel de permiso (Edición / Solo lectura)
    │   │   ├── UsersPage.jsx     # /admin/configuracion/usuarios
    │   │   └── RolesPage.jsx     # /admin/configuracion/roles
    │   └── public/
    │       ├── HomePage.jsx    # Home con las secciones institucionales y el equipo comercial
    │       ├── CatalogPage.jsx # Catálogo: tarjetas por equipo, búsqueda y filtro por tipo en tiempo real
    │       └── EquipmentDetailPage.jsx # Detalle de un equipo (/catalogo/:id): una sola página, el id de la URL decide qué equipo se carga
    │
    ├── components/             # Piezas reutilizables entre páginas
    │   ├── ThemeToggle.jsx     # Botón de modo claro/oscuro (compartido)
    │   ├── ToastList.jsx       # Avisos en pantalla: se cierran solos o con la X
    │   ├── admin/              # Componentes del panel de gestión
    │   │   ├── AdminNav.jsx        # Menú del panel generado desde RUTAS_PANEL, filtrado por los módulos del rol, con grupos desplegables e ítem activo (sidebar y celular)
    │   │   ├── AdminTopbar.jsx     # Barra superior: saludo, "Ver sitio", tema, usuario y menú desplegable en celular
    │   │   ├── UserMenu.jsx        # Menú de la cuenta: nombre, rol y cerrar sesión
    │   │   ├── AdminBrand.jsx      # Marca del panel, lleva a /admin
    │   │   ├── PermissionBadge.jsx # Indicador del nivel de permiso sobre un módulo: Edición o Solo lectura
    │   │   └── AdminPlaceholder.jsx # Contenido provisorio de las páginas del panel
    │   └── public/             # Componentes del portal público
    │       ├── NavBar.jsx          # Header con anclas a las secciones, enlace al catálogo, "Ir al panel" con sesión y menú de celular
    │       ├── Footer.jsx          # Footer con el acceso discreto al login
    │       ├── SectionHeading.jsx  # Encabezado común de las secciones (h2, o h1 en páginas propias)
    │       ├── HeroSection.jsx     # Presentación con acceso al catálogo
    │       ├── ServicesSection.jsx # Texto institucional y tarjetas de servicios
    │       ├── SalesTeamSection.jsx # Sección del equipo comercial en la home
    │       ├── SalesRepList.jsx    # Grilla de vendedores con carga y error (home y detalle de equipo), con mensaje de WhatsApp configurable
    │       ├── SalesRepCard.jsx    # Tarjeta de un vendedor (foto o iniciales, cargo, descripción y WhatsApp), y su versión de carga
    │       ├── LocationSection.jsx # Dirección y mapa embebido de Google Maps
    │       ├── ContactSection.jsx  # Teléfonos por área con enlace a WhatsApp
    │       ├── CatalogSearch.jsx   # Buscador del catálogo
    │       ├── CategoryFilter.jsx  # Filtro por tipo de equipo, con la cantidad de cada uno
    │       ├── EquipmentCard.jsx   # Tarjeta de un equipo (toda clickeable hacia el detalle) con "Ver detalle" y "Cotizar", y su versión de carga
    │       ├── EquipmentDetail.jsx # Detalle de un equipo: galería, datos, cotización y equipo comercial, y su versión de carga
    │       ├── EquipmentGallery.jsx # Galería del detalle (provisional: ícono del tipo de equipo hasta que el back devuelva fotos)
    │       └── CatalogMessage.jsx  # Avisos de carga: error, sin equipos y sin resultados (catálogo y equipo comercial)
    │
    ├── services/               # Comunicación con el backend
    │   ├── api.js              # Cliente HTTP base (apiFetch) que usan todos los services: token, 401, 403 y errores de conexión
    │   ├── authService.js      # POST /auth/login y GET /auth/me
    │   ├── catalogoService.js  # GET /catalogo y GET /catalogo/id=:id: equipos disponibles y detalle de uno
    │   └── vendedoresService.js # GET /vendedores/public: vendedores activos, ordenados por cargo
    │
    └── utils/                  # Funciones auxiliares
        ├── text.js             # Normaliza texto para buscar sin importar mayúsculas ni tildes
        ├── equipos.js          # Datos de un equipo listos para mostrar, WhatsApp de cotización y categorías del listado
        ├── vendedores.js       # Nombre del cargo, iniciales y enlace de WhatsApp de un vendedor
        └── usuarios.js         # Normalización de los módulos del usuario, nombre del rol y nombre completo
```

## Convenciones

- **Services por recurso:** un archivo por entidad del back (`maquinasService.js`, `alquileresService.js`, etc.), todos construidos sobre `apiFetch`. Ningún componente llama a `fetch` directamente.
- **Sesión:** `apiFetch` agrega el token a cada request; ante un 401 cierra la sesión y ante un 403 muestra un aviso sin cerrarla. Si la sesión termina estando en el panel, `<RutaPrivada>` lleva al login. Solo el login usa `auth: false`. Los módulos del usuario se leen siempre como `{ codigo, puedeEditar }`: el formato del back se adapta únicamente en `normalizarModulos()` (`utils/usuarios.js`).
- **Componentes por módulo:** si un componente lo usa un solo módulo, va en `components/public/`, `components/field/` o `components/admin/`. Los compartidos van en la raíz de `components/`.
- **Idioma:** nombres de archivos y código en inglés (`HomePage`, `FieldLayout`); textos visibles y rutas en español (`/campo`, `/admin`).
- **Secciones del panel:** para sumar una, se agrega su ítem en `RUTAS_PANEL` (`config/rutasPanel.js`) con su `modulo`, y su página en `paginasPanel` (`router/index.jsx`) con el mismo path. El sidebar, las tarjetas de Inicio y la protección por módulo se arman solos.
- **Permisos:** se consultan con `tieneModulo(codigo)` y `puedeEditar(codigo)` de `useAuth()`, siempre con los códigos de `MODULOS`, nunca escritos a mano. Es experiencia de usuario: la seguridad real la da el back (401/403).
- **Avisos:** para un mensaje no bloqueante se usa `showToast()` de `useToast()`, no un `alert()`.
- **Contenido institucional:** los textos de la home se leen de `data/empresa.js`; los componentes no tienen textos de la empresa escritos adentro. Si el contenido pasa a la API, solo cambia ese archivo.
- **Nuevos directorios:** se crean cuando una issue los necesita, no antes. Los previstos son:
  - `assets/`: imágenes y logos importados desde el código.
  - `public/`: favicon y archivos estáticos.
