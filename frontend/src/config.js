// Datos de contacto de la empresa (editar aquí)
export const EMPRESA = {
  nombre: 'JM Seguridad y Tecnología',
  whatsapp: '59161234567', // código de país + número, sin espacios ni "+"
  telefono: '+591 6 123 4567',
  direccion: 'Zona Entre Ríos, Tacuaral',
  cobertura: 'Atención en toda la comunidad',
  horario: 'Lunes a Sábado · 8:00 a 18:00',
  facebook: 'https://facebook.com/',
  instagram: 'https://instagram.com/',
};

export const waLink = (mensaje) =>
  `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(mensaje)}`;
