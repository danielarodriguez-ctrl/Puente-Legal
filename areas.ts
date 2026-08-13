// Las categorías están escritas en el lenguaje de la persona afectada,
// no en el del abogado. El nombre jurídico va debajo, como referencia,
// y es el que ve el abogado en su correo.

export type Area = {
  id: string;
  titulo: string; // lo que lee la persona
  nombreJuridico: string; // lo que entiende el abogado
  ejemplos: string; // pistas concretas para que la persona sepa si es su caso
  icono: string;
};

export const AREAS: Area[] = [
  {
    id: "vivienda",
    titulo: "Mi casa se dañó, se cayó o no puedo volver a ella",
    nombreJuridico: "Vivienda, arrendamiento y propiedad",
    ejemplos:
      "La casa quedó inhabitable, el arrendador me cobra igual, el edificio no deja entrar, problemas con la administración o con el dueño.",
    icono: "🏚️",
  },
  {
    id: "seguros",
    titulo: "Tengo un seguro y no me quieren responder",
    nombreJuridico: "Seguros e indemnizaciones",
    ejemplos:
      "La aseguradora niega la reclamación, no sé si mi póliza cubre el terremoto, me piden papeles que no tengo.",
    icono: "📄",
  },
  {
    id: "ayudas_estado",
    titulo: "No me han dado las ayudas del Estado",
    nombreJuridico: "Ayudas humanitarias, derecho de petición y tutela",
    ejemplos:
      "No aparezco en el censo de damnificados, me negaron el subsidio, necesito poner una tutela o un derecho de petición.",
    icono: "🏛️",
  },
  {
    id: "documentos",
    titulo: "Perdí mis documentos o mis papeles",
    nombreJuridico: "Registro civil, identificación y notariado",
    ejemplos:
      "Se perdió la cédula, el registro civil, las escrituras de la casa o los papeles del carro.",
    icono: "🪪",
  },
  {
    id: "fallecimiento",
    titulo: "Falleció un familiar y hay trámites por hacer",
    nombreJuridico: "Sucesiones y trámites por fallecimiento",
    ejemplos:
      "Registro de defunción, herencia, qué pasa con la casa o la pensión de quien falleció.",
    icono: "🕯️",
  },
  {
    id: "desaparicion",
    titulo: "Tengo un familiar desaparecido",
    nombreJuridico: "Desaparición de personas y denuncias penales",
    ejemplos:
      "No sé dónde está mi familiar, necesito ayuda para denunciar o para buscarlo en hospitales y albergues.",
    icono: "🔎",
  },
  {
    id: "salud",
    titulo: "Problemas con la EPS, la atención médica o la pensión",
    nombreJuridico: "Salud y seguridad social",
    ejemplos:
      "La EPS no autoriza el tratamiento, no me dan la incapacidad, dudas con la pensión o con la ARL.",
    icono: "🏥",
  },
  {
    id: "laboral",
    titulo: "Problemas con mi trabajo o mi salario",
    nombreJuridico: "Derecho laboral",
    ejemplos:
      "Me despidieron, la empresa cerró, no me han pagado, me accidenté trabajando, no puedo llegar al trabajo.",
    icono: "💼",
  },
  {
    id: "deudas",
    titulo: "Deudas, créditos o la hipoteca de la casa",
    nombreJuridico: "Obligaciones, insolvencia y derecho financiero",
    ejemplos:
      "Sigo pagando un crédito de una casa que ya no existe, el banco me está cobrando, quiero refinanciar.",
    icono: "🏦",
  },
  {
    id: "familia",
    titulo: "Niños, custodia, alimentos o familia",
    nombreJuridico: "Derecho de familia y protección de menores",
    ejemplos:
      "Quedé a cargo de un menor, problemas de custodia, cuota de alimentos, un niño quedó sin acudiente.",
    icono: "👨‍👩‍👧",
  },
  {
    id: "otro",
    titulo: "No sé en qué categoría entra mi caso",
    nombreJuridico: "Orientación general",
    ejemplos:
      "Si ninguna de las anteriores describe tu situación, cuéntanos qué pasó y te orientamos.",
    icono: "💬",
  },
];

export const AREAS_POR_ID: Record<string, Area> = Object.fromEntries(
  AREAS.map((a) => [a.id, a])
);

// Departamentos con reporte de afectación primero, resto en orden alfabético.
export const DEPARTAMENTOS_AFECTADOS = [
  "Valle del Cauca",
  "Risaralda",
  "Caldas",
  "Quindío",
  "Antioquia",
  "Tolima",
  "Cundinamarca",
  "Bogotá D.C.",
];

export const OTROS_DEPARTAMENTOS = [
  "Amazonas",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Vaupés",
  "Vichada",
];

export const CANALES = [
  { id: "llamada", label: "Llamada telefónica" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "correo", label: "Correo electrónico" },
];

export const URGENCIAS = [
  {
    id: "alta",
    label: "Es urgente",
    detalle: "Hay un riesgo hoy: desalojo, un menor sin protección, un plazo que se vence.",
  },
  {
    id: "media",
    label: "Importante, pero puedo esperar unos días",
    detalle: "Necesito resolverlo pronto, pero no hay un plazo inmediato.",
  },
  {
    id: "baja",
    label: "Es una consulta, quiero saber qué puedo hacer",
    detalle: "Quiero entender mis opciones antes de decidir algo.",
  },
];
