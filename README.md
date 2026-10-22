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
    │   └── rutasPanel.js       # Única fuente de verdad del panel: códigos de módulo (MODULOS), secciones (RUTAS_PANEL) para sidebar, Inicio y rutas protegidas, y pantallas de Máquinas (RUTAS_MAQUINAS: inventario, alta, detalle y edición)
    │
    ├── router/                 # Definición de rutas
    │   ├── index.jsx           # Rutas de cada módulo con su layout, login del panel (sin layout) + 404. Las del panel se generan desde RUTAS_PANEL
    │   ├── RutaPrivada.jsx     # Exige sesión en todo /admin: loader mientras se restaura, si no hay sesión va al login guardando el origen; verifica el token en cada cambio de sección
    │   └── RutaModulo.jsx      # Exige el módulo de la sección (y, con requiereEdicion, poder editarlo); si no, muestra la 403
    │
    ├── context/                # Estado global
    │   ├── ThemeContext.js     # Contexto del tema claro/oscuro
    │   ├── ThemeProvider.jsx   # Aplica el tema y recuerda la elección en localStorage
    │   ├── AuthContext.js      # Contexto de la sesión del panel
    │   ├── AuthProvider.jsx    # Login, logout, restauración de la sesión con /auth/me, permisos por módulo y aviso ante un 403 de la API
    │   ├── ToastContext.js     # Contexto de los avisos (toasts)
    │   ├── ToastProvider.jsx   # Pila de avisos no bloqueantes de toda la app (showToast: error, info o exito)
    │   ├── VendedoresContext.js  # Contexto del equipo comercial
    │   └── VendedoresProvider.jsx # Carga el equipo comercial una vez para la home, el detalle de equipo y el navbar
    │
    ├── data/                   # Contenido fijo del front (hasta que lo provea la API)
    │   └── empresa.js          # Textos institucionales: presentación, servicios, equipo comercial, ubicación, contacto, WhatsApp de cotizaciones y consulta por equipo
    │
    ├── hooks/                  # Lógica reutilizable
    │   ├── useTheme.js         # Acceso al tema actual y a toggleTheme
    │   ├── useAuth.js          # Acceso a la sesión: usuario, cargando, login, logout, tieneModulo y puedeEditar
    │   ├── usePermiso.js       # Nivel de acceso sobre un módulo: { puedeVer, puedeEditar }
    │   ├── useToast.js         # Acceso a showToast(mensaje, { tipo: 'error' | 'info' | 'exito' })
    │   ├── useHashScroll.js    # Scroll suave a la sección del ancla (#servicios, #contacto...)
    │   ├── useActiveSection.js # Sección visible en pantalla, para marcarla en el navbar
    │   ├── useCatalogo.js      # Carga los equipos del catálogo público, con estado de carga/error y reintento
    │   ├── useEquipo.js        # Carga un equipo por id (catálogo o panel, según la función del service que recibe), con estado de carga/no encontrado/error y reintento
    │   ├── useVendedores.js    # Acceso al equipo comercial (estado, vendedores y reintento)
    │   ├── useUsuarios.js      # Carga usuarios y roles juntos, con reintento, refresco en segundo plano y reemplazo de una fila
    │   ├── useFiltrosInventario.js # Filtros y página del inventario de máquinas guardados en la URL (sobreviven a recargar y a volver atrás)
    │   ├── useEquipos.js       # Carga una página del inventario según los filtros, conservando la anterior mientras llega la nueva, con reintento
    │   ├── useCategorias.js    # Carga las categorías de equipo para filtros y formularios, con reintento
    │   └── useRoles.js         # Carga roles y módulos juntos (filas y columnas de la matriz), con reintento, refresco y actualización de un rol
    │
    ├── layouts/                # Estructura común de cada módulo (navbar, sidebar, footer)
    │   ├── PublicLayout.jsx    # Portal público: header + footer
    │   ├── AdminLayout.jsx     # Panel de gestión (/admin): sidebar + topbar + contenido (siempre con sesión)
    │   └── FieldLayout.jsx     # Módulo de campo (/campo), mobile-first
    │
    ├── pages/                  # Una página por ruta, separadas por módulo
    │   ├── NotFoundPage.jsx    # Página 404 compartida
    │   ├── admin/              # Panel de gestión
    │   │   ├── LoginPage.jsx   # /admin/login: pantalla completa, sin sidebar; formulario de inicio de sesión (con sesión activa redirige a la sección de origen o a /admin)
    │   │   ├── AdminHomePage.jsx # /admin: saludo y una tarjeta por cada sección que el rol tiene
    │   │   ├── ForbiddenPage.jsx # 403 dentro del panel: sección que el rol no incluye (o que puede ver pero no editar)
    │   │   ├── MachinesPage.jsx  # /admin/maquinas: inventario con buscador (espera de 400 ms), filtros, dados de baja y paginación del back, todo en la URL; solo lectura sin edición en Máquinas
    │   │   ├── MachineDetailPage.jsx # /admin/maquinas/:id: detalle de un equipo (también dado de baja), con "Equipo no encontrado" y reintento; "Editar" solo con edición y equipo activo
    │   │   ├── MachineFormPage.jsx # /admin/maquinas/nuevo y /admin/maquinas/:id/editar (requieren editar Máquinas): alta de equipo con aviso y paso al detalle del creado; la edición es todavía un placeholder
    │   │   ├── UsersPage.jsx     # /admin/configuracion/usuarios: ABM de usuarios (tabla, búsqueda, filtro por estado, alta, edición, baja y reactivación); solo lectura con Configuración en "Ver"
    │   │   └── RolesPage.jsx     # /admin/configuracion/roles: matriz de permisos roles × módulos, alta y edición de roles, activación y desactivación; solo lectura con Configuración en "Ver"
    │   └── public/
    │       ├── HomePage.jsx    # Home con las secciones institucionales y el equipo comercial
    │       ├── CatalogPage.jsx # Catálogo: tarjetas por equipo, búsqueda y filtro por tipo en tiempo real
    │       └── EquipmentDetailPage.jsx # Detalle de un equipo (/catalogo/:id): una sola página, el id de la URL decide qué equipo se carga
    │
    ├── components/             # Piezas reutilizables entre páginas
    │   ├── ThemeToggle.jsx     # Botón de modo claro/oscuro (compartido)
    │   ├── ToastList.jsx       # Avisos en pantalla: se cierran solos o con la X (quedan sobre los modales)
    │   ├── admin/              # Componentes del panel de gestión
    │   │   ├── AdminNav.jsx        # Menú del panel generado desde RUTAS_PANEL, filtrado por los módulos del rol, con grupos desplegables e ítem activo (sidebar y celular)
    │   │   ├── AdminTopbar.jsx     # Barra superior: saludo, "Ver sitio", tema, usuario y menú desplegable en celular
    │   │   ├── UserMenu.jsx        # Menú de la cuenta: nombre, rol, cambiar contraseña y cerrar sesión
│   │   ├── ChangePasswordModal.jsx # Cambio de la contraseña propia (cualquier rol), con validación y error de contraseña actual incorrecta
    │   │   ├── AdminBrand.jsx      # Marca del panel, lleva a /admin
    │   │   ├── PermissionBadge.jsx # Indicador del nivel de permiso sobre un módulo: Edición o Solo lectura
    │   │   ├── AdminPlaceholder.jsx # Contenido provisorio de las páginas del panel
    │   │   ├── PanelMessage.jsx    # Aviso de una sección del panel: error de carga, sin datos, sin resultados o no encontrado
    │   │   ├── Modal.jsx           # Modal base del panel: portal, foco atrapado, Escape y bloqueo mientras se envía
    │   │   ├── ConfirmDialog.jsx   # Confirmación de una acción delicada, con carga y error
│   │   ├── FormField.jsx       # Campo de formulario (label, ayuda y error) e input de contraseña con mostrar/ocultar
    │   │   ├── UsersToolbar.jsx    # Buscador por nombre o email y filtro por estado de la pantalla de usuarios
    │   │   ├── UsersTable.jsx      # Tabla de usuarios (tarjetas debajo de lg) con rol, estado y último acceso, y su versión de carga
    │   │   ├── UserActionsMenu.jsx # Menú ⋯ de una fila: Editar y Dar de baja / Reactivar
    │   │   ├── UserFormModal.jsx   # Alta y edición de un usuario con validación y errores del back (409 en el email, 400 arriba)
    │   │   ├── PermissionsMatrix.jsx # Matriz de permisos (filas = roles, columnas = módulos) con la columna del rol fija al hacer scroll, y su versión de carga
    │   │   ├── AccessLevelControl.jsx # Control segmentado Sin acceso · Ver · Editar de una celda, y su versión de solo lectura (incluye "Acceso total")
    │   │   ├── RoleActionsMenu.jsx # Menú ⋯ de un rol (Editar y Desactivar / Activar), en un portal para que el scroll de la matriz no lo recorte
    │   │   ├── RoleFormModal.jsx   # Alta y edición de un rol (nombre y descripción) con errores del back (409 y 400 en el nombre, lista de 400 arriba)
    │   │   ├── InventarioToolbar.jsx # Buscador, filtros por tipo, estado y categoría, switch "Ver dados de baja" y limpiar filtros del inventario
    │   │   ├── InventarioTable.jsx # Tabla del inventario (tarjetas debajo de xl) con horas, estado y menú de acciones, y su versión de carga
    │   │   ├── EquipoActionsMenu.jsx # Menú ⋯ de un equipo según el permiso (Ver detalle, Editar, Actualizar horas, Cambiar estado, Dar de baja), en un portal
    │   │   ├── EstadoEquipoBadge.jsx # Badge del estado de un equipo (ícono, texto y color); acepta la clave o la etiqueta del estado
    │   │   ├── EquipoDetail.jsx    # Detalle de un equipo del panel: encabezado con "Editar", aviso de dado de baja, datos generales y datos de máquina, y su versión de carga
    │   │   ├── EquipoForm.jsx      # Formulario de equipo (alta y, precargado, edición): tipo máquina/aditamento, datos generales y de máquina, validaciones del DTO y errores del back (409 en el código interno, 400 arriba)
    │   │   └── Pagination.jsx      # Paginación de un listado: rango mostrado, total y botones de página (anterior/siguiente en celular)
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
    │   ├── api.js              # Cliente HTTP base (apiFetch) que usan todos los services: token, 401, 403, errores de conexión y mensajes de validación del back
    │   ├── authService.js      # POST /auth/login, GET /auth/me y PATCH /auth/password
    │   ├── catalogoService.js  # GET /catalogo y GET /catalogo/id=:id: equipos disponibles y detalle de uno
    │   ├── vendedoresService.js # GET /vendedores/public: vendedores activos, ordenados por cargo
    │   ├── usuariosService.js  # ABM de usuarios (GET, POST y PATCH /usuarios, PATCH /usuarios/:id/estado)
    │   ├── rolesService.js     # Roles y permisos: GET /roles, GET /modulos, POST y PATCH /roles, PUT /roles/:id/modulos
    │   ├── equiposService.js   # Equipos del panel: GET /equipos (paginado, con filtros), GET /equipos/:id, POST y PATCH /equipos
    │   └── categoriasService.js # GET /categorias: categorías de equipo
    │
    └── utils/                  # Funciones auxiliares
        ├── text.js             # Normaliza texto para buscar sin importar mayúsculas ni tildes
        ├── equipos.js          # Datos de un equipo listos para mostrar, WhatsApp de cotización, categorías del listado, tipos, estados (etiqueta, ícono y color, por clave o etiqueta), nombre del equipo, formato de horas ("Sin registrar" si no hay carga) y mensajes de error del módulo máquinas
        ├── vendedores.js       # Nombre del cargo, iniciales y enlace de WhatsApp de un vendedor
        ├── usuarios.js         # Normalización de los módulos (del usuario y de cada rol), nombre del rol, nombre completo, último acceso y error genérico
        └── roles.js            # Niveles de acceso de la matriz (Sin acceso, Ver, Editar) y armado de la lista completa de módulos de un rol
```

## Convenciones

- **Services por recurso:** un archivo por entidad del back (`equiposService.js`, `alquileresService.js`, etc.), todos construidos sobre `apiFetch`. Ningún componente llama a `fetch` directamente.
- **Sesión:** `apiFetch` agrega el token a cada request; ante un 401 cierra la sesión y ante un 403 muestra un aviso sin cerrarla. Si la sesión termina estando en el panel, `<RutaPrivada>` lleva al login. Solo el login usa `auth: false`. Los módulos del usuario se leen siempre como `{ codigo, puedeEditar }`: el formato del back se adapta únicamente en `normalizarModulos()` (`utils/usuarios.js`).
- **Componentes por módulo:** si un componente lo usa un solo módulo, va en `components/public/`, `components/field/` o `components/admin/`. Los compartidos van en la raíz de `components/`.
- **Idioma:** nombres de archivos y código en inglés (`HomePage`, `FieldLayout`); textos visibles y rutas en español (`/campo`, `/admin`).
- **Secciones del panel:** para sumar una, se agrega su ítem en `RUTAS_PANEL` (`config/rutasPanel.js`) con su `modulo`, y su página en `paginasPanel` (`router/index.jsx`) con el mismo path. El sidebar, las tarjetas de Inicio y la protección por módulo se arman solos.
- **Permisos:** en una pantalla se leen con `usePermiso(codigo)`, que devuelve `{ puedeVer, puedeEditar }` (por debajo usa `tieneModulo` y `puedeEditar` de `useAuth()`), siempre con los códigos de `MODULOS` (en MAYÚSCULAS, como los manda el back), nunca escritos a mano. Cada módulo tiene dos niveles: ver (solo consulta) y editar (alta, edición y baja); sin edición, la pantalla se muestra de solo lectura. Es experiencia de usuario: la seguridad real la da el back (401/403).
- **Avisos:** para un mensaje no bloqueante se usa `showToast()` de `useToast()`, no un `alert()`. Los errores 401 y 403 ya los avisa `apiFetch`: para el resto, `getErrorGenerico()` (`utils/usuarios.js`); en el módulo máquinas, `getErrorEquipo()` (`utils/equipos.js`), que además traduce 400, 404 y 409.
- **Modales:** se usa `Modal` (`components/admin/Modal.jsx`), que se muestra mientras está montado. No se usa `<dialog>` nativo: su capa superior taparía los avisos.
- **Contenido institucional:** los textos de la home se leen de `data/empresa.js`; los componentes no tienen textos de la empresa escritos adentro. Si el contenido pasa a la API, solo cambia ese archivo.
- **Nuevos directorios:** se crean cuando una issue los necesita, no antes. Los previstos son:
  - `assets/`: imágenes y logos importados desde el código.
  - `public/`: favicon y archivos estáticos.
