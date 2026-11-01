// src/data/lookups.ts

export const DOMINICA_SUPPLIERS = [
  {
    id: 'agri_sales',
    name: 'Agri Sales & Services Co. Ltd',
    location: '21 Kennedy Avenue, Roseau',
    phone: '(767) 448-2748',
    tags: ['pepper', 'tomato', 'cabbage', 'bean', 'onion'],
    stock: 'Standard Tropical Seed Tins (Tropicana Lettuce, Calypso Tomatoes, California Wonder Peppers, Kifaru Cabbage)'
  },
  {
    id: 'jacos',
    name: "Jaco's Feeds and Fertilizers",
    location: 'Rockaway Highway, Canefield',
    phone: '(767) 265-3301',
    tags: ['potato'],
    stock: 'CARDI Evaluated Desiree Seed Tubers & Organic Soil Conditioners'
  },
  {
    id: 'agri_nursery',
    name: 'Division of Agriculture Nursery Depot',
    location: 'Botanical Gardens, Bath Road, Roseau',
    phone: null,
    tags: ['banana', 'plantain', 'dasheen'],
    stock: 'Hardened Tissue-Culture Plantain/Banana Suckers & High-Yield Root Crop Slips'
  }
];

export const COMPANION_MATRIX = [
  { match: ['pepper'], companions: 'Basil, Onions, Garlic, Marigolds, Spinach' },
  { match: ['tomato'], companions: 'Basil, Marigolds, Carrots, Chives, Mint' },
  { match: ['lettuce'], companions: 'Radishes, Carrots, Chives, Cucumbers, Tomatoes' },
  { match: ['onion'], companions: 'Bell Peppers, Tomatoes, Lettuce, Cabbage, Carrots' },
  { match: ['banana', 'plantain'], companions: 'Dasheen, Tannia, Pigeon Peas, Ginger, Cocoa' },
  { match: ['potato'], companions: 'Beans, Sweet Corn, Garlic, Scallions, Marigolds' },
  { match: ['bean'], companions: 'Sweet Corn, Cucumbers, Carrots, Radishes' },
  { match: ['cabbage'], companions: 'Onions, Mint, Rosemary, Thyme, Tomatoes' }
];

export const getCompanionsForCrop = (cropName: string) => {
  const lower = cropName.toLowerCase();
  const found = COMPANION_MATRIX.find(item => item.match.some(m => lower.includes(m)));
  return found ? found.companions : 'No custom companions registered';
};

export const getSuppliersForCrop = (cropName: string) => {
  const lower = cropName.toLowerCase();
  const matches = DOMINICA_SUPPLIERS.filter(sup => sup.tags.some(t => lower.includes(t)));
  return matches.length > 0 ? matches : [{
     name: 'Division of Agriculture main office',
     location: 'Botanical Gardens, Roseau',
     phone: null,
     stock: 'Check seedling availability directly at the main office.'
  }];
};