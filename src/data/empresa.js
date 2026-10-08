/*
 * Contenido institucional del portal público.
 * Es la única fuente de estos textos: si más adelante vienen de la API, solo se cambia este archivo.
 */

export const presentacion = {
  titulo: 'Venta y alquiler de maquinaria vial en Neuquén y Patagonia',
  // Fragmento del título que se resalta con el color de acento
  tituloDestacado: 'maquinaria vial',
  bajada:
    'Alquiler y venta de minicargadoras, palas cargadoras, excavadoras y aditamentos. Servicio técnico especializado, repuestos y atención personalizada en toda la región.',
}

export const servicios = {
  titulo: 'Venta, alquiler y servicios para la construcción',
  parrafos: [
    'Brindamos soluciones integrales para la construcción y el movimiento de suelos, combinando la venta, alquiler y servicio de maquinaria y equipos para obras de todas las dimensiones.',
    'Disponemos de una amplia flota de maquinaria moderna y confiable, junto con equipos y aditamentos disponibles tanto para alquiler como para venta, permitiendo a nuestros clientes elegir la opción más conveniente para su proyecto.',
    'Además, ofrecemos servicios como movimiento de suelos, limpieza de terrenos, fletes y provisión de materiales, brindando una respuesta rápida y profesional.',
    'Trabajamos con responsabilidad, puntualidad y atención personalizada, construyendo relaciones de confianza a largo plazo. Nuestro objetivo es ser un aliado estratégico que aporte soluciones concretas, optimizando tiempos, costos y resultados.',
  ],
  // `icono` es una clave que el componente traduce a un ícono
  tarjetas: [
    {
      icono: 'venta',
      titulo: 'Venta de maquinaria',
      descripcion: 'Maquinaria moderna y confiable, con la opción más conveniente para tu proyecto.',
    },
    {
      icono: 'alquiler',
      titulo: 'Alquiler de maquinaria y aditamentos',
      descripcion: 'Una amplia flota de equipos y aditamentos para obras de todas las dimensiones.',
    },
    {
      icono: 'movimientoSuelos',
      titulo: 'Movimiento de suelos',
      descripcion: 'Soluciones integrales para la construcción, con respuesta rápida y profesional.',
    },
    {
      icono: 'limpiezaTerrenos',
      titulo: 'Limpieza de terrenos',
      descripcion: 'Terrenos en condiciones para tu obra, con respuesta rápida y profesional.',
    },
    {
      icono: 'fletes',
      titulo: 'Fletes',
      descripcion: 'Traslados con responsabilidad y puntualidad, optimizando tiempos y costos.',
    },
    {
      icono: 'materiales',
      titulo: 'Provisión de materiales',
      descripcion: 'Los materiales que tu obra necesita, con atención personalizada.',
    },
  ],
}

export const ubicacion = {
  direccion: 'JJ Lastra 4220',
  localidad: 'Neuquén Capital',
  codigoPostal: '8300',
  // Texto que se le pasa a Google Maps para ubicar el punto
  consultaMapa: 'JJ Lastra 4220, Neuquén Capital, Neuquén, Argentina',
}

/*
 * Los números se contactan por WhatsApp.
 * `whatsapp` va en formato internacional sin signos: 54 (Argentina) + 9 (celular) + característica + número.
 */
export const contacto = [
  {
    icono: 'cotizaciones',
    area: 'Cotizaciones',
    telefonos: [
      { numero: '(299) 627-5227', whatsapp: '5492996275227' },
      { numero: '(299) 588-1040', whatsapp: '5492995881040' },
    ],
  },
  {
    icono: 'logistica',
    area: 'Logística y servicio técnico',
    telefonos: [{ numero: '(299) 621-9355', whatsapp: '5492996219355' }],
  },
  {
    icono: 'ventas',
    area: 'Ventas y repuestos',
    telefonos: [{ numero: '(299) 586-4236', whatsapp: '5492995864236' }],
  },
]
