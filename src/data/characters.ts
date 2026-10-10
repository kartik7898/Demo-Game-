import { CharacterDef, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  bravestone: {
    id: 'bravestone',
    name: 'Dr. Smolder Bravestone',
    realName: 'Spencer Gilpin',
    actorRole: 'Archeologist & Explorer',
    tagline: 'Fearless hero with superhuman strength and an irresistible smolder.',
    strengths: ['Fearless', 'Boomerang Throwing', 'Speed', 'Super Strength'],
    weakness: 'None',
    baseHp: 130,
    speed: 5.6,
    jumpPower: 12.8,
    attackPower: 32,
    specialAbility: {
      name: 'Smoldering Slam',
      description: 'Unleashes an earth-shattering shockwave that flings back all nearby hostiles.',
      cooldownMs: 6000,
    },
    stats: {
      strength: 98,
      speed: 92,
      agility: 85,
      archaeology: 70,
    },
    spritePalette: {
      skin: '#e0ac69',
      hair: '#382212',
      shirt: '#c2b280', // Safari khaki
      pants: '#4a3f35', // Dark cargo pants
      accent: '#964B00',
    },
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby Roundhouse',
    realName: 'Martha Kaply',
    actorRole: 'Killer of Men',
    tagline: 'Master martial artist delivering rhythmic dance-fighting fury.',
    strengths: ['Karate', 'Dance Fighting', 'Nunchucks', 'High Agility'],
    weakness: 'Venom (Takes +70% damage from animal bites/stings)',
    baseHp: 105,
    speed: 5.3,
    jumpPower: 14.5,
    attackPower: 28,
    specialAbility: {
      name: 'Dance Fighting',
      description: 'Spins in an acrobatic martial arts dance, deflecting incoming projectiles and striking 360° around her.',
      cooldownMs: 5000,
    },
    stats: {
      strength: 82,
      speed: 90,
      agility: 99,
      archaeology: 50,
    },
    spritePalette: {
      skin: '#f5c6a5',
      hair: '#8d1e1e', // Red hair
      shirt: '#991b1b', // Red midriff vest
      pants: '#3f3f46', // Combat shorts
      accent: '#fbbf24',
    },
  },
  shelly: {
    id: 'shelly',
    name: 'Prof. Shelly Oberon',
    realName: 'Bethany Walker',
    actorRole: 'Curvy Genius Cartographer',
    tagline: 'Brilliant scholar who deciphers ancient maps, runes, and hidden ruins.',
    strengths: ['Cartography', 'Archaeology', 'Paleontology', 'Trap Detection'],
    weakness: 'Low Stamina, Heat/Sun Exposure',
    baseHp: 95,
    speed: 4.4,
    jumpPower: 11.2,
    attackPower: 22,
    specialAbility: {
      name: 'Map Decipher',
      description: 'Activates ancient glyph sonar, revealing secret pathways, trap locations, and solving puzzle glyphs instantly.',
      cooldownMs: 7000,
    },
    stats: {
      strength: 55,
      speed: 58,
      agility: 60,
      archaeology: 100,
    },
    spritePalette: {
      skin: '#f2cbb2',
      hair: '#64748b', // Grey scholar hair & pith helmet
      shirt: '#e2e8f0', // White field shirt with suspenders
      pants: '#78716c', // Tan trousers
      accent: '#f59e0b',
    },
  },
  mouse: {
    id: 'mouse',
    name: 'Franklin "Mouse" Finbar',
    realName: 'Anthony "Fridge" Johnson',
    actorRole: 'Weapons Valet & Zoologist',
    tagline: 'Weapons specialist with encyclopedic animal knowledge (just keep him away from cake).',
    strengths: ['Weapons Valet', 'Zoology Expertise', 'Explosive Ordinance'],
    weakness: 'Cake (Instantly explodes on contact!), Slow Running Speed',
    baseHp: 110,
    speed: 4.1,
    jumpPower: 11.0,
    attackPower: 34,
    specialAbility: {
      name: 'Valet Ordinance',
      description: 'Tosses high-yield backpack explosive grenades that detonate on impact.',
      cooldownMs: 5500,
    },
    stats: {
      strength: 78,
      speed: 52,
      agility: 64,
      archaeology: 88,
    },
    spritePalette: {
      skin: '#8d5524',
      hair: '#1c1917', // Red beret
      shirt: '#15803d', // Scout vest
      pants: '#a16207', // Tan shorts
      accent: '#dc2626',
    },
  },
};
