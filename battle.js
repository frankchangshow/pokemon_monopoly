/**
 * battle.js - Pokemon Turn-based Battle Engine
 * Handles move execution, type matchups, CPU AI, logs, Terastallization, and resolution callbacks.
 */

import { PokemonDB } from './assets.js?v=27';
import { Sound } from './sound.js?v=27';

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

    const pMaxHp = playerBase.hp + (playerLevel - 1) * 15;
    const eMaxHp = enemyBase.hp + (enemyLevel - 1) * 15;

    const battleId = ++this.battleSeq;

    const pSpeed = playerBase.speed + (playerLevel - 1) * 2;
    const eSpeed = enemyBase.speed + (enemyLevel - 1) * 2;

    this.activeBattle = {
      id: battleId,
      player: {
        name: playerPokemonName,
        type: playerBase.type,
        maxHp: pMaxHp,
        hp: pMaxHp,
        moves: Array.isArray(playerMoves) && playerMoves.length >= 2 ? playerMoves : playerBase.moves,
        speed: pSpeed,
        level: playerLevel,
        powerUpgrades: playerPowerUpgrades || 0,
        terastallized: false
      },
      enemy: {
        name: enemyPokemonName,
        type: enemyBase.type,
        maxHp: eMaxHp,
        hp: eMaxHp,
        moves: Array.isArray(enemyMoves) && enemyMoves.length >= 2 ? enemyMoves : enemyBase.moves,
        speed: eSpeed,
        level: enemyLevel,
        powerUpgrades: enemyPowerUpgrades || 0,
        terastallized: false
      },
      isTrainerBattle,
      spaceId,
      challengerIdx,
      ownerIdx,
      turn: pSpeed >= eSpeed ? 0 : 1, // High speed goes first
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

  getTypeEffectiveness(attackType, defenseType) {
    const matchups = {
      Grass: { Water: 1.5, Fire: 0.5, Grass: 0.5, Ground: 1.5 },
      Fire: { Grass: 1.5, Water: 0.5, Fire: 0.5, Steel: 1.5 },
      Water: { Fire: 1.5, Grass: 0.5, Water: 0.5, Ground: 1.5, Rock: 1.5 },
      Electric: { Water: 1.5, Flying: 1.5, Electric: 0.5, Ground: 0 },
      Ground: { Fire: 1.5, Electric: 1.5, Grass: 0.5, Poison: 1.5, Rock: 1.5 },
      Poison: { Grass: 1.5, Poison: 0.5, Ground: 0.5, Fairy: 1.5, Steel: 0 },
      Fairy: { Fighting: 1.5, Poison: 0.5, Dark: 1.5, Steel: 0.5 },
      Steel: { Rock: 1.5, Ice: 1.5, Fairy: 1.5, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
      Normal: {}
    };

    if (matchups[attackType] && matchups[attackType][defenseType] !== undefined) {
      return matchups[attackType][defenseType];
    }
    return 1.0;
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

    // Calculate Damage
    let damage = move.power;
    const effectiveness = this.getTypeEffectiveness(move.type, enemy.type);
    damage *= effectiveness;

    // STAB (Same-Type Attack Bonus)
    if (move.type === player.type) {
      damage *= 1.5;
    }

    // Level scaling (+10% damage per level)
    damage *= (1 + (player.level - 1) * 0.1);

    // Power Upgrades (+20% damage per upgrade)
    if (player.powerUpgrades) {
      damage *= (1 + player.powerUpgrades * 0.2);
    }

    // Terastal boost
    if (player.terastallized) {
      damage *= 1.5;
    }

    // Add slight variance
    const variance = 0.85 + Math.random() * 0.3;
    damage = Math.max(1, Math.floor(damage * variance));

    enemy.hp = Math.max(0, enemy.hp - damage);

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

    // Calculate Damage
    let damage = move.power;
    const effectiveness = this.getTypeEffectiveness(move.type, player.type);
    damage *= effectiveness;

    // STAB
    if (move.type === enemy.type) {
      damage *= 1.5;
    }

    // Level scaling (+10% damage per level)
    damage *= (1 + (enemy.level - 1) * 0.1);

    // Power Upgrades (+20% damage per upgrade)
    if (enemy.powerUpgrades) {
      damage *= (1 + enemy.powerUpgrades * 0.2);
    }

    if (enemy.terastallized) {
      damage *= 1.5;
    }

    const variance = 0.85 + Math.random() * 0.3;
    damage = Math.max(1, Math.floor(damage * variance));

    player.hp = Math.max(0, player.hp - damage);

    if (effectiveness > 1.0) {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! It's super effective! Your Pokemon took ${damage} damage.`);
    } else if (effectiveness === 0) {
      this.log(`🛡️ Enemy ${enemy.name} used ${move.name}! It had no effect on your Pokemon.`);
    } else if (effectiveness < 1.0) {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! It wasn't very effective... Your Pokemon took ${damage} damage.`);
    } else {
      this.log(`💥 Enemy ${enemy.name} used ${move.name}! Your Pokemon took ${damage} damage.`);
    }

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
