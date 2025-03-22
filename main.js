// Food system configuration
const FOOD_TYPES = {
  basic_pellet: {
    hungerRestore: 10,
    growthBonus: 0,
    valueBonus: 0,
    breedingBonus: 0,
    price: 50
  },
  premium_pellet: {
    hungerRestore: 15,
    growthBonus: 0.2,
    valueBonus: 0,
    breedingBonus: 0,
    price: 100
  },
  golden_pellet: {
    hungerRestore: 20,
    growthBonus: 0.5,
    valueBonus: 0.3,
    breedingBonus: 0,
    price: 200
  },
  breeding_pellet: {
    hungerRestore: 15,
    growthBonus: 0,
    valueBonus: 0,
    breedingBonus: 1.0,
    price: 150
  },
  rainbow_pellet: {
    hungerRestore: 20,
    growthBonus: 0.3,
    valueBonus: 0.2,
    breedingBonus: 0.5,
    price: 300
  },
  crystal_pellet: {
    hungerRestore: 25,
    growthBonus: 1.0,
    valueBonus: 0.5,
    breedingBonus: 1.0,
    price: 500
  }
};

class FishGame {
  constructor() {
    this.fishId = 0;
    this.decorationId = 0;
    this.coins = 500;
    this.showNames = false;
    this.activeModal = null;
    this.pendingFish = null;
    this.breedingCooldowns = new Map();
    this.selectedFood = null;
    this.selectedFishId = null;
    this.lastIncomeTime = Date.now();
    this.decorations = new Map();
    this.init();
  }

  setupFoodSystem() {
    const feedFishButton = document.getElementById('feedFishButton');
    if (feedFishButton) {
      feedFishButton.addEventListener('click', () => this.openModal('feedFishModal'));
    }

    // Add click handlers for food items
    document.querySelectorAll('.food-item').forEach(item => {
      item.addEventListener('click', () => {
        const foodType = item.dataset.food;
        const foodConfig = FOOD_TYPES[foodType];

        if (!foodConfig) return;

        if (this.coins < foodConfig.price) {
          this.showToast('Not enough coins!', 'error');
          return;
        }

        this.updateCoins(-foodConfig.price);
        this.selectedFood = foodType;
        this.closeModal('feedFishModal');
        this.showToast('Click in the tank to drop food!', 'info');
      });
    });

    // Setup food dropping in tank
    const fishTank = document.getElementById('fish_tank');
    if (fishTank) {
      fishTank.addEventListener('click', (e) => {
        if (!this.selectedFood) return;

        const rect = fishTank.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.dropFood(x, y, this.selectedFood);
        this.selectedFood = null;
      });
    }
  }

  dropFood(x, y, foodType) {
    const tank = document.querySelector('.fish-tank');
    const pellet = document.createElement('div');
    pellet.className = `food-pellet ${foodType}`;
    pellet.style.left = `${x}px`;
    pellet.style.top = `${y}px`;
    tank.appendChild(pellet);

    // Find nearest fish and animate it to follow the pellet
    const nearestFish = this.findNearestHungryFish(x, y);
    if (nearestFish) {
      this.animateFishToFood(nearestFish, pellet, foodType);
    } else {
      // If no hungry fish, remove pellet after animation
      setTimeout(() => {
        if (pellet.parentNode) {
          pellet.classList.add('eaten');
          setTimeout(() => pellet.remove(), 300);
        }
      }, 3000);
    }
  }

  feedFish(foodType) {
    if (this.coins < FOOD_TYPES[foodType].price) {
      this.showToast('Not enough coins!', 'error');
      return;
    }

    this.updateCoins(-FOOD_TYPES[foodType].price);

    const tank = document.querySelector('.fish-tank');
    const pellet = document.createElement('div');
    pellet.className = `food-pellet ${foodType}`;

    // Random position within the tank
    const tankRect = tank.getBoundingClientRect();
    const x = Math.random() * (tankRect.width - 16);
    const y = Math.random() * (tankRect.height - 16);

    pellet.style.left = `${x}px`;
    pellet.style.top = `${y}px`;
    tank.appendChild(pellet);

    // Find nearest fish and animate it to follow the pellet
    const nearestFish = this.findNearestHungryFish(x, y);
    if (nearestFish) {
      this.animateFishToFood(nearestFish, pellet, foodType);
    } else {
      // If no hungry fish, remove pellet after animation
      setTimeout(() => {
        if (pellet.parentNode) {
          pellet.classList.add('eaten');
          setTimeout(() => pellet.remove(), 300);
        }
      }, 3000);
    }
  }

  findNearestHungryFish(x, y) {
    let nearestFish = null;
    let minDistance = Infinity;

    document.querySelectorAll('.fish').forEach(fish => {
      const fishData = this.getFishData(fish);
      if (fishData.hunger < 100) {
        const fishRect = fish.getBoundingClientRect();
        const fishX = fishRect.left + fishRect.width / 2;
        const fishY = fishRect.top + fishRect.height / 2;
        const distance = Math.sqrt(Math.pow(fishX - x, 2) + Math.pow(fishY - y, 2));

        if (distance < minDistance) {
          minDistance = distance;
          nearestFish = fish;
        }
      }
    });

    return nearestFish;
  }

  animateFishToFood(fish, pellet, foodType) {
    const fishRect = fish.getBoundingClientRect();
    const pelletRect = pellet.getBoundingClientRect();

    // Calculate direction
    const dx = pelletRect.left - fishRect.left;
    const dy = pelletRect.top - fishRect.top;

    // Flip fish if needed
    if (dx > 0) {
      fish.classList.remove('right');
    } else {
      fish.classList.add('right');
    }

    // Animate fish to pellet
    fish.style.transition = 'transform 1s ease-in-out';
    fish.style.transform = `translate(${dx}px, ${dy}px)`;

    // When fish reaches food
    setTimeout(() => {
      // Remove pellet with animation
      pellet.classList.add('eaten');
      setTimeout(() => pellet.remove(), 300);

      // Reset fish position
      fish.style.transition = 'transform 0.5s ease-in-out';
      fish.style.transform = '';

      // Apply food effects
      const fishData = this.getFishData(fish);
      const foodEffects = FOOD_TYPES[foodType];

      // Update hunger
      fishData.hunger = Math.min(100, fishData.hunger + foodEffects.hungerRestore);

      // Apply growth bonus
      if (foodEffects.growthBonus > 0) {
        fishData.growth = Math.min(100, fishData.growth + foodEffects.growthBonus * 10);
      }

      // Apply value bonus
      if (foodEffects.valueBonus > 0) {
        fishData.value = Math.floor(fishData.value * (1 + foodEffects.valueBonus));
      }

      // Apply breeding bonus
      if (foodEffects.breedingBonus > 0) {
        fishData.breedingChance = Math.min(100, fishData.breedingChance + foodEffects.breedingBonus * 20);
      }

      // Update fish data
      this.setFishData(fish, fishData);
      this.updateFishDisplay(fish);

      // Show effects
      this.showFeedingEffects(fish, foodEffects);
    }, 1000);
  }

  showFeedingEffects(fish, effects) {
    const effectsDiv = document.createElement('div');
    effectsDiv.className = 'feeding-effects';

    let effectsText = [];
    if (effects.hungerRestore > 0) effectsText.push(`+${effects.hungerRestore} Hunger`);
    if (effects.growthBonus > 0) effectsText.push(`+${effects.growthBonus * 100}% Growth`);
    if (effects.valueBonus > 0) effectsText.push(`+${effects.valueBonus * 100}% Value`);
    if (effects.breedingBonus > 0) effectsText.push(`+${effects.breedingBonus * 100}% Breeding`);

    effectsDiv.textContent = effectsText.join(', ');
    effectsDiv.style.left = `${fish.offsetLeft}px`;
    effectsDiv.style.top = `${fish.offsetTop - 20}px`;

    document.querySelector('.fish-tank').appendChild(effectsDiv);

    // Animate and remove
    setTimeout(() => {
      effectsDiv.style.opacity = '0';
      effectsDiv.style.transform = 'translateY(-20px)';
      setTimeout(() => effectsDiv.remove(), 500);
    }, 100);
  }

  setupDecorationSystem() {
    const decorationsButton = document.getElementById('decorationsButton');
    if (decorationsButton) {
      decorationsButton.addEventListener('click', () => this.openModal('decorationsModal'));
    }

    // Setup category filters
    const decorationModal = document.getElementById('decorationsModal');
    if (decorationModal) {
      decorationModal.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', () => {
          decorationModal.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
          filter.classList.add('active');
          this.filterDecorations(filter.dataset.category);
        });
      });
    }

    this.createDecorationGrid();
    this.setupDecorationDragging();
  }

  showFloatingIncome(fish, amount) {
    const incomeText = document.createElement('div');
    incomeText.className = 'floating-income';
    incomeText.innerHTML = `+${amount} <i class="fas fa-coins"></i>`;

    // Position it above the fish
    const fishRect = fish.getBoundingClientRect();
    incomeText.style.left = `${fish.offsetLeft + (fishRect.width / 2)}px`;
    incomeText.style.top = `${fish.offsetTop - 20}px`;  // Offset it 20px above the fish

    document.getElementById('fish_tank').appendChild(incomeText);

    // Animate and remove
    incomeText.animate(
      [
        { transform: 'translateY(0) translateX(-50%)', opacity: 1 },
        { transform: 'translateY(-20px) translateX(-50%)', opacity: 0 }
      ],
      { duration: 1000, easing: 'ease-out' }
    ).onfinish = () => incomeText.remove();
  }

  createFishSelector() {
    const fishSelect = document.getElementById('fishSelect');
    if (!fishSelect) return;

    // Clear existing fish
    fishSelect.innerHTML = '';

    // Get available fish and sort by price
    const availableFish = GAME_CONFIG.fishTypes
      .filter(fish => !fish.isHybrid)
      .sort((a, b) => a.basePrice - b.basePrice);

    // Create fish elements
    availableFish.forEach((fish, index) => {
      const li = document.createElement('li');
      li.title = `${fish.displayName}\nPrice: ${fish.basePrice} coins\nRarity: ${fish.rarity.charAt(0).toUpperCase() + fish.rarity.slice(1)}`;
      li.className = `fishSelect ${fish.rarity}`;
      li.dataset.rarity = fish.rarity;

      const fishDiv = document.createElement('div');
      fishDiv.className = `${fish.name} left fish-image`;

      const nameDiv = document.createElement('div');
      nameDiv.className = 'fish-name';
      nameDiv.textContent = fish.displayName;

      const priceDiv = document.createElement('div');
      priceDiv.className = 'fish-price';
      priceDiv.innerHTML = `<i class="fas fa-coins"></i> ${fish.basePrice}`;

      li.appendChild(fishDiv);
      li.appendChild(nameDiv);
      li.appendChild(priceDiv);
      li.addEventListener('click', () => this.addFish(fish.name, GAME_CONFIG.fishTypes.indexOf(fish)));
      fishSelect.appendChild(li);
    });

    // Add filter functionality
    const filterButtons = document.querySelectorAll('.category-filter');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter fish
        const rarity = button.dataset.rarity;
        const fishItems = fishSelect.querySelectorAll('.fishSelect');

        fishItems.forEach(item => {
          if (rarity === 'all' || item.dataset.rarity === rarity) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  createDecorationGrid() {
    const decorationGrid = document.querySelector('.decoration-grid');
    if (!decorationGrid) return;

    // Clear existing decorations
    decorationGrid.innerHTML = '';

    // Sort decorations by price
    const sortedDecorations = [...GAME_CONFIG.decorations].sort((a, b) => a.price - b.price);

    // Create decoration items
    sortedDecorations.forEach(decoration => {
      const item = document.createElement('div');
      item.className = 'decoration-item';
      item.dataset.name = decoration.name;
      item.dataset.category = decoration.category;

      const preview = document.createElement('div');
      preview.className = `decoration-preview ${decoration.name}`;

      const info = document.createElement('div');
      info.className = 'decoration-info';

      const name = document.createElement('div');
      name.className = 'decoration-name';
      name.textContent = decoration.displayName;

      const price = document.createElement('div');
      price.className = 'decoration-price';
      price.innerHTML = `${decoration.price} <i class="fas fa-coins"></i>`;

      const bonuses = document.createElement('div');
      bonuses.className = 'decoration-bonuses';
      const bonusText = Object.entries(decoration.bonuses)
        .map(([type, value]) => `+${value * 100}% ${type}`)
        .join(', ');
      bonuses.textContent = bonusText;

      info.appendChild(name);
      info.appendChild(price);
      info.appendChild(bonuses);

      item.appendChild(preview);
      item.appendChild(info);

      item.addEventListener('click', () => this.purchaseDecoration(decoration));
      decorationGrid.appendChild(item);
    });
  }
} 