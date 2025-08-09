// Recommendation engine: maps evaluation to product suggestions with contraindications and care tips

// Catalog of products with tags and contraindications
export const PRODUCTS = [
  {
    id: 'silicone-gel',
    name: 'Apósito de Silicona con Gel',
    description: 'Minimiza dolor y trauma al retirar. Ideal para piel frágil.',
    tags: ['no-adherente', 'proteccion-piel', 'dolor-alto', 'exudado-bajo', 'exudado-moderado'],
    contraindications: ['exudado-alto'],
  },
  {
    id: 'hidrocoloide',
    name: 'Apósito Hidrocoloide',
    description: 'Mantiene ambiente húmedo, ideal para exudado bajo/moderado.',
    tags: ['exudado-bajo', 'exudado-moderado', 'borde-adherido'],
    contraindications: ['exudado-alto', 'infeccion-si'],
  },
  {
    id: 'alginato',
    name: 'Alginato de Calcio',
    description: 'Alta absorción y hemostático suave; útil en sangrado.',
    tags: ['exudado-alto', 'sangrado-alto', 'absorcion-alta'],
    contraindications: ['exudado-bajo'],
  },
  {
    id: 'espuma-super',
    name: 'Espuma Superabsorbente',
    description: 'Controla exudado abundante y reduce maceración.',
    tags: ['exudado-alto', 'maceracion-riesgo'],
    contraindications: [],
  },
  {
    id: 'carbon',
    name: 'Apósito de Carbón Activado',
    description: 'Disminuye el olor; puede combinarse con otros apósitos.',
    tags: ['olor-alto'],
    contraindications: [],
  },
  {
    id: 'hidrogel',
    name: 'Hidrogel',
    description: 'Hidrata tejido seco/esfacelo; favorece desbridamiento autolítico.',
    tags: ['tejido-seco', 'esfacelo', 'necrosis', 'exudado-bajo'],
    contraindications: ['exudado-alto'],
  },
  {
    id: 'plata',
    name: 'Apósito Antimicrobiano (Plata)',
    description: 'Control antimicrobiano en sospecha/presencia de infección.',
    tags: ['infeccion-riesgo', 'infeccion-si'],
    contraindications: [],
  },
  {
    id: 'malla-silicona',
    name: 'Malla No Adherente Siliconada',
    description: 'Capa de contacto que protege tejido y piel.',
    tags: ['no-adherente', 'proteccion-piel', 'maceracion-riesgo'],
    contraindications: [],
  },
];

export function mapEvaluationToTags(e) {
  const tags = new Set();
  // Exudate
  if (e.moisture === 'Bajo' || e.moisture === 'No Exudativa') tags.add('exudado-bajo');
  if (e.moisture === 'Moderado') tags.add('exudado-moderado');
  if (e.moisture === 'Alto' || e.moisture === 'Exudativa') tags.add('exudado-alto');
  // Pain / Odor / Bleeding
  if (Number(e.pain) >= 3) tags.add('dolor-alto');
  if (Number(e.odor) >= 3) tags.add('olor-alto');
  if (Number(e.bleeding) >= 2) tags.add('sangrado-alto');
  // Infection
  if (e.infection === 'Si') tags.add('infeccion-si');
  if (e.infection === 'Si' || Number(e.odor) >= 3) tags.add('infeccion-riesgo');
  // Tissue dryness
  if (e.tissue === 'Esfacelo' || e.tissue === 'Necrosis') tags.add('esfacelo');
  if (e.tissue === 'Necrosis') tags.add('necrosis');
  if (e.tissue === 'Epitelial') tags.add('tejido-seco');
  // Border
  if (e.edge === 'Integrados') tags.add('borde-adherido');
  // Maceration risk
  if (e.surrounding === 'Macerada' || e.moisture === 'Alto') tags.add('maceracion-riesgo');
  return tags;
}

export function buildRecommendations(evaluation) {
  const tags = mapEvaluationToTags(evaluation);
  const list = PRODUCTS.map((p) => {
    const contra = p.contraindications.find((c) => tags.has(c));
    const enabled = !contra;
    // Simple reason: first matching tag
    const reason = p.tags.find((t) => tags.has(t));
    return { ...p, enabled, reason: reason || null, contraindication: contra || null };
  });

  // Care tips (Crusting technique)
  const careTips = [];
  if (tags.has('maceracion-riesgo')) {
    careTips.push({
      id: 'crusting',
      title: 'Técnica de Crusting (protección perilesional)',
      content: [
        'Seca suavemente la piel perilesional.',
        'Aplica una capa fina de barrera (film/benzoinado).',
        'Espolvorea polímero/estoma powder (polvo barrera).',
        'Repite 2–3 capas alternando (film + polvo) hasta formar una “costra” protectora.',
        'Coloca el apósito absorbente evitando fugas.',
      ],
    });
  }

  return { tags, products: list, careTips };
}
