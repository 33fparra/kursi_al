export type HistoriBlockSlug =
  | 'para-ilire'
  | 'iliret'
  | 'mesjeta'
  | 'skenderbeu'
  | 'pushtimi-otoman'
  | 'pavaresia'
  | 'komunizmi'
  | 'postkomunizmi';

export interface HistoriBlock {
  slug: HistoriBlockSlug;
  number: number;
  title: { sq: string; en: string };
  shortTitle: { sq: string; en: string };
  description: { sq: string; en: string };
}

export const HISTORI_BLOCKS: HistoriBlock[] = [
  {
    slug: 'para-ilire',
    number: 0,
    title: { sq: 'Bloku 0: Para Ilirëve', en: 'Block 0: Before the Illyrians' },
    shortTitle: { sq: 'Para Ilirëve', en: 'Before the Illyrians' },
    description: {
      sq: 'Rrënjët e lashta të Ballkanit, para se emri "Ilir" të shkruhej ndonjëherë.',
      en: 'The ancient roots of the Balkans, before the name "Illyrian" was ever written down.',
    },
  },
  {
    slug: 'iliret',
    number: 1,
    title: { sq: 'Bloku 1: Farkëtimi i Ilirëve', en: 'Block 1: The Forging of the Illyrians' },
    shortTitle: { sq: 'Ilirët', en: 'The Illyrians' },
    description: {
      sq: 'Lindja e fiseve ilire, mbretëritë e tyre dhe përplasja me Romën.',
      en: 'The birth of the Illyrian tribes, their kingdoms, and the collision with Rome.',
    },
  },
  {
    slug: 'mesjeta',
    number: 2,
    title: { sq: 'Bloku 2: Mesjeta dhe Uragani i Pushtimeve', en: 'Block 2: The Middle Ages and the Hurricane of Invasions' },
    shortTitle: { sq: 'Mesjeta', en: 'The Middle Ages' },
    description: {
      sq: 'Sllavët, Bizanti dhe principatat mesjetare shqiptare mes valëve të pushtuesve.',
      en: 'The Slavs, Byzantium, and the medieval Albanian principalities amid waves of invaders.',
    },
  },
  {
    slug: 'skenderbeu',
    number: 3,
    title: { sq: 'Bloku 3: Epopeja e Skënderbeut', en: 'Block 3: The Epic of Skanderbeg' },
    shortTitle: { sq: 'Skënderbeu', en: 'Skanderbeg' },
    description: {
      sq: 'Rezistenca shqiptare kundër Perandorisë Osmane dhe legjenda e Gjergj Kastriotit.',
      en: 'The Albanian resistance against the Ottoman Empire and the legend of Gjergj Kastrioti.',
    },
  },
  {
    slug: 'pushtimi-otoman',
    number: 4,
    title: { sq: 'Bloku 4: Pesë Shekujt nën Gjysmëhënë', en: 'Block 4: The Five Centuries Under the Crescent Moon' },
    shortTitle: { sq: 'Perandoria Osmane', en: 'The Ottoman Empire' },
    description: {
      sq: 'Jeta, ekonomia dhe shoqëria shqiptare gjatë pesë shekujve të sundimit osman.',
      en: 'Albanian life, economy and society under five centuries of Ottoman rule.',
    },
  },
  {
    slug: 'pavaresia',
    number: 5,
    title: { sq: 'Bloku 5: Rilindja dhe Kaosi i Pavarësisë', en: 'Block 5: The National Revival and the Chaos of Independence' },
    shortTitle: { sq: 'Pavarësia', en: 'Independence' },
    description: {
      sq: 'Rilindja Kombëtare, Pavarësia e vitit 1912 dhe vitet e trazuara që e ndoqën.',
      en: 'The National Revival, the 1912 declaration of independence, and the turbulent years that followed.',
    },
  },
  {
    slug: 'komunizmi',
    number: 6,
    title: { sq: 'Bloku 6: Eksperimenti i Izolimit Ekstrem', en: 'Block 6: The Experiment of Extreme Isolation' },
    shortTitle: { sq: 'Komunizmi', en: 'Communism' },
    description: {
      sq: 'Shqipëria komuniste e Enver Hoxhës dhe izolimi i saj nga pjesa tjetër e botës.',
      en: 'Communist Albania under Enver Hoxha and its isolation from the rest of the world.',
    },
  },
  {
    slug: 'postkomunizmi',
    number: 7,
    title: { sq: 'Bloku 7: Rrëzimi, 1997 dhe Shekulli XXI', en: 'Block 7: The Collapse, 1997 and the 21st Century' },
    shortTitle: { sq: 'Pas-Komunizmi', en: 'Post-Communism' },
    description: {
      sq: 'Rënia e komunizmit, kriza e skemave piramidale të 1997 dhe Shqipëria moderne.',
      en: 'The fall of communism, the 1997 pyramid scheme crisis, and modern Albania.',
    },
  },
];

export function getHistoriBlock(slug: string): HistoriBlock | undefined {
  return HISTORI_BLOCKS.find(b => b.slug === slug);
}
