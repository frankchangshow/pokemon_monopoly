/**
 * battle.js - Pokemon Turn-based Battle Engine
 * Handles move execution, type matchups, CPU AI, logs, Terastallization, and resolution callbacks.
 */

import { PokemonDB, PokemonBattleStats } from './assets.js?v=28';
import { Sound } from './sound.js?v=28';

const ALL_STATS = ["hp", "attack", "defense", "specialAttack", "specialDefense", "speed"];
const PHYSICAL_TYPES = new Set(["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel"]);
const SPECIAL_TYPES = new Set(["Fire", "Water", "Electric", "Grass", "Ice", "Psychic", "Dragon", "Dark", "Fairy"]);
const STATUS_MOVE_NAMES = new Set([
  "Glare", "Leer", "String Shot", "Hone Claws", "Work Up", "Worry Seed"
]);
const MOVE_CATEGORY_OVERRIDES = {
  "Absorb": "special",
  "Acid Spray": "special",
  "Aqua Jet": "physical",
  "Aqua Step": "physical",
  "Bite": "physical",
  "Bitter Blade": "physical",
  "Bug Bite": "physical",
  "Bullet Seed": "physical",
  "Close Combat": "physical",
  "Collision Course": "physical",
  "Dig": "physical",
  "Double Hit": "physical",
  "Double Kick": "physical",
  "Double Shock": "physical",
  "Dragon Claw": "physical",
  "Dragon Pulse": "special",
  "Drain Punch": "physical",
  "Drill Peck": "physical",
  "Earth Power": "special",
  "Earthquake": "physical",
  "Electro Drift": "special",
  "Ember": "special",
  "Fire Fang": "physical",
  "Flame Wheel": "physical",
  "Flip Turn": "physical",
  "Flower Trick": "physical",
  "Gigaton Hammer": "physical",
  "Glaive Rush": "physical",
  "Gunk Shot": "physical",
  "Hurricane": "special",
  "Hyper Drill": "physical",
  "Icicle Crash": "physical",
  "Iron Head": "physical",
  "Iron Tail": "physical",
  "Jet Punch": "physical",
  "Kowtow Cleave": "physical",
  "Leafage": "physical",
  "Liquidation": "physical",
  "Make It Rain": "special",
  "Metal Claw": "physical",
  "Mud-Slap": "special",
  "Overheat": "special",
  "Parabolic Charge": "special",
  "Play Rough": "physical",
  "Poison Jab": "physical",
  "Population Bomb": "physical",
  "Pound": "physical",
  "Power Gem": "special",
  "Quick Attack": "physical",
  "Rage Fist": "physical",
  "Razor Leaf": "physical",
  "Scratch": "physical",
  "Seed Bomb": "physical",
  "Shadow Ball": "special",
  "Shadow Claw": "physical",
  "Slash": "physical",
  "Sludge Wave": "special",
  "Spark": "physical",
  "Stomp": "physical",
  "Stone Edge": "physical",
  "Super Fang": "physical",
  "Tackle": "physical",
  "Thunder Shock": "special",
  "Torch Song": "special",
  "Twin Beam": "special",
  "Water Gun": "special",
  "Water Pulse": "special",
  "Wave Crash": "physical",
  "Wild Charge": "physical",
  "Wing Attack": "physical"
};

const TYPE_CHART = {
  Normal: { immune: ["Ghost"], resisted: ["Rock", "Steel"], strong: [] },
  Fire: { immune: [], resisted: ["Fire", "Water", "Rock", "Dragon"], strong: ["Grass", "Ice", "Bug", "Steel"] },
  Water: { immune: [], resisted: ["Water", "Grass", "Dragon"], strong: ["Fire", "Ground", "Rock"] },
  Electric: { immune: ["Ground"], resisted: ["Electric", "Grass", "Dragon"], strong: ["Water", "Flying"] },
  Grass: { immune: [], resisted: ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"], strong: ["Water", "Ground", "Rock"] },
  Ice: { immune: [], resisted: ["Fire", "Water", "Ice", "Steel"], strong: ["Grass", "Ground", "Flying", "Dragon"] },
  Fighting: { immune: ["Ghost"], resisted: ["Poison", "Flying", "Psychic", "Bug", "Fairy"], strong: ["Normal", "Ice", "Rock", "Dark", "Steel"] },
  Poison: { immune: ["Steel"], resisted: ["Poison", "Ground", "Rock", "Ghost"], strong: ["Grass", "Fairy"] },
  Ground: { immune: ["Flying"], resisted: ["Grass", "Bug"], strong: ["Fire", "Electric", "Poison", "Rock", "Steel"] },
  Flying: { immune: [], resisted: ["Electric", "Rock", "Steel"], strong: ["Grass", "Fighting", "Bug"] },
  Psychic: { immune: ["Dark"], resisted: ["Psychic", "Steel"], strong: ["Fighting", "Poison"] },
  Bug: { immune: [], resisted: ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"], strong: ["Grass", "Psychic", "Dark"] },
  Rock: { immune: [], resisted: ["Fighting", "Ground", "Steel"], strong: ["Fire", "Ice", "Flying", "Bug"] },
  Ghost: { immune: ["Normal"], resisted: ["Dark"], strong: ["Psychic", "Ghost"] },
  Dragon: { immune: ["Fairy"], resisted: ["Steel"], strong: ["Dragon"] },
  Dark: { immune: [], resisted: ["Fighting", "Dark", "Fairy"], strong: ["Psychic", "Ghost"] },
  Steel: { immune: [], resisted: ["Fire", "Water", "Electric", "Steel"], strong: ["Ice", "Rock", "Fairy"] },
  Fairy: { immune: [], resisted: ["Fire", "Poison", "Steel"], strong: ["Fighting", "Dragon", "Dark"] }
};

export class BattleEngine {
  constructor() {
    this.activeBattle = null;
    this.onMoveExecuted = null;
    this.battleSeq = 0;
  }

  // Start a new battle
  startBattle(playerPokemonName, enemyPokemonName, isTrainerBattle, spaceId, challengerIdx, ownerIdx, playerLevel, enemyLevel, playerPowerUpgrades, enemyPowerUpgrades, onComplete, playerMoves = null, enemyMoves = null) {
    const playerBase = PokemonDB[playerPokemonName];
    const enemyBase = PokemonDB[enemyPokemonName];

    if (!playerBase || !enemyBase) {
      console.error("Invalid Pokemon names for battle:", playerPokemonName, enemyPokemonName);
      return;
    }

    const playerStats = this.createBattleStats(playerBase, playerLevel);
    const enemyStats = this.createBattleStats(enemyBase, enemyLevel);

    const battleId = ++this.battleSeq;

    this.activeBattle = {
      id: battleId,
      player: {
        name: playerPokemonName,
        type: playerStats.types[0],
        types: playerStats.types,
        maxHp: playerStats.hp,
        hp: playerStats.hp,
        moves: this.normalizeMoves(Array.isArray(playerMoves) && playerMoves.length >= 2 ? playerMoves : playerBase.moves),
        stats: playerStats,
        statStages: this.createStatStages(),
        status: null,
        level: playerLevel,
        powerUpgrades: playerPowerUpgrades || 0,
        terastallized: false
      },
      enemy: {
        name: enemyPokemonName,
        type: enemyStats.types[0],
        types: enemyStats.types,
        maxHp: enemyStats.hp,
        hp: enemyStats.hp,
        moves: this.normalizeMoves(Array.isArray(enemyMoves) && enemyMoves.length >= 2 ? enemyMoves : enemyBase.moves),
        stats: enemyStats,
        statStages: this.createStatStages(),
        status: null,
        level: enemyLevel,
        powerUpgrades: enemyPowerUpgrades || 0,
        terastallized: false
      },
      isTrainerBattle,
      spaceId,
      challengerIdx,
      ownerIdx,
      turn: playerStats.speed >= enemyStats.speed ? 0 : 1, // High speed goes first
      logs: [],
      onComplete
    };

    this.log(`A battle started! Your ${playerPokemonName} vs Wild ${enemyPokemonName}!`);
    if (isTrainerBattle) {
      this.activeBattle.logs = [];
      this.log(`Trainer Battle initiated! Challenge for rent discount!`);
    }

    // If enemy goes first, schedule AI move
    if (this.activeBattle.turn === 1) {
      setTimeout(() => this.executeEnemyTurn(battleId), 1000);
    }
  }

  log(msg) {
    if (this.activeBattle) {
      this.activeBattle.logs.push(msg);
    }
  }

  createStatStages() {
    return { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
  }

  createBattleStats(base, level) {
    const source = PokemonBattleStats[base.name];
    const rawStats = source?.stats || this.inferBaseStats(base);
    const types = source?.types || [base.type || "Normal"];
    const boundedLevel = Math.max(1, Math.min(100, Number(level) || 1));
    const calculated = {};
    for (const stat of ALL_STATS) {
      calculated[stat] = this.calculateStat(rawStats[stat], boundedLevel, stat === "hp");
    }
    calculated.types = types;
    return calculated;
  }

  inferBaseStats(base) {
    const hp = Math.max(1, Math.round((base.hp || 100) * 0.65));
    const speed = Math.max(1, base.speed || 50);
    return {
      hp,
      attack: Math.max(1, Math.round(55 + ((base.hp || 100) - 100) * 0.25 + (speed - 50) * 0.15)),
      defense: Math.max(1, Math.round(55 + ((base.hp || 100) - 100) * 0.35 - (speed - 50) * 0.05)),
      specialAttack: Math.max(1, Math.round(55 + ((base.hp || 100) - 100) * 0.2)),
      specialDefense: Math.max(1, Math.round(55 + ((base.hp || 100) - 100) * 0.25)),
      speed
    };
  }

  calculateStat(baseStat, level, isHp = false) {
    const base = Math.max(1, Number(baseStat) || 1);
    if (isHp) {
      return Math.floor(((2 * base + 31) * level) / 100) + level + 10;
    }
    return Math.floor(((2 * base + 31) * level) / 100) + 5;
  }

  normalizeMoves(moves = []) {
    return moves.map(move => ({
      accuracy: 100,
      priority: 0,
      category: this.inferMoveCategory(move),
      ...move,
      category: move.category || this.inferMoveCategory(move)
    }));
  }

  inferMoveCategory(move) {
    if (!move || STATUS_MOVE_NAMES.has(move.name) || !move.power || move.power <= 0) return "status";
    if (move.category) return move.category;
    if (MOVE_CATEGORY_OVERRIDES[move.name]) return MOVE_CATEGORY_OVERRIDES[move.name];
    if (PHYSICAL_TYPES.has(move.type)) return "physical";
    if (SPECIAL_TYPES.has(move.type)) return "special";
    return "physical";
  }

  stageMultiplier(stage) {
    const bounded = Math.max(-6, Math.min(6, Number(stage) || 0));
    return bounded >= 0 ? (2 + bounded) / 2 : 2 / (2 - bounded);
  }

  accuracyMultiplier(stage) {
    const bounded = Math.max(-6, Math.min(6, Number(stage) || 0));
    return bounded >= 0 ? (3 + bounded) / 3 : 3 / (3 - bounded);
  }

  getBattleStat(pokemon, stat) {
    let value = pokemon.stats[stat] || 1;
    if (pokemon.statStages && stat in pokemon.statStages) {
      value *= this.stageMultiplier(pokemon.statStages[stat]);
    }
    if (stat === "attack" && pokemon.status === "burn") value *= 0.5;
    if (stat === "speed" && pokemon.status === "paralysis") value *= 0.5;
    return Math.max(1, Math.floor(value));
  }

  getDefensiveTypes(pokemon) {
    if (pokemon.terastallized) return [pokemon.type];
    return pokemon.types?.length ? pokemon.types : [pokemon.type || "Normal"];
  }

  getOffensiveTypes(pokemon) {
    const naturalTypes = pokemon.types?.length ? pokemon.types : [pokemon.type || "Normal"];
    if (!pokemon.terastallized) return naturalTypes;
    return [...new Set([...naturalTypes, pokemon.type])];
  }

  getTypeEffectiveness(attackType, defenseTypes) {
    const types = Array.isArray(defenseTypes) ? defenseTypes : [defenseTypes];
    const matchup = TYPE_CHART[attackType] || TYPE_CHART.Normal;
    let multiplier = 1;
    for (const defenseType of types) {
      if (matchup.immune.includes(defenseType)) return 0;
      if (matchup.strong.includes(defenseType)) multiplier *= 2;
      if (matchup.resisted.includes(defenseType)) multiplier *= 0.5;
    }
    return multiplier;
  }

  getStabMultiplier(attacker, move) {
    const offensiveTypes = this.getOffensiveTypes(attacker);
    if (!attacker.terastallized) return offensiveTypes.includes(move.type) ? 1.5 : 1;
    if (attacker.type === move.type && offensiveTypes.includes(move.type)) return 2;
    if (attacker.type === move.type) return 1.5;
    return offensiveTypes.includes(move.type) ? 1.5 : 1;
  }

  calculateDamage(attacker, defender, move) {
    const category = move.category || this.inferMoveCategory(move);
    if (category === "status" || !move.power) {
      return { damage: 0, effectiveness: 1, notes: ["status"] };
    }

    const attackStatName = category === "special" ? "specialAttack" : "attack";
    const defenseStatName = category === "special" ? "specialDefense" : "defense";
    const attack = this.getBattleStat(attacker, attackStatName);
    const defense = this.getBattleStat(defender, defenseStatName);
    const effectiveness = this.getTypeEffectiveness(move.type, this.getDefensiveTypes(defender));
    if (effectiveness === 0) return { damage: 0, effectiveness, notes: ["immune"] };

    const base = (((2 * attacker.level / 5 + 2) * move.power * attack / Math.max(1, defense)) / 50) + 2;
    let damage = base * this.getStabMultiplier(attacker, move) * effectiveness;
    if (attacker.powerUpgrades) damage *= (1 + attacker.powerUpgrades * 0.2);
    if (attacker.terastallized) damage *= 1.15;
    const variance = 0.85 + Math.random() * 0.3;
    damage = Math.max(1, Math.floor(damage * variance));
    return { damage, effectiveness, notes: [category, `${attackStatName}/${defenseStatName}`] };
  }

  moveHits(attacker, defender, move) {
    if (move.accuracy === null || move.accuracy === undefined) return true;
    const accuracyStage = (attacker.statStages?.accuracy || 0) - (defender.statStages?.evasion || 0);
    const modified = Math.max(1, Math.min(100, move.accuracy * this.accuracyMultiplier(accuracyStage)));
    return Math.random() * 100 < modified;
  }

  applyStatusMove(attacker, defender, move) {
    const name = move.name;
    const changes = [];
    if (name === "Leer") changes.push({ target: defender, stat: "defense", amount: -1 });
    if (name === "String Shot") changes.push({ target: defender, stat: "speed", amount: -1 });
    if (name === "Hone Claws") changes.push({ target: attacker, stat: "attack", amount: 1 }, { target: attacker, stat: "accuracy", amount: 1 });
    if (name === "Work Up") changes.push({ target: attacker, stat: "attack", amount: 1 }, { target: attacker, stat: "specialAttack", amount: 1 });
    if (name === "Glare" && !defender.status) {
      defender.status = "paralysis";
      return [`${defender.name} was paralyzed!`];
    }
    const notes = [];
    for (const change of changes) {
      change.target.statStages[change.stat] = Math.max(-6, Math.min(6, (change.target.statStages[change.stat] || 0) + change.amount));
      notes.push(`${change.target.name}'s ${change.stat} ${change.amount > 0 ? "rose" : "fell"}!`);
    }
    return notes.length ? notes : [`${attacker.name} used ${move.name}!`];
  }

  terastallizePlayer() {
    if (!this.activeBattle || this.activeBattle.player.terastallized) return;
    this.activeBattle.player.terastallized = true;
    this.log(`✨ Your ${this.activeBattle.player.name} Terastallized! Its ${this.activeBattle.player.type} type moves are powered up!`);
    Sound.playHitSuperEffective();
  }

  terastallizeEnemy() {
    if (!this.activeBattle || this.activeBattle.enemy.terastallized) return;
    this.activeBattle.enemy.terastallized = true;
    this.log(`✨ Opponent's ${this.activeBattle.enemy.name} Terastallized!`);
  }

  executePlayerMove(moveIdx) {
    if (!this.activeBattle || this.activeBattle.turn !== 0) return;

    const move = this.activeBattle.player.moves[moveIdx];
    const player = this.activeBattle.player;
    const enemy = this.activeBattle.enemy;
    if (!move) return;

    if (!this.moveHits(player, enemy, move)) {
      this.log(`${player.name} used ${move.name}, but it missed!`);
      if (this.onMoveExecuted) this.onMoveExecuted("player", "enemy", move, 1, 0);
      this.activeBattle.turn = 1;
      const battleId = this.activeBattle.id;
      setTimeout(() => this.executeEnemyTurn(battleId), 1000);
      return;
    }

    const { damage, effectiveness, notes } = this.calculateDamage(player, enemy, move);
    enemy.hp = Math.max(0, enemy.hp - damage);
    const statusNotes = damage === 0 && (move.category || this.inferMoveCategory(move)) === "status"
      ? this.applyStatusMove(player, enemy, move)
      : [];

    // Play sound effects
    if (effectiveness > 1.0) {
      this.log(`💥 ${player.name} used ${move.name}! It's super effective! Enemy took ${damage} damage.`);
    } else if (effectiveness === 0) {
      this.log(`🛡️ ${player.name} used ${move.name}! It had no effect on enemy.`);
    } else if (effectiveness < 1.0) {
      this.log(`💥 ${player.name} used ${move.name}! It wasn't very effective... Enemy took ${damage} damage.`);
    } else {
      this.log(`💥 ${player.name} used ${move.name}! Enemy took ${damage} damage.`);
    }
    [...notes, ...statusNotes].filter(note => note && !["physical", "special", "status"].includes(note)).forEach(note => this.log(`• ${note}`));

    // Trigger callback to handle visuals/audio in UI
    if (this.onMoveExecuted) {
      this.onMoveExecuted("player", "enemy", move, effectiveness, damage);
    }

    // Check Faint
    if (enemy.hp === 0) {
      this.resolveBattle(0); // Player wins
      return;
    }

    // Switch turn
    this.activeBattle.turn = 1;
    const battleId = this.activeBattle.id;
    setTimeout(() => this.executeEnemyTurn(battleId), 1000);
  }

  executeEnemyTurn(expectedBattleId = null) {
    if (!this.activeBattle || this.activeBattle.turn !== 1) return;
    if (expectedBattleId !== null && this.activeBattle.id !== expectedBattleId) return;

    const enemy = this.activeBattle.enemy;
    const player = this.activeBattle.player;

    // AI logic: 20% chance to Terastallize if HP is below 50%
    if (!enemy.terastallized && enemy.hp < enemy.maxHp * 0.5 && Math.random() < 0.3) {
      this.terastallizeEnemy();
    }

    // Choose move (AI favors stronger moves, or pick random)
    const moveIdx = Math.random() < 0.4 ? 1 : 0;
    const move = enemy.moves[moveIdx];
    if (!move) return;

    if (!this.moveHits(enemy, player, move)) {
      this.log(`Enemy ${enemy.name} used ${move.name}, but it missed!`);
      if (this.onMoveExecuted) this.onMoveExecuted("enemy", "player", move, 1, 0);
      this.activeBattle.turn = 0;
      return;
    }

    const { damage, effectiveness, notes } = this.calculateDamage(enemy, player, move);
    player.hp = Math.max(0, player.hp - damage);
    const statusNotes = damage === 0 && (move.category || this.inferMoveCategory(move)) === "status"
      ? this.applyStatusMove(enemy, player, move)
      : [];

    if (effectiveness > 1.0) {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! It's super effective! Your Pokemon took ${damage} damage.`);
    } else if (effectiveness === 0) {
      this.log(`🛡️ Enemy ${enemy.name} used ${move.name}! It had no effect on your Pokemon.`);
    } else if (effectiveness < 1.0) {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! It wasn't very effective... Your Pokemon took ${damage} damage.`);
    } else {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! Your Pokemon took ${damage} damage.`);
    }
    [...notes, ...statusNotes].filter(note => note && !["physical", "special", "status"].includes(note)).forEach(note => this.log(`• ${note}`));

    // Trigger callback to handle visuals/audio in UI
    if (this.onMoveExecuted) {
      this.onMoveExecuted("enemy", "player", move, effectiveness, damage);
    }

    if (player.hp === 0) {
      this.resolveBattle(1); // Enemy wins
      return;
    }

    this.activeBattle.turn = 0;
  }

  resolveBattle(winnerIdx) {
    const battle = this.activeBattle;
    if (!battle || battle.resolved) return;
    battle.resolved = true;
    battle.turn = -1; // Prevent any player moves during the exit delay
    
    if (winnerIdx === 0) {
      this.log(`🏆 Victory! Wild ${battle.enemy.name} fainted!`);
      Sound.playVictory();
    } else {
      this.log(`💀 Defeat! Your ${battle.player.name} fainted!`);
      Sound.playDefeat();
    }

    // Schedule exit transition
    setTimeout(() => {
      if (this.activeBattle && this.activeBattle.id === battle.id) {
        this.activeBattle = null;
      }
      battle.onComplete(winnerIdx === 0);
    }, 2500);
  }

  reset() {
    this.activeBattle = null;
    this.battleSeq = 0;
  }
}

export const Battle = new BattleEngine();
export default Battle;
