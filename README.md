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
    ├── index.css               # Tailwind, paleta, tokens de vidrio, fondo global, clases .glass / .glass-strong, botones, campos e ícono dentro de un campo (field-icon); clases sólidas del módulo de campo (campo-*), el verde de estado (ok-*), solo para "Normal" en los ítems de un checklist (campo e historial), los tokens del visor de fotos (--visor-*) y la hoja de impresión (hoja-impresion e impresion-*: A4, papel siempre claro, sin vidrio; al imprimir oculta todo lo demás)
    │
    ├── config/                 # Configuración global
    │   ├── env.js              # Lee y expone las variables de entorno (API_URL)
    │   └── rutasPanel.js       # Única fuente de verdad del panel: códigos de módulo (MODULOS), secciones (RUTAS_PANEL) para sidebar, Inicio y rutas protegidas, pantallas de Máquinas (RUTAS_MAQUINAS: inventario, alta, detalle, edición, historial y detalle de un checklist del historial) y de Alquileres (RUTAS_ALQUILERES: listado, alta, detalle, checklist de entrega/devolución, clientes y detalle de un cliente)
    │
    ├── router/                 # Definición de rutas
    │   ├── index.jsx           # Rutas de cada módulo con su layout, login del panel (sin layout) + 404. Las del panel se generan desde RUTAS_PANEL; una sección con pantallas propias (subrutasPanel, hoy Alquileres) monta su layout con ellas adentro. El checklist de entrega/devolución de un alquiler va fuera del panel: sesión + FieldLayout + edición en Alquileres
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
    │   ├── ChecklistProvider.jsx # Estado del asistente del checklist (reducer): tipo, paso y datos, fotos en memoria (no van al borrador; si el retomado tenía, se piden de nuevo), borrador automático en localStorage, responsable recordado precargado en cada checklist nuevo, confirmación al cerrar la pestaña, edición desde la revisión y envío (un solo POST aunque se toque dos veces; el error lleva al paso que lo corrige; el éxito borra el borrador y recuerda al responsable). Lo usan el QR y la entrega/devolución de un alquiler: cada página le pasa la clave del borrador, cómo enviar, si el responsable es el de la sesión (no se pide) y, opcionalmente, qué hacer al terminar o ante un error
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
    │   ├── useChecklistHistorial.js # Carga el detalle de un checklist del historial por los ids de la URL: carga, no encontrado (404: no existe o es de otro equipo), error y reintento
    │   ├── useExportacionChecklists.js # Exportar a PDF los checklists de un equipo con los filtros aplicados: pide todos (todas las páginas, solo GET), deja listo el informe con la fecha de emisión y avisa con un toast si falla la red
    │   ├── useFiltrosClientes.js # Búsqueda por razón social y filtro de estado de los clientes (Activos por defecto o Todos, que incluye a los inactivos) guardados en la URL
    │   ├── useClientes.js      # Carga los clientes según la búsqueda y el estado, conservando la lista anterior mientras llega la nueva, con reintento y recarga después de guardar
    │   ├── useCliente.js       # Carga un cliente por id con la cantidad de alquileres (loading, success, not-found, error), con reintento y recarga sin pasar por la carga
    │   ├── useAlquileresCliente.js # Carga el historial de alquileres de un cliente (GET /alquileres?cliente_id=): todos los estados, el más nuevo primero, con carga, error y reintento
    │   ├── useAlquileres.js    # Carga GET /alquileres con una consulta (estados, cliente, por vencer); con null no pide nada. Conserva la lista anterior mientras llega la nueva, con error y reintento
    │   ├── useAlquiler.js      # Carga un alquiler por id (GET /alquileres/:id: cliente, autor y equipos con su entrega y devolución) con carga, no encontrado, error, reintento y recarga sin pasar por la carga; si la navegación ya trae el detalle (desde el alta) lo muestra enseguida y lo vuelve a pedir igual
    │   ├── useEquiposAlquilables.js # Todos los equipos activos y disponibles para el alta de un alquiler (GET /equipos de a 50, el tope del back); solo si el rol tiene Máquinas. Con reintento y `recargar` que devuelve la lista nueva
    │   ├── useFiltrosAlquileres.js # Pestaña del listado de alquileres (Activos por defecto), filtros del Historial (estado y cliente) y página, guardados en la URL; cambiar de pestaña descarta filtros y página
    │   ├── useEquiposDisponibles.js # Cantidad de equipos activos y disponibles (total de GET /equipos?estado=disponible&activo=true), con carga, error y reintento. Exige el módulo Máquinas
    │   ├── useTextoDiferido.js # Campo de texto que se aplica cuando se deja de tipear (400 ms por defecto), con borrar al momento y puesta al día si cambia la URL
    │   ├── useCategorias.js    # Carga las categorías de equipo para filtros y formularios, con reintento
    │   ├── useFormularioChecklist.js # Carga el formulario de checklist por el token del QR: carga, QR no válido (404), sin conexión (con reintento solo al volver la red) y error; también lo vuelve a pedir sin pantalla de carga para actualizar las horas
    │   ├── useFormularioChecklistAlquiler.js # Carga el formulario de entrega o devolución de un equipo alquilado (ids y ?tipo= de la URL) ya adaptado para el asistente: carga, no encontrado (404 o URL inválida), conflicto (409, con el mensaje del back), sin conexión (con reintento al volver la red) y error
    │   ├── useChecklist.js     # Acceso al estado del asistente del checklist (equipo, opciones, paso, datos y acciones)
    │   ├── useAtrasDelFlujo.js # El botón Atrás del celular retrocede un paso del asistente en vez de salir de la página
    │   └── useRoles.js         # Carga roles y módulos juntos (filas y columnas de la matriz), con reintento, refresco y actualización de un rol
    │
    ├── layouts/                # Estructura común de cada módulo (navbar, sidebar, footer)
    │   ├── PublicLayout.jsx    # Portal público: header + footer
    │   ├── AdminLayout.jsx     # Panel de gestión (/admin): sidebar + topbar + contenido (siempre con sesión)
    │   ├── AlquileresLayout.jsx # Módulo Alquileres (/admin/alquileres), dentro del panel: pestañas Alquileres / Clientes arriba y la pantalla abajo (el checklist de entrega/devolución va sin pestañas)
    │   └── FieldLayout.jsx     # Módulo de campo (/campo y /c/:token) y checklist de entrega/devolución de un alquiler: sin navbar, footer ni panel, fondo sólido, siempre en modo claro, mobile-first
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
    │   │   ├── MachineChecklistPage.jsx # /admin/maquinas/:id/historial/checklists/:checklistId (requiere ver Máquinas): detalle de un checklist del historial con el equipo, "Checklist no encontrado" (404) y reintento; se puede recargar o compartir; "Volver al historial" restaura los filtros con los que se abrió; "Imprimir" abre el diálogo de impresión con el checklist completo y sus fotos (se puede guardar como PDF)
    │   │   ├── MachineFormPage.jsx # /admin/maquinas/nuevo y /admin/maquinas/:id/editar (requieren editar Máquinas): alta de equipo con aviso y paso al detalle del creado; edición precargada que envía solo los campos modificados (PATCH parcial), bloqueada para equipos dados de baja
    │   │   ├── RentalsPage.jsx   # /admin/alquileres (requiere ver Alquileres): tarjeta de equipos disponibles (solo con Máquinas) y pestañas Activos (pendientes y activos) / Por vencer (con contador; activos que vencen en 7 días o menos o ya vencidos, el más urgente primero) / Historial (todos, con filtros de estado y cliente), con la pestaña, los filtros y la página en la URL; paginado en el front (10 por página); estados de carga, vacío y error por pestaña; "Nuevo alquiler" solo con edición
    │   │   ├── RentalFormPage.jsx # /admin/alquileres/nuevo (requiere editar Alquileres): alta de un alquiler con AlquilerForm; le avisa si el rol tiene Máquinas (sin él no se pueden listar los equipos)
    │   │   ├── RentalDetailPage.jsx # /admin/alquileres/:id: detalle de un alquiler con AlquilerDetail; estados de carga, "Alquiler no encontrado" (con link al listado) y error con reintento. Con edición en Alquileres, en el encabezado: Prorrogar y Cambiar ubicación (pendiente o activo) y Anular (solo pendiente), cada una en su modal; al terminar avisa y refresca el detalle. Sin edición se ve todo, sin botones
    │   │   ├── RentalChecklistPage.jsx # /admin/alquileres/:id/equipos/:equipoId/checklist?tipo= (requiere editar Alquileres): entrega o devolución de un equipo a pantalla completa (sin el panel), con el asistente del QR: encabezado de solo lectura (equipo, cliente, ubicación y fechas), horas precargadas con las actuales (solo máquinas), ítems de la plantilla de máquina o aditamento, observaciones y foto, revisión y envío. No pide nombre y apellido (el back usa la sesión). Al enviar avisa y vuelve al detalle; un 409 al entrar o al enviar muestra el motivo con "Volver al alquiler"; también no encontrado y sin conexión con reintento
    │   │   ├── ClientsPage.jsx   # /admin/alquileres/clientes: clientes ordenados por razón social, con buscador por razón social (espera de 300 ms) y filtro de estado (Activos por defecto), ambos en la URL; estados de carga, error, sin clientes y sin resultados; toda la fila abre el detalle; con edición en Alquileres, "Nuevo cliente" y, por fila, Editar y Desactivar / Reactivar (con confirmación), con aviso de éxito y la lista recargada; no hay eliminar
    │   │   ├── ClientDetailPage.jsx # /admin/alquileres/clientes/:id: datos del cliente (activo o no) con la cantidad de alquileres; Editar y Desactivar / Reactivar con edición en Alquileres; estados de carga, no encontrado y error. Debajo, el historial de alquileres del cliente; cada uno abre su detalle
    │   │   ├── UsersPage.jsx     # /admin/configuracion/usuarios: ABM de usuarios (tabla, búsqueda, filtro por estado, alta, edición, baja y reactivación); solo lectura con Configuración en "Ver"
    │   │   └── RolesPage.jsx     # /admin/configuracion/roles: matriz de permisos roles × módulos, alta y edición de roles, activación y desactivación; solo lectura con Configuración en "Ver"
    │   ├── field/              # Módulo de campo (QR)
    │   │   ├── FieldHomePage.jsx # /campo: pantalla de bienvenida del módulo
    │   │   └── ChecklistPage.jsx # /c/:token: lo que abre el QR del equipo (pública, sin sesión): esqueleto de carga, QR no válido, sin conexión con "Reintentar" y el asistente del checklist (Diario o Mantenimiento)
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
    │   │   ├── EstadoActivoBadge.jsx # Estado Activo / Inactivo de un registro (usuarios, clientes): punto lleno o hueco y su texto
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
    │   │   ├── EstadoAlquilerBadge.jsx # Badge del estado de un alquiler (Pendiente, Activo, Finalizado, Anulado): ícono, texto y color fijo, igual en todas las pantallas
    │   │   ├── AlquileresTabs.jsx  # Pestañas del módulo Alquileres (Alquileres / Clientes): links con la activa según la ruta (Clientes en /clientes y su detalle; Alquileres en el resto)
    │   │   ├── ClientesToolbar.jsx # Buscador por razón social y filtro de estado (Activos / Todos) de la pantalla de clientes
    │   │   ├── ClientesTable.jsx   # Tabla de clientes desde lg (razón social, CUIT, contacto con el email, teléfono como enlace a WhatsApp, dirección y estado) y tarjetas por debajo; toda la fila abre el detalle; con edición, un menú ⋯ por fila. Incluye su versión de carga
    │   │   ├── ClienteFormModal.jsx # Alta (POST) y edición (PATCH, solo lo que cambió) de un cliente: razón social obligatoria, CUIT, teléfono, email (con formato) y dirección; el 409 de CUIT repetido se marca en el campo. Contacto, localidad y observaciones quedan fuera hasta que el back los acepte
    │   │   ├── ClienteActionsMenu.jsx # Menú ⋯ de una fila de clientes (en un portal): Editar y Desactivar / Reactivar
    │   │   ├── ClienteEstadoDialog.jsx # Confirmación para desactivar o reactivar un cliente (PATCH con `activo`): explica que no se borra
    │   │   ├── ClienteDetail.jsx   # Detalle de un cliente: encabezado con estado y cantidad de alquileres, acciones, aviso de inactivo y sus datos. Incluye su versión de carga
    │   │   ├── HistorialAlquileresCliente.jsx # Historial de alquileres de un cliente: tabla desde lg (N.º, estado, equipos por código interno, inicio y fin prevista) y tarjetas por debajo; toda la fila abre el detalle del alquiler; estados de carga, error con reintento y "todavía no tiene alquileres"
    │   │   ├── UbicacionInput.jsx  # Ubicación de un alquiler (alta y "cambiar ubicación"): un solo campo donde se pegan las coordenadas o un link largo de Google Maps (con botón Pegar si el navegador lo permite), con las coordenadas leídas y "Verificar en Maps"; ayuda para los links cortos (maps.app.goo.gl), que no traen coordenadas; referencia obligatoria. Entrega { latitud, longitud, ubicacion_referencia }
    │   │   ├── AvisoDadoDeBaja.jsx # Aviso de equipo dado de baja (se conserva por su historial), compartido por el detalle y el historial
    │   │   ├── HistorialHeader.jsx # Encabezado del historial: "M027 · Minicargadora Bobcat S530" (sin modelo en aditamentos), badge de estado y aviso de dado de baja; sin acciones. Incluye la versión de carga de toda la pantalla
    │   │   ├── SegmentedTabs.jsx   # Pestañas sobre vidrio (control segmentado) con el patrón de tabs de WAI-ARIA (flechas, Inicio y Fin) y contador opcional por pestaña; en celular, ícono arriba del texto para que entren tres a 360px
    │   │   ├── HistorialTabs.jsx   # Pestañas del historial de un equipo (Checklists, Alquileres, Mantenimiento) sobre SegmentedTabs
    │   │   ├── VencimientoTag.jsx  # Aviso de vencimiento de un alquiler ACTIVO ("Vence en 3 días" con reloj, "Vencido hace 2 días" en rojo con alerta); lo usan el listado y el detalle
    │   │   ├── AlquilerDetail.jsx  # Detalle de un alquiler: encabezado (N.º, estado, vencimiento y lugar para las acciones), motivo de anulación destacado si está anulado, datos (cliente con link a su detalle, fechas, ubicación con link a Google Maps, contacto en obra por WhatsApp, autor y fecha de alta, observaciones) y una tarjeta por equipo con el avance ("Entregados 2/3 · Devueltos 1/3"). Incluye su versión de carga
    │   │   ├── AlquilerEquipoCard.jsx # Tarjeta de un equipo del alquiler: código, categoría y marca, tipo y dos columnas, Entrega y Devolución (fecha, responsable y horas si es máquina), que se apilan en celular; "Completar entrega" / "Completar devolución" llevan a su checklist, solo con edición y el alquiler en curso, y la devolución recién después de la entrega
    │   │   ├── AlquilerAccionModal.jsx # Las tres acciones que modifican un alquiler: Prorrogar (fin actual y nueva fecha, no anterior al inicio; PATCH fecha_fin_prevista), Cambiar ubicación (UbicacionInput precargado y contacto en obra; PATCH) y Anular (advertencia de que no se deshace, equipos que se liberan y motivo obligatorio; POST /anular). No dejan guardar sin cambios; los 409 se muestran en el modal y refrescan el detalle detrás
    │   │   ├── AlquileresTable.jsx # Listado de alquileres: tabla desde xl (N.º, cliente, equipos resumidos "MC-01 +3", inicio, fin prevista con aviso de vencimiento, estado, entregados "2/4" y ubicación como enlace a Google Maps) y tarjetas por debajo; toda la fila abre el detalle salvo la ubicación. Incluye su versión de carga
    │   │   ├── AlquileresToolbar.jsx # Filtros del Historial de alquileres: estado y cliente (select con búsqueda), con "Limpiar filtros"
    │   │   ├── ClienteCombobox.jsx # Select con búsqueda de un cliente (combobox de WAI-ARIA): filtra por razón social sin importar tildes y marca los inactivos. Para filtrar: "Todos los clientes" y ✕ para quitar el filtro; en un formulario (`enFormulario`, `opcionTodos={null}`): estilo de campo dentro de un .glass, con su error
    │   │   ├── AlquilerForm.jsx    # Alta de un alquiler en bloques: cliente (activos, con "Nuevo cliente" que lo deja elegido), equipos, fechas, ubicación, contacto en obra y observaciones. Valida en el front, muestra un resumen para confirmar (cliente y equipos no se cambian después), hace el POST, pide el detalle y lleva a él; si un equipo dejó de estar disponible (409) recarga la lista, lo saca de la selección y lo nombra
    │   │   ├── EquiposSelector.jsx # Selección múltiple de equipos disponibles para un alquiler: buscador por código o categoría, grupos Máquinas y Aditamentos con casillas, chips de los elegidos para quitarlos, aviso de los que el back rechazó y mensaje si el rol no tiene Máquinas
    │   │   ├── EquiposDisponiblesCard.jsx # Tarjeta chica con la cantidad de equipos disponibles y enlace a Máquinas filtrado por "disponible"; carga y error con reintento
    │   │   ├── HistorialChecklists.jsx # Pestaña Checklists del historial: filtros, listado de a 20 (el más nuevo arriba), paginación y estados (cargando, sin checklists, sin resultados y error con reintento); "Exportar PDF" con todos los checklists filtrados, no solo la página
    │   │   ├── ChecklistsToolbar.jsx # Filtros de los checklists: buscador en las observaciones, responsable, tipo, rango de fechas (Desde/Hasta), "Limpiar filtros" y, al lado, las acciones sobre el listado (Exportar PDF)
    │   │   ├── HistorialChecklistsTable.jsx # Checklists de un equipo: tabla desde md (fecha, tipo, horas motor, responsable, anormales y fotos) y tarjetas en celular; toda la fila abre el detalle. Incluye su versión de carga
    │   │   ├── TipoChecklistBadge.jsx # Badge del tipo de checklist (ícono, texto y un tono por tipo)
    │   │   ├── ChecklistDetalle.jsx # Detalle de un checklist: cabecera (tipo, fecha y hora, horas motor, responsable y anormales), ítems ANORMAL primero y resaltados con su observación, observaciones generales, fotos y el resto de los ítems en un bloque colapsable; cada bloque solo si tiene contenido. Incluye su versión de carga
    │   │   ├── EstadoItemBadge.jsx # Estado de un ítem respondido en el panel (✓ Normal en verde, ✕ Anormal en rojo, — No aplica en gris)
    │   │   ├── GaleriaFotos.jsx    # Miniaturas de las fotos de un checklist pedidas achicadas a Cloudinary (w_300), que abren el visor
    │   │   ├── VisorFotos.jsx      # Visor de fotos a pantalla completa: flechas en pantalla y de teclado, deslizar en celular, Escape para cerrar, foco atrapado y precarga de la anterior y la siguiente
    │   │   ├── HojaImpresion.jsx   # Hoja para imprimir o guardar como PDF desde el navegador: portal en <body> invisible en pantalla, espera a que carguen las fotos, abre el diálogo con un título que sirve de nombre de archivo y se desmonta al cerrarlo. No sube nada al back
    │   │   ├── EncabezadoImpresion.jsx # Encabezado de las hojas impresas del historial: marca, fecha de emisión, título y equipo con su estado (y dado de baja)
    │   │   ├── InformeChecklists.jsx # Hoja del historial de checklists: filtros aplicados, cantidad y tabla con todos los checklists filtrados (horas motor solo en máquinas)
    │   │   ├── InformeChecklistDetalle.jsx # Hoja de un checklist (entrega o devolución para el cliente): datos, observaciones generales, todas las respuestas con las anormales resaltadas y las fotos, dos por fila
    │   │   ├── EquipoDetail.jsx    # Detalle de un equipo del panel: encabezado con "Ver historial", "Ver QR", "Editar" y el ⋯ de acciones, aviso de dado de baja, datos generales y datos de máquina, y su versión de carga
    │   │   ├── EquipoForm.jsx      # Formulario de equipo (alta y, precargado, edición): tipo máquina/aditamento, datos generales y de máquina, validaciones del DTO y errores del back (409 en el código interno, 400 arriba); en la edición, tipo fijo, sin horas de motor y sin vaciar la ubicación ni la descripción ya cargadas. Incluye su versión de carga
    │   │   └── Pagination.jsx      # Paginación de un listado: rango mostrado, total y botones de página (anterior/siguiente en celular)
    │   ├── field/              # Componentes del módulo de campo: sin vidrio, fondos sólidos, 16px mínimo y botones de 48px o más
    │   │   ├── FieldScreen.jsx     # Pantalla base: encabezado fijo arriba, contenido y acción principal fija abajo
    │   │   ├── FieldMessage.jsx    # Aviso de pantalla completa (QR no válido, sin conexión) sin salidas a otras partes del sistema
    │   │   ├── MainAction.jsx      # Botón principal de un paso: deshabilitado dice qué falta; incompleto se ve igual pero lleva a lo que falta; bloqueado mientras se envía
    │   │   ├── FieldDialog.jsx     # Pregunta que frena el flujo (dialog nativo, sale desde abajo): botones grandes uno debajo del otro
    │   │   ├── WizardHeader.jsx    # "Atrás", "Paso X de N" y barra de progreso; en el primer paso puede llevar una salida (en el alquiler, "Volver al alquiler")
    │   │   ├── ChecklistWizard.jsx # Asistente: un paso por pantalla (5 en máquinas, 4 en aditamentos), primero ofrece seguir el borrador y después de enviar muestra "Listo" (su Atrás lleva a un checklist nuevo, nunca al enviado). El primer paso lo arma quien lo monta (renderInicio): elegir la revisión en el QR o el encabezado del alquiler
    │   │   ├── DraftPrompt.jsx     # "Tenés un checklist sin terminar": seguir donde quedaste o empezar de nuevo
    │   │   ├── ChecklistDone.jsx   # "Listo": ✓ grande, resumen de lo que respondió el back (tipo, equipo, horas y anormales) y "Hacer otro checklist de este equipo"
    │   │   ├── EnvioAlert.jsx      # Por qué no salió el envío, arriba del paso al que llevó el error: "No se pudo enviar" sin conexión o el mensaje del back
    │   │   ├── ChecklistStart.jsx  # Paso 1 del QR: el equipo y un botón por cada opción que manda el back (Diario y Mantenimiento), y su versión de carga
    │   │   ├── AlquilerChecklistStart.jsx # Paso 1 de la entrega o devolución de un alquiler: qué se hace, el equipo y cliente, ubicación y fechas de solo lectura, con "Empezar la entrega" / "Empezar la devolución"; y el link "Volver al alquiler" (SalidaAlquiler)
    │   │   ├── EquipoSummary.jsx   # Encabezado del equipo: código interno, categoría y marca, y horas actuales si es máquina
    │   │   ├── ItemCard.jsx        # Un ítem del checklist: nombre y los tres estados (✓ Normal, ✕ Anormal, — No aplica); respondida cambia de fondo
    │   │   ├── FotoSlot.jsx        # Lugar de una foto: "Sacar foto" abre la cámara trasera, la comprime ("Procesando…") y muestra la miniatura con ✕ y "Sacar otra"; avisa "Volvé a sacar la foto" al retomar un borrador
    │   │   └── steps/              # Pasos del asistente: HorasStep (horas del horómetro: no menos que las actuales y confirmación si suben más de 200 hs); ItemsStep (lista de ítems con contador fijo, marcado en bloque de los pendientes y botón que lleva al primero que falta); CierreStep (observaciones con ayuda según el tipo, contador y aviso si hay ítems Anormales sin contar, foto del equipo y nombre y apellido obligatorios, salvo que el responsable sea el usuario de la sesión); RevisionStep (todo lo cargado de solo lectura con un "Editar" por bloque (el del tipo, solo si había para elegir), horas con la diferencia, conteo por estado con los Anormales por nombre, "Enviar" / "Enviando…" / "Reintentar"). Llegando desde la revisión, el botón de cada paso dice "Volver a la revisión"
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
    │   ├── historialService.js # Historial de un equipo (solo lectura): GET /equipos/:id/historial/checklists (paginado, con filtros de fecha, tipo, responsable y búsqueda en observaciones) y GET /equipos/:id/historial/checklists/:checklistId (detalle con respuestas y fotos); para el PDF, recorre todas las páginas de a 100 (el máximo del back)
    │   ├── clientesService.js  # Clientes (módulo Alquileres): GET /clientes (sin paginar, con búsqueda y filtro por activo), GET /clientes/:id (con la cantidad de alquileres), POST y PATCH /clientes (también activar/desactivar: no hay DELETE)
    │   ├── alquileresService.js # Alquileres: GET /alquileres (sin paginar; filtros por estado, cliente, equipo y por vencer), GET /alquileres/:id, POST y PATCH /alquileres (prórroga y ubicación), POST /alquileres/:id/anular, GET y POST del checklist de entrega/devolución de un equipo (multipart: `tipo`, `datos` JSON y `fotos`) y equipos disponibles para el alta (GET /equipos?estado=disponible: una página o todos, de a 50)
    │   └── checklistsService.js # GET /public/checklists/:token (sin sesión): equipo del QR y sus opciones de checklist con los ítems (por QR, solo Diario y Mantenimiento: la entrega y la devolución van por el alquiler); POST del checklist terminado (multipart: `datos` JSON y `fotos`; un 400, como el de un tipo que no va por QR, muestra el mensaje del back)
    │
    ├── types/                  # Tipos en JSDoc (el proyecto es JavaScript): VS Code los usa para autocompletar
    │   └── alquileres.js       # Cliente, Alquiler, AlquilerListado, AlquilerDetalle, AlquilerEquipo, EstadoAlquiler, filtros y bodies de alta y edición, formulario y datos del checklist, tal cual el back (snake_case)
    │
    └── utils/                  # Funciones auxiliares
        ├── text.js             # Normaliza texto para buscar sin importar mayúsculas ni tildes
        ├── equipos.js          # Datos de un equipo listos para mostrar, WhatsApp de cotización, categorías del listado, tipos, estados (etiqueta, ícono y color, y clave, por clave o etiqueta), nombre del equipo, el equipo en una línea (código · categoría marca modelo), formato de horas ("Sin registrar" si no hay carga), campos modificados de un equipo (body del PATCH) y mensajes de error del módulo máquinas
        ├── historial.js        # Pestañas del historial de un equipo (id de la URL, etiqueta, ícono y módulo pendiente) y lectura de la pestaña activa (?tab=), con Checklists por defecto; tipos de checklist (etiqueta, ícono y tono), checklist del listado y su detalle con los nombres del front, separación de los ítems ANORMAL del resto, URL de las fotos con la transformación de Cloudinary (miniatura, ampliada e impresión), formatos de fecha y horas, validación de las fechas de los filtros, filtros aplicados en palabras y nombre del archivo PDF
        ├── vendedores.js       # Nombre del cargo, iniciales y enlace de WhatsApp de un vendedor
        ├── usuarios.js         # Normalización de los módulos (del usuario y de cada rol), nombre del rol, nombre completo, último acceso y error genérico
        ├── roles.js            # Niveles de acceso de la matriz (Sin acceso, Ver, Editar) y armado de la lista completa de módulos de un rol
        ├── qr.js               # Link del QR de un equipo (/c/<qr_token>) y etiqueta en PNG para imprimir: QR, código interno y "Escaneá para hacer el checklist", cuadrada y en alta resolución
        ├── alquileres.js       # Estados de un alquiler (etiqueta, ícono y color), fechas de calendario como dd/mm/aaaa sin correrlas de día (formatFechaAlquiler), tipos de checklist de alquiler (Entrega, Devolución), link a Google Maps de una ubicación (linkMaps), aviso de vencimiento de un ACTIVO ("Vence en 3 días", "Vencido hace 2 días", con DIAS_POR_VENCER = 7 como el back), equipos resumidos ("MC-01 +3"), pestañas del listado; para el detalle, tipo de equipo (Máquina, Aditamento), qué checklist se puede completar en cada equipo (getAccionesEquipo: solo PENDIENTE o ACTIVO y con edición), entregados y devueltos, fecha y hora de un timestamp y nombre completo; para el checklist de entrega/devolución, tipo válido, clave del borrador, el formulario adaptado al asistente, el 409 en palabras del usuario y el aviso de éxito; y, para el alta, fecha de hoy como aaaa-mm-dd, duración en días, validación, códigos que nombra el 409 y búsqueda de equipos por código o categoría; para las acciones del detalle, cuáles corresponden según el estado y la edición (getAccionesAlquiler), fecha de calendario de un alquiler para un input date, validación de la prórroga, máximo del motivo de anulación y mensajes de error (los 409 en palabras del usuario)
        ├── ubicacion.js        # Coordenadas pegadas ("lat, lng", "lat lng" o link de Google Maps con ?q=, !3d…!4d… o @lat,lng) a números con 6 decimales y validados (-90 a 90, -180 a 180), links sin coordenadas, coordenadas del back como número aunque lleguen como texto (aCoordenada) y validación de la ubicación antes de enviar (validarUbicacion)
        ├── imagenes.js         # Compresión de una imagen en el navegador (lado mayor y JPEG con la calidad que entre en el peso buscado)
        └── checklists.js       # Formulario de checklist con los nombres del front, ícono por tipo, pasos según máquina o aditamento, validación de las horas del horómetro, estados de los ítems y marcado en bloque de los pendientes, ítems anormales y su aviso, ayuda de las observaciones según el tipo, validación del nombre y apellido, cantidad de fotos (MAX_FOTOS) y su compresión, borrador en localStorage (checklist:<clave>:<tipo>: el token del QR o alquiler:<id>:<equipoId>), responsable recordado (checklist:responsable), conteo por estado, cambio de horas ("2.140 → 2.148 hs (+8)"), datos del POST (el cuerpo común y el del QR, con tipo y responsable), respuesta del envío y a qué paso lleva cada error (400, 409, sin conexión)
```

## Convenciones

- **Services por recurso:** un archivo por entidad del back (`equiposService.js`, `alquileresService.js`, etc.), todos construidos sobre `apiFetch`. Ningún componente llama a `fetch` directamente.
- **Sesión:** `apiFetch` agrega el token a cada request; ante un 401 cierra la sesión y ante un 403 muestra un aviso sin cerrarla. Si la sesión termina estando en el panel, `<RutaPrivada>` lleva al login. Solo el login usa `auth: false`. Los módulos del usuario se leen siempre como `{ codigo, puedeEditar }`: el formato del back se adapta únicamente en `normalizarModulos()` (`utils/usuarios.js`).
- **Componentes por módulo:** si un componente lo usa un solo módulo, va en `components/public/`, `components/field/` o `components/admin/`. Los compartidos van en la raíz de `components/`.
- **Idioma:** nombres de archivos y código en inglés (`HomePage`, `FieldLayout`); textos visibles y rutas en español (`/campo`, `/admin`).
- **Secciones del panel:** para sumar una, se agrega su ítem en `RUTAS_PANEL` (`config/rutasPanel.js`) con su `modulo`, y su página en `paginasPanel` (`router/index.jsx`) con el mismo path. El sidebar, las tarjetas de Inicio y la protección por módulo se arman solos. Si la sección tiene varias pantallas bajo un mismo ítem del sidebar (como Alquileres), su página es el layout del módulo y sus pantallas van en `subrutasPanel`.
- **Permisos:** en una pantalla se leen con `usePermiso(codigo)`, que devuelve `{ puedeVer, puedeEditar }` (por debajo usa `tieneModulo` y `puedeEditar` de `useAuth()`), siempre con los códigos de `MODULOS` (en MAYÚSCULAS, como los manda el back), nunca escritos a mano. Cada módulo tiene dos niveles: ver (solo consulta) y editar (alta, edición y baja); sin edición, la pantalla se muestra de solo lectura. Es experiencia de usuario: la seguridad real la da el back (401/403).
- **Avisos:** para un mensaje no bloqueante se usa `showToast()` de `useToast()`, no un `alert()`. Los errores 401 y 403 ya los avisa `apiFetch`: para el resto, `getErrorGenerico()` (`utils/usuarios.js`); en el módulo máquinas, `getErrorEquipo()` (`utils/equipos.js`), que además traduce 400, 404 y 409.
- **Modales:** se usa `Modal` (`components/admin/Modal.jsx`), que se muestra mientras está montado. No se usa `<dialog>` nativo: su capa superior taparía los avisos.
- **Contenido institucional:** los textos de la home se leen de `data/empresa.js`; los componentes no tienen textos de la empresa escritos adentro. Si el contenido pasa a la API, solo cambia ese archivo.
- **Nuevos directorios:** se crean cuando una issue los necesita, no antes. Los previstos son:
  - `assets/`: imágenes y logos importados desde el código.
  - `public/`: favicon y archivos estáticos.
