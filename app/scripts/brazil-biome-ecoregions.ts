/**
 * Curated groups of RESOLVE Ecoregions 2017 (by exact ECO_NAME) approximating IBGE's six Brazilian biomes.
 *
 * An ecoregion is listed when a meaningful part of it lies inside that IBGE biome in Brazil; its extent
 * across the border comes along (e.g. Uruguayan savanna also covers Uruguay). Ecoregions with no real
 * Brazilian extent stay unlisted and resolve to "unsupported". Where an ecoregion straddles two IBGE
 * biomes it goes to the one most of its Brazilian cities fall in (noted inline).
 */
export const BRAZIL_BIOME_ECOREGIONS = {
  amazon: [
    'Madeira-Tapajós moist forests',
    'Southwest Amazon moist forests',
    'Uatumã-Trombetas moist forests',
    'Mato Grosso tropical dry forests', // Amazon–Cerrado transition; northern Mato Grosso is IBGE Amazônia
    'Guianan lowland moist forests',
    'Tapajós-Xingu moist forests',
    'Japurá-Solimões-Negro moist forests',
    'Xingu-Tocantins-Araguaia moist forests',
    'Juruá-Purus moist forests',
    'Negro-Branco moist forests',
    'Tocantins/Pindare moist forests',
    'Purus-Madeira moist forests',
    'Purus várzea',
    'Solimões-Japurá moist forests',
    'Marajó várzea',
    'Guianan Highlands moist forests',
    'Guianan savanna', // Roraima and Amapá savannas (lavrado), inside IBGE Amazônia
    'Rio Negro campinarana',
    'Monte Alegre várzea',
    'Iquitos várzea',
    'Pantepui forests & shrublands',
    'Gurupa várzea',
    'Amazon-Orinoco-Southern Caribbean mangroves',
  ],
  'atlantic-forest': [
    'Alto Paraná Atlantic forests',
    'Araucaria moist forests',
    'Serra do Mar coastal forests',
    'Bahia interior forests',
    'Bahia coastal forests',
    'Pernambuco interior forests',
    'Pernambuco coastal forests',
    'Atlantic Coast restingas',
    'Southern Atlantic Brazilian mangroves',
    'Fernando de Noronha-Atol das Rocas moist forests',
    'Trindade-Martin Vaz Islands tropical forests',
  ],
  caatinga: [
    'Caatinga',
    'Brazilian Atlantic dry forests', // São Francisco valley dry forests, mostly IBGE Caatinga
    'Caatinga Enclaves moist forests', // humid "brejos" inside the Caatinga
    'Northeast Brazil restingas', // Ceará and Piauí coast
  ],
  cerrado: [
    'Cerrado',
    'Maranhão Babaçu forests', // Cerrado–Amazon transition; Teresina and central Maranhão are IBGE Cerrado
    'Campos Rupestres montane savanna',
  ],
  pantanal: [
    'Pantanal',
    'Chiquitano dry forests', // its Brazilian extent (Corumbá, Cáceres) borders the Pantanal floodplain
  ],
  pampa: ['Uruguayan savanna'],
} as const
