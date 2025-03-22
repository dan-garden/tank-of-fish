import { GAME_CONFIG } from './config.js';

// Game Configuration
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
    this.pendingDecoration = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeGame());
    } else {
      this.initializeGame();
    }
  }

  initializeGame() {
    this.loadGameState();
    this.updateCoins();
    this.createFishSelector();
    this.setupEventListeners();
    this.setupDecorationSystem();

    // Save game state and generate income every second
    setInterval(() => {
      this.saveGameState();
      this.generatePassiveIncome();
    }, 1000);
  }

  saveGameState() {
    const fishElements = document.querySelectorAll('.fish');
    const fishStates = Array.from(fishElements).map(fish => ({
      id: parseInt(fish.dataset.id),
      type: fish.dataset.type,
      typeIndex: parseInt(fish.dataset.place),
      name: fish.dataset.name,
      position: {
        left: fish.style.left,
        top: fish.style.top
      },
      growth: parseInt(document.getElementById(`growth_${fish.dataset.id}`).dataset.growth),
      hunger: parseFloat(fish.dataset.hunger),
      growthBonus: parseFloat(fish.dataset.growthBonus) || 0,
      valueBonus: parseFloat(fish.dataset.valueBonus) || 0,
      canBreed: fish.dataset.canBreed === 'true'
    }));

    const decorationStates = Array.from(this.decorations.values());
    const gameState = {
      fishId: this.fishId,
      decorationId: this.decorationId,
      coins: this.coins,
      showNames: this.showNames,
      fish: fishStates,
      breedingCooldowns: Array.from(this.breedingCooldowns.entries()),
      decorations: decorationStates,
      lastSaved: Date.now()
    };

    localStorage.setItem('fishGameState', JSON.stringify(gameState));
  }

  loadGameState() {
    const savedState = localStorage.getItem('fishGameState');
    if (!savedState) return;

    const gameState = JSON.parse(savedState);

    // Restore basic game state
    this.fishId = gameState.fishId;
    this.decorationId = gameState.decorationId || 0;
    this.coins = gameState.coins;
    this.showNames = gameState.showNames;
    this.selectedFishId = null;

    // Restore breeding cooldowns
    this.breedingCooldowns = new Map(gameState.breedingCooldowns);

    // Remove expired breeding cooldowns
    const now = Date.now();
    for (const [fishId, cooldownEnd] of this.breedingCooldowns.entries()) {
      if (cooldownEnd < now) {
        this.breedingCooldowns.delete(fishId);
      }
    }

    // Restore decorations
    this.decorations.clear();
    if (gameState.decorations) {
      const fishTank = document.getElementById('fish_tank');
      gameState.decorations.forEach(decoration => {
        const decorationType = GAME_CONFIG.decorations.find(d => d.name === decoration.type);
        if (!decorationType) return;

        const decorationElement = document.createElement('div');
        decorationElement.className = `decoration ${decoration.type}`;
        decorationElement.id = `decoration_${decoration.id}`;
        decorationElement.style.width = `${decorationType.width}px`;
        decorationElement.style.height = `${decorationType.height}px`;
        decorationElement.style.left = decoration.position.left;
        decorationElement.style.top = decoration.position.top;

        // Add bonus area indicator
        const bonusArea = document.createElement('div');
        bonusArea.className = 'bonus-area';
        bonusArea.style.width = `${decorationType.width * 3}px`;
        bonusArea.style.height = `${decorationType.width * 3}px`;
        bonusArea.style.left = `-${decorationType.width}px`;
        bonusArea.style.top = `-${decorationType.width}px`;
        decorationElement.appendChild(bonusArea);

        fishTank.appendChild(decorationElement);
        this.decorations.set(decoration.id, decoration);
      });
    }

    // Restore fish
    const fishTank = document.getElementById('fish_tank');
    gameState.fish.forEach(fishState => {
      const fishElement = document.createElement('div');
      fishElement.id = `fish_${fishState.id}`;
      fishElement.className = `${fishState.type} fish`;
      fishElement.dataset.place = fishState.typeIndex;
      fishElement.dataset.name = fishState.name;
      fishElement.dataset.id = fishState.id;
      fishElement.dataset.type = fishState.type;
      fishElement.dataset.canBreed = fishState.canBreed.toString();
      fishElement.dataset.hunger = fishState.hunger.toString();
      fishElement.dataset.growthBonus = fishState.growthBonus.toString();
      if (fishState.valueBonus) {
        fishElement.dataset.valueBonus = fishState.valueBonus.toString();
      }

      // Position the fish
      fishElement.style.left = fishState.position.left;
      fishElement.style.top = fishState.position.top;

      // Add fish name
      const nameDiv = document.createElement('div');
      nameDiv.className = `fishName ${this.showNames ? '' : 'hidden'}`;
      nameDiv.textContent = fishState.name;

      // Add growth bar
      const growthDiv = document.createElement('div');
      growthDiv.className = 'growth';
      growthDiv.innerHTML = `<div id="growth_${fishState.id}" data-growth="${fishState.growth}" style="width:${fishState.growth}%;" class="inner_growth"></div>`;

      // Add hunger indicator
      const hungerDiv = document.createElement('div');
      hungerDiv.className = 'hunger-indicator';
      hungerDiv.innerHTML = `<div class="inner-hunger" style="width:${fishState.hunger}%;"></div>`;

      // Add breeding indicator
      const breedingIndicator = document.createElement('div');
      breedingIndicator.className = 'breeding-indicator hidden';
      breedingIndicator.innerHTML = '❤️';

      fishElement.appendChild(nameDiv);
      fishElement.appendChild(growthDiv);
      fishElement.appendChild(hungerDiv);
      fishElement.appendChild(breedingIndicator);

      // Add fully-grown class if fish is at 100% growth
      if (fishState.growth >= 100) {
        fishElement.classList.add('fully-grown');
      }

      // Add click event listener
      fishElement.addEventListener('click', () => {
        this.selectedFishId = fishState.id;
        this.updateFishStats(fishState.id, fishState.typeIndex);
        this.openModal('fishStatsModal');
      });

      fishTank.appendChild(fishElement);

      // Start fish systems
      this.startGrowth(fishState.id, fishState.typeIndex);
      this.startFishMovement(fishState.id, fishState.type);
      this.startHunger(fishState.id);
      this.checkBreeding(fishState.id);
    });

    this.showToast('Game loaded!', 'success');
  }

  updateCoins(amount = 0) {
    // If amount is provided, update coins with validation
    if (amount !== 0) {
      const newAmount = this.coins + amount;
      // Prevent negative coins
      if (newAmount < 0) {
        this.showToast('Not enough coins!', 'error');
        return false;
      }
      this.coins = newAmount;
    }

    // Update display
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
      coinsElement.textContent = this.coins;
    }
    return true;
  }

  createFishSelector() {
    const fishSelect = document.getElementById('fishSelect');
    if (!fishSelect) return;

    // Clear existing fish
    fishSelect.innerHTML = '';

    // Create fish elements
    GAME_CONFIG.fishTypes.forEach((fish, index) => {
      // Skip hybrid fish types which are only obtainable through breeding
      if (fish.isHybrid) return;

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
      li.addEventListener('click', () => this.addFish(fish.name, index));
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

  startGrowth(fishId, typeIndex) {
    const growth = document.getElementById(`growth_${fishId}`);
    if (!growth) return;

    const fish = document.getElementById(`fish_${fishId}`);
    if (!fish) return;

    const fishType = GAME_CONFIG.fishTypes[typeIndex];
    const growthBonus = parseFloat(fish.dataset.growthBonus) || 0;
    const decorationBonuses = this.getDecorationBonuses(fish);
    const totalGrowthBonus = growthBonus + decorationBonuses.growth;
    const speed = fishType.growthTime / (100 * (1 + totalGrowthBonus));
    const currentGrowth = parseInt(growth.dataset.growth);
    const currentHunger = parseFloat(fish.dataset.hunger);

    if (currentGrowth >= 100) {
      growth.style.width = '100%';
      growth.classList.remove('nearly-grown');
      // Add fully grown class to fish
      fish.classList.add('fully-grown');
      // Show ready to sell tooltip
      if (!fish.querySelector('.status-tooltip.success')) {
        this.showStatusTooltip(fish, 'success', '💰 Ready to sell!');
      }
      return;
    }

    // Remove fully grown class if not fully grown
    fish.classList.remove('fully-grown');

    // Add nearly-grown indicator
    if (currentGrowth >= 90) {
      growth.classList.add('nearly-grown');
      // Show almost grown tooltip
      if (!fish.querySelector('.status-tooltip.info')) {
        this.showStatusTooltip(fish, 'info', '⭐ Almost grown!');
      }
    } else {
      growth.classList.remove('nearly-grown');
    }

    // Only grow if not too hungry
    if (currentHunger < 30) {
      setTimeout(() => this.startGrowth(fishId, typeIndex), 1000);
      return;
    }

    const newGrowth = currentGrowth + 1;
    const animation = growth.animate(
      [{ width: `${currentGrowth}%` }, { width: `${newGrowth}%` }],
      { duration: speed }
    );

    growth.dataset.currentAnimation = true;

    animation.onfinish = () => {
      if (!document.getElementById(`growth_${fishId}`)) return;
      if (!growth.dataset.currentAnimation) return;

      growth.style.width = `${newGrowth}%`;
      growth.dataset.growth = `${newGrowth}`;
      this.updateFishStats(fishId, typeIndex);
      this.startGrowth(fishId, typeIndex);
    };
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }

  openModal(modalId) {
    if (this.activeModal) {
      this.closeModal(this.activeModal);
    }
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modalId;
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      this.activeModal = null;
      if (modalId === 'fishStatsModal') {
        this.selectedFishId = null;
      }
    }
  }

  addFish(type, typeIndex) {
    const fishType = GAME_CONFIG.fishTypes[typeIndex];

    if (this.fishId >= GAME_CONFIG.maxFish) {
      this.showToast('Sorry, fish tank full!', 'error');
      return;
    }

    if (!this.updateCoins(-fishType.basePrice)) {
      return;
    }

    // Store the fish type and index for later use
    this.pendingFish = { type, typeIndex };

    // Show the input modal
    this.openModal('inputModal');
    const input = document.getElementById('fishNameInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  createFish(name) {
    if (!this.pendingFish) return;

    const { type, typeIndex, position } = this.pendingFish;
    const fishType = GAME_CONFIG.fishTypes[typeIndex];

    // Clean up the fish name
    const fishName = name.replace(/\s/g, '_');

    this.fishId++;
    const fishTank = document.getElementById('fish_tank');

    const fishElement = document.createElement('div');
    fishElement.id = `fish_${this.fishId}`;
    fishElement.className = `${type} fish`;
    fishElement.dataset.place = typeIndex;
    fishElement.dataset.name = fishName;
    fishElement.dataset.id = this.fishId;
    fishElement.dataset.type = type;
    fishElement.dataset.canBreed = fishType.canBreed.toString();
    fishElement.dataset.hunger = '100';
    fishElement.dataset.growthBonus = '0';
    fishElement.dataset.rarity = fishType.rarity;

    // Position the fish at the specified location or center of tank if not specified
    if (position) {
      fishElement.style.left = `${position.x}px`;
      fishElement.style.top = `${position.y}px`;
    } else {
      const tankRect = fishTank.getBoundingClientRect();
      fishElement.style.left = `${(tankRect.width - fishType.width) / 2}px`;
      fishElement.style.top = `${(tankRect.height - fishType.height) / 2}px`;
    }

    // Add fish name with rarity color
    const nameDiv = document.createElement('div');
    nameDiv.className = `fishName ${this.showNames ? '' : 'hidden'}`;
    nameDiv.textContent = fishName;

    // Add growth bar
    const growthDiv = document.createElement('div');
    growthDiv.className = 'growth';
    growthDiv.innerHTML = `<div id="growth_${this.fishId}" data-growth="0" style="width:0%;" class="inner_growth"></div>`;

    const hungerDiv = document.createElement('div');
    hungerDiv.className = 'hunger-indicator';
    hungerDiv.innerHTML = `<div class="inner-hunger" style="width:100%;"></div>`;

    // Add breeding indicator
    const breedingIndicator = document.createElement('div');
    breedingIndicator.className = 'breeding-indicator hidden';
    breedingIndicator.innerHTML = '❤️';

    fishElement.appendChild(nameDiv);
    fishElement.appendChild(growthDiv);
    fishElement.appendChild(hungerDiv);
    fishElement.appendChild(breedingIndicator);

    fishElement.addEventListener('click', () => {
      this.selectedFishId = this.fishId;
      this.updateFishStats(this.fishId, typeIndex);
      this.openModal('fishStatsModal');
    });

    fishTank.appendChild(fishElement);

    this.startGrowth(this.fishId, typeIndex);
    this.startFishMovement(this.fishId, type);
    this.startHunger(this.fishId);
    this.checkBreeding(this.fishId);

    this.closeModal('inputModal');
    this.showToast(`Added ${fishName} to your tank!`, 'success');

    this.pendingFish = null;
  }

  startHunger(fishId) {
    const fish = document.getElementById(`fish_${fishId}`);
    if (!fish) return;

    const updateHunger = () => {
      if (!document.getElementById(`fish_${fishId}`)) return;

      const currentHunger = parseFloat(fish.dataset.hunger);
      const newHunger = Math.max(0, currentHunger - GAME_CONFIG.hungerRate);
      fish.dataset.hunger = newHunger.toString();

      // Update hunger indicator
      const hungerIndicator = fish.querySelector('.hunger-indicator .inner-hunger');
      if (hungerIndicator) {
        hungerIndicator.style.width = `${newHunger}%`;
        hungerIndicator.classList.toggle('warning', newHunger < 30);
      }

      // Visual feedback for hungry fish
      if (newHunger < 30) {
        fish.classList.add('hungry');
        // Show starving tooltip when hunger drops below 30%
        if (!fish.querySelector('.status-tooltip.warning')) {
          this.showStatusTooltip(fish, 'warning', '🍽️ Starving!');
        }
      } else {
        fish.classList.remove('hungry');
      }

      // Update stats if the modal is open for this specific fish
      if (this.activeModal === 'fishStatsModal' && this.selectedFishId === fishId) {
        const statHunger = document.getElementById('stat_hunger');
        if (statHunger) {
          statHunger.textContent = `${Math.round(newHunger)}%`;
          const hungerProgress = document.querySelector('.hunger-progress');
          if (hungerProgress) {
            hungerProgress.style.width = `${newHunger}%`;
            hungerProgress.classList.toggle('warning', newHunger < 30);
          }
        }
      }

      setTimeout(updateHunger, 1000);
    };

    updateHunger();
  }

  startFishMovement(fishId, type) {
    const fish = document.getElementById(`fish_${fishId}`);
    if (!fish) return;

    const tank = document.getElementById('fish_tank');
    const maxLeft = tank.clientWidth - fish.clientWidth;
    const maxTop = tank.clientHeight - fish.clientHeight;

    // If fish is currently in a targeted movement, don't interrupt it
    if (fish.dataset.targetX && fish.dataset.targetY) return;

    // Generate random target within tank bounds
    const newLeft = Math.floor(Math.random() * maxLeft);
    const newTop = Math.floor(Math.random() * maxTop);

    this.moveToTarget(fish, type, newLeft, newTop, () => {
      this.startFishMovement(fishId, type);
      this.checkBreeding(fishId);
    });
  }

  moveToTarget(fish, type, targetX, targetY, onComplete) {
    // Get the current position from the actual DOM position
    const rect = fish.getBoundingClientRect();
    const tank = document.getElementById('fish_tank');
    const tankRect = tank.getBoundingClientRect();
    const currentLeft = rect.left - tankRect.left;
    const currentTop = rect.top - tankRect.top;

    // Cancel any existing animations
    const currentAnimations = fish.getAnimations();
    currentAnimations.forEach(animation => animation.cancel());

    // Update fish direction based on movement
    fish.className = `${type} fish ${targetX > currentLeft ? 'right' : 'left'}`;

    // Calculate distance and speed
    const distance = Math.sqrt(
      Math.pow(targetX - currentLeft, 2) +
      Math.pow(targetY - currentTop, 2)
    );

    // Speed is proportional to distance, with min and max limits
    const speed = Math.min(Math.max(distance * 20, 2000), 10000);

    // Store target coordinates
    fish.dataset.targetX = targetX;
    fish.dataset.targetY = targetY;

    // Set initial position to current position to ensure smooth transition
    fish.style.left = `${currentLeft}px`;
    fish.style.top = `${currentTop}px`;

    // Add slight wave motion to vertical movement
    const animation = fish.animate(
      [
        {
          left: `${currentLeft}px`,
          top: `${currentTop}px`
        },
        {
          left: `${targetX}px`,
          top: `${targetY}px`
        }
      ],
      {
        duration: speed,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );

    animation.onfinish = () => {
      fish.style.left = `${targetX}px`;
      fish.style.top = `${targetY}px`;
      delete fish.dataset.targetX;
      delete fish.dataset.targetY;
      if (onComplete) onComplete();

      // If no onComplete callback was provided, restart normal movement
      // This ensures fish keep moving after reaching food or other targets
      if (!onComplete) {
        this.startFishMovement(fish.dataset.id, fish.dataset.type);
      }
    };

    return animation;
  }

  updateFishStats(fishId, typeIndex) {
    // Only update if this is the selected fish
    if (this.selectedFishId !== fishId) return;

    const fish = document.getElementById(`fish_${fishId}`);
    const growth = document.getElementById(`growth_${fishId}`);

    if (!fish || !growth) return;

    const fishType = GAME_CONFIG.fishTypes[typeIndex];
    const isFullyGrown = parseInt(growth.dataset.growth) === 100;
    const currentHunger = parseFloat(fish.dataset.hunger);
    const canBreed = fish.dataset.canBreed === 'true';

    const statName = document.getElementById('stat_name');
    const statType = document.getElementById('stat_type');
    const statGrowth = document.getElementById('stat_growth');
    const statHunger = document.getElementById('stat_hunger');
    const statRarity = document.getElementById('stat_rarity');
    const statCanBreed = document.getElementById('stat_can_breed');
    const breedingPartners = document.getElementById('breeding_partners');
    const statBreedingCooldown = document.getElementById('stat_breeding_cooldown');
    const sellButton = document.getElementById('sellFish');
    const hungerProgress = document.querySelector('.hunger-progress');

    // Update basic info
    if (statName) statName.textContent = fish.dataset.name;
    if (statType) statType.textContent = fishType.displayName;
    if (statGrowth) {
      statGrowth.textContent = `${growth.dataset.growth}% ${isFullyGrown ? '(Fully Grown)' : '(Will sell for more when fully grown)'}`;
    }
    if (statHunger) {
      statHunger.textContent = `${Math.round(currentHunger)}%`;
    }
    if (statRarity) {
      const rarity = fishType.rarity.charAt(0).toUpperCase() + fishType.rarity.slice(1);
      statRarity.textContent = rarity;
      statRarity.className = `stat-value rarity-${fishType.rarity}`;
    }
    if (hungerProgress) {
      hungerProgress.style.width = `${currentHunger}%`;
      hungerProgress.classList.toggle('warning', currentHunger < 30);
    }

    // Update breeding info
    if (statCanBreed) {
      if (!canBreed) {
        statCanBreed.textContent = 'No';
        statCanBreed.style.color = 'var(--danger-color)';
      } else if (!isFullyGrown) {
        statCanBreed.textContent = 'Not yet (needs to be fully grown)';
        statCanBreed.style.color = 'var(--text-color)';
      } else if (currentHunger < GAME_CONFIG.minHungerToBreed) {
        statCanBreed.textContent = 'Not yet (needs more food)';
        statCanBreed.style.color = 'var(--text-color)';
      } else {
        statCanBreed.textContent = 'Yes';
        statCanBreed.style.color = 'var(--success-color)';
      }
    }

    // Update breeding partners
    if (breedingPartners) {
      breedingPartners.innerHTML = '';
      if (fishType.compatibleWith && fishType.compatibleWith.length > 0) {
        fishType.compatibleWith.forEach(partnerType => {
          const partner = GAME_CONFIG.fishTypes.find(f => f.name === partnerType);
          if (!partner) return;

          const partnerElement = document.createElement('div');
          partnerElement.className = 'breeding-partner';

          // Check if there are any available breeding partners of this type
          const availablePartner = Array.from(document.querySelectorAll('.fish')).find(f =>
            f.dataset.type === partnerType &&
            f.dataset.canBreed === 'true' &&
            parseInt(document.getElementById(`growth_${f.dataset.id}`).dataset.growth) === 100 &&
            parseFloat(f.dataset.hunger) >= GAME_CONFIG.minHungerToBreed &&
            !this.breedingCooldowns.has(parseInt(f.dataset.id))
          );

          if (availablePartner) {
            partnerElement.classList.add('available');
            partnerElement.innerHTML = `<i class="fas fa-check-circle"></i> ${partner.displayName}`;
          } else {
            partnerElement.innerHTML = `<i class="fas fa-times-circle"></i> ${partner.displayName}`;
          }

          breedingPartners.appendChild(partnerElement);
        });
      } else {
        breedingPartners.textContent = 'None';
      }
    }

    // Update breeding cooldown
    if (statBreedingCooldown) {
      const cooldownEnd = this.breedingCooldowns.get(fishId);
      if (cooldownEnd) {
        const timeLeft = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          statBreedingCooldown.textContent = `${minutes}m ${seconds}s`;
          statBreedingCooldown.classList.remove('ready');

          // Update the cooldown every second
          setTimeout(() => this.updateFishStats(fishId, typeIndex), 1000);
        } else {
          statBreedingCooldown.textContent = 'Ready!';
          statBreedingCooldown.classList.add('ready');
          this.breedingCooldowns.delete(fishId);
        }
      } else {
        statBreedingCooldown.textContent = 'Ready!';
        statBreedingCooldown.classList.add('ready');
      }
    }

    // Update sell button
    if (sellButton) {
      const valueBonus = parseFloat(fish.dataset.valueBonus) || 0;
      const rarityMultiplier = GAME_CONFIG.rarityTiers[fishType.rarity].multiplier;
      const baseValue = isFullyGrown ? fishType.fullGrownPrice : fishType.basePrice;
      const finalValue = Math.round(baseValue * rarityMultiplier * (1 + valueBonus));

      sellButton.textContent = `Sell for ${finalValue} coins`;
      sellButton.dataset.sell = typeIndex;
      sellButton.dataset.growth = isFullyGrown;
      sellButton.dataset.id = fishId;
    }
  }

  sellFish() {
    const sellButton = document.getElementById('sellFish');
    if (!sellButton) return;

    const typeIndex = parseInt(sellButton.dataset.sell);
    const isGrown = sellButton.dataset.growth === 'true';
    const fishId = sellButton.dataset.id;

    const fish = document.getElementById(`fish_${fishId}`);
    if (!fish) return;

    const fishName = fish.dataset.name;
    const fishType = GAME_CONFIG.fishTypes[typeIndex];
    const rarityMultiplier = GAME_CONFIG.rarityTiers[fishType.rarity].multiplier;

    // Stop the growth animation
    const growth = document.getElementById(`growth_${fishId}`);
    if (growth) {
      growth.dataset.currentAnimation = '';
    }

    const valueBonus = parseFloat(fish.dataset.valueBonus) || 0;
    const baseValue = isGrown ? fishType.fullGrownPrice : fishType.basePrice;
    const sellValue = Math.round(baseValue * rarityMultiplier * (1 + valueBonus));

    fish.remove();
    this.updateCoins(sellValue);
    this.closeModal('fishStatsModal');
    this.showToast(`Sold ${fishName} for ${sellValue} coins!`, 'success');
  }

  toggleNames() {
    if (this.fishId === 0) {
      this.showToast('You don\'t have any fish yet!', 'error');
      return;
    }

    this.showNames = !this.showNames;
    document.querySelectorAll('.fishName').forEach(name => {
      name.classList.toggle('hidden');
    });
    this.closeModal('settingsModal');
    this.showToast(`Fish names ${this.showNames ? 'shown' : 'hidden'}!`);
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  checkBreeding(fishId) {
    const fish = document.getElementById(`fish_${fishId}`);
    if (!fish || fish.dataset.canBreed !== 'true') return;

    const typeIndex = parseInt(fish.dataset.place);
    const fishType = GAME_CONFIG.fishTypes[typeIndex];
    const growth = document.getElementById(`growth_${fishId}`);
    const currentHunger = parseFloat(fish.dataset.hunger);

    // Only fully grown and well-fed fish can breed
    if (!growth || parseInt(growth.dataset.growth) < 100 || currentHunger < GAME_CONFIG.minHungerToBreed) return;

    // Check if fish is on breeding cooldown
    if (this.breedingCooldowns.has(fishId)) {
      const cooldownEnd = this.breedingCooldowns.get(fishId);
      if (Date.now() < cooldownEnd) return;
      this.breedingCooldowns.delete(fishId);
    }

    // Find nearby compatible fish
    const nearbyFish = this.findNearbyFish(fish);
    for (const nearbyFishElement of nearbyFish) {
      const nearbyTypeIndex = parseInt(nearbyFishElement.dataset.place);
      const nearbyType = GAME_CONFIG.fishTypes[nearbyTypeIndex].name;

      if (fishType.compatibleWith.includes(nearbyType)) {
        const nearbyGrowth = document.getElementById(`growth_${nearbyFishElement.dataset.id}`);
        if (!nearbyGrowth || parseInt(nearbyGrowth.dataset.growth) < 100) continue;

        // Check if nearby fish is on breeding cooldown
        const nearbyId = parseInt(nearbyFishElement.dataset.id);
        if (this.breedingCooldowns.has(nearbyId)) {
          const cooldownEnd = this.breedingCooldowns.get(nearbyId);
          if (Date.now() < cooldownEnd) continue;
          this.breedingCooldowns.delete(nearbyId);
        }

        // Start breeding process
        this.startBreeding(fish, nearbyFishElement);
        break;
      }
    }
  }

  findNearbyFish(fish) {
    const nearbyFish = [];
    const fishRect = fish.getBoundingClientRect();
    const fishCenter = {
      x: fishRect.left + fishRect.width / 2,
      y: fishRect.top + fishRect.height / 2
    };

    document.querySelectorAll('.fish').forEach(otherFish => {
      if (otherFish.id === fish.id) return;

      const otherRect = otherFish.getBoundingClientRect();
      const otherCenter = {
        x: otherRect.left + otherRect.width / 2,
        y: otherRect.top + otherRect.height / 2
      };

      const distance = Math.sqrt(
        Math.pow(fishCenter.x - otherCenter.x, 2) +
        Math.pow(fishCenter.y - otherCenter.y, 2)
      );

      if (distance <= GAME_CONFIG.breedingDistance) {
        nearbyFish.push(otherFish);
      }
    });

    return nearbyFish;
  }

  startBreeding(fish1, fish2) {
    const fish1Id = parseInt(fish1.dataset.id);
    const fish2Id = parseInt(fish2.dataset.id);
    const fish1Type = GAME_CONFIG.fishTypes[parseInt(fish1.dataset.place)];
    const fish2Type = fish2.dataset.type;

    // Calculate meeting point between the two fish
    const fish1Rect = fish1.getBoundingClientRect();
    const fish2Rect = fish2.getBoundingClientRect();
    const meetX = (fish1Rect.left + fish2Rect.left) / 2;
    const meetY = (fish1Rect.top + fish2Rect.top) / 2;
    const tank = document.getElementById('fish_tank');
    const tankRect = tank.getBoundingClientRect();

    // Convert to tank-relative coordinates
    const targetX = meetX - tankRect.left;
    const targetY = meetY - tankRect.top;

    // Show breeding indicators with hearts animation
    const createHearts = (fishElement) => {
      for (let i = 0; i < 3; i++) {
        const heart = document.createElement('div');
        heart.className = 'breeding-heart';
        heart.innerHTML = '❤️';
        heart.style.left = `${fishElement.offsetLeft + fishElement.offsetWidth / 2}px`;
        heart.style.top = `${fishElement.offsetTop}px`;
        heart.style.animationDelay = `${i * 0.3}s`;
        tank.appendChild(heart);

        // Remove heart after animation
        setTimeout(() => heart.remove(), 2000);
      }
    };

    // Show breeding indicators
    fish1.querySelector('.breeding-indicator').classList.remove('hidden');
    fish2.querySelector('.breeding-indicator').classList.remove('hidden');
    createHearts(fish1);
    createHearts(fish2);

    // Add glowing effect to breeding fish
    fish1.classList.add('breeding');
    fish2.classList.add('breeding');

    // Move both fish to the meeting point
    const animation1 = this.moveToTarget(fish1, fish1.dataset.type, targetX - 30, targetY);
    const animation2 = this.moveToTarget(fish2, fish2.dataset.type, targetX + 30, targetY);

    // Set breeding cooldowns
    this.breedingCooldowns.set(fish1Id, Date.now() + GAME_CONFIG.breedingCooldown);
    this.breedingCooldowns.set(fish2Id, Date.now() + GAME_CONFIG.breedingCooldown);

    // Show breeding tooltip
    this.showStatusTooltip(fish1, 'love', '❤️ Breeding...');
    this.showStatusTooltip(fish2, 'love', '❤️ Breeding...');

    // Create offspring after breeding animation
    setTimeout(() => {
      // Hide breeding indicators and remove effects
      fish1.querySelector('.breeding-indicator').classList.add('hidden');
      fish2.querySelector('.breeding-indicator').classList.add('hidden');
      fish1.classList.remove('breeding');
      fish2.classList.remove('breeding');

      // Restart movement for both parent fish
      this.startFishMovement(fish1Id, fish1.dataset.type);
      this.startFishMovement(fish2Id, fish2.dataset.type);

      // Determine offspring type
      const offspringType = fish1Type.offspringTypes[fish2Type];
      const offspringIndex = GAME_CONFIG.fishTypes.findIndex(type => type.name === offspringType);

      if (offspringIndex === -1) return;

      // Generate a random name for the offspring
      const baseName = offspringType.replace(/_/g, ' ');
      const randomNum = Math.floor(Math.random() * 1000);
      const offspringName = `Baby ${baseName} ${randomNum}`;

      // Store the offspring details
      this.pendingFish = {
        type: offspringType,
        typeIndex: offspringIndex,
        position: { x: targetX, y: targetY }
      };

      // Create celebration effect
      const celebration = document.createElement('div');
      celebration.className = 'breeding-celebration';
      celebration.style.left = `${targetX}px`;
      celebration.style.top = `${targetY}px`;
      celebration.innerHTML = '🎉';
      tank.appendChild(celebration);

      // Create the offspring
      this.createFish(offspringName);

      // Remove celebration after animation
      setTimeout(() => celebration.remove(), 2000);

      // Show new fish tooltip
      const newFish = document.getElementById(`fish_${this.fishId}`);
      if (newFish) {
        this.showStatusTooltip(newFish, 'success', '🎉 New fish born!');
      }

      this.showToast('A new fish has been born! 🎉', 'success');
    }, 5000);
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
        const foodConfig = GAME_CONFIG.foodTypes.find(f => f.name === foodType);

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
    const tank = document.getElementById('fish_tank');
    const pellet = document.createElement('div');
    pellet.className = `food-pellet ${foodType.split('_')[0]}`;
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

  resetGame() {
    // Clear localStorage
    localStorage.removeItem('fishGameState');

    // Remove all fish
    const fishTank = document.getElementById('fish_tank');
    const fish = fishTank.querySelectorAll('.fish');
    fish.forEach(f => f.remove());

    // Reset game state
    this.fishId = 0;
    this.decorationId = 0;
    this.coins = 500;
    this.showNames = false;
    this.activeModal = null;
    this.pendingFish = null;
    this.breedingCooldowns = new Map();
    this.selectedFood = null;
    this.selectedFishId = null;
    this.decorations = new Map();

    // Update UI
    this.updateCoins();
    this.closeModal('settingsModal');
    this.showToast('Game reset complete!', 'success');
  }

  setupEventListeners() {
    // Menu buttons
    const addFishButton = document.getElementById('addFishButton');
    const settingsButton = document.getElementById('settingsButton');

    if (addFishButton) {
      addFishButton.addEventListener('click', () => this.openModal('addFishModal'));
    }

    if (settingsButton) {
      settingsButton.addEventListener('click', () => this.openModal('settingsModal'));
    }

    // Input form submission
    const inputForm = document.getElementById('inputForm');
    if (inputForm) {
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('fishNameInput');
        if (input && input.value.trim()) {
          this.createFish(input.value.trim());
        }
      });
    }

    // Close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
      const modal = button.closest('.modal');
      if (modal) {
        button.addEventListener('click', () => this.closeModal(modal.id));
      }
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Toggle names button
    const toggleNamesButton = document.querySelector('.toggle-names');
    if (toggleNamesButton) {
      toggleNamesButton.addEventListener('click', () => this.toggleNames());
    }

    // Sell fish button
    const sellFishButton = document.getElementById('sellFish');
    if (sellFishButton) {
      sellFishButton.addEventListener('click', () => this.sellFish());
    }

    // Reset game button
    const resetButton = document.querySelector('.reset-game');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
          this.resetGame();
        }
      });
    }

    // Add food system event listeners
    this.setupFoodSystem();
  }

  generatePassiveIncome() {
    const now = Date.now();
    const timeDiff = now - this.lastIncomeTime;

    // Only generate income every 5 seconds
    if (timeDiff < 5000) return;

    const fishElements = document.querySelectorAll('.fish');
    let totalIncome = 0;

    fishElements.forEach(fish => {
      const growth = document.getElementById(`growth_${fish.dataset.id}`);
      if (!growth || parseInt(growth.dataset.growth) < 100) return;

      const typeIndex = parseInt(fish.dataset.place);
      const fishType = GAME_CONFIG.fishTypes[typeIndex];
      const valueBonus = parseFloat(fish.dataset.valueBonus) || 0;

      // Base income is 1% of the fish's full grown price per 5 seconds
      const baseIncome = Math.ceil(fishType.fullGrownPrice * 0.01);
      const bonusIncome = Math.ceil(baseIncome * (1 + valueBonus));

      totalIncome += bonusIncome;

      // Show floating income number
      if (totalIncome > 0) {
        this.showFloatingIncome(fish, bonusIncome);
      }
    });

    if (totalIncome > 0) {
      this.coins += totalIncome;
      this.updateCoins();
    }

    this.lastIncomeTime = now;
  }

  showFloatingIncome(fish, amount) {
    const incomeText = document.createElement('div');
    incomeText.className = 'floating-income';
    incomeText.innerHTML = `+${amount} <i class="fas fa-coins"></i>`;

    // Position it above the fish
    const fishRect = fish.getBoundingClientRect();
    incomeText.style.left = `${fish.offsetLeft + fishRect.width / 2}px`;
    incomeText.style.top = `${fish.offsetTop}px`;

    document.getElementById('fish_tank').appendChild(incomeText);

    // Animate and remove
    incomeText.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-20px)', opacity: 0 }
      ],
      { duration: 1000, easing: 'ease-out' }
    ).onfinish = () => incomeText.remove();
  }

  setupDecorationSystem() {
    const decorationsButton = document.getElementById('decorationsButton');
    if (decorationsButton) {
      decorationsButton.addEventListener('click', () => this.openModal('decorationsModal'));
    }

    // Setup category filters
    document.querySelectorAll('.category-filter').forEach(filter => {
      filter.addEventListener('click', () => {
        document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        this.filterDecorations(filter.dataset.category);
      });
    });

    this.createDecorationGrid();
    this.setupDecorationDragging();
  }

  createDecorationGrid() {
    const grid = document.querySelector('.decoration-grid');
    if (!grid) return;

    grid.innerHTML = '';
    GAME_CONFIG.decorations.forEach(decoration => {
      const item = document.createElement('div');
      item.className = 'decoration-item';
      item.dataset.name = decoration.name;

      const preview = document.createElement('div');
      preview.className = `decoration-preview ${decoration.name}`;

      const info = document.createElement('div');
      info.className = 'decoration-info';

      const name = document.createElement('div');
      name.className = 'decoration-name';
      name.textContent = decoration.displayName;

      const price = document.createElement('div');
      price.className = 'decoration-price';
      price.innerHTML = `<i class="fas fa-coins"></i> ${decoration.price}`;

      const bonuses = document.createElement('div');
      bonuses.className = 'decoration-bonuses';
      const bonusText = Object.entries(decoration.bonuses)
        .map(([key, value]) => `+${value * 100}% ${key}`)
        .join(', ');
      bonuses.textContent = bonusText;

      info.appendChild(name);
      info.appendChild(price);
      info.appendChild(bonuses);
      item.appendChild(preview);
      item.appendChild(info);

      item.addEventListener('click', () => this.purchaseDecoration(decoration));
      grid.appendChild(item);
    });
  }

  purchaseDecoration(decoration) {
    if (this.coins < decoration.price) {
      this.showToast('Not enough coins!', 'error');
      return;
    }

    // Store the decoration info and wait for placement
    this.pendingDecoration = decoration;
    this.closeModal('decorationsModal');
    this.showToast('Click in the tank to place your decoration!', 'info');

    // Add one-time click handler for placement
    const tank = document.getElementById('fish_tank');
    const placeDecoration = (e) => {
      const rect = tank.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.coins -= decoration.price;
      this.updateCoins();
      this.decorationId++;

      const decorationElement = document.createElement('div');
      decorationElement.className = `decoration ${decoration.name}`;
      decorationElement.id = `decoration_${this.decorationId}`;
      decorationElement.style.width = `${decoration.width}px`;
      decorationElement.style.height = `${decoration.height}px`;

      // Add bonus area indicator
      const bonusArea = document.createElement('div');
      bonusArea.className = 'bonus-area';
      bonusArea.style.width = `${decoration.width * 3}px`;
      bonusArea.style.height = `${decoration.width * 3}px`;
      bonusArea.style.left = `-${decoration.width}px`;
      bonusArea.style.top = `-${decoration.width}px`;
      decorationElement.appendChild(bonusArea);

      // Position at click location
      decorationElement.style.left = `${Math.max(0, Math.min(x - decoration.width / 2, tank.clientWidth - decoration.width))}px`;
      decorationElement.style.top = `${Math.max(0, Math.min(y - decoration.height / 2, tank.clientHeight - decoration.height))}px`;

      tank.appendChild(decorationElement);
      this.decorations.set(this.decorationId, {
        id: this.decorationId,
        type: decoration.name,
        position: {
          left: decorationElement.style.left,
          top: decorationElement.style.top
        },
        bonuses: decoration.bonuses
      });

      this.setupDecorationDragging();
      this.showToast(`Added ${decoration.displayName} to your tank!`, 'success');
      this.saveGameState();

      // Remove the click handler
      tank.removeEventListener('click', placeDecoration);
      this.pendingDecoration = null;
    };

    tank.addEventListener('click', placeDecoration);
  }

  setupDecorationDragging() {
    const decorations = document.querySelectorAll('.decoration');
    const tank = document.getElementById('fish_tank');

    decorations.forEach(decoration => {
      if (decoration.getAttribute('data-draggable')) return;
      decoration.setAttribute('data-draggable', 'true');

      // Add sell button
      const sellButton = document.createElement('button');
      sellButton.className = 'sell-button';
      sellButton.innerHTML = '×';
      decoration.appendChild(sellButton);

      let isDragging = false;
      let startX, startY;
      let initialLeft, initialTop;

      decoration.addEventListener('mousedown', (e) => {
        if (e.target === sellButton) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = decoration.offsetLeft;
        initialTop = decoration.offsetTop;

        decoration.style.cursor = 'grabbing';
      });

      const handleMouseMove = (e) => {
        if (!isDragging) return;

        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const newLeft = initialLeft + dx;
        const newTop = initialTop + dy;

        // Constrain to tank boundaries
        const maxX = tank.clientWidth - decoration.clientWidth;
        const maxY = tank.clientHeight - decoration.clientHeight;

        decoration.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
        decoration.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
      };

      const handleMouseUp = () => {
        if (!isDragging) return;

        isDragging = false;
        decoration.style.cursor = 'grab';

        // Update decoration position in game state
        const decorationId = parseInt(decoration.id.split('_')[1]);
        const decorationData = this.decorations.get(decorationId);
        if (decorationData) {
          decorationData.position = {
            left: decoration.style.left,
            top: decoration.style.top
          };
          this.saveGameState();
        }
      };

      // Add sell button click handler
      sellButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const decorationId = parseInt(decoration.id.split('_')[1]);
        const decorationData = this.decorations.get(decorationId);
        if (!decorationData) return;

        const decorationType = GAME_CONFIG.decorations.find(d => d.name === decorationData.type);
        if (!decorationType) return;

        const sellPrice = Math.floor(decorationType.price * 0.5);
        this.coins += sellPrice;
        this.updateCoins();
        decoration.remove();
        this.decorations.delete(decorationId);
        this.saveGameState();
        this.showToast(`Sold ${decorationType.displayName} for ${sellPrice} coins!`, 'success');
      });

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  updateDecorationPosition(decoration) {
    const id = parseInt(decoration.id.split('_')[1]);
    const decorationData = this.decorations.get(id);
    if (decorationData) {
      decorationData.position = {
        left: decoration.style.left,
        top: decoration.style.top
      };
      this.saveGameState();
    }
  }

  filterDecorations(category) {
    const grid = document.querySelector('.decoration-grid');
    if (!grid) return;

    grid.querySelectorAll('.decoration-item').forEach(item => {
      const decoration = GAME_CONFIG.decorations.find(d => d.name === item.dataset.name);
      if (category === 'all' || decoration.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  getDecorationBonuses(fish) {
    const bonuses = {
      growth: 0,
      breeding: 0,
      value: 0
    };

    const fishRect = fish.getBoundingClientRect();
    const fishCenter = {
      x: fishRect.left + fishRect.width / 2,
      y: fishRect.top + fishRect.height / 2
    };

    // Remove any existing bonus indicators
    fish.querySelectorAll('.active-bonus, .bonus-tooltip').forEach(indicator => indicator.remove());

    // Track active decorations for tooltip
    const activeDecorations = [];

    this.decorations.forEach(decoration => {
      const decorElement = document.getElementById(`decoration_${decoration.id}`);
      if (!decorElement) return;

      const decorRect = decorElement.getBoundingClientRect();
      const decorCenter = {
        x: decorRect.left + decorRect.width / 2,
        y: decorRect.top + decorRect.height / 2
      };

      const distance = Math.sqrt(
        Math.pow(fishCenter.x - decorCenter.x, 2) +
        Math.pow(fishCenter.y - decorCenter.y, 2)
      );

      // Check if fish is within bonus area (1.5x decoration width)
      if (distance <= decorRect.width * 1.5) {
        activeDecorations.push({
          name: GAME_CONFIG.decorations.find(d => d.name === decoration.type).displayName,
          bonuses: decoration.bonuses
        });

        Object.entries(decoration.bonuses).forEach(([key, value]) => {
          bonuses[key] += value;
        });
      }
    });

    if (activeDecorations.length > 0) {
      // Create bonus indicator
      const indicator = document.createElement('div');
      indicator.className = 'active-bonus';

      // Add stack count if multiple decorations
      if (activeDecorations.length > 1) {
        const stackCount = document.createElement('div');
        stackCount.className = 'stack-count';
        stackCount.textContent = activeDecorations.length;
        indicator.appendChild(stackCount);
      }

      // Create tooltip with detailed bonus information
      const tooltip = document.createElement('div');
      tooltip.className = 'bonus-tooltip';

      // Format bonus text
      const bonusText = Object.entries(bonuses)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => `+${(value * 100).toFixed(0)}% ${key}`)
        .join(', ');

      const decorationsList = activeDecorations
        .map(d => d.name)
        .join(', ');

      tooltip.textContent = `${decorationsList}: ${bonusText}`;

      // Position indicator and tooltip
      indicator.style.left = `${fishRect.width / 2}px`;
      indicator.style.top = `-${fishRect.height + 10}px`;

      fish.appendChild(indicator);
      fish.appendChild(tooltip);
    }

    return bonuses;
  }

  findNearestHungryFish(x, y) {
    let nearestFish = null;
    let minDistance = Infinity;

    document.querySelectorAll('.fish').forEach(fish => {
      const hunger = parseFloat(fish.dataset.hunger);
      if (hunger < 100) {
        const fishRect = fish.getBoundingClientRect();
        const tankRect = document.getElementById('fish_tank').getBoundingClientRect();
        const fishX = fishRect.left - tankRect.left + fishRect.width / 2;
        const fishY = fishRect.top - tankRect.top + fishRect.height / 2;
        const distance = Math.sqrt(Math.pow(x - fishX, 2) + Math.pow(y - fishY, 2));

        if (distance < minDistance) {
          minDistance = distance;
          nearestFish = fish;
        }
      }
    });

    return nearestFish;
  }

  animateFishToFood(fish, pellet, foodType) {
    const foodConfig = GAME_CONFIG.foodTypes.find(f => f.name === foodType);
    if (!foodConfig) return;

    const fishRect = fish.getBoundingClientRect();
    const pelletRect = pellet.getBoundingClientRect();
    const tankRect = document.getElementById('fish_tank').getBoundingClientRect();

    // Calculate relative positions
    const fishX = fishRect.left - tankRect.left;
    const fishY = fishRect.top - tankRect.top;
    const pelletX = pelletRect.left - tankRect.left;
    const pelletY = pelletRect.top - tankRect.top;

    // Add slight random offset to prevent fish clustering
    const targetX = pelletX + (Math.random() - 0.5) * 20;
    const targetY = pelletY + (Math.random() - 0.5) * 20;

    // Update fish direction
    if (targetX > fishX) {
      fish.classList.remove('left');
      fish.classList.add('right');
    } else {
      fish.classList.remove('right');
      fish.classList.add('left');
    }

    // Move fish to food
    this.moveToTarget(fish, fish.dataset.type, targetX, targetY, () => {
      // Remove pellet
      pellet.classList.add('eaten');
      setTimeout(() => pellet.remove(), 300);

      // Update fish stats
      const currentHunger = parseFloat(fish.dataset.hunger);
      const newHunger = Math.min(100, currentHunger + foodConfig.hungerRestored);
      fish.dataset.hunger = newHunger.toString();

      if (foodConfig.growthBonus) {
        fish.dataset.growthBonus = foodConfig.growthBonus.toString();
      }

      if (foodConfig.valueBonus) {
        fish.dataset.valueBonus = foodConfig.valueBonus.toString();
      }

      // Update stats if the modal is open for this fish
      if (this.activeModal === 'fishStatsModal' && fish.dataset.id === document.getElementById('sellFish').dataset.id) {
        this.updateFishStats(fish.dataset.id, parseInt(fish.dataset.place));
      }

      // Show feeding effects
      this.showFeedingEffects(fish, foodConfig);

      // Resume normal movement
      this.startFishMovement(fish.dataset.id, fish.dataset.type);
    });
  }

  showFeedingEffects(fish, foodConfig) {
    const effectsDiv = document.createElement('div');
    effectsDiv.className = 'feeding-effects';

    const effects = [];
    if (foodConfig.hungerRestored) effects.push(`+${foodConfig.hungerRestored} Hunger`);
    if (foodConfig.growthBonus) effects.push(`+${foodConfig.growthBonus * 100}% Growth`);
    if (foodConfig.valueBonus) effects.push(`+${foodConfig.valueBonus * 100}% Value`);
    if (foodConfig.breedingBonus) effects.push(`+${foodConfig.breedingBonus * 100}% Breeding`);

    effectsDiv.textContent = effects.join(', ');
    effectsDiv.style.left = `${fish.offsetLeft}px`;
    effectsDiv.style.top = `${fish.offsetTop - 20}px`;

    document.getElementById('fish_tank').appendChild(effectsDiv);

    // Animate and remove
    setTimeout(() => {
      effectsDiv.style.opacity = '0';
      effectsDiv.style.transform = 'translateY(-20px)';
      setTimeout(() => effectsDiv.remove(), 500);
    }, 1500);
  }

  showStatusTooltip(fish, type, message) {
    // Remove any existing status tooltips
    const existingTooltip = fish.querySelector('.status-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = `status-tooltip ${type}`;
    tooltipDiv.textContent = message;

    // Position the tooltip above the fish
    tooltipDiv.style.left = `${fish.offsetWidth / 2}px`;
    tooltipDiv.style.top = `-30px`;

    fish.appendChild(tooltipDiv);

    // Remove tooltip after animation
    setTimeout(() => {
      if (tooltipDiv.parentNode === fish) {
        tooltipDiv.classList.add('fade-out');
        setTimeout(() => tooltipDiv.remove(), 500);
      }
    }, 2000);
  }
}

// Initialize game and expose it globally for testing
const game = new FishGame();
window.game = game;

// Add some testing utilities
window.testUtils = {
  setCoins: (amount) => {
    game.coins = Math.max(0, amount);
    game.updateCoins();
    game.showToast(`Set coins to ${amount}`, 'info');
  },
  addCoins: (amount) => {
    game.updateCoins(amount);
    game.showToast(`Added ${amount} coins`, 'info');
  },
  resetCooldowns: () => {
    game.breedingCooldowns.clear();
    game.showToast('Reset all breeding cooldowns', 'info');
  },
  maxGrowth: (fishId) => {
    const growth = document.getElementById(`growth_${fishId}`);
    if (growth) {
      growth.style.width = '100%';
      growth.dataset.growth = '100';
      game.showToast(`Maximized growth for fish ${fishId}`, 'info');
    }
  },
  maxHunger: (fishId) => {
    const fish = document.getElementById(`fish_${fishId}`);
    if (fish) {
      fish.dataset.hunger = '100';
      game.showToast(`Maximized hunger for fish ${fishId}`, 'info');
    }
  }
};

// Log testing instructions to console
console.log(`
Fish Tank Testing Utilities Available:
- game: The main game instance
- testUtils.setCoins(amount): Set coins to specific amount
- testUtils.addCoins(amount): Add coins (negative to subtract)
- testUtils.resetCooldowns(): Reset all breeding cooldowns
- testUtils.maxGrowth(fishId): Set fish growth to 100%
- testUtils.maxHunger(fishId): Set fish hunger to 100%

Example usage:
testUtils.setCoins(1000)
testUtils.addCoins(500)
testUtils.resetCooldowns()
testUtils.maxGrowth(1)
testUtils.maxHunger(1)
`);
