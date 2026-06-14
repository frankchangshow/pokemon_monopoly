/**
 * game.js - Monopoly Board Game Engine
 * Core state machine for player turns, board movements, real-estate, cards, trading, and mortgaging.
 */

import { BoardSpaces, AcademyCards, TeraRaidCards } from './assets.js?v=8';
import { Sound } from './sound.js?v=8';

export class GameEngine {
  constructor() {
    this.players = [];
    this.currentPlayerIdx = 0;
    this.spaces = JSON.parse(JSON.stringify(BoardSpaces)); // Deep copy spaces
    this.academyDeck = [...AcademyCards];
    this.teraRaidDeck = [...TeraRaidCards];
    this.logs = [];
    this.doubleRollCount = 0;
    this.dice = [1, 1];
    this.hasRolledThisTurn = false;
    
    // Board state
    this.ownership = {}; // spaceId -> playerIdx
    this.buildings = {}; // spaceId -> count (0-4: Camps, 5: Gym)
    this.mortgages = {}; // spaceId -> boolean

    // Shuffle decks
    this.shuffleDeck(this.academyDeck);
    this.shuffleDeck(this.teraRaidDeck);
  }

  // Initialize game with 4 players (1 human, 3 AI)
  initGame(humanName, starterPokemon) {
    this.players = [
      {
        id: 0,
        name: humanName || "Trainer",
        pokemon: starterPokemon,
        baseStarter: starterPokemon,
        level: 1,
        evolveStage: 0,
        cash: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        isAI: false,
        isBankrupt: false,
        color: "#E74C3C", // Red
        collection: [],
        powerUpgrades: 0,
        evolutionUpgrades: 0,
        bonusLevels: 0,
        pokemonLevelUps: {},
        passedGo: false
      },
      {
        id: 1,
        name: "Rival Nemona",
        pokemon: this.getRandomRivalPokemon(starterPokemon, 0),
        baseStarter: this.getRandomRivalPokemon(starterPokemon, 0),
        level: 1,
        evolveStage: 0,
        cash: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        isAI: true,
        isBankrupt: false,
        color: "#F1C40F", // Yellow
        collection: [],
        powerUpgrades: 0,
        evolutionUpgrades: 0,
        bonusLevels: 0,
        pokemonLevelUps: {},
        passedGo: false
      },
      {
        id: 2,
        name: "Director Clavell",
        pokemon: this.getRandomRivalPokemon(starterPokemon, 1),
        baseStarter: this.getRandomRivalPokemon(starterPokemon, 1),
        level: 1,
        evolveStage: 0,
        cash: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        isAI: true,
        isBankrupt: false,
        color: "#3498DB", // Blue
        collection: [],
        powerUpgrades: 0,
        evolutionUpgrades: 0,
        bonusLevels: 0,
        pokemonLevelUps: {},
        passedGo: false
      },
      {
        id: 3,
        name: "Penny",
        pokemon: this.getRandomRivalPokemon(starterPokemon, 2),
        baseStarter: this.getRandomRivalPokemon(starterPokemon, 2),
        level: 1,
        evolveStage: 0,
        cash: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        isAI: true,
        isBankrupt: false,
        color: "#8E44AD", // Purple
        collection: [],
        powerUpgrades: 0,
        evolutionUpgrades: 0,
        bonusLevels: 0,
        pokemonLevelUps: {},
        passedGo: false
      }
    ];

    this.currentPlayerIdx = 0;
    this.logs = [];
    this.doubleRollCount = 0;
    this.hasRolledThisTurn = false;
    this.ownership = {};
    this.buildings = {};
    this.mortgages = {};

    this.log("Game started! Good luck on your treasure hunt in Paldea!");
    Sound.playClick();
  }

  serializeState() {
    return {
      players: JSON.parse(JSON.stringify(this.players)),
      currentPlayerIdx: this.currentPlayerIdx,
      spaces: JSON.parse(JSON.stringify(this.spaces)),
      academyDeck: JSON.parse(JSON.stringify(this.academyDeck)),
      teraRaidDeck: JSON.parse(JSON.stringify(this.teraRaidDeck)),
      logs: [...this.logs],
      doubleRollCount: this.doubleRollCount,
      dice: [...this.dice],
      hasRolledThisTurn: this.hasRolledThisTurn,
      ownership: { ...this.ownership },
      buildings: { ...this.buildings },
      mortgages: { ...this.mortgages }
    };
  }

  loadState(state) {
    if (!state || !Array.isArray(state.players)) {
      throw new Error("Invalid save data.");
    }

    this.players = JSON.parse(JSON.stringify(state.players)).map((player) => ({
      jailFreeCards: 0,
      collection: [],
      powerUpgrades: 0,
      evolutionUpgrades: 0,
      bonusLevels: 0,
      pokemonLevelUps: {},
      passedGo: false,
      ...player
    }));
    this.currentPlayerIdx = Number.isInteger(state.currentPlayerIdx) ? state.currentPlayerIdx : 0;
    this.spaces = JSON.parse(JSON.stringify(state.spaces || BoardSpaces));
    this.academyDeck = JSON.parse(JSON.stringify(state.academyDeck || AcademyCards));
    this.teraRaidDeck = JSON.parse(JSON.stringify(state.teraRaidDeck || TeraRaidCards));
    this.logs = Array.isArray(state.logs) ? [...state.logs] : [];
    this.doubleRollCount = Number.isInteger(state.doubleRollCount) ? state.doubleRollCount : 0;
    this.dice = Array.isArray(state.dice) ? [...state.dice] : [1, 1];
    this.hasRolledThisTurn = !!state.hasRolledThisTurn;
    this.ownership = { ...(state.ownership || {}) };
    this.buildings = { ...(state.buildings || {}) };
    this.mortgages = { ...(state.mortgages || {}) };
  }

  getRandomRivalPokemon(starter, offset) {
    const list = ["Sprigatito", "Fuecoco", "Quaxly", "Pawmi"].filter(p => p !== starter);
    return list[offset % list.length];
  }

  recalculatePlayerStats(playerIdx) {
    const player = this.players[playerIdx];
    if (!player || player.isBankrupt) return;

    let totalCamps = 0;
    let totalGyms = 0;

    this.spaces.forEach(s => {
      if (this.ownership[s.id] === playerIdx) {
        const bCount = this.buildings[s.id] || 0;
        if (bCount === 5) {
          totalGyms++;
        } else {
          totalCamps += bCount;
        }
      }
    });

    const oldLevel = player.level;
    const oldPokemon = player.pokemon;

    // Level formula: 1 + camps + gyms * 3 + bonusLevels from trades + level ups from passing GO
    const starterLevelUps = player.pokemonLevelUps ? (player.pokemonLevelUps[player.baseStarter] || 0) : 0;
    player.level = 1 + totalCamps + (totalGyms * 3) + (player.bonusLevels || 0) + starterLevelUps;

    // Evolution logic based on total Gyms owned + evolutionUpgrades from trades
    const baseStage = (totalGyms >= 3) ? 2 : ((totalGyms >= 1) ? 1 : 0);
    const finalStage = Math.min(2, baseStage + (player.evolutionUpgrades || 0));
    player.evolveStage = finalStage;

    if (player.baseStarter === "Sprigatito") {
      if (finalStage === 2) {
        player.pokemon = "Meowscarada";
      } else if (finalStage === 1) {
        player.pokemon = "Floragato";
      } else {
        player.pokemon = "Sprigatito";
      }
    } else if (player.baseStarter === "Fuecoco") {
      if (finalStage === 2) {
        player.pokemon = "Skeledirge";
      } else if (finalStage === 1) {
        player.pokemon = "Crocalor";
      } else {
        player.pokemon = "Fuecoco";
      }
    } else if (player.baseStarter === "Quaxly") {
      if (finalStage === 2) {
        player.pokemon = "Quaquaval";
      } else if (finalStage === 1) {
        player.pokemon = "Quaxwell";
      } else {
        player.pokemon = "Quaxly";
      }
    } else if (player.baseStarter === "Pawmi") {
      if (finalStage === 2) {
        player.pokemon = "Pawmot";
      } else if (finalStage === 1) {
        player.pokemon = "Pawmo";
      } else {
        player.pokemon = "Pawmi";
      }
    }

    if (player.level !== oldLevel) {
      this.log(`📈 ${player.name}'s partner Level increased to Lv. ${player.level}!`);
    }

    if (player.pokemon !== oldPokemon) {
      this.log(`✨ What's this? ${player.name}'s ${oldPokemon} is evolving! It evolved into ${player.pokemon}!`);
    }
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  log(msg) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logs.unshift(`[${time}] ${msg}`);
    if (this.logs.length > 100) this.logs.pop();
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIdx];
  }

  nextTurn() {
    // Check if double rolled and user is allowed another turn
    if (this.isDouble() && this.doubleRollCount > 0 && this.doubleRollCount < 3 && !this.getCurrentPlayer().inJail && !this.getCurrentPlayer().isBankrupt) {
      this.hasRolledThisTurn = false;
      this.log(`${this.getCurrentPlayer().name} rolled doubles! Take another roll.`);
      return false; // Still same player's turn
    }

    this.doubleRollCount = 0;
    this.hasRolledThisTurn = false;
    
    // Find next active player
    let count = 0;
    do {
      this.currentPlayerIdx = (this.currentPlayerIdx + 1) % this.players.length;
      count++;
    } while (this.getCurrentPlayer().isBankrupt && count < this.players.length);

    this.log(`It's now ${this.getCurrentPlayer().name}'s turn.`);
    return true; // Turn shifted
  }

  isDouble() {
    return this.dice[0] === this.dice[1];
  }

  // Roll dice and move current player
  rollDice() {
    if (this.hasRolledThisTurn) return null;

    Sound.playDiceRoll();

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    this.dice = [die1, die2];
    this.hasRolledThisTurn = true;

    const player = this.getCurrentPlayer();
    this.log(`${player.name} rolled a ${die1} and a ${die2} (Total: ${die1 + die2}).`);

    if (this.isDouble()) {
      this.doubleRollCount++;
      if (this.doubleRollCount === 3) {
        this.log(`${player.name} rolled 3 doubles in a row! Sent straight to Principal Clavell's detention office.`);
        this.sendToJail(player);
        return { dice: this.dice, sentToJail: true };
      }
    } else {
      this.doubleRollCount = 0;
    }

    if (player.inJail) {
      if (this.isDouble()) {
        player.inJail = false;
        player.jailTurns = 0;
        this.log(`${player.name} rolled doubles and escaped detention!`);
        // Move immediately
        this.movePlayer(player, die1 + die2);
        return { dice: this.dice, escapedJail: true, spacesMoved: die1 + die2 };
      } else {
        player.jailTurns++;
        this.log(`${player.name} failed to roll doubles (Detention Turn ${player.jailTurns}/3).`);
        if (player.jailTurns >= 3) {
          this.log(`${player.name} has spent 3 turns in detention. Must pay ₽50 fine to leave.`);
          // Forced payment and movement are handled by the caller so the UI can animate the roll.
          return { dice: this.dice, jailFineRequired: true, spacesMoved: die1 + die2 };
        }
        return { dice: this.dice, stillInJail: true };
      }
    }

    const spacesMoved = die1 + die2;
    this.movePlayer(player, spacesMoved);
    return { dice: this.dice, spacesMoved };
  }

  movePlayer(player, steps) {
    const oldPos = player.position;
    let newPos = (oldPos + steps) % 40;
    
    // Check passing GO
    if (newPos < oldPos && steps > 0) {
      player.cash += 200;
      player.passedGo = true;
      this.log(`${player.name} passed GO and collected ₽200!`);
    }

    player.position = newPos;
  }

  sendToJail(player) {
    player.position = 10; // Detention Space
    player.inJail = true;
    player.jailTurns = 0;
    this.doubleRollCount = 0;
    this.hasRolledThisTurn = true; // Ends roll ability
    Sound.playJaildetention();
  }

  payJailFine(player) {
    if (player.cash >= 50) {
      player.cash -= 50;
      player.inJail = false;
      player.jailTurns = 0;
      this.log(`${player.name} paid ₽50 fine and left detention.`);
      return true;
    }
    return false;
  }

  useJailFreeCard(player) {
    if (player.jailFreeCards > 0) {
      player.jailFreeCards--;
      player.inJail = false;
      player.jailTurns = 0;
      this.log(`${player.name} used a Get Out of Detention Free card!`);
      return true;
    }
    return false;
  }

  // Get properties in a color group
  getGroupProperties(groupName) {
    return this.spaces.filter(s => s.group === groupName);
  }

  // Check if player owns all active properties of a color group
  ownsColorGroup(playerIdx, groupName) {
    if (groupName === "corner" || groupName === "card" || groupName === "tax") return false;
    const group = this.getGroupProperties(groupName);
    return group.every(s => this.ownership[s.id] === playerIdx && !this.mortgages[s.id]);
  }

  // Calculate current rent for a property
  calculateRent(spaceId) {
    const space = this.spaces[spaceId];
    if (space.type !== "property" && space.type !== "station" && space.type !== "utility") return 0;
    
    const ownerIdx = this.ownership[spaceId];
    if (ownerIdx === undefined || this.mortgages[spaceId]) return 0;

    if (space.type === "property") {
      const buildings = this.buildings[spaceId] || 0;
      
      // If unimproved, check if player owns complete color group
      if (buildings === 0) {
        const ownsAll = this.ownsColorGroup(ownerIdx, space.group);
        return ownsAll ? space.rent[0] * 2 : space.rent[0];
      }
      return space.rent[buildings];
    }

    if (space.type === "station") {
      // Find how many stations the owner owns
      const stations = this.spaces.filter(s => s.type === "station");
      const ownedCount = stations.filter(s => this.ownership[s.id] === ownerIdx && !this.mortgages[s.id]).length;
      return space.rent[Math.max(0, ownedCount - 1)];
    }

    if (space.type === "utility") {
      const utilities = this.spaces.filter(s => s.type === "utility");
      const ownedCount = utilities.filter(s => this.ownership[s.id] === ownerIdx && !this.mortgages[s.id]).length;
      
      // Rotom utilities: 4x dice sum for 1 utility, 10x for both
      const diceSum = this.dice[0] + this.dice[1];
      const multiplier = ownedCount === 2 ? 10 : 4;
      return diceSum * multiplier;
    }

    return 0;
  }

  buyProperty(playerIdx, spaceId, discountPercentage = 0) {
    const player = this.players[playerIdx];
    const space = this.spaces[spaceId];
    
    let cost = space.cost;
    if (discountPercentage > 0) {
      cost = Math.floor(cost * (1 - discountPercentage / 100));
    }

    if (player.cash >= cost) {
      player.cash -= cost;
      this.ownership[spaceId] = playerIdx;
      this.buildings[spaceId] = 0;
      this.log(`${player.name} bought ${space.name} (${space.pokemon}) for ₽${cost}!`);
      Sound.playBuyCamp();
      this.recalculatePlayerStats(playerIdx);
      return true;
    }
    return false;
  }

  payRent(payeeIdx, spaceId, discountPercentage = 0) {
    const payee = this.players[payeeIdx];
    const ownerIdx = this.ownership[spaceId];
    const owner = this.players[ownerIdx];
    
    let rent = this.calculateRent(spaceId);
    
    // Apply battle discounts / penalties
    if (discountPercentage > 0) {
      rent = Math.floor(rent * (1 - discountPercentage / 100));
      this.log(`Battle discount applied! Rent reduced by ${discountPercentage}%.`);
    } else if (discountPercentage < 0) {
      // Negative discount means increase (penalty)
      const multiplier = 1 + Math.abs(discountPercentage) / 100;
      rent = Math.floor(rent * multiplier);
      this.log(`Battle penalty applied! Rent increased to ${multiplier}x.`);
    }

    if (payee.cash >= rent) {
      payee.cash -= rent;
      owner.cash += rent;
      this.log(`${payee.name} paid ₽${rent} rent to ${owner.name} for ${this.spaces[spaceId].name}.`);
      return { success: true, rent };
    }
    
    return { success: false, rent }; // Triggers mortgage/bankruptcy menu
  }

  // Get user-friendly explanation of why a property can or cannot be upgraded
  getUpgradeStatus(playerIdx, spaceId) {
    const space = this.spaces[spaceId];
    if (!space) return { ready: false, message: "" };
    if (space.type !== "property") {
      return { ready: false, message: "This type of property (Taxi / Utility) cannot be upgraded." };
    }
    if (this.ownership[spaceId] !== playerIdx) {
      return { ready: false, message: "You do not own this property." };
    }
    if (this.mortgages[spaceId]) {
      return { ready: false, message: "This property is mortgaged. Unmortgage it first to upgrade." };
    }

    const currentCount = this.buildings[spaceId] || 0;
    if (currentCount === 5) {
      return { ready: false, message: "Already fully upgraded with a Gym Station." };
    }

    const groupProperties = this.getGroupProperties(space.group);
    
    // 1. Must own complete color group
    const missingProps = groupProperties.filter(s => this.ownership[s.id] !== playerIdx);
    if (missingProps.length > 0) {
      const missingNames = missingProps.map(s => s.name).join(", ");
      return { 
        ready: false, 
        message: `Must own all properties in the color group to upgrade. Missing: ${missingNames}` 
      };
    }

    // 2. Mortgaged group check
    const mortgagedProps = groupProperties.filter(s => this.mortgages[s.id]);
    if (mortgagedProps.length > 0) {
      const mortgagedNames = mortgagedProps.map(s => s.name).join(", ");
      return {
        ready: false,
        message: `Cannot upgrade: A property in this group is mortgaged (${mortgagedNames}).`
      };
    }

    const player = this.players[playerIdx];

    // 3. Upgrade to Gym check (if currently has 4 camps)
    if (currentCount === 4) {
      const underCamped = groupProperties.filter(s => (this.buildings[s.id] || 0) < 4);
      if (underCamped.length > 0) {
        const underNames = underCamped.map(s => s.name).join(", ");
        return {
          ready: false,
          message: `To upgrade to Gym Station, all other properties in this group must first have 4 Camps (need camps on: ${underNames}).`
        };
      }
      if (player.cash < space.houseCost) {
        return {
          ready: false,
          message: `Need ₽${space.houseCost} to upgrade to a Gym Station (You have ₽${player.cash}).`
        };
      }
      return {
        ready: true,
        message: `Ready to upgrade to a Pokémon Gym Station for ₽${space.houseCost}!`
      };
    }

    // 4. Upgrade camp check (currentCount is 0, 1, 2, 3)
    // Check even building rule
    const unevenProps = groupProperties.filter(s => (this.buildings[s.id] || 0) < currentCount);
    if (unevenProps.length > 0) {
      const unevenNames = unevenProps.map(s => s.name).join(", ");
      return {
        ready: false,
        message: `Must build evenly. Build camps on other properties first: ${unevenNames}.`
      };
    }

    if (player.cash < space.houseCost) {
      return {
        ready: false,
        message: `Need ₽${space.houseCost} to build a Camp (You have ₽${player.cash}).`
      };
    }

    const nextCamp = currentCount + 1;
    return {
      ready: true,
      message: `Ready to build Camp #${nextCamp} for ₽${space.houseCost}!`
    };
  }

  // Real estate upgrades (Building Camps/Gyms)
  canBuildCamp(playerIdx, spaceId) {
    const space = this.spaces[spaceId];
    if (space.type !== "property") return false;
    if (this.ownership[spaceId] !== playerIdx || this.mortgages[spaceId]) return false;

    // Must own complete color group
    if (!this.ownsColorGroup(playerIdx, space.group)) return false;

    const currentCount = this.buildings[spaceId] || 0;
    if (currentCount >= 4) return false;

    // Check even building rule: cannot build if this property would have more than 1 building difference
    const groupProperties = this.getGroupProperties(space.group);
    for (let s of groupProperties) {
      const bCount = this.buildings[s.id] || 0;
      if (currentCount > bCount) return false; // Must build evenly
    }

    const player = this.players[playerIdx];
    return player.cash >= space.houseCost;
  }

  buildCamp(playerIdx, spaceId) {
    if (!this.canBuildCamp(playerIdx, spaceId)) return false;
    const space = this.spaces[spaceId];
    const player = this.players[playerIdx];

    player.cash -= space.houseCost;
    this.buildings[spaceId] = (this.buildings[spaceId] || 0) + 1;
    this.log(`${player.name} set up a Camp on ${space.name} for ₽${space.houseCost}.`);
    Sound.playBuyCamp();
    this.recalculatePlayerStats(playerIdx);
    return true;
  }

  canBuildGym(playerIdx, spaceId) {
    const space = this.spaces[spaceId];
    if (space.type !== "property") return false;
    if (this.ownership[spaceId] !== playerIdx || this.mortgages[spaceId]) return false;

    const currentCount = this.buildings[spaceId] || 0;
    if (currentCount !== 4) return false; // Must have 4 camps first

    // Check even building rule: all other group properties must have at least 4 camps
    const groupProperties = this.getGroupProperties(space.group);
    for (let s of groupProperties) {
      const bCount = this.buildings[s.id] || 0;
      if (bCount < 4) return false;
    }

    const player = this.players[playerIdx];
    return player.cash >= space.houseCost;
  }

  buildGym(playerIdx, spaceId) {
    if (!this.canBuildGym(playerIdx, spaceId)) return false;
    const space = this.spaces[spaceId];
    const player = this.players[playerIdx];

    player.cash -= space.houseCost;
    this.buildings[spaceId] = 5; // 5 represents Gym (Hotel)
    this.log(`${player.name} upgraded Camp to a Pokémon Gym Station on ${space.name} for ₽${space.houseCost}!`);
    Sound.playBuyCamp();
    this.recalculatePlayerStats(playerIdx);
    return true;
  }

  // Sell upgrades (Sell Camps/Gyms for 50% refund)
  sellUpgrade(playerIdx, spaceId) {
    const bCount = this.buildings[spaceId] || 0;
    if (bCount === 0 || this.ownership[spaceId] !== playerIdx) return false;

    const space = this.spaces[spaceId];
    const refund = Math.floor(space.houseCost / 2);
    const player = this.players[playerIdx];

    player.cash += refund;
    this.buildings[spaceId] = bCount - 1;
    
    const itemSold = bCount === 5 ? "Gym Station" : "Camp";
    this.log(`${player.name} sold ${itemSold} on ${space.name} for ₽${refund}.`);
    this.recalculatePlayerStats(playerIdx);
    return true;
  }

  // Mortgage mechanics
  canMortgage(playerIdx, spaceId) {
    if (this.ownership[spaceId] !== playerIdx || this.mortgages[spaceId]) return false;
    
    // Cannot mortgage if there are buildings on the color group
    const space = this.spaces[spaceId];
    if (space.type === "property") {
      const groupProperties = this.getGroupProperties(space.group);
      const hasBuildings = groupProperties.some(s => (this.buildings[s.id] || 0) > 0);
      if (hasBuildings) return false;
    }
    return true;
  }

  mortgageProperty(playerIdx, spaceId) {
    if (!this.canMortgage(playerIdx, spaceId)) return false;
    const space = this.spaces[spaceId];
    const player = this.players[playerIdx];

    const value = Math.floor(space.cost / 2);
    player.cash += value;
    this.mortgages[spaceId] = true;
    this.log(`${player.name} mortgaged ${space.name} for ₽${value}.`);
    return true;
  }

  canUnmortgage(playerIdx, spaceId) {
    if (this.ownership[spaceId] !== playerIdx || !this.mortgages[spaceId]) return false;
    const space = this.spaces[spaceId];
    const cost = Math.floor((space.cost / 2) * 1.1); // 10% fee
    const player = this.players[playerIdx];
    return player.cash >= cost;
  }

  unmortgageProperty(playerIdx, spaceId) {
    if (!this.canUnmortgage(playerIdx, spaceId)) return false;
    const space = this.spaces[spaceId];
    const player = this.players[playerIdx];

    const cost = Math.floor((space.cost / 2) * 1.1);
    player.cash -= cost;
    this.mortgages[spaceId] = false;
    this.log(`${player.name} unmortgaged ${space.name} for ₽${cost}.`);
    return true;
  }

  // Draw card helper
  drawCard(type) {
    const deck = type === "academy" ? this.academyDeck : this.teraRaidDeck;
    const card = deck.shift();
    deck.push(card); // Recycle to bottom of deck
    return card;
  }

  // Resolve card effects
  resolveCard(playerIdx, card) {
    const player = this.players[playerIdx];
    this.log(`${player.name} drew card: "${card.text}"`);

    if (card.action === "money") {
      player.cash += card.val;
      // If negative money, caller will verify if player needs to mortgage
    } else if (card.action === "gotojail") {
      this.sendToJail(player);
    } else if (card.action === "jailfree") {
      player.jailFreeCards++;
    } else if (card.action === "moveto") {
      const steps = (card.val - player.position + 40) % 40;
      this.movePlayer(player, steps);
    } else if (card.action === "repairs") {
      // Calculate repairs based on total buildings owned
      let totalCost = 0;
      this.spaces.forEach((s) => {
        if (this.ownership[s.id] === playerIdx) {
          const bCount = this.buildings[s.id] || 0;
          if (bCount === 5) {
            totalCost += card.hotelVal;
          } else {
            totalCost += bCount * card.houseVal;
          }
        }
      });
      player.cash -= totalCost;
      this.log(`${player.name} paid ₽${totalCost} for repairs.`);
    }
  }

  // Check if player has assets to sell/mortgage to cover a debt
  getNetWorth(playerIdx) {
    const player = this.players[playerIdx];
    let value = player.cash;

    this.spaces.forEach((s) => {
      if (this.ownership[s.id] === playerIdx) {
        if (!this.mortgages[s.id]) {
          value += Math.floor(s.cost / 2); // Mortgage value
        }
        // Sell buildings
        const bCount = this.buildings[s.id] || 0;
        if (s.houseCost) {
          if (bCount === 5) {
            value += Math.floor(s.houseCost / 2) * 5;
          } else {
            value += Math.floor(s.houseCost / 2) * bCount;
          }
        }
      }
    });

    return value;
  }

  declareBankruptcy(bankruptPlayerIdx, creditorIdx) {
    const player = this.players[bankruptPlayerIdx];
    player.isBankrupt = true;
    player.cash = 0;
    this.log(`💥 ${player.name} went bankrupt!`);

    const hasCreditor = creditorIdx !== undefined && creditorIdx !== null;
    const creditor = hasCreditor ? this.players[creditorIdx] : null;

    // Hand over all assets
    this.spaces.forEach((s) => {
      if (this.ownership[s.id] === bankruptPlayerIdx) {
        if (hasCreditor) {
          this.ownership[s.id] = creditorIdx;
          this.buildings[s.id] = 0; // Buildings are demolished on bankruptcy hand-over
          this.mortgages[s.id] = false; // Creditor gets them clear or inherits mortgage? (Monopoly rule is inherit, but for gameplay simplicity we clear it)
          this.log(`${creditor.name} received ownership of ${s.name}.`);
        } else {
          // Handed to bank: set back to unowned
          delete this.ownership[s.id];
          this.buildings[s.id] = 0;
          this.mortgages[s.id] = false;
        }
      }
    });

    this.recalculatePlayerStats(bankruptPlayerIdx);
    if (hasCreditor) {
      this.recalculatePlayerStats(creditorIdx);
    }
  }

  normalizePokemonName(player, pokemonName) {
    if (!player) return pokemonName;
    const starterEvos = {
      "Sprigatito": ["Sprigatito", "Floragato", "Meowscarada"],
      "Fuecoco": ["Fuecoco", "Crocalor", "Skeledirge"],
      "Quaxly": ["Quaxly", "Quaxwell", "Quaquaval"],
      "Pawmi": ["Pawmi", "Pawmo", "Pawmot"]
    };
    for (const [baseStarter, evos] of Object.entries(starterEvos)) {
      if (evos.includes(pokemonName)) {
        return baseStarter; // map evolutions back to base starter name
      }
    }
    return pokemonName;
  }

  getPokemonLevel(player, pokemonName) {
    if (!player) return 1;
    const normName = this.normalizePokemonName(player, pokemonName);
    
    // Check if starter
    if (normName === player.baseStarter) {
      return player.level; // already includes camps, gyms, trades, and GO boosts
    }
    
    // Caught pokemon
    let baseLvl = 1;
    const space = this.spaces.find(s => s.pokemon === pokemonName);
    if (space) {
      baseLvl = Math.max(1, Math.floor(space.cost / 60));
    }
    const levelUps = player.pokemonLevelUps ? (player.pokemonLevelUps[normName] || 0) : 0;
    return baseLvl + levelUps;
  }

  degradeProperty(spaceId) {
    const space = this.spaces[spaceId];
    const bCount = this.buildings[spaceId] || 0;
    if (bCount > 0) {
      this.buildings[spaceId] = bCount - 1;
      const oldType = bCount === 5 ? "Gym Station" : "Camp";
      const newType = (bCount - 1) === 5 ? "Gym Station" : ((bCount - 1) > 0 ? `${bCount - 1} Camps` : "no upgrades");
      this.log(`${space.name}'s development degraded from ${oldType} to ${newType}!`);
      
      const ownerIdx = this.ownership[spaceId];
      if (ownerIdx !== undefined && ownerIdx !== null) {
        this.recalculatePlayerStats(ownerIdx);
      }
      return true;
    }
    return false;
  }

  transferPropertyOwnership(spaceId, newOwnerIdx) {
    const oldOwnerIdx = this.ownership[spaceId];
    const space = this.spaces[spaceId];
    const pokemonName = space.pokemon;

    this.ownership[spaceId] = newOwnerIdx;

    // Remove from old owner's collection
    if (oldOwnerIdx !== undefined && oldOwnerIdx !== null) {
      const oldOwner = this.players[oldOwnerIdx];
      if (oldOwner && oldOwner.collection) {
        oldOwner.collection = oldOwner.collection.filter(p => p !== pokemonName);
      }
      this.recalculatePlayerStats(oldOwnerIdx);
    }

    // Add to new owner's collection
    if (newOwnerIdx !== undefined && newOwnerIdx !== null) {
      const newOwner = this.players[newOwnerIdx];
      if (newOwner) {
        if (!newOwner.collection) newOwner.collection = [];
        if (!newOwner.collection.includes(pokemonName)) {
          newOwner.collection.push(pokemonName);
        }
      }
      this.recalculatePlayerStats(newOwnerIdx);
    }

    const newOwnerName = this.players[newOwnerIdx] ? this.players[newOwnerIdx].name : "the Bank";
    const oldOwnerName = this.players[oldOwnerIdx] ? this.players[oldOwnerIdx].name : "the Bank";
    this.log(`Ownership of ${space.name} (${space.pokemon}) transferred from ${oldOwnerName} to ${newOwnerName}!`);
  }
}
export default GameEngine;
