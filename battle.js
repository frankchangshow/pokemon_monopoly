/**
 * battle.js - Pokemon Turn-based Battle Engine
 * Handles move execution, type matchups, CPU AI, logs, Terastallization, and resolution callbacks.
 */

import { PokemonDB, PokemonBattleStats } from './assets.js?v=42';
import { Sound } from './sound.js?v=42';

const ALL_STATS = ["hp", "attack", "defense", "specialAttack", "specialDefense", "speed"];
const PLAYER_MIN_MOVE_POWER = 30;
const PLAYER_DAMAGE_MULTIPLIER = 1.3;
const ENEMY_DAMAGE_MULTIPLIER = 0.65;
const PHYSICAL_TYPES = new Set(["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel"]);
const SPECIAL_TYPES = new Set(["Fire", "Water", "Electric", "Grass", "Ice", "Psychic", "Dragon", "Dark", "Fairy"]);
const STATUS_MOVE_NAMES = new Set([
  "Glare", "Leer", "String Shot", "Hone Claws", "Work Up", "Worry Seed"
]);
const STATUS_EFFECTS_BY_MOVE = {
  "Ember": [{ target: "defender", status: "burn", chance: 0.1 }],
  "Fire Fang": [{ target: "defender", status: "burn", chance: 0.1 }],
  "Flame Wheel": [{ target: "defender", status: "burn", chance: 0.1 }],
  "Glare": [{ target: "defender", status: "paralysis", chance: 1 }],
  "Gunk Shot": [{ target: "defender", status: "poison", chance: 0.3 }],
  "Poison Jab": [{ target: "defender", status: "poison", chance: 0.3 }],
  "Sludge Wave": [{ target: "defender", status: "poison", chance: 0.1 }],
  "Spark": [{ target: "defender", status: "paralysis", chance: 0.3 }],
  "Thunder Shock": [{ target: "defender", status: "paralysis", chance: 0.1 }]
};
const STAT_EFFECTS_BY_MOVE = {
  "Acid Spray": [{ target: "defender", stat: "specialDefense", amount: -2, chance: 1 }],
  "Aqua Step": [{ target: "attacker", stat: "speed", amount: 1, chance: 1 }],
  "Close Combat": [
    { target: "attacker", stat: "defense", amount: -1, chance: 1 },
    { target: "attacker", stat: "specialDefense", amount: -1, chance: 1 }
  ],
  "Hone Claws": [
    { target: "attacker", stat: "attack", amount: 1, chance: 1 },
    { target: "attacker", stat: "accuracy", amount: 1, chance: 1 }
  ],
  "Leer": [{ target: "defender", stat: "defense", amount: -1, chance: 1 }],
  "Metal Claw": [{ target: "attacker", stat: "attack", amount: 1, chance: 0.1 }],
  "Mud-Slap": [{ target: "defender", stat: "accuracy", amount: -1, chance: 1 }],
  "Overheat": [{ target: "attacker", stat: "specialAttack", amount: -2, chance: 1 }],
  "Play Rough": [{ target: "defender", stat: "attack", amount: -1, chance: 0.1 }],
  "Shadow Ball": [{ target: "defender", stat: "specialDefense", amount: -1, chance: 0.2 }],
  "String Shot": [{ target: "defender", stat: "speed", amount: -1, chance: 1 }],
  "Torch Song": [{ target: "attacker", stat: "specialAttack", amount: 1, chance: 1 }],
  "Work Up": [
    { target: "attacker", stat: "attack", amount: 1, chance: 1 },
    { target: "attacker", stat: "specialAttack", amount: 1, chance: 1 }
  ]
};
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
  startBattle(playerPokemonName, enemyPokemonName, isTrainerBattle, spaceId, challengerIdx, ownerIdx, playerLevel, enemyLevel, playerPowerUpgrades, enemyPowerUpgrades, onComplete, playerMoves = null, enemyMoves = null, playerTraining = null, enemyTraining = null) {
    const playerBase = PokemonDB[playerPokemonName];
    const enemyBase = PokemonDB[enemyPokemonName];

    if (!playerBase || !enemyBase) {
      console.error("Invalid Pokemon names for battle:", playerPokemonName, enemyPokemonName);
      return;
    }

    const playerStats = this.createBattleStats(playerBase, playerLevel, playerTraining);
    const enemyStats = this.createBattleStats(enemyBase, enemyLevel, enemyTraining);

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
      // In this board-game flow, the human side should get the first decision.
      // Speed still matters through stats/effects, but losing before acting feels bad.
      turn: 0,
      logs: [],
      onComplete
    };

    this.log(`A battle started! Your ${playerPokemonName} vs Wild ${enemyPokemonName}!`);
    if (isTrainerBattle) {
      this.activeBattle.logs = [];
      this.log(`Trainer Battle initiated! Challenge for rent discount!`);
    }

    // Defensive guard if future rules reintroduce enemy opening turns.
    if (this.activeBattle.turn === 1) {
      setTimeout(() => this.executeEnemyTurn(battleId), 1000);
    }
  }

  log(msg) {
    if (this.activeBattle) {
      this.activeBattle.logs.push(msg);
    }
  }

  shouldLogBattleNote(note) {
    return Boolean(note) && !["physical", "special", "status"].includes(note) && !note.includes("/");
  }

  createStatStages() {
    return { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
  }

  createBattleStats(base, level, training = null) {
    const source = PokemonBattleStats[base.name];
    const rawStats = source?.stats || this.inferBaseStats(base);
    const types = source?.types || [base.type || "Normal"];
    const boundedLevel = Math.max(1, Math.min(100, Number(level) || 1));
    const calculated = {};
    for (const stat of ALL_STATS) {
      calculated[stat] = this.calculateStat(rawStats[stat], boundedLevel, stat === "hp");
    }
    if (training) {
      calculated.hp += Math.max(0, Number(training.hp) || 0);
      calculated.attack += Math.max(0, Number(training.attack) || 0);
      calculated.defense += Math.max(0, Number(training.defense) || 0);
      calculated.speed += Math.max(0, Number(training.speed) || 0);
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

  getAdjustedMovePower(attacker, move) {
    const rawPower = Math.max(0, Number(move.power) || 0);
    if (!rawPower) return 0;
    if (this.activeBattle && attacker === this.activeBattle.player) {
      return Math.max(rawPower, PLAYER_MIN_MOVE_POWER);
    }
    return rawPower;
  }

  getSideDamageMultiplier(attacker) {
    if (!this.activeBattle) return 1;
    if (attacker === this.activeBattle.player) return PLAYER_DAMAGE_MULTIPLIER;
    if (attacker === this.activeBattle.enemy) return ENEMY_DAMAGE_MULTIPLIER;
    return 1;
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

    const movePower = this.getAdjustedMovePower(attacker, move);
    const base = (((2 * attacker.level / 5 + 2) * movePower * attack / Math.max(1, defense)) / 50) + 2;
    let damage = base * this.getStabMultiplier(attacker, move) * effectiveness;
    if (attacker.powerUpgrades) damage *= (1 + attacker.powerUpgrades * 0.2);
    if (attacker.terastallized) damage *= 1.15;
    damage *= this.getSideDamageMultiplier(attacker);
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

  applyMoveEffects(attacker, defender, move, effectiveness = 1) {
    if (effectiveness === 0) return [];
    const events = [];
    const resolveTarget = target => target === "attacker" ? attacker : defender;
    const resolveSide = target => target === "attacker" ? "attacker" : "defender";

    for (const effect of STATUS_EFFECTS_BY_MOVE[move.name] || []) {
      if (Math.random() > (effect.chance ?? 1)) continue;
      const target = resolveTarget(effect.target);
      if (target.status) {
        events.push({
          kind: "status-blocked",
          target: resolveSide(effect.target),
          targetName: target.name,
          status: target.status,
          text: `${target.name} already has a status condition!`
        });
        continue;
      }
      target.status = effect.status;
      events.push({
        kind: "status",
        target: resolveSide(effect.target),
        targetName: target.name,
        status: effect.status,
        text: `${target.name} was ${this.formatStatusApplied(effect.status)}!`
      });
    }

    for (const effect of STAT_EFFECTS_BY_MOVE[move.name] || []) {
      if (Math.random() > (effect.chance ?? 1)) continue;
      const target = resolveTarget(effect.target);
      const current = target.statStages[effect.stat] || 0;
      const next = Math.max(-6, Math.min(6, current + effect.amount));
      if (next === current) {
        events.push({
          kind: "stat-blocked",
          target: resolveSide(effect.target),
          targetName: target.name,
          stat: effect.stat,
          amount: 0,
          text: `${target.name}'s ${this.formatStatName(effect.stat)} won't go ${effect.amount > 0 ? "higher" : "lower"}!`
        });
        continue;
      }
      target.statStages[effect.stat] = next;
      events.push({
        kind: "stat",
        target: resolveSide(effect.target),
        targetName: target.name,
        stat: effect.stat,
        amount: next - current,
        text: `${target.name}'s ${this.formatStatName(effect.stat)} ${effect.amount > 0 ? "rose" : "fell"}!`
      });
    }

    return events;
  }

  formatStatusApplied(status) {
    if (status === "burn") return "burned";
    if (status === "poison") return "poisoned";
    if (status === "paralysis") return "paralyzed";
    return status;
  }

  formatStatName(stat) {
    const labels = {
      attack: "Attack",
      defense: "Defense",
      specialAttack: "Sp. Atk",
      specialDefense: "Sp. Def",
      speed: "Speed",
      accuracy: "Accuracy",
      evasion: "Evasion"
    };
    return labels[stat] || stat;
  }

  terastallizePlayer() {
    if (!this.activeBattle || this.activeBattle.player.terastallized) return;
    this.activeBattle.player.terastallized = true;
    this.log(`✨ Your ${this.activeBattle.player.name} Terastallized! Its ${this.activeBattle.player.type} type moves are powered up!`);
    Sound.playHitSuperEffective();
  }

  applyBattleItemToPlayer(item) {
    if (!this.activeBattle || !item) return { ok: false, message: "No active battle." };
    const player = this.activeBattle.player;
    if (item.heal) {
      const before = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + item.heal);
      const healed = player.hp - before;
      if (healed <= 0) return { ok: false, message: `${player.name} is already at full HP.` };
      this.log(`🧪 ${player.name} used ${item.name} and restored ${healed} HP!`);
      return { ok: true, message: `${player.name} restored ${healed} HP!` };
    }

    const changes = item.stats || (item.stat ? [{ stat: item.stat, amount: item.amount || 1 }] : []);
    if (!changes.length) return { ok: false, message: `${item.name} cannot be used in battle.` };
    changes.forEach(change => {
      player.statStages[change.stat] = Math.max(-6, Math.min(6, (player.statStages[change.stat] || 0) + change.amount));
    });
    const label = changes.map(change => `${change.stat} ${change.amount > 0 ? "+" : ""}${change.amount}`).join(", ");
    this.log(`🧪 ${player.name} used ${item.name}! ${label}`);
    return { ok: true, message: `${item.name} boosted ${player.name}!` };
  }

  executePlayerMove(moveIdx) {
    if (!this.activeBattle || this.activeBattle.turn !== 0) return;

    const move = this.activeBattle.player.moves[moveIdx];
    const player = this.activeBattle.player;
    const enemy = this.activeBattle.enemy;
    if (!move) return;

    if (!this.moveHits(player, enemy, move)) {
      this.log(`${player.name} used ${move.name}, but it missed!`);
      if (this.onMoveExecuted) this.onMoveExecuted("player", "enemy", move, 1, 0, { missed: true, effects: [] });
      this.activeBattle.turn = 1;
      const battleId = this.activeBattle.id;
      setTimeout(() => this.executeEnemyTurn(battleId), 1000);
      return;
    }

    const { damage, effectiveness, notes } = this.calculateDamage(player, enemy, move);
    enemy.hp = Math.max(0, enemy.hp - damage);
    const effectEvents = this.applyMoveEffects(player, enemy, move, effectiveness);

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
    [...notes, ...effectEvents.map(event => event.text)].filter(note => this.shouldLogBattleNote(note)).forEach(note => this.log(`• ${note}`));

    // Trigger callback to handle visuals/audio in UI
    if (this.onMoveExecuted) {
      this.onMoveExecuted("player", "enemy", move, effectiveness, damage, { missed: false, effects: effectEvents });
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

    // Choose move (AI favors stronger moves, or pick random)
    const move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
    if (!move) return;

    if (!this.moveHits(enemy, player, move)) {
      this.log(`Enemy ${enemy.name} used ${move.name}, but it missed!`);
      if (this.onMoveExecuted) this.onMoveExecuted("enemy", "player", move, 1, 0, { missed: true, effects: [] });
      this.activeBattle.turn = 0;
      return;
    }

    const { damage, effectiveness, notes } = this.calculateDamage(enemy, player, move);
    player.hp = Math.max(0, player.hp - damage);
    const effectEvents = this.applyMoveEffects(enemy, player, move, effectiveness);

    if (effectiveness > 1.0) {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! It's super effective! Your Pokemon took ${damage} damage.`);
    } else if (effectiveness === 0) {
      this.log(`🛡️ Enemy ${enemy.name} used ${move.name}! It had no effect on your Pokemon.`);
    } else if (effectiveness < 1.0) {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! It wasn't very effective... Your Pokemon took ${damage} damage.`);
    } else {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! Your Pokemon took ${damage} damage.`);
    }
    [...notes, ...effectEvents.map(event => event.text)].filter(note => this.shouldLogBattleNote(note)).forEach(note => this.log(`• ${note}`));

    // Trigger callback to handle visuals/audio in UI
    if (this.onMoveExecuted) {
      this.onMoveExecuted("enemy", "player", move, effectiveness, damage, { missed: false, effects: effectEvents });
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
    }, 3000);
  }

  reset() {
    this.activeBattle = null;
    this.battleSeq = 0;
  }
}

export const Battle = new BattleEngine();
export default Battle;
