export const GAME_CONFIG = {
  maxFish: 100,
  breedingDistance: 50, // pixels
  breedingCooldown: 300000, // 5 minutes in milliseconds
  hungerRate: 0.1, // % per second
  maxHunger: 100,
  minHungerToBreed: 70, // Fish need to be well fed to breed

  // Rarity tiers and their spawn chances
  rarityTiers: {
    common: { chance: 100, multiplier: 1 },
    uncommon: { chance: 60, multiplier: 1.5 },
    rare: { chance: 30, multiplier: 2.5 },
    epic: { chance: 15, multiplier: 4 },
    legendary: { chance: 5, multiplier: 8 }
  },

  decorations: [
    {
      name: 'small_plant',
      displayName: 'Small Plant',
      price: 100,
      bonuses: {
        growth: 0.05 // 5% faster growth for nearby fish
      },
      width: 60,
      height: 100,
      category: 'plants'
    },
    {
      name: 'large_plant',
      displayName: 'Large Plant',
      price: 250,
      bonuses: {
        growth: 0.1 // 10% faster growth for nearby fish
      },
      width: 100,
      height: 160,
      category: 'plants'
    },
    {
      name: 'rock_cave',
      displayName: 'Rock Cave',
      price: 300,
      bonuses: {
        breeding: 0.2 // 20% faster breeding for fish inside
      },
      width: 60,
      height: 40,
      category: 'rocks'
    },
    {
      name: 'castle',
      displayName: 'Castle',
      price: 500,
      bonuses: {
        growth: 0.1,
        breeding: 0.1,
        value: 0.05 // 5% more value for nearby fish
      },
      width: 80,
      height: 100,
      category: 'buildings'
    },
    {
      name: 'treasure_chest',
      displayName: 'Treasure Chest',
      price: 400,
      bonuses: {
        value: 0.15 // 15% more value for nearby fish
      },
      width: 40,
      height: 30,
      category: 'decorative'
    }
  ],
  foodTypes: [
    {
      name: 'basic_pellet',
      displayName: 'Basic Pellets',
      price: 50,
      hungerRestored: 30,
      description: 'Simple fish food that restores hunger'
    },
    {
      name: 'premium_pellet',
      displayName: 'Premium Pellets',
      price: 100,
      hungerRestored: 50,
      growthBonus: 0.2,
      description: 'Higher quality food that boosts growth'
    },
    {
      name: 'golden_pellet',
      displayName: 'Golden Pellets',
      price: 200,
      hungerRestored: 100,
      growthBonus: 0.5,
      valueBonus: 0.1,
      description: 'Luxury food that maximizes growth and value'
    },
    {
      name: 'breeding_pellet',
      displayName: 'Love Pellets',
      price: 300,
      hungerRestored: 70,
      breedingBonus: 0.3,
      description: 'Special food that increases breeding chances'
    },
    {
      name: 'rainbow_pellet',
      displayName: 'Rainbow Pellets',
      price: 400,
      hungerRestored: 80,
      growthBonus: 0.3,
      valueBonus: 0.2,
      breedingBonus: 0.1,
      description: 'Magical food with all-around benefits'
    },
    {
      name: 'crystal_pellet',
      displayName: 'Crystal Pellets',
      price: 500,
      hungerRestored: 100,
      growthBonus: 0.6,
      valueBonus: 0.3,
      description: 'Crystallized essence that maximizes fish potential'
    }
  ],
  fishTypes: [
    // Common Fish (100-300 base price)
    {
      name: 'goldfish',
      displayName: 'Goldfish',
      basePrice: 100,
      fullGrownPrice: 150,
      growthTime: 180000,
      width: 41,
      height: 19,
      rarity: 'common',
      canBreed: true,
      compatibleWith: ['goldfish', 'clownfish'],
      offspringTypes: {
        'goldfish': 'golden_neon',
        'clownfish': 'royal_clown'
      }
    },
    {
      name: 'anchovy',
      displayName: 'Anchovy',
      basePrice: 120,
      fullGrownPrice: 180,
      growthTime: 180000,
      width: 40,
      height: 20,
      rarity: 'common',
      canBreed: true,
      compatibleWith: ['european_anchovy', 'sardine'],
      offspringTypes: {
        'european_anchovy': 'anchovy',
        'sardine': 'european_anchovy'
      }
    },
    {
      name: 'european_anchovy',
      displayName: 'European Anchovy',
      basePrice: 140,
      fullGrownPrice: 210,
      growthTime: 180000,
      width: 40,
      height: 20,
      rarity: 'common',
      canBreed: true,
      compatibleWith: ['anchovy', 'sardine'],
      offspringTypes: {
        'anchovy': 'european_anchovy',
        'sardine': 'anchovy'
      }
    },
    {
      name: 'sardine',
      displayName: 'Sardine',
      basePrice: 160,
      fullGrownPrice: 240,
      growthTime: 200000,
      width: 45,
      height: 20,
      rarity: 'common',
      canBreed: true,
      compatibleWith: ['anchovy', 'european_anchovy'],
      offspringTypes: {
        'anchovy': 'european_anchovy',
        'european_anchovy': 'anchovy'
      }
    },
    {
      name: 'yellow_perch',
      displayName: 'Yellow Perch',
      basePrice: 200,
      fullGrownPrice: 300,
      growthTime: 240000,
      width: 50,
      height: 25,
      rarity: 'common',
      canBreed: true,
      compatibleWith: ['bluegill'],
      offspringTypes: {
        'bluegill': 'yellow_perch'
      }
    },

    // Uncommon Fish (300-600 base price)
    {
      name: 'clownfish',
      displayName: 'Clownfish',
      basePrice: 300,
      fullGrownPrice: 450,
      growthTime: 300000,
      width: 41,
      height: 19,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['goldfish', 'neonfish'],
      offspringTypes: {
        'goldfish': 'royal_clown',
        'neonfish': 'rainbow_neon'
      }
    },
    {
      name: 'neonfish',
      displayName: 'Neon Tetra',
      basePrice: 350,
      fullGrownPrice: 525,
      growthTime: 320000,
      width: 45,
      height: 19,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['clownfish'],
      offspringTypes: {
        'clownfish': 'rainbow_neon'
      }
    },
    {
      name: 'bluegill',
      displayName: 'Bluegill',
      basePrice: 400,
      fullGrownPrice: 600,
      growthTime: 300000,
      width: 50,
      height: 25,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['yellow_perch', 'smallmouth_bass'],
      offspringTypes: {
        'yellow_perch': 'bluegill',
        'smallmouth_bass': 'largemouth_bass'
      }
    },
    {
      name: 'atlantic_mackerel',
      displayName: 'Atlantic Mackerel',
      basePrice: 450,
      fullGrownPrice: 675,
      growthTime: 360000,
      width: 55,
      height: 25,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['bluefish'],
      offspringTypes: {
        'bluefish': 'marlin'
      }
    },
    {
      name: 'bluefish',
      displayName: 'Bluefish',
      basePrice: 500,
      fullGrownPrice: 750,
      growthTime: 400000,
      width: 55,
      height: 25,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['atlantic_mackerel'],
      offspringTypes: {
        'atlantic_mackerel': 'marlin'
      }
    },
    {
      name: 'smallmouth_bass',
      displayName: 'Smallmouth Bass',
      basePrice: 550,
      fullGrownPrice: 825,
      growthTime: 450000,
      width: 60,
      height: 30,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['bluegill', 'bass'],
      offspringTypes: {
        'bluegill': 'bass',
        'bass': 'giant_bass'
      }
    },

    // Rare Fish (600-1200 base price)
    {
      name: 'largemouth_bass',
      displayName: 'Largemouth Bass',
      basePrice: 600,
      fullGrownPrice: 900,
      growthTime: 480000,
      width: 52,
      height: 20,
      rarity: 'rare',
      canBreed: true,
      compatibleWith: ['smallmouth_bass'],
      offspringTypes: {
        'smallmouth_bass': 'giant_bass'
      }
    },
    {
      name: 'starfish',
      displayName: 'Starfish',
      basePrice: 700,
      fullGrownPrice: 1050,
      growthTime: 500000,
      width: 30,
      height: 30,
      rarity: 'rare',
      canBreed: true,
      compatibleWith: ['starfish'],
      offspringTypes: {
        'starfish': 'crystal_star'
      }
    },
    {
      name: 'betta_fish',
      displayName: 'Betta Fish',
      basePrice: 800,
      fullGrownPrice: 1200,
      growthTime: 500000,
      width: 50,
      height: 30,
      rarity: 'rare',
      canBreed: true,
      compatibleWith: ['blue_tang', 'jellyfish'],
      offspringTypes: {
        'blue_tang': 'royal_betta',
        'jellyfish': 'crystal_betta'
      }
    },
    {
      name: 'blue_tang',
      displayName: 'Blue Tang',
      basePrice: 900,
      fullGrownPrice: 1350,
      growthTime: 600000,
      width: 55,
      height: 30,
      rarity: 'rare',
      canBreed: true,
      compatibleWith: ['betta_fish', 'jellyfish'],
      offspringTypes: {
        'betta_fish': 'royal_betta',
        'jellyfish': 'prismatic_tang'
      }
    },
    {
      name: 'pufferfish',
      displayName: 'Pufferfish',
      basePrice: 1000,
      fullGrownPrice: 1500,
      growthTime: 700000,
      width: 50,
      height: 50,
      rarity: 'rare',
      canBreed: true,
      compatibleWith: ['pufferfish'],
      offspringTypes: {
        'pufferfish': 'spiky_puffer'
      }
    },

    // Epic Fish (1200-3000 base price)
    {
      name: 'jellyfish',
      displayName: 'Jellyfish',
      basePrice: 1200,
      fullGrownPrice: 1800,
      growthTime: 800000,
      width: 30,
      height: 30,
      rarity: 'epic',
      canBreed: true,
      compatibleWith: ['blue_tang', 'betta_fish'],
      offspringTypes: {
        'blue_tang': 'prismatic_tang',
        'betta_fish': 'crystal_betta'
      }
    },
    {
      name: 'moray_eel',
      displayName: 'Moray Eel',
      basePrice: 1500,
      fullGrownPrice: 2250,
      growthTime: 900000,
      width: 90,
      height: 35,
      rarity: 'epic',
      canBreed: true,
      compatibleWith: ['black_dragonfish'],
      offspringTypes: {
        'black_dragonfish': 'dragon_eel'
      }
    },
    {
      name: 'black_dragonfish',
      displayName: 'Black Dragonfish',
      basePrice: 2000,
      fullGrownPrice: 3000,
      growthTime: 1000000,
      width: 70,
      height: 35,
      rarity: 'epic',
      canBreed: true,
      compatibleWith: ['moray_eel'],
      offspringTypes: {
        'moray_eel': 'dragon_eel'
      }
    },
    {
      name: 'sturgeon',
      displayName: 'Sturgeon',
      basePrice: 2500,
      fullGrownPrice: 3750,
      growthTime: 1200000,
      width: 100,
      height: 35,
      rarity: 'epic',
      canBreed: true,
      compatibleWith: ['oarfish'],
      offspringTypes: {
        'oarfish': 'golden_sturgeon'
      }
    },

    // Legendary Fish (3000+ base price)
    {
      name: 'marlin',
      displayName: 'Blue Marlin',
      basePrice: 3000,
      fullGrownPrice: 4500,
      growthTime: 1500000,
      width: 80,
      height: 20,
      rarity: 'legendary',
      canBreed: true,
      compatibleWith: ['oarfish'],
      offspringTypes: {
        'oarfish': 'ghost_marlin'
      }
    },
    {
      name: 'oarfish',
      displayName: 'Oarfish',
      basePrice: 5000,
      fullGrownPrice: 7500,
      growthTime: 1800000,
      width: 130,
      height: 45,
      rarity: 'legendary',
      canBreed: false
    },
    {
      name: 'giant_isopod',
      displayName: 'Giant Isopod',
      basePrice: 8000,
      fullGrownPrice: 12000,
      growthTime: 2400000,
      width: 70,
      height: 45,
      rarity: 'legendary',
      canBreed: true,
      compatibleWith: ['black_dragonfish'],
      offspringTypes: {
        'black_dragonfish': 'void_isopod'
      }
    },

    // Hybrid Fish (only obtainable through breeding)
    {
      name: 'golden_neon',
      displayName: 'Golden Neon',
      basePrice: 1000,
      fullGrownPrice: 1500,
      growthTime: 600000,
      width: 45,
      height: 19,
      rarity: 'rare',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'rainbow_neon',
      displayName: 'Rainbow Neon',
      basePrice: 1500,
      fullGrownPrice: 2250,
      growthTime: 700000,
      width: 45,
      height: 19,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'crystal_star',
      displayName: 'Crystal Star',
      basePrice: 2000,
      fullGrownPrice: 3000,
      growthTime: 800000,
      width: 30,
      height: 30,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'royal_clown',
      displayName: 'Royal Clownfish',
      basePrice: 1200,
      fullGrownPrice: 1800,
      growthTime: 600000,
      width: 41,
      height: 19,
      rarity: 'rare',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'royal_betta',
      displayName: 'Royal Betta',
      basePrice: 2000,
      fullGrownPrice: 3000,
      growthTime: 800000,
      width: 55,
      height: 35,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'giant_bass',
      displayName: 'Giant Bass',
      basePrice: 2500,
      fullGrownPrice: 3750,
      growthTime: 900000,
      width: 80,
      height: 40,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'dragon_eel',
      displayName: 'Dragon Eel',
      basePrice: 4000,
      fullGrownPrice: 6000,
      growthTime: 1500000,
      width: 110,
      height: 45,
      rarity: 'legendary',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'spiky_puffer',
      displayName: 'Spiky Puffer',
      basePrice: 2500,
      fullGrownPrice: 3750,
      growthTime: 1000000,
      width: 60,
      height: 60,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'crystal_betta',
      displayName: 'Crystal Betta',
      basePrice: 3000,
      fullGrownPrice: 4500,
      growthTime: 900000,
      width: 50,
      height: 30,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'ghost_marlin',
      displayName: 'Ghost Marlin',
      basePrice: 4500,
      fullGrownPrice: 6750,
      growthTime: 1200000,
      width: 80,
      height: 20,
      rarity: 'legendary',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'prismatic_tang',
      displayName: 'Prismatic Tang',
      basePrice: 2800,
      fullGrownPrice: 4200,
      growthTime: 800000,
      width: 55,
      height: 30,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'void_isopod',
      displayName: 'Void Isopod',
      basePrice: 10000,
      fullGrownPrice: 15000,
      growthTime: 2000000,
      width: 70,
      height: 45,
      rarity: 'legendary',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'golden_sturgeon',
      displayName: 'Golden Sturgeon',
      basePrice: 5000,
      fullGrownPrice: 7500,
      growthTime: 1500000,
      width: 100,
      height: 35,
      rarity: 'legendary',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'plasma_jellyfish',
      displayName: 'Plasma Jellyfish',
      basePrice: 3500,
      fullGrownPrice: 5250,
      growthTime: 1000000,
      width: 30,
      height: 30,
      rarity: 'epic',
      canBreed: false,
      isHybrid: true
    },
    {
      name: 'crownfish',
      displayName: 'Crown Fish',
      basePrice: 400,
      fullGrownPrice: 600,
      growthTime: 300000,
      width: 50,
      height: 60,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['neonfish', 'neonfish_2'],
      offspringTypes: {
        'neonfish': 'rainbow_neon',
        'neonfish_2': 'golden_neon'
      }
    },
    {
      name: 'neonfish_2',
      displayName: 'Electric Neon',
      basePrice: 450,
      fullGrownPrice: 675,
      growthTime: 320000,
      width: 45,
      height: 19,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['crownfish', 'neonfish_3'],
      offspringTypes: {
        'crownfish': 'golden_neon',
        'neonfish_3': 'rainbow_neon'
      }
    },
    {
      name: 'neonfish_3',
      displayName: 'Plasma Neon',
      basePrice: 500,
      fullGrownPrice: 750,
      growthTime: 340000,
      width: 45,
      height: 19,
      rarity: 'uncommon',
      canBreed: true,
      compatibleWith: ['neonfish_2', 'neonfish'],
      offspringTypes: {
        'neonfish_2': 'rainbow_neon',
        'neonfish': 'golden_neon'
      }
    }
  ]
}; 