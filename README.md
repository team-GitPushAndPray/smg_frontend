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
    ├── index.css               # Tailwind, paleta, tokens de vidrio, fondo global, clases .glass / .glass-strong, botones, campos e ícono dentro de un campo (field-icon); clases sólidas del módulo de campo (campo-*) y el verde de estado (ok-*), solo para "Normal" en los ítems del checklist
    │
    ├── config/                 # Configuración global
    │   ├── env.js              # Lee y expone las variables de entorno (API_URL)
    │   └── rutasPanel.js       # Única fuente de verdad del panel: códigos de módulo (MODULOS), secciones (RUTAS_PANEL) para sidebar, Inicio y rutas protegidas, y pantallas de Máquinas (RUTAS_MAQUINAS: inventario, alta, detalle, edición, historial y detalle de un checklist del historial)
    │
    ├── router/                 # Definición de rutas
    │   ├── index.jsx           # Rutas de cada módulo con su layout, login del panel (sin layout) + 404. Las del panel se generan desde RUTAS_PANEL
    │   ├── RutaPrivada.jsx     # Exige sesión en todo /admin: loader mientras se restaura, si no hay sesión va al login guardando el origen; verifica el token en cada cambio de sección
    │   └── RutaModulo.jsx      # Exige el módulo de la sección (y, con requiereEdicion, poder editarlo); si no, muestra la 403
    │
    ├── context/                # Estado global
    │   ├── ThemeContext.js     # Contexto del tema claro/oscuro
    │   ├── ThemeProvider.jsx   # Aplica el tema y recuerda la elección en localStorage; en el módulo de campo fuerza el modo claro (setForcedLight)
    │   ├── AuthContext.js      # Contexto de la sesión del panel
    │   ├── AuthProvider.jsx    # Login, logout, restauración de la sesión con /auth/me, permisos por módulo y aviso ante un 403 de la API
    │   ├── ToastContext.js     # Contexto de los avisos (toasts)
    │   ├── ToastProvider.jsx   # Pila de avisos no bloqueantes de toda la app (showToast: error, info o exito)
    │   ├── ChecklistContext.js # Contexto del checklist de campo
    │   ├── ChecklistProvider.jsx # Estado del asistente del checklist (reducer): tipo, paso y datos, fotos en memoria (no van al borrador; si el retomado tenía, se piden de nuevo), borrador automático en localStorage, responsable recordado precargado en cada checklist nuevo, confirmación al cerrar la pestaña, edición desde la revisión y envío (un solo POST aunque se toque dos veces; el error lleva al paso que lo corrige; el éxito borra el borrador y recuerda al responsable)
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
    │   ├── useEquipo.js        # Carga un equipo por id (catálogo o panel, según la función del service que recibe), con estado de carga/no encontrado/error, reintento y recarga sin pasar por la carga
    │   ├── useVendedores.js    # Acceso al equipo comercial (estado, vendedores y reintento)
    │   ├── useUsuarios.js      # Carga usuarios y roles juntos, con reintento, refresco en segundo plano y reemplazo de una fila
    │   ├── useFiltrosInventario.js # Filtros y página del inventario de máquinas guardados en la URL (sobreviven a recargar y a volver atrás)
    │   ├── useEquipos.js       # Carga una página del inventario según los filtros, conservando la anterior mientras llega la nueva, con reintento
    │   ├── useFiltrosHistorial.js # Filtros (desde, hasta, tipo, responsable, q) y página de los checklists del historial guardados en la URL junto a la pestaña; ignora lo inválido y nunca deja un rango al revés
    │   ├── useChecklistsEquipo.js # Carga una página de los checklists de un equipo según los filtros, conservando la anterior mientras llega la nueva, con reintento
    │   ├── useTextoDiferido.js # Campo de texto que se aplica cuando se deja de tipear (400 ms), con borrar al momento y puesta al día si cambia la URL
    │   ├── useCategorias.js    # Carga las categorías de equipo para filtros y formularios, con reintento
    │   ├── useFormularioChecklist.js # Carga el formulario de checklist por el token del QR: carga, QR no válido (404), sin conexión (con reintento solo al volver la red) y error; también lo vuelve a pedir sin pantalla de carga para actualizar las horas
    │   ├── useChecklist.js     # Acceso al estado del asistente del checklist (equipo, opciones, paso, datos y acciones)
    │   ├── useAtrasDelFlujo.js # El botón Atrás del celular retrocede un paso del asistente en vez de salir de la página
    │   └── useRoles.js         # Carga roles y módulos juntos (filas y columnas de la matriz), con reintento, refresco y actualización de un rol
    │
    ├── layouts/                # Estructura común de cada módulo (navbar, sidebar, footer)
    │   ├── PublicLayout.jsx    # Portal público: header + footer
    │   ├── AdminLayout.jsx     # Panel de gestión (/admin): sidebar + topbar + contenido (siempre con sesión)
    │   └── FieldLayout.jsx     # Módulo de campo (/campo y /c/:token): sin navbar ni footer, fondo sólido, siempre en modo claro, mobile-first
    │
    ├── pages/                  # Una página por ruta, separadas por módulo
    │   ├── NotFoundPage.jsx    # Página 404 compartida
    │   ├── admin/              # Panel de gestión
    │   │   ├── LoginPage.jsx   # /admin/login: pantalla completa, sin sidebar; formulario de inicio de sesión (con sesión activa redirige a la sección de origen o a /admin)
    │   │   ├── AdminHomePage.jsx # /admin: saludo y una tarjeta por cada sección que el rol tiene
    │   │   ├── ForbiddenPage.jsx # 403 dentro del panel: sección que el rol no incluye (o que puede ver pero no editar)
    │   │   ├── MachinesPage.jsx  # /admin/maquinas: inventario con buscador (espera de 400 ms), filtros, dados de baja y paginación del back, todo en la URL; acciones de horas, estado y baja que refrescan la página; solo lectura sin edición en Máquinas
    │   │   ├── MachineDetailPage.jsx # /admin/maquinas/:id: detalle de un equipo (también dado de baja), con "Equipo no encontrado" y reintento; "Ver historial" para todos (también dado de baja), "Ver QR" para todos y "Editar" y las acciones de horas, estado y baja solo con edición, todo con el equipo activo; las acciones al terminar recargan el equipo
    │   │   ├── MachineHistoryPage.jsx # /admin/maquinas/:id/historial (requiere ver Máquinas): historial de solo lectura de un equipo (también dado de baja), con encabezado, "Equipo no encontrado" y reintento; pestañas Checklists, Alquileres y Mantenimiento con la activa en la URL (?tab=checklists); Checklists con filtros, tabla y paginación; Alquileres y Mantenimiento con estado vacío hasta M-08 y M-10
    │   │   ├── MachineChecklistPage.jsx # /admin/maquinas/:id/historial/checklists/:checklistId (requiere ver Máquinas): detalle de un checklist del historial (provisorio hasta la issue del detalle); "Volver al historial" restaura los filtros con los que se abrió
    │   │   ├── MachineFormPage.jsx # /admin/maquinas/nuevo y /admin/maquinas/:id/editar (requieren editar Máquinas): alta de equipo con aviso y paso al detalle del creado; edición precargada que envía solo los campos modificados (PATCH parcial), bloqueada para equipos dados de baja
    │   │   ├── UsersPage.jsx     # /admin/configuracion/usuarios: ABM de usuarios (tabla, búsqueda, filtro por estado, alta, edición, baja y reactivación); solo lectura con Configuración en "Ver"
    │   │   └── RolesPage.jsx     # /admin/configuracion/roles: matriz de permisos roles × módulos, alta y edición de roles, activación y desactivación; solo lectura con Configuración en "Ver"
    │   ├── field/              # Módulo de campo (QR)
    │   │   ├── FieldHomePage.jsx # /campo: pantalla de bienvenida del módulo
    │   │   └── ChecklistPage.jsx # /c/:token: lo que abre el QR del equipo (pública, sin sesión): esqueleto de carga, QR no válido, sin conexión con "Reintentar" y el asistente del checklist
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
    │   │   ├── SearchField.jsx     # Campo de búsqueda sobre el fondo (vidrio opaco) con ícono y ✕ para borrar; lo usan el inventario y el historial
    │   │   ├── FilterSelect.jsx    # Select de filtro sobre el fondo (vidrio opaco) con etiqueta para lectores de pantalla
    │   │   ├── InventarioToolbar.jsx # Buscador, filtros por tipo, estado y categoría, switch "Ver dados de baja" y limpiar filtros del inventario
    │   │   ├── InventarioTable.jsx # Tabla del inventario (tarjetas debajo de xl) con horas, estado y menú de acciones, y su versión de carga
    │   │   ├── EquipoActionsMenu.jsx # Menú ⋯ de un equipo según el permiso (Ver detalle y Ver historial para todos, Editar, Actualizar horas, Cambiar estado, Dar de baja), en un portal; en el detalle, solo las acciones con modal
    │   │   ├── EquipoAccionModal.jsx # Modales de las acciones de un equipo: actualizar horas (no menores a las actuales), cambiar estado (aviso del catálogo) y confirmación de baja; manejan el 400 en el modal y el 409/404 con aviso y refresco
    │   │   ├── EquipoQrModal.jsx   # QR de un equipo (lleva a /c/<qr_token>): vista previa de la etiqueta, "Descargar PNG" para imprimir a 5 × 5 cm y "Copiar link" para grabarlo en una etiqueta NFC
    │   │   ├── EstadoEquipoBadge.jsx # Badge del estado de un equipo (ícono, texto y color); acepta la clave o la etiqueta del estado
    │   │   ├── AvisoDadoDeBaja.jsx # Aviso de equipo dado de baja (se conserva por su historial), compartido por el detalle y el historial
    │   │   ├── HistorialHeader.jsx # Encabezado del historial: "M027 · Minicargadora Bobcat S530" (sin modelo en aditamentos), badge de estado y aviso de dado de baja; sin acciones. Incluye la versión de carga de toda la pantalla
    │   │   ├── HistorialTabs.jsx   # Pestañas del historial (Checklists, Alquileres, Mantenimiento): control segmentado con el patrón de tabs de WAI-ARIA (flechas, Inicio y Fin); en celular, ícono arriba del texto para que entren a 360px
    │   │   ├── HistorialChecklists.jsx # Pestaña Checklists del historial: filtros, listado de a 20 (el más nuevo arriba), paginación y estados (cargando, sin checklists, sin resultados y error con reintento)
    │   │   ├── ChecklistsToolbar.jsx # Filtros de los checklists: buscador en las observaciones, responsable, tipo, rango de fechas (Desde/Hasta) y "Limpiar filtros"
    │   │   ├── HistorialChecklistsTable.jsx # Checklists de un equipo: tabla desde md (fecha, tipo, horas motor, responsable, anormales y fotos) y tarjetas en celular; toda la fila abre el detalle. Incluye su versión de carga
    │   │   ├── TipoChecklistBadge.jsx # Badge del tipo de checklist (ícono, texto y un tono por tipo)
    │   │   ├── EquipoDetail.jsx    # Detalle de un equipo del panel: encabezado con "Ver historial", "Ver QR", "Editar" y el ⋯ de acciones, aviso de dado de baja, datos generales y datos de máquina, y su versión de carga
    │   │   ├── EquipoForm.jsx      # Formulario de equipo (alta y, precargado, edición): tipo máquina/aditamento, datos generales y de máquina, validaciones del DTO y errores del back (409 en el código interno, 400 arriba); en la edición, tipo fijo, sin horas de motor y sin vaciar la ubicación ni la descripción ya cargadas. Incluye su versión de carga
    │   │   └── Pagination.jsx      # Paginación de un listado: rango mostrado, total y botones de página (anterior/siguiente en celular)
    │   ├── field/              # Componentes del módulo de campo: sin vidrio, fondos sólidos, 16px mínimo y botones de 48px o más
    │   │   ├── FieldScreen.jsx     # Pantalla base: encabezado fijo arriba, contenido y acción principal fija abajo
    │   │   ├── FieldMessage.jsx    # Aviso de pantalla completa (QR no válido, sin conexión) sin salidas a otras partes del sistema
    │   │   ├── MainAction.jsx      # Botón principal de un paso: deshabilitado dice qué falta; incompleto se ve igual pero lleva a lo que falta; bloqueado mientras se envía
    │   │   ├── FieldDialog.jsx     # Pregunta que frena el flujo (dialog nativo, sale desde abajo): botones grandes uno debajo del otro
    │   │   ├── WizardHeader.jsx    # "Atrás", "Paso X de N" y barra de progreso
    │   │   ├── ChecklistWizard.jsx # Asistente: un paso por pantalla (5 en máquinas, 4 en aditamentos), primero ofrece seguir el borrador y después de enviar muestra "Listo" (su Atrás lleva a un checklist nuevo, nunca al enviado)
    │   │   ├── DraftPrompt.jsx     # "Tenés un checklist sin terminar": seguir donde quedaste o empezar de nuevo
    │   │   ├── ChecklistDone.jsx   # "Listo": ✓ grande, resumen de lo que respondió el back (tipo, equipo, horas y anormales) y "Hacer otro checklist de este equipo"
    │   │   ├── EnvioAlert.jsx      # Por qué no salió el envío, arriba del paso al que llevó el error: "No se pudo enviar" sin conexión o el mensaje del back
    │   │   ├── ChecklistStart.jsx  # Paso 1: el equipo y un botón por cada opción que manda el back, y su versión de carga
    │   │   ├── EquipoSummary.jsx   # Encabezado del equipo: código interno, categoría y marca, y horas actuales si es máquina
    │   │   ├── ItemCard.jsx        # Un ítem del checklist: nombre y los tres estados (✓ Normal, ✕ Anormal, — No aplica); respondida cambia de fondo
    │   │   ├── FotoSlot.jsx        # Lugar de una foto: "Sacar foto" abre la cámara trasera, la comprime ("Procesando…") y muestra la miniatura con ✕ y "Sacar otra"; avisa "Volvé a sacar la foto" al retomar un borrador
    │   │   └── steps/              # Pasos del asistente: HorasStep (horas del horómetro: no menos que las actuales y confirmación si suben más de 200 hs); ItemsStep (lista de ítems con contador fijo, marcado en bloque de los pendientes y botón que lleva al primero que falta); CierreStep (observaciones con ayuda según el tipo, contador y aviso si hay ítems Anormales sin contar, foto del equipo y nombre y apellido obligatorios); RevisionStep (todo lo cargado de solo lectura con un "Editar" por bloque, horas con la diferencia, conteo por estado con los Anormales por nombre, "Enviar" / "Enviando…" / "Reintentar"). Llegando desde la revisión, el botón de cada paso dice "Volver a la revisión"
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
    │   ├── api.js              # Cliente HTTP base (apiFetch) que usan todos los services: token, 401, 403, errores de conexión y mensajes de validación del back; body JSON o FormData (archivos). También arma el query string de los filtros (toQuery)
    │   ├── authService.js      # POST /auth/login, GET /auth/me y PATCH /auth/password
    │   ├── catalogoService.js  # GET /catalogo y GET /catalogo/id=:id: equipos disponibles y detalle de uno
    │   ├── vendedoresService.js # GET /vendedores/public: vendedores activos, ordenados por cargo
    │   ├── usuariosService.js  # ABM de usuarios (GET, POST y PATCH /usuarios, PATCH /usuarios/:id/estado)
    │   ├── rolesService.js     # Roles y permisos: GET /roles, GET /modulos, POST y PATCH /roles, PUT /roles/:id/modulos
    │   ├── equiposService.js   # Equipos del panel: GET /equipos (paginado, con filtros), GET /equipos/:id, POST y PATCH /equipos, PATCH /equipos/:id/horas y /estado, y DELETE /equipos/:id (baja lógica)
    │   ├── categoriasService.js # GET /categorias: categorías de equipo
    │   ├── historialService.js # Historial de un equipo (solo lectura): GET /equipos/:id/historial/checklists (paginado, con filtros de fecha, tipo, responsable y búsqueda en observaciones)
    │   └── checklistsService.js # GET /public/checklists/:token (sin sesión): equipo del QR y sus opciones de checklist con los ítems; POST del checklist terminado (multipart: `datos` JSON y `fotos`)
    │
    └── utils/                  # Funciones auxiliares
        ├── text.js             # Normaliza texto para buscar sin importar mayúsculas ni tildes
        ├── equipos.js          # Datos de un equipo listos para mostrar, WhatsApp de cotización, categorías del listado, tipos, estados (etiqueta, ícono y color, y clave, por clave o etiqueta), nombre del equipo, el equipo en una línea (código · categoría marca modelo), formato de horas ("Sin registrar" si no hay carga), campos modificados de un equipo (body del PATCH) y mensajes de error del módulo máquinas
        ├── historial.js        # Pestañas del historial de un equipo (id de la URL, etiqueta, ícono y módulo pendiente) y lectura de la pestaña activa (?tab=), con Checklists por defecto; tipos de checklist (etiqueta, ícono y tono), checklist del listado con los nombres del front, formatos de fecha y horas y validación de las fechas de los filtros
        ├── vendedores.js       # Nombre del cargo, iniciales y enlace de WhatsApp de un vendedor
        ├── usuarios.js         # Normalización de los módulos (del usuario y de cada rol), nombre del rol, nombre completo, último acceso y error genérico
        ├── roles.js            # Niveles de acceso de la matriz (Sin acceso, Ver, Editar) y armado de la lista completa de módulos de un rol
        ├── qr.js               # Link del QR de un equipo (/c/<qr_token>) y etiqueta en PNG para imprimir: QR, código interno y "Escaneá para hacer el checklist", cuadrada y en alta resolución
        ├── imagenes.js         # Compresión de una imagen en el navegador (lado mayor y JPEG con la calidad que entre en el peso buscado)
        └── checklists.js       # Formulario de checklist con los nombres del front, ícono por tipo, pasos según máquina o aditamento, validación de las horas del horómetro, estados de los ítems y marcado en bloque de los pendientes, ítems anormales y su aviso, ayuda de las observaciones según el tipo, validación del nombre y apellido, cantidad de fotos (MAX_FOTOS) y su compresión, borrador en localStorage (checklist:<token>:<tipo>), responsable recordado (checklist:responsable), conteo por estado, cambio de horas ("2.140 → 2.148 hs (+8)"), datos del POST, respuesta del envío y a qué paso lleva cada error (400, 409, sin conexión)
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
