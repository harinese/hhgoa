import heic2any from 'heic2any';

export interface BuilderPersona {
  title: string;
  beachBag: string[];
  shippingGoal: string;
  builderClass: string;
}

const BUILDER_CLASSES = [
  'TERMINAL WIZARD',
  'PROMPT ALCHEMIST',
  'KERNEL SURFER',
  'BYTE SLINGER',
  'ZERO-KNOWLEDGE PIRATE',
  'FULL-STACK NOMAD',
  'SHARDING PROPHET',
  'RUST MAVERICK',
  'DEEP-LEARNING NINJA',
  'GIGACHAD SHIPPER'
];

const BEACH_BAG_ITEMS = [
  ['COCONUT', 'VS CODE', 'LO-FI BEATS'],
  ['RED BULL', 'AIRPODS MAX', 'CYBER SUNGLASSES'],
  ['SOLANA WATER', 'NEOVIM', 'MATCHA LATTE'],
  ['SUNSCREEN', 'GITHUB COPILOT', 'HAMMOCK'],
  ['ESPRESSO', 'CURSOR IDE', 'BEACH TOWEL'],
  ['TROPICAL JUICE', 'LLAMA 3.3', 'SURFBOARD']
];

const SHIPPING_GOALS = [
  'BUILDING THE FUTURE',
  'SHIPPING BEFORE SUNSET',
  'DISRUPTING SILICON BEACH',
  'DECENTRALIZING PARADISE',
  'SCALING TO 1M USERS',
  'HACKING THE MATRIX'
];

export const getRandomPersona = (): BuilderPersona => {
  const randomClass = BUILDER_CLASSES[Math.floor(Math.random() * BUILDER_CLASSES.length)];
  const randomBag = BEACH_BAG_ITEMS[Math.floor(Math.random() * BEACH_BAG_ITEMS.length)];
  const randomGoal = SHIPPING_GOALS[Math.floor(Math.random() * SHIPPING_GOALS.length)];

  return {
    title: randomClass,
    beachBag: randomBag,
    shippingGoal: randomGoal,
    builderClass: randomClass,
  };
};

export const convertHeicIfNeeded = async (file: File): Promise<Blob | File> => {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic') {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });
      return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    } catch (e) {
      console.warn('HEIC conversion failed, falling back to original file', e);
      return file;
    }
  }
  return file;
};
