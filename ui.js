/**
 * ui.js - Frontend User Interface & Controller
 * Integrates assets, sounds, Monopoly engine, and Battle engine to render a dynamic comic-book game.
 */

import { PokemonSVGs, PokemonDB, BoardSpaces, SpecialSVGs } from './assets.js?v=42';
import { Sound } from './sound.js?v=42';
import { GameEngine, BattleItems } from './game.js?v=42';
import { Battle } from './battle.js?v=42';

window.Battle = Battle;

const ASSET_VERSION = "42";

const AVAILABLE_PNGS = [
  "sprigatito", "fuecoco", "quaxly", "pawmi",
  "floragato", "meowscarada", "crocalor", "skeledirge", "quaxwell", "quaquaval", "pawmo", "pawmot",
  "tinkaton", "ceruledge", "koraidon", "miraidon", "lechonk", "charcadet", "tinkatink", "fidough", "smoliv",
  "tarountula", "corviknight", "tandemaus", "rotom", "nacli", "orthworm", "toedscool", "capsakid", "grafaiai", "shroodle", "wattrel", "bellibolt",
  "dondozo", "tatsugiri", "veluza",
  "annihilape", "baxcalibur", "clodsire", "cyclizar", "dudunsparce", "farigiraf", "flamigo", "gholdengo", "glimmora", "kingambit", "maushold", "palafin",
  "oinkologne", "spidops", "dachsbun", "dolliv", "arboliva", "naclstack", "garganacl", "toedscruel", "scovillain", "kilowattrel", "tinkatuff", "armarouge",
  "tadbulb", "rookidee", "corvisquire", "finizen", "frigibax", "arctibax", "gimmighoul", "pawniard", "bisharp", "mankey", "primeape", "paldean wooper", "glimmet", "girafarig", "dunsparce",
  "sprigatito_tera", "fuecoco_tera", "quaxly_tera", "pawmi_tera",
  "floragato_tera", "meowscarada_tera", "crocalor_tera", "skeledirge_tera", "quaxwell_tera", "quaquaval_tera", "pawmo_tera", "pawmot_tera",
  "tinkaton_tera", "ceruledge_tera", "koraidon_tera", "miraidon_tera", "lechonk_tera", "charcadet_tera", "tinkatink_tera", "fidough_tera", "smoliv_tera",
  "tarountula_tera", "corviknight_tera", "tandemaus_tera", "rotom_tera", "nacli_tera", "orthworm_tera", "toedscool_tera", "capsakid_tera", "grafaiai_tera", "shroodle_tera", "wattrel_tera", "bellibolt_tera",
  "dondozo_tera", "tatsugiri_tera", "veluza_tera",
  "annihilape_tera", "baxcalibur_tera", "clodsire_tera", "cyclizar_tera", "dudunsparce_tera", "farigiraf_tera", "flamigo_tera", "gholdengo_tera", "glimmora_tera", "kingambit_tera", "maushold_tera", "palafin_tera",
  "oinkologne_tera", "spidops_tera", "dachsbun_tera", "dolliv_tera", "arboliva_tera", "naclstack_tera", "garganacl_tera", "toedscruel_tera", "scovillain_tera", "kilowattrel_tera", "tinkatuff_tera", "armarouge_tera",
  "tadbulb_tera", "rookidee_tera", "corvisquire_tera", "finizen_tera", "frigibax_tera", "arctibax_tera", "gimmighoul_tera", "pawniard_tera", "bisharp_tera", "mankey_tera", "primeape_tera", "paldean wooper_tera", "glimmet_tera", "girafarig_tera", "dunsparce_tera",
  "go_sprite", "jail_sprite", "free_parking_sprite", "go_to_jail_sprite",
  "go_full", "jail_full", "free_parking_full", "go_to_jail_full",
  "tera_raid_chest", "academy_class", "poke_mart_tax", "league_assessment_tax"
];

const SAVE_STORAGE_KEY = "pokemonMonopolySaveSlotsV1";
const SAVE_SLOT_COUNT = 3;
const MYSTERY_CATCH_SPACE_ID = "__mystery__";
const MYSTERY_POKEMON_POOL = [
  { name: "Finizen", title: "HERO SURF SURPRISE!", rarity: "Rare", cost: 260, trigger: "water" },
  { name: "Frigibax", title: "ICE DRAGON RUMBLE!", rarity: "Ultra Rare", cost: 360, trigger: "late" },
  { name: "Gimmighoul", title: "GOLDEN COIN GHOST!", rarity: "Ultra Rare", cost: 380, trigger: "money" },
  { name: "Pawniard", title: "CHECKMATE CHALLENGE!", rarity: "Rare", cost: 340, trigger: "battle" },
  { name: "Mankey", title: "RAGE FROM BEYOND!", rarity: "Rare", cost: 320, trigger: "loss" },
  { name: "Paldean Wooper", title: "MUDDY PALDEA FRIEND!", rarity: "Rare", cost: 250, trigger: "desert" },
  { name: "Cyclizar", title: "ROAMING ROADSTER!", rarity: "Rare", cost: 280, trigger: "travel" },
  { name: "Flamigo", title: "FLYING FLOCK FLASH!", rarity: "Rare", cost: 240, trigger: "travel" },
  { name: "Glimmet", title: "AREA ZERO CRYSTAL!", rarity: "Ultra Rare", cost: 360, trigger: "raid" },
  { name: "Girafarig", title: "TWIN-MIND OMEN!", rarity: "Rare", cost: 260, trigger: "academy" },
  { name: "Dunsparce", title: "ODD LITTLE LEGEND!", rarity: "Rare", cost: 220, trigger: "weird" },
  { name: "Maushold", title: "FAMILY SWARM EVENT!", rarity: "Rare", cost: 240, trigger: "swarm" }
];
const MYSTERY_QUIRKS = [
  { name: "Lucky", text: "+$50 when you catch it.", cashBonus: 50 },
  { name: "Brave", text: "Starts battles with +1 saved level.", levelBonus: 1 },
  { name: "Swift", text: "Fast nature: +1 saved level.", levelBonus: 1 },
  { name: "Guardian", text: "Great for defending property.", defenseBonus: 1 },
  { name: "Greedy", text: "+$100 when you catch it.", cashBonus: 100 },
  { name: "Tera-born", text: "Carries a Tera sparkle badge.", teraBorn: true },
  { name: "Collector", text: "Raises the next mystery odds.", pityBonus: 2 },
  { name: "Stubborn", text: "Rare collection trophy trait.", trophy: true }
];

class UIManager {
  constructor() {
    this.game = new GameEngine();
    this.selectedStarter = "Sprigatito";
    this.isMuted = false;
    this.selectedDeedId = null;
    this.combatAnimating = false;
    this.prevCash = [1500, 1500, 1500, 1500];
    this.activePassHandler = null;
    this.prevPlayerTera = false;
    this.prevEnemyTera = false;
    this.victoryShown = false;

    // DOM Elements Cache
    this.setupScreen = document.getElementById("setup-screen");
    this.gameContainer = document.getElementById("game-container");
    this.boardGrid = document.getElementById("board-grid");
    this.logsSection = document.getElementById("logs-section");
    this.logsToggleBtn = document.getElementById("logs-toggle-btn");
    this.logsToggleLabel = document.getElementById("logs-toggle-label");
    this.logsPanel = document.getElementById("logs-panel-box");
    this.trainerList = document.getElementById("trainer-list-box");
    this.statusDialog = document.getElementById("status-dialog");
    
    this.rollBtn = document.getElementById("roll-dice-btn");
    this.buyBtn = document.getElementById("buy-prop-btn");
    this.buildBtn = document.getElementById("build-btn");
    this.manageBtn = document.getElementById("manage-assets-btn");
    this.saveGameBtn = document.getElementById("save-game-btn");
    this.loadGameBtn = document.getElementById("load-game-btn");
    this.endBtn = document.getElementById("end-turn-btn");
    this.actionBox = document.querySelector(".action-box");
    
    this.die1 = document.getElementById("die-1");
    this.die2 = document.getElementById("die-2");
    this.diceZone = document.querySelector(".dice-zone");
    this.dashboardUtilities = document.getElementById("utility-menu-container");
    this.utilityPopupMenu = document.getElementById("utility-popup-menu");
    this.utilityMenuBtn = document.getElementById("utility-menu-btn");
    this.victoryOverlay = document.getElementById("victory-overlay");
    this.victoryConfetti = document.getElementById("victory-confetti");
    this.victorySubtitle = document.getElementById("victory-subtitle");
    this.victoryPartner = document.getElementById("victory-partner");
    this.victorySummaryGrid = document.getElementById("victory-summary-grid");
    this.victoryDefeated = document.getElementById("victory-defeated");
    this.victoryNewGameBtn = document.getElementById("victory-new-game-btn");
    
    // Encounter Sprite Elements
    this.encounterSpriteBox = document.getElementById("encounter-sprite-box");
    this.encounterSpriteImg = document.getElementById("encounter-sprite-img");
    this.encounterSpriteTitle = document.getElementById("encounter-sprite-title");
    this.encounterSpriteName = document.getElementById("encounter-sprite-name");
    this.isEncounterActive = false;
    
    this.muteBtn = document.getElementById("mute-btn");
    
    // Battle Modal DOM
    this.battleOverlay = document.getElementById("battle-overlay");
    this.playerPokeName = document.getElementById("player-poke-name");
    this.playerPokeTera = document.getElementById("player-poke-tera");
    this.playerHpBar = document.getElementById("player-hp-bar");
    this.playerHpText = document.getElementById("player-hp-text");
    this.playerBattleStats = document.getElementById("player-battle-stats");
    this.playerBattleSprite = document.getElementById("player-battle-sprite");
    
    this.enemyPokeName = document.getElementById("enemy-poke-name");
    this.enemyPokeTera = document.getElementById("enemy-poke-tera");
    this.enemyHpBar = document.getElementById("enemy-hp-bar");
    this.enemyHpText = document.getElementById("enemy-hp-text");
    this.enemyBattleStats = document.getElementById("enemy-battle-stats");
    this.enemyBattleSprite = document.getElementById("enemy-battle-sprite");
    
    this.battleMove0 = document.getElementById("move-btn-0");
    this.battleMove1 = document.getElementById("move-btn-1");
    this.battleMove2 = document.getElementById("move-btn-2");
    this.battleMove3 = document.getElementById("move-btn-3");
    this.battleItemBtn = document.getElementById("battle-item-btn");
    this.battleTeraBtn = document.getElementById("terastallize-btn");
    this.battleLogText = document.getElementById("battle-log-text");
    this.battleStatsToggleBtn = document.getElementById("battle-stats-toggle-btn");
    this.battleStatsOverlay = document.getElementById("battle-stats-overlay");
    this.battleStatsCloseBtn = document.getElementById("battle-stats-close-btn");
    this.battleItemOverlay = document.getElementById("battle-item-overlay");
    this.battleItemCloseBtn = document.getElementById("battle-item-close-btn");
    this.battleItemGrid = document.getElementById("battle-item-grid");
    this.playerBattleStats = document.getElementById("player-battle-stats");
    this.enemyBattleStats = document.getElementById("enemy-battle-stats");
    this.playerBattleStatsName = document.getElementById("player-battle-stats-name");
    this.enemyBattleStatsName = document.getElementById("enemy-battle-stats-name");

    // Pokemon Selection Modal DOM
    this.pokemonSelectionOverlay = document.getElementById("pokemon-selection-overlay");
    this.pokemonSelectionGrid = document.getElementById("pokemon-selection-grid");
    this.pokemonSelectionConfirmBtn = document.getElementById("pokemon-selection-confirm-btn");

    // Pokemon Level Up Modal DOM
    this.pokemonLevelupOverlay = document.getElementById("pokemon-levelup-overlay");
    this.pokemonLevelupGrid = document.getElementById("pokemon-levelup-grid");
    this.pokemonLevelupConfirmBtn = document.getElementById("pokemon-levelup-confirm-btn");

    // Deed card & Draw card modals
    this.deedOverlay = document.getElementById("deed-overlay");
    this.cardDrawOverlay = document.getElementById("card-draw-overlay");
    this.cardDrawTitle = document.getElementById("card-draw-title");
    this.cardDrawText = document.getElementById("card-draw-text");
    this.cardDrawOkBtn = document.getElementById("card-draw-ok-btn");

    // Save / Load DOM
    this.setupSaveSlots = document.getElementById("setup-save-slots");
    this.saveOverlay = document.getElementById("save-overlay");
    this.modalSaveSlots = document.getElementById("modal-save-slots");
    this.saveModalTitle = document.getElementById("save-modal-title");
    this.saveCloseBtn = document.getElementById("save-close-btn");
    this.saveOverlayMode = "save";

    // Catch mini-game DOM
    this.catchOverlay = document.getElementById("catch-overlay");
    this.catchPokemonSprite = document.getElementById("catch-pokemon-sprite");
    this.catchRingOuter = document.getElementById("catch-ring-outer");
    this.catchRingInner = document.getElementById("catch-ring-inner");
    this.pokeballProjectile = document.getElementById("pokeball-projectile");
    this.throwBallBtn = document.getElementById("throw-ball-btn");
    this.catchFeedback = document.getElementById("catch-feedback");
    
    this.ballBtnPoke = document.getElementById("ball-btn-poke");
    this.ballBtnGreat = document.getElementById("ball-btn-great");
    this.ballBtnUltra = document.getElementById("ball-btn-ultra");
    this.ballSelectionPanel = this.catchOverlay.querySelector(".ball-selection");

    // Sliding Bar DOM elements
    this.catchBarContainer = document.getElementById("catch-bar-container");
    this.catchBarSweetspot = document.getElementById("catch-bar-sweetspot");
    this.catchBarIndicator = document.getElementById("catch-bar-indicator");

    // Power Spam DOM elements
    this.catchSpamContainer = document.getElementById("catch-spam-container");
    this.catchSpamPrompt = document.getElementById("catch-spam-prompt");
    this.catchSpamFill = document.getElementById("catch-spam-fill");
    this.catchSpamTimer = document.getElementById("catch-spam-timer");

    // QTE Arrow Sequence DOM elements
    this.catchQteContainer = document.getElementById("catch-qte-container");
    this.catchQteSequence = document.getElementById("catch-qte-sequence");
    this.catchQteTimer = document.getElementById("catch-qte-timer");
    this.catchQteKeys = document.getElementById("catch-qte-keys");

    // Catch Game State variables
    this.catchSpaceId = null;
    this.selectedBall = "poke"; // poke, great, ultra
    this.ringProgress = 100;
    this.ringDirection = -1;
    this.ringSpeed = 1.5;
    this.isCatchAnimRunning = false;
    this.catchAnimationId = null;

    // New Mini-game State variables
    this.catchGameType = "circle"; // circle, bar, spam, qte
    this.hasCatchGameStarted = false;
    this.ballCostPaid = false;
    this.pendingCatchQuality = "Miss";

    // Sliding Bar state
    this.sliderProgress = 0;
    this.sliderDirection = 1;

    // Power Spam state
    this.spamProgress = 0;
    this.spamTimeLeft = 4.0;
    this.lastSpamFrameTime = 0;

    // QTE Sequence state
    this.qteSequence = [];
    this.qteCurrentIndex = 0;
    this.qteTimeLeft = 5.0;
    this.lastQteFrameTime = 0;
  }

  init() {
    this.renderStarterPreviews();
    this.renderSaveSlots();
    this.removeCenterSaveLoadControls();
    this.observeActionBoxForLegacySaveLoadControls();
    this.setupEventListeners();

    // Bind battle callback for combat animations & chiptune audio
    Battle.onMoveExecuted = (attacker, defender, move, effectiveness, damage, effectEvent) => {
      this.animateCombatMove(attacker, defender, move, effectiveness, damage, effectEvent);
    };
  }

  removeCenterSaveLoadControls() {
    if (!this.actionBox) return;
    const legacyButtons = this.actionBox.querySelectorAll("#quick-save-game-btn, #quick-load-game-btn, .btn-save-action, .btn-load-action");
    legacyButtons.forEach(button => button.remove());

    this.actionBox.querySelectorAll("button").forEach(button => {
      const label = button.innerText.trim().toUpperCase();
      if (label === "SAVE" || label === "LOAD") {
        button.remove();
      }
    });
  }

  observeActionBoxForLegacySaveLoadControls() {
    if (!this.actionBox || this.actionBoxSaveLoadObserver) return;
    this.actionBoxSaveLoadObserver = new MutationObserver(() => {
      this.removeCenterSaveLoadControls();
    });
    this.actionBoxSaveLoadObserver.observe(this.actionBox, { childList: true, subtree: true });
  }

  renderStarterPreviews() {
    document.getElementById("starter-svg-sprigatito").innerHTML = `<img src="images/sprigatito.png" alt="Sprigatito">`;
    document.getElementById("starter-svg-fuecoco").innerHTML = `<img src="images/fuecoco.png" alt="Fuecoco">`;
    document.getElementById("starter-svg-quaxly").innerHTML = `<img src="images/quaxly.png" alt="Quaxly">`;
    document.getElementById("starter-svg-pawmi").innerHTML = `<img src="images/pawmi.png" alt="Pawmi">`;
  }

  setupEventListeners() {
    // Starter Card Selection Click
    document.querySelectorAll(".starter-card").forEach(card => {
      card.addEventListener("click", (e) => {
        document.querySelectorAll(".starter-card").forEach(c => c.classList.remove("selected"));
        const target = e.currentTarget;
        target.classList.add("selected");
        this.selectedStarter = target.dataset.pokemon;
        Sound.playClick();
      });
    });

    // Start Game Button
    document.getElementById("start-game-btn").addEventListener("click", () => {
      const name = document.getElementById("trainer-name-input").value.trim() || "Florian";
      Battle.reset();
      this.game.initGame(name, this.selectedStarter);
      this.victoryShown = false;
      if (this.victoryOverlay) this.victoryOverlay.style.display = "none";
      
      this.setupScreen.style.display = "none";
      this.gameContainer.style.display = "grid";
      
      this.renderBoard();
      this.updateUI();
      
      // Request AudioContext activation
      Sound.init();
      Sound.playVictory();
    });

    // Roll Dice Button
    this.rollBtn.addEventListener("click", () => {
      if (this.game.hasRolledThisTurn) return;
      this.rollDiceSequence();
    });

    // End Turn Button
    this.endBtn.addEventListener("click", () => {
      if (this.activePassHandler) {
        this.activePassHandler();
        return;
      }
      if (this.endBtn.innerText !== "END TURN") return;
      
      const turnShifted = this.game.nextTurn();
      this.updateUI();
      const current = this.game.getCurrentPlayer();
      
      if (!turnShifted) {
        // Same player gets another turn (rolled doubles)
        this.setDialogText(`${current.name} rolled doubles! Take another roll.`);
        if (!current.isAI) {
          this.rollBtn.style.display = "inline-block";
        } else {
          setTimeout(() => this.executeAITurn(), 1500);
        }
      } else {
        this.setDialogText(`It's ${current.name}'s turn.`);
        if (current.isAI) {
          setTimeout(() => this.executeAITurn(), 1500);
        } else {
          this.rollBtn.style.display = "inline-block";
        }
      }
    });

    // Buy Property Button
    this.buyBtn.addEventListener("click", () => {
      const player = this.game.getCurrentPlayer();
      const pos = player.position;
      const space = this.game.spaces[pos];
      
      const discount = this.currentWildDiscount || 0;
      const purchaseCost = Math.floor(space.cost * (1 - discount / 100));
      const bought = this.game.buyProperty(player.id, pos, discount);
      if (!bought) {
        this.setDialogText(`Not enough money to buy ${space.name}. It costs $${purchaseCost}, but you only have $${player.cash}.`);
        this.game.log(`${player.name} could not afford ${space.name} (cost $${purchaseCost}, cash $${player.cash}).`);
        this.buyBtn.innerText = discount > 0 ? `CLAIM FREE ($${purchaseCost})` : `BUY AT FULL ($${space.cost})`;
        this.buyBtn.style.display = "inline-block";
        this.endBtn.innerText = "END TURN";
        this.endBtn.style.display = "inline-block";
        this.updateUI();
        this.buyBtn.style.display = "inline-block";
        return;
      }
      this.currentWildDiscount = 0;
      
      this.buyBtn.style.display = "none";
      this.endBtn.style.display = "inline-block";

      // Clean up encounter state if active
      if (this.isEncounterActive) {
        this.isEncounterActive = false;
        this.hideEncounterSprite();
        const wildBattleBtn = document.getElementById("wild-battle-btn");
        if (wildBattleBtn) wildBattleBtn.remove();
        const trainerBattleBtn = document.getElementById("trainer-battle-btn");
        if (trainerBattleBtn) trainerBattleBtn.remove();
        const payRentBtn = document.getElementById("pay-rent-btn");
        if (payRentBtn) payRentBtn.remove();
        this.activePassHandler = null; // Clear any pending pass handler
        this.endBtn.innerText = "END TURN";
      }

      this.setDialogText(`You bought ${space.name} (${space.pokemon}) for $${purchaseCost}!`);
      this.updateUI();
      this.maybeTriggerMysteryEncounter(player, "propertyClaim", () => {
        this.showColorSetUpgradePrompt(pos);
        this.endBtn.style.display = "inline-block";
      });
    });

    // Upgrade Buildings (Camps/Gyms)
    this.buildBtn.addEventListener("click", () => {
      Sound.playClick();
      this.showDeedsManagerModal("build");
    });

    // Mortgage / Asset Management
    this.manageBtn.addEventListener("click", () => {
      Sound.playClick();
      this.showDeedsManagerModal("mortgage");
    });

    this.saveGameBtn.addEventListener("click", () => {
      Sound.playClick();
      this.showSaveOverlay("save");
    });

    this.loadGameBtn.addEventListener("click", () => {
      Sound.playClick();
      this.showSaveOverlay("load");
    });

    // Toggle utility popup menu
    if (this.utilityMenuBtn && this.utilityPopupMenu) {
      this.utilityMenuBtn.addEventListener("click", (e) => {
        Sound.playClick();
        e.stopPropagation();
        const isShown = this.utilityPopupMenu.style.display === "flex";
        this.utilityPopupMenu.style.display = isShown ? "none" : "flex";
      });

      window.addEventListener("click", () => {
        this.utilityPopupMenu.style.display = "none";
      });

      this.utilityPopupMenu.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    if (this.setupSaveSlots) {
      this.setupSaveSlots.addEventListener("click", (e) => this.handleSaveSlotClick(e, "setup"));
    }

    if (this.modalSaveSlots) {
      this.modalSaveSlots.addEventListener("click", (e) => this.handleSaveSlotClick(e, "modal"));
    }

    if (this.saveCloseBtn) {
      this.saveCloseBtn.addEventListener("click", () => this.hideSaveOverlay());
    }

    if (this.saveOverlay) {
      this.saveOverlay.addEventListener("click", (e) => {
        if (e.target === this.saveOverlay) this.hideSaveOverlay();
      });
    }

    if (this.victoryNewGameBtn) {
      this.victoryNewGameBtn.addEventListener("click", () => {
        window.location.reload();
      });
    }

    // Deed Overlay Close
    this.deedOverlay.addEventListener("click", (e) => {
      if (e.target === this.deedOverlay) {
        this.deedOverlay.style.display = "none";
      }
    });

    // Mute sound toggle
    this.muteBtn.addEventListener("click", () => {
      const isMuted = Sound.toggleMute();
      this.muteBtn.innerText = isMuted ? "🔇" : "🔊";
    });

    // Battle options
    this.battleMove0.addEventListener("click", () => this.handlePlayerBattleMove(0));
    this.battleMove1.addEventListener("click", () => this.handlePlayerBattleMove(1));
    if (this.battleMove2) this.battleMove2.addEventListener("click", () => this.handlePlayerBattleMove(2));
    if (this.battleMove3) this.battleMove3.addEventListener("click", () => this.handlePlayerBattleMove(3));
    if (this.battleItemBtn) this.battleItemBtn.addEventListener("click", () => this.showBattleItemMenu());
    if (this.battleItemCloseBtn) this.battleItemCloseBtn.addEventListener("click", () => this.hideBattleItemMenu());
    if (this.battleItemOverlay) {
      this.battleItemOverlay.addEventListener("click", (e) => {
        if (e.target === this.battleItemOverlay) this.hideBattleItemMenu();
      });
    }
    
    this.battleTeraBtn.addEventListener("click", () => {
      const player = this.getActiveBattlePlayer();
      if (!player || !this.game.spendTeraCharge(player)) {
        this.setBattleLog("Your Tera Orb is empty. Recharge at Free Parking, passing GO, or with a Tera Shard.");
        this.updateBattleHUDs();
        return;
      }
      Battle.terastallizePlayer();
      this.playerPokeTera.style.display = "inline-block";
      this.battleTeraBtn.disabled = true;
      this.updateBattleHUDs();
    });
    if (this.battleStatsToggleBtn) {
      this.battleStatsToggleBtn.addEventListener("click", () => this.toggleBattleStatsOverlay(true));
    }

    if (this.logsToggleBtn) {
      this.logsToggleBtn.addEventListener("click", () => this.toggleAdventureLog());
    }
    if (this.battleStatsCloseBtn) {
      this.battleStatsCloseBtn.addEventListener("click", () => this.toggleBattleStatsOverlay(false));
    }
    if (this.battleStatsOverlay) {
      this.battleStatsOverlay.addEventListener("click", event => {
        if (event.target === this.battleStatsOverlay) this.toggleBattleStatsOverlay(false);
      });
    }

    // Catch mini-game ball selectors
    const selectBall = (ballType) => {
      if (this.throwBallBtn.disabled) return;
      if (this.hasCatchGameStarted) return; // Can't change balls mid-minigame
      this.selectedBall = ballType;
      this.ballBtnPoke.classList.remove("active");
      this.ballBtnGreat.classList.remove("active");
      this.ballBtnUltra.classList.remove("active");
      
      if (ballType === "poke") this.ballBtnPoke.classList.add("active");
      else if (ballType === "great") this.ballBtnGreat.classList.add("active");
      else if (ballType === "ultra") this.ballBtnUltra.classList.add("active");
      
      Sound.playClick();
      this.updateCatchRingSpecs();
    };

    this.ballBtnPoke.addEventListener("click", () => selectBall("poke"));
    this.ballBtnGreat.addEventListener("click", () => selectBall("great"));
    this.ballBtnUltra.addEventListener("click", () => selectBall("ultra"));

    // Throw Ball Button click
    this.throwBallBtn.addEventListener("click", () => {
      if (this.catchGameType === "circle" || this.catchGameType === "bar") {
        if (!this.isCatchAnimRunning) return;
        this.throwBall();
      } else {
        // spam or qte
        if (this.hasCatchGameStarted) {
          if (this.catchGameType === "spam") {
            this.handleSpamPress();
          }
        } else {
          this.startActiveCatchGame();
        }
      }
    });

    // Click on catch arena to catch / mash
    const catchArena = this.catchOverlay.querySelector(".catch-arena");
    if (catchArena) {
      catchArena.addEventListener("click", (e) => {
        if (!this.isCatchAnimRunning) return;
        if (this.catchGameType === "circle" || this.catchGameType === "bar") {
          if (this.throwBallBtn.disabled) return;
          this.throwBall();
        } else if (this.catchGameType === "spam" && this.hasCatchGameStarted) {
          this.handleSpamPress();
        }
      });
    }

    // Keyboard controls for Spam and QTE games
    window.addEventListener("keydown", (e) => {
      if (!this.isCatchAnimRunning) return;
      if (e.repeat) return; // Prevent key repeat double-triggering
      if (this.catchGameType === "spam" && this.hasCatchGameStarted) {
        if (e.code === "Space") {
          e.preventDefault();
          this.handleSpamPress();
        }
      } else if (this.catchGameType === "qte" && this.hasCatchGameStarted) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          e.preventDefault();
          this.handleQtePress(e.key);
        }
      }
    });

    // Click handlers for virtual arrow keys in QTE game
    document.querySelectorAll(".btn-qte-arrow").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Stop propagation so it doesn't count as a catchArena click
        if (!this.isCatchAnimRunning) return;
        if (this.catchGameType === "qte" && this.hasCatchGameStarted) {
          const key = btn.dataset.key;
          this.handleQtePress(key);
        }
      });
    });
  }

  getSaveSlots() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY) || "[]");
      const slots = Array.isArray(parsed) ? parsed : [];
      return Array.from({ length: SAVE_SLOT_COUNT }, (_, idx) => slots[idx] || null);
    } catch (err) {
      console.warn("Unable to read save slots:", err);
      return Array.from({ length: SAVE_SLOT_COUNT }, () => null);
    }
  }

  writeSaveSlots(slots) {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(slots.slice(0, SAVE_SLOT_COUNT)));
  }

  renderSaveSlots() {
    if (this.setupSaveSlots) {
      this.setupSaveSlots.innerHTML = this.renderSaveSlotCards("setup");
    }
    if (this.modalSaveSlots) {
      this.modalSaveSlots.innerHTML = this.renderSaveSlotCards(this.saveOverlayMode);
    }
  }

  renderSaveSlotCards(mode) {
    const slots = this.getSaveSlots();
    return slots.map((save, idx) => {
      const slotNumber = idx + 1;
      const isEmpty = !save;
      const summary = save ? this.formatSaveSummary(save) : "Empty slot";
      const timestamp = save ? this.formatSaveTimestamp(save.savedAt) : "No save file";
      const trainerName = save ? this.escapeHTML(save.summary?.trainerName || save.summary?.activeTrainer || "Saved Game") : "Empty";
      const loadDisabled = isEmpty ? "disabled" : "";
      const deleteDisabled = isEmpty ? "disabled" : "";
      const saveButton = mode === "save"
        ? `<button class="save-action-primary ${isEmpty ? "save-action-new" : "save-action-overwrite"}" data-action="save" data-slot="${idx}">${isEmpty ? "SAVE" : "OVERWRITE"}</button>`
        : "";

      return `
        <div class="save-slot-card ${isEmpty ? "empty" : ""}">
          <div class="save-slot-label">Slot ${slotNumber}</div>
          <div class="save-slot-trainer">${trainerName}</div>
          <div class="save-slot-time">${this.escapeHTML(timestamp)}</div>
          <div class="save-slot-summary">${summary}</div>
          <div class="save-slot-actions">
            ${saveButton}
            <button class="save-action-primary save-action-load" data-action="load" data-slot="${idx}" ${loadDisabled}>LOAD</button>
            <button class="save-action-delete" data-action="delete" data-slot="${idx}" title="Delete Slot ${slotNumber}" ${deleteDisabled}>×</button>
          </div>
        </div>
      `;
    }).join("");
  }

  formatSaveTimestamp(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  formatSaveSummary(save) {
    const summary = save.summary || {};
    const trainerLines = (summary.trainers || []).slice(0, 4).map(t => {
      return `${this.escapeHTML(t.name)}: ${this.escapeHTML(t.pokemon)} Lv.${t.level}, $${t.cash}, ${t.properties} deeds`;
    });
    const active = summary.activeTrainer ? `Turn: ${this.escapeHTML(summary.activeTrainer)}` : "Turn: Unknown";
    const owned = `Properties: ${summary.totalProperties || 0}`;
    return [active, owned, ...trainerLines].join("<br>");
  }

  buildSaveSummary(state) {
    const propertyCounts = {};
    Object.values(state.ownership || {}).forEach(ownerIdx => {
      propertyCounts[ownerIdx] = (propertyCounts[ownerIdx] || 0) + 1;
    });

    const active = state.players[state.currentPlayerIdx] || state.players[0];
    const human = state.players.find(player => player.id === 0) || state.players[0];
    return {
      trainerName: human ? human.name : "Trainer",
      activeTrainer: active ? active.name : "Unknown",
      totalProperties: Object.keys(state.ownership || {}).length,
      trainers: state.players.map(player => ({
        id: player.id,
        name: player.name,
        pokemon: player.pokemon,
        level: player.level,
        cash: player.cash,
        position: player.position,
        properties: propertyCounts[player.id] || 0,
        collection: player.collection ? player.collection.length : 0,
        bankrupt: !!player.isBankrupt
      }))
    };
  }

  canSaveCurrentState() {
    const tempIds = ["wild-battle-btn", "trainer-battle-btn", "high-stakes-battle-btn", "pay-rent-btn", "accept-challenge-btn", "high-stakes-defense-btn", "resolve-debt-btn", "color-set-upgrade-btn"];
    const hasTempPrompt = tempIds.some(id => !!document.getElementById(id));
    const blockingOverlay =
      Battle.activeBattle ||
      this.isEncounterActive ||
      this.activePassHandler ||
      hasTempPrompt ||
      this.catchOverlay.style.display !== "none" ||
      this.cardDrawOverlay.style.display === "flex" ||
      this.pokemonSelectionOverlay.style.display === "flex" ||
      this.pokemonLevelupOverlay.style.display === "flex";

    if (!this.game.players.length) {
      return { ok: false, message: "Start a game before saving." };
    }
    if (blockingOverlay) {
      return { ok: false, message: "Finish the current battle, catch attempt, card, or property choice before saving." };
    }
    return { ok: true };
  }

  saveToSlot(slotIdx) {
    const status = this.canSaveCurrentState();
    if (!status.ok) {
      alert(status.message);
      return false;
    }

    const slots = this.getSaveSlots();
    if (slots[slotIdx] && !confirm(`Overwrite Slot ${slotIdx + 1} for ${slots[slotIdx].summary?.trainerName || "this saved game"}?`)) {
      return false;
    }

    const state = this.game.serializeState();
    slots[slotIdx] = {
      version: 1,
      savedAt: new Date().toISOString(),
      summary: this.buildSaveSummary(state),
      state
    };
    this.writeSaveSlots(slots);
    this.renderSaveSlots();
    this.setDialogText(`Game saved to Slot ${slotIdx + 1}.`);
    this.game.log(`Game saved to Slot ${slotIdx + 1}.`);
    this.updateUI();
    return true;
  }

  loadFromSlot(slotIdx) {
    const slots = this.getSaveSlots();
    const save = slots[slotIdx];
    if (!save || !save.state) return;

    if (this.game.players.length && !confirm(`Load Slot ${slotIdx + 1}? Current unsaved progress will be lost.`)) {
      return;
    }

    Battle.reset();
    this.game.loadState(save.state);
    this.selectedCollectionIndices = [];
    this.currentWildDiscount = 0;
    this.activePassHandler = null;
    this.isEncounterActive = false;
    this.combatAnimating = false;
    this.victoryShown = false;
    if (this.victoryOverlay) this.victoryOverlay.style.display = "none";
    this.prevCash = this.game.players.map(p => p.cash);
    this.gameSessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.closeTransientOverlays();

    this.setupScreen.style.display = "none";
    this.gameContainer.style.display = "grid";
    this.renderBoard();
    this.updateUI();
    this.restoreControlsAfterLoad();
    this.hideSaveOverlay();
    this.renderSaveSlots();
    this.setDialogText(`Loaded Slot ${slotIdx + 1}.`);
  }

  deleteSaveSlot(slotIdx) {
    if (!confirm(`Delete Slot ${slotIdx + 1}?`)) return;
    const slots = this.getSaveSlots();
    slots[slotIdx] = null;
    this.writeSaveSlots(slots);
    this.renderSaveSlots();
  }

  handleSaveSlotClick(event, source) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const slotIdx = Number(button.dataset.slot);
    const action = button.dataset.action;
    if (!Number.isInteger(slotIdx)) return;

    Sound.playClick();
    if (action === "save") {
      if (this.saveToSlot(slotIdx)) this.hideSaveOverlay();
    } else if (action === "load") {
      this.loadFromSlot(slotIdx);
    } else if (action === "delete") {
      this.deleteSaveSlot(slotIdx);
    }
  }

  showSaveOverlay(mode = "save") {
    this.saveOverlayMode = mode;
    if (this.saveModalTitle) {
      this.saveModalTitle.innerText = mode === "save" ? "SAVE GAME" : "LOAD GAME";
    }
    this.renderSaveSlots();
    this.saveOverlay.style.display = "flex";
    if (this.utilityPopupMenu) this.utilityPopupMenu.style.display = "none";
  }

  hideSaveOverlay() {
    if (this.saveOverlay) {
      this.saveOverlay.style.display = "none";
    }
  }

  closeTransientOverlays() {
    this.hideEncounterSprite();
    this.battleOverlay.style.display = "none";
    this.catchOverlay.style.display = "none";
    this.deedOverlay.style.display = "none";
    this.cardDrawOverlay.style.display = "none";
    this.pokemonSelectionOverlay.style.display = "none";
    this.pokemonLevelupOverlay.style.display = "none";
    ["wild-battle-btn", "trainer-battle-btn", "pay-rent-btn", "accept-challenge-btn", "resolve-debt-btn"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.remove();
    });
    this.endBtn.innerText = "END TURN";
  }

  restoreControlsAfterLoad() {
    const player = this.game.getCurrentPlayer();
    this.buyBtn.style.display = "none";
    this.endBtn.style.display = "none";
    this.rollBtn.style.display = "none";

    if (!player || player.isBankrupt) return;
    if (player.isAI) {
      this.setDialogText(`Loaded during ${player.name}'s turn.`);
      setTimeout(() => this.executeAITurn(), 1200);
      return;
    }

    if (this.game.hasRolledThisTurn) {
      this.endBtn.style.display = "inline-block";
    } else {
      this.rollBtn.style.display = "inline-block";
    }
  }

  escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // Set Dialogue text in the speech bubble
  setDialogText(text) {
    this.statusDialog.innerText = text;
  }

  updateDialogueAvatar(pokemonName, playerColor = "#FFF") {
    const avatar = document.getElementById("dialogue-avatar");
    if (!avatar) return;

    // If the center encounter sprite card is active, hide the dialogue avatar to avoid redundancy
    if (this.encounterSpriteBox && this.encounterSpriteBox.style.display === "flex") {
      avatar.style.display = "none";
      return;
    }

    avatar.style.borderColor = playerColor;
    avatar.style.backgroundColor = "#FFF";
    const lowerPoke = pokemonName.toLowerCase();
    if (AVAILABLE_PNGS.includes(lowerPoke)) {
      avatar.innerHTML = `<img src="images/${lowerPoke}.png" alt="${pokemonName}">`;
    } else {
      avatar.innerHTML = PokemonSVGs[pokemonName] || "";
    }
    avatar.style.display = "flex";
  }

  showEncounterSprite(pokemonName, encounterType = "WILD ENCOUNTER!") {
    if (!this.encounterSpriteBox || !this.encounterSpriteImg || !this.encounterSpriteTitle || !this.encounterSpriteName) return;

    Sound.playEncounterSound();

    this.encounterSpriteTitle.innerText = encounterType;
    this.encounterSpriteName.innerText = pokemonName;

    const lowerPoke = pokemonName.toLowerCase();
    if (AVAILABLE_PNGS.includes(lowerPoke)) {
      this.encounterSpriteImg.src = `images/${lowerPoke}.png`;
      this.encounterSpriteImg.style.display = "block";
      // Clear any innerHTML if we previously inserted SVGs
      const imageWrapper = this.encounterSpriteImg.parentNode;
      const svgs = imageWrapper.querySelectorAll("svg");
      svgs.forEach(s => s.remove());
    } else {
      this.encounterSpriteImg.style.display = "none";
      const imageWrapper = this.encounterSpriteImg.parentNode;
      const svgs = imageWrapper.querySelectorAll("svg");
      svgs.forEach(s => s.remove());
      if (PokemonSVGs[pokemonName]) {
        imageWrapper.insertAdjacentHTML("beforeend", PokemonSVGs[pokemonName]);
      }
    }

    this.encounterSpriteBox.style.display = "flex";
    if (this.diceZone) this.diceZone.style.display = "none";

    // Hide dialogue avatar to prevent duplicate image displays
    const avatar = document.getElementById("dialogue-avatar");
    if (avatar) avatar.style.display = "none";
  }

  hideEncounterSprite() {
    if (this.encounterSpriteBox) {
      this.encounterSpriteBox.style.display = "none";
    }
    if (this.diceZone) {
      this.diceZone.style.display = "flex";
    }

    // Restore and show dialogue avatar for active player
    const avatar = document.getElementById("dialogue-avatar");
    if (avatar) {
      const player = this.game.getCurrentPlayer();
      if (player) {
        this.updateDialogueAvatar(player.pokemon, player.color);
      }
    }
  }

  // Render traditional dice with dots instead of text numbers
  renderDie(dieElement, value) {
    if (value === "?") {
      dieElement.innerHTML = `<span style="font-family: var(--font-title); font-size: 1.8rem; line-height: 1;">?</span>`;
      dieElement.style.display = "flex";
      return;
    }

    dieElement.innerHTML = "";
    dieElement.style.display = "grid";
    dieElement.style.gridTemplateColumns = "repeat(3, 1fr)";
    dieElement.style.gridTemplateRows = "repeat(3, 1fr)";
    dieElement.style.padding = "5px";
    dieElement.style.gap = "4px";

    const dotsActive = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    const activeIndices = dotsActive[value] || [];
    for (let i = 0; i < 9; i++) {
      const dot = document.createElement("div");
      dot.className = "die-dot" + (activeIndices.includes(i) ? " active" : "");
      dieElement.appendChild(dot);
    }
  }

  // Flash the screen overlay in the element's color
  flashScreen(type) {
    if (!type) type = "normal";
    const flashClass = `flash-${type.toLowerCase()}`;
    this.battleOverlay.classList.add(flashClass);
    setTimeout(() => {
      this.battleOverlay.classList.remove(flashClass);
    }, 250);
  }

  // Draw floating comic text like "BOOM!", "ONE SHOT!" on attacks
  showActionTextPopup(side, word) {
    const parent = side === "player" ? this.enemyBattleSprite : this.playerBattleSprite;
    
    const popup = document.createElement("div");
    popup.className = "action-popup";
    popup.innerText = word;
    popup.style.top = "20px";
    popup.style.left = "40px";
    
    parent.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
  }

  showCenterActionToast(text, variant = "info", host = null, durationMs = null) {
    const target = host || document.body;
    const activeToasts = target.querySelectorAll(":scope > .center-action-toast").length;
    const stackIndex = Math.min(activeToasts, 4);
    const toast = document.createElement("div");
    toast.className = `center-action-toast ${variant}`;
    toast.innerText = text;
    toast.style.setProperty("--toast-stack-offset", `${stackIndex * -64}px`);
    const duration = durationMs || (String(variant).includes("money") ? 5000 : 1600);
    toast.style.animationDuration = `${duration}ms`;
    target.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }

  formatMoney(amount) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    return `$${value}`;
  }

  getRentAmounts(spaceId) {
    const fullRent = this.game.calculateRent(spaceId);
    return {
      fullRent,
      winRent: Math.floor(fullRent * 0.5),
      lossRent: Math.floor(fullRent * 1.5)
    };
  }

  showMoneyTransfer(amount, fromName, toName, message, host = null) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (value <= 0) return;

    const target = host || this.gameContainer || document.body;
    const duration = 5000;
    this.showCenterActionToast(message || `${this.formatMoney(value)} paid`, "money", target, duration);

    const burst = document.createElement("div");
    burst.className = "money-transfer-burst";
    burst.style.animationDuration = `${duration}ms`;
    burst.innerHTML = `
      <span class="money-transfer-amount">-${this.formatMoney(value)}</span>
      <span class="money-transfer-route">${this.escapeHTML(fromName)} pays ${this.escapeHTML(toName)}</span>
      <span class="money-transfer-amount gain">+${this.formatMoney(value)}</span>
    `;
    target.appendChild(burst);
    setTimeout(() => burst.remove(), duration);
  }

  showDamageNumber(side, damage) {
    const parent = side === "player" ? this.playerBattleSprite : this.enemyBattleSprite;
    if (!parent) return;
    const damageEl = document.createElement("div");
    damageEl.className = "damage-number-pop";
    damageEl.innerText = `-${damage} HP`;
    parent.appendChild(damageEl);
    setTimeout(() => damageEl.remove(), 1100);
  }

  // Render the initial 40-space Monopoly grid layout
  renderBoard() {
    // Clear out existing tiles except the center board panel
    const centerPanel = this.boardGrid.querySelector(".board-center");
    this.boardGrid.innerHTML = "";
    this.boardGrid.appendChild(centerPanel);

    const availablePNGs = AVAILABLE_PNGS;

    this.game.spaces.forEach(space => {
      const tile = document.createElement("div");
      let sideClass = "side-bottom";
      if (space.id >= 10 && space.id < 20) sideClass = "side-left";
      else if (space.id >= 20 && space.id < 30) sideClass = "side-top";
      else if (space.id >= 30 && space.id < 40) sideClass = "side-right";
      
      tile.className = `tile ${space.group} ${sideClass}`;
      tile.dataset.id = space.id;

      // Create content wrapper to support layout rotation (original board style)
      const isCorner = space.group === "corner";
      const content = document.createElement("div");
      content.className = isCorner ? "tile-content corner-content" : "tile-content";

      // Color Group Bar
      if (space.type === "property") {
        const bar = document.createElement("div");
        bar.className = `tile-color-bar ${space.group}`;
        content.appendChild(bar);
      }

      // Title/Name
      const name = document.createElement("div");
      name.className = "tile-name";
      name.innerText = space.name;
      content.appendChild(name);

      // Icon (SVG / Image)
      const icon = document.createElement("div");
      icon.className = "tile-icon";
      if (space.pokemon) {
        const lowerPoke = space.pokemon.toLowerCase();
        if (availablePNGs.includes(lowerPoke)) {
          icon.innerHTML = `<img src="images/${lowerPoke}.png?v=${ASSET_VERSION}" alt="${space.pokemon}">`;
        } else if (PokemonSVGs[space.pokemon]) {
          icon.innerHTML = PokemonSVGs[space.pokemon];
        }
      } else if (space.type === "GO") {
        icon.innerHTML = `<img src="images/go_full.png?v=${ASSET_VERSION}" alt="GO">`;
      } else if (space.type === "jail") {
        icon.innerHTML = `<img src="images/jail_full.png?v=${ASSET_VERSION}" alt="Jail">`;
      } else if (space.type === "parking") {
        icon.innerHTML = `<img src="images/free_parking_full.png?v=${ASSET_VERSION}" alt="Free Parking">`;
      } else if (space.type === "gotojail") {
        icon.innerHTML = `<img src="images/go_to_jail_full.png?v=${ASSET_VERSION}" alt="Go to Jail">`;
      } else if (space.type === "tax") {
        if (space.id === 4) {
          icon.innerHTML = `<img src="images/poke_mart_tax.png?v=${ASSET_VERSION}" alt="Poke Mart Tax">`;
        } else {
          icon.innerHTML = `<img src="images/league_assessment_tax.png?v=${ASSET_VERSION}" alt="League Assessment Tax">`;
        }
      } else if (space.type === "raid") {
        icon.innerHTML = `<img src="images/tera_raid_chest.png?v=${ASSET_VERSION}" alt="Tera Raid Chest">`;
      } else if (space.type === "academy") {
        icon.innerHTML = `<img src="images/academy_class.png?v=${ASSET_VERSION}" alt="Academy Class">`;
      }
      content.appendChild(icon);

      // Pricing info
      if (space.cost > 0) {
        const price = document.createElement("div");
        price.className = "tile-price";
        price.innerText = `$${space.cost}`;
        content.appendChild(price);
      }

      // Append content wrapper to tile
      tile.appendChild(content);

      // Houses / Camps build indicators (direct child of tile, outside rotated wrapper)
      const buildings = document.createElement("div");
      buildings.className = "buildings-container";
      buildings.id = `buildings-space-${space.id}`;
      tile.appendChild(buildings);

      // Token container (child of rotated content wrapper, to align rotation)
      const tokens = document.createElement("div");
      tokens.className = "token-container";
      tokens.id = `tokens-space-${space.id}`;
      content.appendChild(tokens);

      // Add click to view property details
      tile.addEventListener("click", () => this.handleTileClick(space.id));

      this.boardGrid.appendChild(tile);
    });
  }

  // Handle showing detail popups for properties
  handleTileClick(spaceId) {
    const space = this.game.spaces[spaceId];
    if (space.type !== "property" && space.type !== "station" && space.type !== "utility") return;

    this.selectedDeedId = spaceId;
    this.renderDeedCard();
    this.deedOverlay.style.display = "flex";
  }

  renderDeedCard() {
    const spaceId = this.selectedDeedId;
    const space = this.game.spaces[spaceId];
    const ownerIdx = this.game.ownership[spaceId];
    const hasOwner = ownerIdx !== undefined;
    const owner = hasOwner ? this.game.players[ownerIdx] : null;
    const isMortgaged = this.game.mortgages[spaceId];
    const buildingsCount = this.game.buildings[spaceId] || 0;
    
    let colorClass = space.group;
    let rentInfoHTML = "";

    if (space.type === "property") {
      rentInfoHTML = `
        <div class="deed-info-row"><span>Base Rent (Unimproved):</span><span>$${space.rent[0]}</span></div>
        <div class="deed-info-row"><span>With 1 Camp:</span><span>$${space.rent[1]}</span></div>
        <div class="deed-info-row"><span>With 2 Camps:</span><span>$${space.rent[2]}</span></div>
        <div class="deed-info-row"><span>With 3 Camps:</span><span>$${space.rent[3]}</span></div>
        <div class="deed-info-row"><span>With 4 Camps:</span><span>$${space.rent[4]}</span></div>
        <div class="deed-info-row"><span>With Gym Station:</span><span>$${space.rent[5]}</span></div>
        <div class="deed-info-row bold"><span>Camp Upgrade Cost:</span><span>$${space.houseCost}</span></div>
      `;
    } else if (space.type === "station") {
      colorClass = "station";
      rentInfoHTML = `
        <div class="deed-info-row"><span>1 Taxi Owned:</span><span>$${space.rent[0]}</span></div>
        <div class="deed-info-row"><span>2 Taxis Owned:</span><span>$${space.rent[1]}</span></div>
        <div class="deed-info-row"><span>3 Taxis Owned:</span><span>$${space.rent[2]}</span></div>
        <div class="deed-info-row"><span>4 Taxis Owned:</span><span>$${space.rent[3]}</span></div>
      `;
    } else if (space.type === "utility") {
      colorClass = "utility";
      rentInfoHTML = `
        <div class="deed-info-row"><span>1 Utility Owned:</span><span>4x Dice Sum</span></div>
        <div class="deed-info-row"><span>2 Utilities Owned:</span><span>10x Dice Sum</span></div>
      `;
    }

    const upgradeBtnState = this.game.canBuildCamp(0, spaceId) || this.game.canBuildGym(0, spaceId) ? "" : "disabled";
    const groupUpgradePlan = this.game.getGroupUpgradePlan(0, spaceId);
    const groupUpgradeBtnState = groupUpgradePlan.ready ? "" : "disabled";
    const groupUpgradeLabel = groupUpgradePlan.ready ? `UPGRADE SET ($${groupUpgradePlan.totalCost})` : "UPGRADE SET";
    const sellBtnState = hasOwner && ownerIdx === 0 && buildingsCount > 0 ? "" : "disabled";
    const mortgageBtnText = isMortgaged ? "UNMORTGAGE" : "MORTGAGE";
    const mortgageBtnState = isMortgaged ? (this.game.canUnmortgage(0, spaceId) ? "" : "disabled") : (this.game.canMortgage(0, spaceId) ? "" : "disabled");
    const isPlayerOwned = hasOwner && ownerIdx === 0;

    let upgradeMessageHTML = "";
    if (isPlayerOwned && space.type === "property") {
      const status = this.game.getUpgradeStatus(0, spaceId);
      if (status.message) {
        const isReady = status.ready;
        const color = isReady ? "#1E8449" : "#C0392B";
        const bgColor = isReady ? "#E8F8F5" : "#FDEDEC";
        const borderColor = isReady ? "#2ECC71" : "#E74C3C";
        upgradeMessageHTML = `
          <div class="upgrade-status-box" style="
            margin-top: 12px;
            padding: 8px 12px;
            background-color: ${bgColor};
            border: 2px solid ${borderColor};
            border-radius: 8px;
            color: ${color};
            font-family: var(--font-body);
            font-size: 0.85rem;
            font-weight: 700;
            text-align: center;
            line-height: 1.4;
            box-shadow: 2px 2px 0px #000;
          ">
            ${isReady ? "✨" : "⚠️"} ${status.message}
          </div>
        `;
      }
    }

    let statusHTML = "";
    if (isMortgaged) {
      statusHTML = `<div style="font-size: 0.85rem; font-weight: 800; color: #E74C3C; margin-bottom: 12px;">Status: Mortgaged (by ${owner.name})</div>`;
    } else if (hasOwner) {
      const isGym = buildingsCount === 5;
      let buildingsVisualHTML = "";
      if (space.type === "property") {
        if (isGym) {
          buildingsVisualHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin: 4px 0 12px 0;">
              <svg viewBox="0 0 32 32" style="width: 28px; height: 28px; filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.25));">
                <ellipse cx="16" cy="26" rx="14" ry="4" fill="#34495E" stroke="#1A252F" stroke-width="2"/>
                <path d="M4 24 C4 10, 28 10, 28 24 Z" fill="#E74C3C" stroke="#1A252F" stroke-width="2" stroke-linejoin="round"/>
                <path d="M4 24 C4 18, 28 18, 28 24 Z" fill="#ECF0F1" stroke="#1A252F" stroke-width="2" stroke-linejoin="round"/>
                <path d="M4 17.5 C6 17.5, 26 17.5, 28 17.5" stroke="#1A252F" stroke-width="2"/>
                <circle cx="16" cy="17.5" r="4" fill="#FFFFFF" stroke="#1A252F" stroke-width="2"/>
                <circle cx="16" cy="17.5" r="1.5" fill="#BDC3C7"/>
                <path d="M7 11 L5 5" stroke="#F1C40F" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M25 11 L27 5" stroke="#F1C40F" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="5" cy="5" r="1.5" fill="#F1C40F"/>
                <circle cx="27" cy="5" r="1.5" fill="#F1C40F"/>
              </svg>
              <span style="font-family: var(--font-title); font-size: 0.9rem; font-weight: 900; color: #E74C3C;">GYM STATION</span>
            </div>
          `;
        } else {
          let tentsHTML = "";
          for (let i = 0; i < 4; i++) {
            if (i < buildingsCount) {
              tentsHTML += `
                <svg viewBox="0 0 32 32" style="width: 22px; height: 22px; filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.2));">
                  <path d="M16 4 L2 26 L30 26 Z" fill="#2ECC71" stroke="#1A5235" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M16 12 L9 26 L23 26 Z" fill="#27AE60" stroke="#1A5235" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M16 12 L16 26 L23 26 Z" fill="#1E8449"/>
                  <path d="M16 4 L16 1 L19 2.5 L16 4 Z" fill="#E74C3C" stroke="#000" stroke-width="0.5"/>
                </svg>
              `;
            } else {
              tentsHTML += `
                <svg viewBox="0 0 32 32" style="width: 22px; height: 22px; opacity: 0.2;">
                  <path d="M16 4 L2 26 L30 26 Z" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="3,3" stroke-linejoin="round"/>
                </svg>
              `;
            }
          }
          buildingsVisualHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px 0 12px 0;">
              ${tentsHTML}
            </div>
          `;
        }
      }
      const niceStatus = isGym ? "Gym Station" : `${buildingsCount} / 4 Camps`;
      statusHTML = `
        <div style="font-size: 0.85rem; font-weight: 800; color: #2C3E50; margin-bottom: 4px;">Status: Owned by ${owner.name} (${niceStatus})</div>
        ${buildingsVisualHTML}
      `;
    } else {
      statusHTML = `<div style="font-size: 0.85rem; font-weight: 800; color: #7F8C8D; margin-bottom: 12px;">Status: Unowned</div>`;
    }

    let pokeImgHTML = "";
    if (space.pokemon) {
      const availablePNGs = AVAILABLE_PNGS;
      const lowerPoke = space.pokemon.toLowerCase();
      if (availablePNGs.includes(lowerPoke)) {
        pokeImgHTML = `<img src="images/${lowerPoke}.png" alt="${space.pokemon}" style="width:100%; height:100%; object-fit:contain; border:2px solid #000; border-radius:8px;">`;
      } else {
        pokeImgHTML = PokemonSVGs[space.pokemon] || "";
      }
    }

    // Property switcher if owned by human
    const playerDeeds = this.game.spaces.filter(s => this.game.ownership[s.id] === 0);
    let switcherHTML = "";
    if (playerDeeds.length > 1) {
      switcherHTML = `
        <div class="deed-switcher" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.85rem; font-weight: 800;">
          <label for="deed-select" style="color: var(--text-dark);">VIEW DEED:</label>
          <select id="deed-select" style="font-family: var(--font-title); font-weight: 800; padding: 4px 8px; border: 2.5px solid #000; border-radius: 6px; box-shadow: 2px 2px 0px #000; background: #FFF; cursor: pointer;">
            ${playerDeeds.map(d => `<option value="${d.id}" ${d.id === spaceId ? "selected" : ""}>${d.name} (${d.pokemon || "Taxi"})</option>`).join("")}
          </select>
        </div>
      `;
    }

    const cardContent = document.getElementById("deed-card-content");
    cardContent.innerHTML = `
      <div class="deed-header ${colorClass}">${space.name}</div>
      <div style="margin: 10px 0 5px 0;">${switcherHTML}</div>
      <div style="width: 80px; height: 80px; margin: 0 auto 10px auto;">${pokeImgHTML}</div>
      <div class="deed-pokemon-name">${space.pokemon ? space.pokemon : "Corviknight Flying Taxi"}</div>
      ${statusHTML}
      <div class="deed-info-row"><span>Purchase Price:</span><span>$${space.cost}</span></div>
      <div class="deed-info-row"><span>Mortgage Value:</span><span>$${Math.floor(space.cost / 2)}</span></div>
      <hr style="margin: 10px 0; border: 0; border-top: 1.5px solid #CCC;"/>
      ${rentInfoHTML}
      
      ${isPlayerOwned ? `
        <div class="deed-actions">
          <button class="btn-comic btn-buy" id="deed-upgrade-btn" ${upgradeBtnState}>UPGRADE</button>
          <button class="btn-comic btn-build" id="deed-group-upgrade-btn" ${groupUpgradeBtnState}>${groupUpgradeLabel}</button>
          <button class="btn-comic btn-end" id="deed-sell-btn" ${sellBtnState}>SELL</button>
          <button class="btn-comic btn-mortgage" id="deed-mortgage-btn" ${mortgageBtnState}>${mortgageBtnText}</button>
        </div>
        ${upgradeMessageHTML}
      ` : ""}
    `;

    // Hook switcher event if present
    const selectElement = document.getElementById("deed-select");
    if (selectElement) {
      selectElement.addEventListener("change", (e) => {
        this.selectedDeedId = parseInt(e.target.value);
        this.renderDeedCard();
      });
    }

    // Hook events inside the dynamic card
    if (isPlayerOwned) {
      document.getElementById("deed-upgrade-btn").addEventListener("click", () => {
        if (this.game.canBuildGym(0, spaceId)) {
          this.game.buildGym(0, spaceId);
        } else {
          this.game.buildCamp(0, spaceId);
        }
        this.renderDeedCard();
        this.updateUI();
      });

      document.getElementById("deed-group-upgrade-btn").addEventListener("click", () => {
        const result = this.game.buildGroupUpgrade(0, spaceId);
        this.setDialogText(result.success ? `${result.kind}s added across the color set for $${result.totalCost}.` : result.message);
        this.renderDeedCard();
        this.updateUI();
      });

      document.getElementById("deed-sell-btn").addEventListener("click", () => {
        this.game.sellUpgrade(0, spaceId);
        this.renderDeedCard();
        this.updateUI();
      });

      document.getElementById("deed-mortgage-btn").addEventListener("click", () => {
        if (isMortgaged) {
          this.game.unmortgageProperty(0, spaceId);
        } else {
          this.game.mortgageProperty(0, spaceId);
        }
        this.renderDeedCard();
        this.updateUI();
      });
    }
  }

  showDeedsManagerModal(actionType) {
    // Collect all properties owned by player 0 (Human)
    const playerDeeds = this.game.spaces.filter(s => this.game.ownership[s.id] === 0);
    if (playerDeeds.length === 0) {
      alert("You don't own any properties yet! Buy some first.");
      return;
    }

    // Open the first one found as a gateway
    this.selectedDeedId = playerDeeds[0].id;
    this.renderDeedCard();
    this.deedOverlay.style.display = "flex";
  }

  showColorSetUpgradePrompt(spaceId) {
    const space = this.game.spaces[spaceId];
    if (!space || space.type !== "property" || !this.game.ownsColorGroup(0, space.group)) return;
    const plan = this.game.getGroupUpgradePlan(0, spaceId);
    if (!plan.ready) return;

    const existing = document.getElementById("color-set-upgrade-btn");
    if (existing) existing.remove();

    this.setDialogText(`You own the complete ${space.group} color set! Upgrade all properties together?`);
    const upgradeSetBtn = document.createElement("button");
    upgradeSetBtn.className = "btn-comic btn-build";
    upgradeSetBtn.id = "color-set-upgrade-btn";
    upgradeSetBtn.innerText = `UPGRADE SET ($${plan.totalCost})`;
    this.endBtn.parentNode.insertBefore(upgradeSetBtn, this.endBtn);
    upgradeSetBtn.addEventListener("click", () => {
      upgradeSetBtn.remove();
      this.selectedDeedId = spaceId;
      this.renderDeedCard();
      this.deedOverlay.style.display = "flex";
    });
  }

  // Update game board visual tokens, houses, sidebar, logs
  updateUI() {
    this.removeCenterSaveLoadControls();
    const player = this.game.getCurrentPlayer();
    
    // Dice values
    this.renderDie(this.die1, this.game.hasRolledThisTurn ? this.game.dice[0] : "?");
    this.renderDie(this.die2, this.game.hasRolledThisTurn ? this.game.dice[1] : "?");

    // Manage button display states
    if (player.id === 0) { // Human turn
      // Only show roll button if not in an active encounter and hasn't rolled yet
      if (!this.isEncounterActive) {
        this.rollBtn.style.display = this.game.hasRolledThisTurn ? "none" : "inline-block";
      }
      if (this.dashboardUtilities) this.dashboardUtilities.style.display = "flex";
      this.buildBtn.style.display = "inline-flex";
      this.manageBtn.style.display = "inline-flex";
    } else { // AI turn
      this.rollBtn.style.display = "none";
      this.buyBtn.style.display = "none";
      this.endBtn.style.display = "none";
      if (this.dashboardUtilities) this.dashboardUtilities.style.display = "none";
      this.buildBtn.style.display = "none";
      this.manageBtn.style.display = "none";
      if (this.utilityPopupMenu) this.utilityPopupMenu.style.display = "none";
    }

    // Reset encounter sprite & dialogue avatar if no active encounter
    if (!this.isEncounterActive) {
      this.hideEncounterSprite();
      this.updateDialogueAvatar(player.pokemon, player.color);
      // Clear small button style from buyBtn only when NOT in encounter
      this.buyBtn.classList.remove("btn-buy-small");
    }

    // Clear tokens and re-place
    this.game.spaces.forEach(space => {
      const tokenContainer = document.getElementById(`tokens-space-${space.id}`);
      if (tokenContainer) {
        tokenContainer.innerHTML = "";
      }

      // Mortgage Overlay & Ownership Styling
      const tile = this.boardGrid.querySelector(`.tile[data-id="${space.id}"]`);
      if (tile) {
        // Clear ownership visual classes first
        tile.classList.remove("owned-p0", "owned-p1", "owned-p2", "owned-p3");

        const priceTag = tile.querySelector(".tile-price");
        if (priceTag) {
          priceTag.className = "tile-price";
          priceTag.style.backgroundColor = "";
          priceTag.style.color = "";
        }

        const ownerIdx = this.game.ownership[space.id];
        if (ownerIdx !== undefined) {
          const owner = this.game.players[ownerIdx];
          tile.classList.add(`owned-p${ownerIdx}`);
          
          if (priceTag) {
            priceTag.style.backgroundColor = owner.color;
            priceTag.style.color = (ownerIdx === 1) ? "#000" : "#FFF"; // Black text for Nemona (yellow), White for others
            priceTag.innerText = owner.name.split(" ")[0]; // Florian, Nemona, Clavell, Penny
          }
        } else {
          // Reset price text if not owned
          if (priceTag && space.cost > 0) {
            priceTag.innerText = `$${space.cost}`;
          }
        }

        // Remove existing mortgage overlay if any
        const existingOverlay = tile.querySelector(".mortgage-overlay");
        if (existingOverlay) existingOverlay.remove();

        if (this.game.mortgages[space.id]) {
          const overlay = document.createElement("div");
          overlay.className = "mortgage-overlay";
          overlay.innerText = "MORTGAGED";
          tile.appendChild(overlay);
        }
      }

      // Houses / Camps
      const buildingsContainer = document.getElementById(`buildings-space-${space.id}`);
      if (buildingsContainer) {
        buildingsContainer.innerHTML = "";
        const bCount = this.game.buildings[space.id] || 0;
        const ownerIdx = this.game.ownership[space.id];
        const hasOwner = ownerIdx !== undefined;

        if (bCount === 5) {
          const gym = document.createElement("div");
          gym.className = "building-gym";
          gym.innerHTML = `
            <svg viewBox="0 0 32 32" class="gym-svg" title="Gym Station">
              <ellipse cx="16" cy="26" rx="14" ry="4" fill="#34495E" stroke="#1A252F" stroke-width="2"/>
              <path d="M4 24 C4 10, 28 10, 28 24 Z" fill="#E74C3C" stroke="#1A252F" stroke-width="2" stroke-linejoin="round"/>
              <path d="M4 24 C4 18, 28 18, 28 24 Z" fill="#ECF0F1" stroke="#1A252F" stroke-width="2" stroke-linejoin="round"/>
              <path d="M4 17.5 C6 17.5, 26 17.5, 28 17.5" stroke="#1A252F" stroke-width="2"/>
              <circle cx="16" cy="17.5" r="4" fill="#FFFFFF" stroke="#1A252F" stroke-width="2"/>
              <circle cx="16" cy="17.5" r="1.5" fill="#BDC3C7"/>
              <path d="M7 11 L5 5" stroke="#F1C40F" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M25 11 L27 5" stroke="#F1C40F" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="5" cy="5" r="1.5" fill="#F1C40F"/>
              <circle cx="27" cy="5" r="1.5" fill="#F1C40F"/>
            </svg>
          `;
          buildingsContainer.appendChild(gym);
        } else if (hasOwner && space.type === "property") {
          for (let i = 0; i < 4; i++) {
            const camp = document.createElement("div");
            if (i < bCount) {
              camp.className = "building-camp filled";
              camp.innerHTML = `
                <svg viewBox="0 0 32 32" class="camp-svg" title="Camp Site">
                  <path d="M16 4 L2 26 L30 26 Z" fill="#2ECC71" stroke="#1A5235" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M16 12 L9 26 L23 26 Z" fill="#27AE60" stroke="#1A5235" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M16 12 L16 26 L23 26 Z" fill="#1E8449"/>
                  <path d="M16 4 L16 1 L19 2.5 L16 4 Z" fill="#E74C3C" stroke="#000" stroke-width="0.5"/>
                </svg>
              `;
            } else {
              camp.className = "building-camp placeholder";
              camp.innerHTML = `
                <svg viewBox="0 0 32 32" class="camp-svg-placeholder">
                  <path d="M16 4 L2 26 L30 26 Z" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="2" stroke-dasharray="3,3" stroke-linejoin="round"/>
                </svg>
              `;
            }
            buildingsContainer.appendChild(camp);
          }
        }
      }
    });

    // Re-render player tokens on board
    const availablePNGs = AVAILABLE_PNGS;

    this.game.players.forEach(p => {
      if (p.isBankrupt) return;
      const tokenContainer = document.getElementById(`tokens-space-${p.position}`);
      if (tokenContainer) {
        const token = document.createElement("div");
        token.className = "player-token";
        token.style.setProperty("--player-color", p.color);
        token.style.borderColor = p.color; // Backup style assignment
        token.title = `${p.name} (${p.pokemon})`;

        const lowerPoke = p.pokemon.toLowerCase();
        if (availablePNGs.includes(lowerPoke)) {
          token.innerHTML = `<img src="images/${lowerPoke}.png" alt="${p.pokemon}">`;
        } else if (PokemonSVGs[p.pokemon]) {
          token.innerHTML = PokemonSVGs[p.pokemon];
        } else {
          // Fallback dot
          token.style.backgroundColor = p.color;
        }

        tokenContainer.appendChild(token);
      }
    });

    // Update Sidebar logs
    if (this.logsPanel) {
      this.logsPanel.innerHTML = this.game.logs.map(log => `<div class="log-entry">${log}</div>`).join("");
      if (!this.logsSection || !this.logsSection.classList.contains("collapsed")) {
        this.logsPanel.scrollTop = this.logsPanel.scrollHeight;
      }
    }

    // Update Sidebar Trainer Cards
    this.trainerList.innerHTML = this.game.players.map(p => {
      const activeClass = p.id === this.game.currentPlayerIdx ? "active" : "";
      const bankruptClass = p.isBankrupt ? "bankrupt" : "";

      const lowerPoke = p.pokemon.toLowerCase();
      const availablePNGs = AVAILABLE_PNGS;

      let spriteHtml = "";
      if (availablePNGs.includes(lowerPoke)) {
        spriteHtml = `<img src="images/${lowerPoke}.png" alt="${p.pokemon}">`;
      } else {
        spriteHtml = PokemonSVGs[p.pokemon] || "";
      }

      return `
        <div class="trainer-card ${activeClass} ${bankruptClass}" data-player-id="${p.id}" style="--trainer-color: ${p.color}; padding-left: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="player-token" style="--player-color: ${p.color}; width: 34px; height: 34px; flex-shrink: 0; box-shadow: 1.5px 1.5px 0px #000; border-width: 2px;">
              ${spriteHtml}
            </div>
            <div class="trainer-info-left">
              <span class="trainer-card-name">${p.name}</span>
              <span class="trainer-card-partner">${p.pokemon} (Lv. ${p.level}) ${p.inJail ? '[DETENTION]' : ''}</span>
            </div>
          </div>
          <span class="trainer-card-cash">$${p.cash}</span>
        </div>
      `;
    }).join("");

    // Compare cash changes for floating indicators and sound effects
    this.game.players.forEach(p => {
      const prev = this.prevCash[p.id] !== undefined ? this.prevCash[p.id] : 1500;
      if (p.cash !== prev) {
        const diff = p.cash - prev;
        this.prevCash[p.id] = p.cash;
        
        // Find corresponding trainer card element in DOM
        const card = this.trainerList.querySelector(`.trainer-card[data-player-id="${p.id}"]`);
        if (card) {
          // Play money sound
          if (diff > 0) {
            Sound.playMoneyGain();
          } else {
            Sound.playMoneyLoss();
          }

          // Create floating element
          const floatEl = document.createElement("div");
          floatEl.className = `floating-cash ${diff > 0 ? 'gain' : 'loss'}`;
          floatEl.innerText = `${diff > 0 ? '+' : '-'}$${Math.abs(diff)}`;
          card.appendChild(floatEl);

          // Auto-remove element after animation ends (1200ms)
          setTimeout(() => {
            floatEl.remove();
          }, 1200);
        }
      }
    });

    // Render the player's Pokémon collection
    this.renderCollection();

    // Auto-scroll active player tile into view
    const activePlayer = this.game.players[this.game.currentPlayerIdx];
    if (activePlayer && !activePlayer.isBankrupt) {
      const tile = this.boardGrid.querySelector(`.tile[data-id="${activePlayer.position}"]`);
      if (tile) {
        tile.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }

    this.checkForVictory();
    this.uploadLogsToServer();
  }

  checkForVictory() {
    if (this.victoryShown || !this.game.players.length) return;
    const winner = this.game.getWinner();
    if (!winner || winner.id !== 0) return;
    this.game.markFinished(winner.id);
    this.victoryShown = true;
    this.showVictoryScreen(winner);
  }

  toggleAdventureLog(forceOpen = null) {
    if (!this.logsSection) return;
    const shouldOpen = forceOpen === null ? this.logsSection.classList.contains("collapsed") : forceOpen;
    this.logsSection.classList.toggle("collapsed", !shouldOpen);
    if (this.logsToggleBtn) this.logsToggleBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    if (this.logsToggleLabel) this.logsToggleLabel.innerText = shouldOpen ? "HIDE" : "SHOW";
    if (shouldOpen && this.logsPanel) this.logsPanel.scrollTop = this.logsPanel.scrollHeight;
  }

  showVictoryScreen(winner) {
    if (!this.victoryOverlay) return;
    this.rollBtn.style.display = "none";
    this.buyBtn.style.display = "none";
    this.endBtn.style.display = "none";
    this.isEncounterActive = false;
    this.hideEncounterSprite();
    Sound.playVictory();

    if (this.victorySubtitle) {
      this.victorySubtitle.innerText = `${winner.name} conquered Paldea and eliminated every rival!`;
    }
    if (this.victoryPartner) {
      this.victoryPartner.innerHTML = this.getPokemonSpriteMarkup(winner.pokemon);
    }
    if (this.victorySummaryGrid) {
      this.victorySummaryGrid.innerHTML = this.buildVictorySummaryHTML(winner);
    }
    if (this.victoryDefeated) {
      const defeated = this.game.players
        .filter(player => player.id !== winner.id)
        .map(player => `${this.escapeHTML(player.name)} (${this.escapeHTML(player.pokemon)})`)
        .join(" • ");
      this.victoryDefeated.innerHTML = `<strong>Defeated Rivals:</strong> ${defeated || "None"}`;
    }

    this.renderVictoryConfetti();
    this.victoryOverlay.style.display = "flex";
  }

  buildVictorySummaryHTML(winner) {
    const stats = this.game.gameStats || {};
    const finishedAt = stats.finishedAt || Date.now();
    const elapsedMs = Math.max(0, finishedAt - (stats.startedAt || finishedAt));
    const playMs = this.game.getCurrentPlayMs();
    const propertiesOwned = Object.values(this.game.ownership).filter(ownerIdx => ownerIdx === winner.id).length;
    const collectionCount = winner.collection ? winner.collection.length : 0;
    const netWorth = this.game.getNetWorth(winner.id);
    const humanGoPasses = stats.passesGoByPlayer ? (stats.passesGoByPlayer[winner.id] || 0) : 0;
    const summaryItems = [
      ["Total Time", this.formatDuration(elapsedMs)],
      ["Played Time", this.formatDuration(playMs)],
      ["Turns", stats.turnsCompleted || 0],
      ["Your GO Laps", humanGoPasses],
      ["Total GO Passes", stats.totalPassesGo || 0],
      ["Final Cash", `$${winner.cash}`],
      ["Net Worth", `$${netWorth}`],
      ["Properties", propertiesOwned],
      ["Collection", collectionCount],
      ["Partner", `${winner.pokemon} Lv.${winner.level}`],
      ["Started", this.formatDateTime(stats.startedAt)],
      ["Finished", this.formatDateTime(finishedAt)]
    ];
    return summaryItems.map(([label, value]) => `
      <div class="victory-stat-card">
        <span class="victory-stat-label">${this.escapeHTML(label)}</span>
        <span class="victory-stat-value">${this.escapeHTML(value)}</span>
      </div>
    `).join("");
  }

  formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  formatDateTime(timestamp) {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  getPokemonSpriteMarkup(pokemonName) {
    if (!pokemonName) return "";
    const lowerName = pokemonName.toLowerCase();
    if (AVAILABLE_PNGS.includes(lowerName)) {
      return `<img src="images/${lowerName}.png" alt="${this.escapeHTML(pokemonName)}">`;
    }
    return PokemonSVGs[pokemonName] || "";
  }

  getBattlePokemonSpriteMarkup(pokemon, preferTera = false) {
    if (!pokemon?.name) return "";
    const lowerName = pokemon.name.toLowerCase();
    const imageName = preferTera ? `${lowerName}_tera` : lowerName;
    const imageSrc = `images/${encodeURIComponent(imageName)}.png?v=${ASSET_VERSION}`;
    const fallbackSrc = `images/${encodeURIComponent(lowerName)}.png?v=${ASSET_VERSION}`;
    const alt = this.escapeHTML(pokemon.name);
    const fallbackMarkup = this.escapeHTML(PokemonSVGs[pokemon.name] || this.getMysterySpriteMarkup({
      name: pokemon.name,
      type: pokemon.type
    }));

    return `<img src="${imageSrc}" alt="${alt}" style="width:100%; height:100%; object-fit:contain; border:3px solid #000; border-radius:12px; box-shadow:var(--box-shadow-comic);" onerror="if (this.dataset.fallbackTried) { this.outerHTML = this.dataset.fallbackMarkup; } else { this.dataset.fallbackTried = '1'; this.src = '${fallbackSrc}'; }" data-fallback-markup="${fallbackMarkup}">`;
  }

  renderVictoryConfetti() {
    if (!this.victoryConfetti || this.victoryConfetti.childElementCount > 0) return;
    const colors = ["#FFDE00", "#E74C3C", "#3B4CCA", "#2ECC71", "#FFFFFF", "#FF8C00"];
    const pieces = Array.from({ length: 96 }, (_, idx) => {
      const left = (idx * 37) % 100;
      const color = colors[idx % colors.length];
      const duration = 2.8 + (idx % 7) * 0.28;
      const delay = -((idx % 13) * 0.19);
      const rotate = `${(idx * 29) % 180}deg`;
      return `<span class="confetti-piece" style="left:${left}%; --confetti-color:${color}; --fall-duration:${duration}s; --fall-delay:${delay}s; --confetti-rotate:${rotate};"></span>`;
    }).join("");
    this.victoryConfetti.innerHTML = pieces;
  }

  createConfettiHTML(count = 80) {
    const colors = ["#FFDE00", "#E74C3C", "#3B4CCA", "#2ECC71", "#FFFFFF", "#FF8C00", "#9B59B6"];
    return Array.from({ length: count }, (_, idx) => {
      const left = (idx * 41) % 100;
      const color = colors[idx % colors.length];
      const duration = 2.4 + (idx % 8) * 0.24;
      const delay = -((idx % 11) * 0.15);
      const rotate = `${(idx * 31) % 180}deg`;
      return `<span class="confetti-piece" style="left:${left}%; --confetti-color:${color}; --fall-duration:${duration}s; --fall-delay:${delay}s; --confetti-rotate:${rotate};"></span>`;
    }).join("");
  }

  uploadLogsToServer() {
    if (this.logUploadTimeout) {
      clearTimeout(this.logUploadTimeout);
    }
    this.logUploadTimeout = setTimeout(() => {
      if (!this.gameSessionId) {
        this.gameSessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
      
      const state = {
        currentPlayerIdx: this.game.currentPlayerIdx,
        hasRolledThisTurn: this.game.hasRolledThisTurn,
        doubleRollCount: this.game.doubleRollCount,
        dice: this.game.dice,
        isEncounterActive: !!this.isEncounterActive,
        catchSpaceId: this.catchSpaceId || null,
        selectedDeedId: this.selectedDeedId || null,
        combatAnimating: !!this.combatAnimating,
        players: this.game.players.map(p => ({
          id: p.id,
          name: p.name,
          pokemon: p.pokemon,
          cash: p.cash,
          position: p.position,
          inJail: p.inJail,
          jailTurns: p.jailTurns,
          isBankrupt: p.isBankrupt
        })),
        ownership: this.game.ownership,
        buildings: this.game.buildings,
        mortgages: this.game.mortgages
      };

      if (!window.ENABLE_LOG_UPLOAD) return;

      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.gameSessionId,
          logs: this.game.logs,
          state: state
        })
      }).catch(() => {});
    }, 500);
  }

  // Animation to move player token space by space
  animateMovePlayer(player, steps, callback, startPosition = player.position) {
    if (!Number.isFinite(steps) || steps <= 0) {
      this.game.log(`Movement skipped for ${player.name}: invalid step count (${steps}).`);
      this.updateUI();
      callback();
      return;
    }

    let currentStep = 0;
    const oldPosition = ((startPosition % 40) + 40) % 40;
    player.position = oldPosition;

    const performStep = () => {
      if (currentStep >= steps) {
        player.position = (oldPosition + steps) % 40;
        this.updateUI();
        callback();
        return;
      }
      
      currentStep++;
      player.position = (player.position + 1) % 40;
      
      Sound.playClick();
      this.updateUI();
      
      setTimeout(performStep, 200); // Step delay
    };

    performStep();
  }

  // Roll dice animation sequence
  rollDiceSequence() {
    this.isEncounterActive = false;
    this.hideEncounterSprite();

    // Clean up any stale temporary buttons from the control panel
    const idsToClean = ["wild-battle-btn", "trainer-battle-btn", "high-stakes-battle-btn", "pay-rent-btn", "accept-challenge-btn", "high-stakes-defense-btn", "resolve-debt-btn", "pay-rent-fallback-btn", "color-set-upgrade-btn"];
    idsToClean.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.remove();
    });
    this.activePassHandler = null;
    this.endBtn.innerText = "END TURN";

    this.rollBtn.disabled = true;
    this.die1.classList.add("rolling");
    this.die2.classList.add("rolling");
    
    Sound.playDiceRoll();

    let rollTurns = 0;
    const interval = setInterval(() => {
      this.renderDie(this.die1, Math.floor(Math.random() * 6) + 1);
      this.renderDie(this.die2, Math.floor(Math.random() * 6) + 1);
      rollTurns++;
      if (rollTurns > 6) {
        clearInterval(interval);
        this.die1.classList.remove("rolling");
        this.die2.classList.remove("rolling");
        
        // Execute real roll
        const result = this.game.rollDice();
        this.rollBtn.disabled = false;
        
        if (!result) return;
        
        this.updateUI();

        if (result.sentToJail) {
          this.setDialogText("Uh-oh! Sent directly to detention for rolling 3 doubles!");
          this.rollBtn.style.display = "none";
          this.endBtn.style.display = "inline-block";
          return;
        }

        if (result.stillInJail) {
          this.setDialogText("No doubles. You are stuck in detention for this turn.");
          this.rollBtn.style.display = "none";
          this.endBtn.style.display = "inline-block";
          return;
        }

        if (result.escapedJail) {
          this.setDialogText("Hooray! Rolled doubles and escaped detention!");
        }

        if (result.jailFineRequired) {
          // Third failed detention roll: pay the fine, then move using this roll.
          const player = this.game.getCurrentPlayer();
          const paidFine = this.game.payJailFine(player);
          if (!paidFine) {
            this.setDialogText("Detention limit reached, but you need $50 to pay the escape fine.");
            this.rollBtn.style.display = "none";
            this.endBtn.style.display = "inline-block";
            return;
          }
          this.game.movePlayer(player, result.spacesMoved);
          this.updateUI();
          this.setDialogText("Detention limit reached! Paid $50 escape fine.");
        }

        // Animate movement
        this.rollBtn.style.display = "none";
        this.setDialogText(`Moving ${result.spacesMoved} spaces...`);
        
        // We set player position back and run animation
        const player = this.game.getCurrentPlayer();
        const steps = result.spacesMoved;
        
        // Temporarily reset position for animation sync
        const finalPos = player.position;
        const startPos = (finalPos - steps + 40) % 40;
        
        this.animateMovePlayer(player, steps, () => {
          this.checkAndProcessPassedGo(player, () => {
            this.handleLandingSpace(player.id, finalPos);
          });
        }, startPos);
      }
    }, 100);
  }

  // Handle landing space rules and battle logic
  handleLandingSpace(playerIdx, spaceId) {
    const player = this.game.players[playerIdx];
    const space = this.game.spaces[spaceId];
    
    // Clean up any stale temporary buttons from the control panel
    const idsToClean = ["wild-battle-btn", "trainer-battle-btn", "high-stakes-battle-btn", "pay-rent-btn", "accept-challenge-btn", "high-stakes-defense-btn", "resolve-debt-btn", "pay-rent-fallback-btn", "color-set-upgrade-btn"];
    idsToClean.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.remove();
    });
    this.activePassHandler = null;
    this.isEncounterActive = false; // Always reset encounter state on new landing
    this.endBtn.innerText = "END TURN";
    this.endBtn.style.display = "none"; // Always hide endBtn at start; each branch re-shows as needed
    this.rollBtn.style.display = "none";
    this.buyBtn.style.display = "none";

    this.updateUI();

    // Corner spaces
    if (space.type === "GO") {
      this.setDialogText("Landed on GO! Safe zone.");
      if (player.isAI) {
        setTimeout(() => this.executeAITurnEnd(), 1500);
      } else {
        this.endBtn.style.display = "inline-block";
      }
      return;
    }
    if (space.type === "jail") {
      this.setDialogText("Just visiting Detention Office.");
      if (player.isAI) {
        setTimeout(() => this.executeAITurnEnd(), 1500);
      } else {
        this.endBtn.style.display = "inline-block";
      }
      return;
    }
    if (space.type === "parking") {
      const recharged = this.game.rechargeTera(player, "Tera Orb recharged at Free Parking");
      const itemId = this.game.rollItemDrop(Math.random() < 0.25 ? "rare" : "battle");
      this.game.addItem(player, itemId, 1);
      const item = BattleItems[itemId];
      this.setDialogText(`Free Parking rest stop! ${recharged ? "Tera recharged. " : ""}Found ${item.name}.`);
      if (!player.isAI) this.showCenterActionToast(`Free Parking: ${item.name}!`, "money", this.gameContainer);
      this.awardEvolutionPoints(player, player.pokemon, 1, "Free Parking", this.gameContainer);
      this.updateUI();
      if (player.isAI) {
        setTimeout(() => this.executeAITurnEnd(), 1500);
      } else {
        this.maybeTriggerMysteryEncounter(player, "freeParking", () => {
          this.endBtn.style.display = "inline-block";
        });
      }
      return;
    }
    if (space.type === "gotojail") {
      this.game.sendToJail(player);
      this.setDialogText("Busted! Principal Clavell sent you to detention.");
      this.updateUI();
      if (player.isAI) {
        setTimeout(() => this.executeAITurnEnd(), 1500);
      } else {
        this.endBtn.style.display = "inline-block";
      }
      return;
    }

    // Card Draw Spaces
    if (space.type === "academy" || space.type === "raid") {
      const card = this.game.drawCard(space.type);
      this.showCardDrawModal(space.type === "academy" ? "Academy Class" : "Tera Raid Chest", card);
      return;
    }

    // Tax Spaces
    if (space.type === "tax") {
      const taxCost = space.cost;
      this.game.log(`${player.name} paid $${taxCost} for ${space.name}.`);
      player.cash -= taxCost;
      this.setDialogText(`Landed on ${space.name}. Paid $${taxCost} tax.`);
      this.resolveDuesCheck(playerIdx, null, () => {
        this.updateUI();
        if (player.isAI) {
          setTimeout(() => this.executeAITurnEnd(), 1500);
        } else {
          this.endBtn.style.display = "inline-block";
        }
      });
      return;
    }

    // Property / Station / Utility Spaces
    const ownerIdx = this.game.ownership[spaceId];
    
    // UNOWNED SPACE
    if (ownerIdx === undefined) {
      if (player.isAI) {
        // AI Logic: 80% chance to battle for free property catch, else direct buy outright if they can afford
        const aiWillBattle = Math.random() < 0.8;
        if (aiWillBattle && space.pokemon) {
          this.setDialogText(`${player.name} encounters wild ${space.pokemon} and battles!`);
          
          // Quick simulation for AI wild battle (65% win chance)
          const aiWins = Math.random() < 0.65;
          setTimeout(() => {
            if (aiWins) {
              // Catch rate scales by cost (rarity): Easy: 75%, Medium: 45%, Hard: 20%
              let catchChance = 0.45;
              if (space.cost <= 120) catchChance = 0.75;
              else if (space.cost > 240) catchChance = 0.20;

              const caught = Math.random() < catchChance;
              if (caught) {
                this.game.log(`${player.name} successfully caught wild ${space.pokemon} and claimed it for FREE!`);
                this.game.buyProperty(player.id, spaceId, 100); // 100% discount is free!
              } else {
                this.game.log(`${player.name}'s Poke Ball failed! Wild ${space.pokemon} broke free and fled.`);
              }
            } else {
              this.game.log(`${player.name} was defeated by wild ${space.pokemon}! It fled.`);
            }
            this.updateUI();
            this.executeAITurnEnd();
          }, 1500);
        } else {
          // Direct buy if affordable
          if (player.cash >= space.cost) {
            this.game.buyProperty(player.id, spaceId, 0);
          }
          this.updateUI();
          this.executeAITurnEnd();
        }
      } else {
        // Human player choice
        this.rollBtn.style.display = "none";
        this.setDialogText(`You encountered wild ${space.pokemon}! Battle and catch to claim it for FREE!`);
        this.isEncounterActive = true;
        this.showEncounterSprite(space.pokemon, "WILD ENCOUNTER!");
        
        // Show battle prompt controls
        this.buyBtn.innerText = `BUY AT FULL ($${space.cost})`;
        this.buyBtn.style.display = "inline-block";
        this.buyBtn.classList.add("btn-buy-small");
        
        // Set up custom battle button
        const battleBtn = document.createElement("button");
        battleBtn.className = "btn-comic btn-roll btn-battle-highlight";
        battleBtn.id = "wild-battle-btn";
        battleBtn.innerText = "CHALLENGE BATTLE";
        this.buyBtn.parentNode.insertBefore(battleBtn, this.buyBtn);
        
        battleBtn.addEventListener("click", () => {
          this.isEncounterActive = false;
          this.hideEncounterSprite();
          this.buyBtn.classList.remove("btn-buy-small");
          battleBtn.remove();
          this.buyBtn.style.display = "none";
          this.activePassHandler = null; // Clear active pass handler
          this.promptPokemonSelection((selectedPoke) => {
            this.initiateWildBattle(selectedPoke, space.pokemon, spaceId);
          });
        });

        // Set up pass button
        this.endBtn.innerText = "PASS / AUCTION";
        this.endBtn.style.display = "inline-block";
        const passHandler = () => {
          this.isEncounterActive = false;
          this.hideEncounterSprite();
          this.buyBtn.classList.remove("btn-buy-small");
          this.buyBtn.style.display = "none";
          const wildBtn = document.getElementById("wild-battle-btn");
          if (wildBtn) wildBtn.remove();
          this.endBtn.innerText = "END TURN";
          this.endBtn.style.display = "inline-block"; // Ensure it stays visible
          this.setDialogText(`Passed on wild ${space.pokemon}.`);
          this.activePassHandler = null; // Clear active pass handler
          this.updateUI();
          this.endBtn.style.display = "inline-block"; // Re-show after updateUI in case it was hidden
        };
        this.activePassHandler = passHandler;
      }
      return;
    }

    // OWNED BY CURRENT PLAYER
    if (ownerIdx === player.id) {
      this.setDialogText(`You landed on your own property: ${space.name}.`);
      if (player.isAI) {
        this.executeAITurnEnd();
      } else {
        this.endBtn.style.display = "inline-block";
      }
      return;
    }

    // OWNED BY OPPONENT
    const owner = this.game.players[ownerIdx];
    if (this.game.mortgages[spaceId]) {
      this.setDialogText(`${space.name} is mortgaged. No rent due!`);
      if (player.isAI) {
        this.executeAITurnEnd();
      } else {
        this.endBtn.style.display = "inline-block";
      }
      return;
    }

    // Trigger Trainer Battle Challenge vs Owner
    if (player.isAI) {
      // AI lands on human's property: AI challenges human to a trainer battle!
      if (ownerIdx === 0) { // Owner is Human
        this.rollBtn.style.display = "none";
        this.setDialogText(`${player.name} landed on your property.`);
        this.isEncounterActive = true;
        this.showEncounterSprite(player.pokemon, `${player.name} CHALLENGE!`);
        const rentAmounts = this.getRentAmounts(spaceId);
        
        const acceptChallengeBtn = document.createElement("button");
        acceptChallengeBtn.className = "btn-comic btn-roll btn-battle-highlight";
        acceptChallengeBtn.id = "accept-challenge-btn";
        acceptChallengeBtn.innerText = "DEFEND PROPERTY (Normal)";
        this.rollBtn.parentNode.appendChild(acceptChallengeBtn);

        const highStakesDefenseBtn = document.createElement("button");
        highStakesDefenseBtn.className = "btn-comic btn-mortgage btn-battle-highlight";
        highStakesDefenseBtn.id = "high-stakes-defense-btn";
        const aiWagerOptions = this.getEligibleWagerOptions(player.id);
        highStakesDefenseBtn.innerText = "HIGH STAKES DEFENSE";
        this.rollBtn.parentNode.appendChild(highStakesDefenseBtn);

        // Also provide a fallback: pay full rent without battle
        const payRentFallbackBtn = document.createElement("button");
        payRentFallbackBtn.className = "btn-comic btn-buy btn-buy-small";
        payRentFallbackBtn.id = "pay-rent-fallback-btn";
        payRentFallbackBtn.innerText = `COLLECT RENT +${this.formatMoney(rentAmounts.fullRent)}`;
        this.rollBtn.parentNode.appendChild(payRentFallbackBtn);
        
        const cleanupChallenge = () => {
          this.isEncounterActive = false;
          this.hideEncounterSprite();
          const ac = document.getElementById("accept-challenge-btn");
          if (ac) ac.remove();
          const hsd = document.getElementById("high-stakes-defense-btn");
          if (hsd) hsd.remove();
          const prf = document.getElementById("pay-rent-fallback-btn");
          if (prf) prf.remove();
        };

        acceptChallengeBtn.addEventListener("click", () => {
          cleanupChallenge();
          this.promptPokemonSelection((selectedPoke) => {
            this.initiateTrainerBattle(selectedPoke, player.pokemon, spaceId, player.id, owner.id, { mode: "normal" });
          });
        });

        highStakesDefenseBtn.addEventListener("click", () => {
          const aiWager = aiWagerOptions[0] || null;
          cleanupChallenge();
          this.setDialogText(`High Stakes Defense! Win to collect 1.5x rent${aiWager ? ` and take ${aiWager.name}` : ""}. Lose and ${player.name} gets half rent plus a catch chance, but you keep ${space.name}.`);
          this.promptPokemonSelection((selectedPoke) => {
            this.initiateTrainerBattle(selectedPoke, player.pokemon, spaceId, player.id, owner.id, {
              mode: "high",
              attackerWager: aiWager
            });
          });
        });

        payRentFallbackBtn.addEventListener("click", () => {
          cleanupChallenge();
          // Human owner just collects full rent without battling; AI pays normally
          const rentResult = this.game.payRent(player.id, spaceId, 0);
          this.showMoneyTransfer(rentResult.rent, player.name, owner.name, `${owner.name} collected ${this.formatMoney(rentResult.rent)} rent!`, this.gameContainer);
          this.setDialogText(`${player.name} paid full rent ${this.formatMoney(rentResult.rent)} to you.`);
          this.resolveDuesCheck(player.id, 0, () => {
            this.updateUI();
            this.executeAITurnEnd();
          });
        });
      } else {
        // AI lands on AI: Quick simulate
        const challengerWins = Math.random() < 0.5;
        if (challengerWins) {
          const rentResult = this.game.payRent(player.id, spaceId, 50);
          this.game.log(`${player.name} won trainer battle against ${owner.name}! Paying 50% rent (${this.formatMoney(rentResult.rent)}).`);
          this.resolveDuesCheck(player.id, ownerIdx, () => {
            this.updateUI();
            this.executeAITurnEnd();
          });
        } else {
          this.game.log(`${player.name} lost trainer battle against ${owner.name}! Paying 1.5x rent penalty.`);
          this.game.payRent(player.id, spaceId, -50);
          this.resolveDuesCheck(player.id, ownerIdx, () => {
            this.updateUI();
            this.executeAITurnEnd();
          });
        }
      }
    } else {
      // Human lands on AI's property: Choice
      this.rollBtn.style.display = "none";
      this.setDialogText(`Landed on ${owner.name}'s property.`);
      this.isEncounterActive = true;
      this.showEncounterSprite(owner.pokemon, "TRAINER CHALLENGE!");
      const rentAmounts = this.getRentAmounts(spaceId);
      
      const challengeBtn = document.createElement("button");
      challengeBtn.className = "btn-comic btn-roll btn-battle-highlight";
      challengeBtn.id = "trainer-battle-btn";
      challengeBtn.innerText = "NORMAL BATTLE (50% / 1.5x)";
      this.buyBtn.parentNode.insertBefore(challengeBtn, this.buyBtn);

      const highStakesBtn = document.createElement("button");
      highStakesBtn.className = "btn-comic btn-mortgage btn-battle-highlight";
      highStakesBtn.id = "high-stakes-battle-btn";
      const humanWagerOptions = this.getEligibleWagerOptions(player.id);
      highStakesBtn.innerText = humanWagerOptions.length > 0 ? "HIGH STAKES BATTLE" : "HIGH STAKES (NO WAGER)";
      highStakesBtn.disabled = humanWagerOptions.length === 0;
      this.buyBtn.parentNode.insertBefore(highStakesBtn, this.buyBtn);

      const payBtn = document.createElement("button");
      payBtn.className = "btn-comic btn-buy btn-buy-small";
      payBtn.id = "pay-rent-btn";
      payBtn.innerText = `PAY RENT ${this.formatMoney(rentAmounts.fullRent)}`;
      this.buyBtn.parentNode.insertBefore(payBtn, this.buyBtn);

      challengeBtn.addEventListener("click", () => {
        this.isEncounterActive = false;
        this.hideEncounterSprite();
        challengeBtn.remove();
        highStakesBtn.remove();
        payBtn.remove();
        this.promptPokemonSelection((selectedPoke) => {
          this.initiateTrainerBattle(selectedPoke, owner.pokemon, spaceId, player.id, owner.id, { mode: "normal" });
        });
      });

      highStakesBtn.addEventListener("click", () => {
        this.promptWagerSelection(player.id, (wager) => {
          if (!wager) return;
          this.isEncounterActive = false;
          this.hideEncounterSprite();
          challengeBtn.remove();
          highStakesBtn.remove();
          payBtn.remove();
          this.setDialogText(`High Stakes! Win for half rent and a catch chance. Lose and you give up ${wager.name} plus 1.5x rent.`);
          this.promptPokemonSelection((selectedPoke) => {
            this.initiateTrainerBattle(selectedPoke, owner.pokemon, spaceId, player.id, owner.id, {
              mode: "high",
              attackerWager: wager
            });
          });
        });
      });

      payBtn.addEventListener("click", () => {
        this.isEncounterActive = false;
        this.hideEncounterSprite();
        challengeBtn.remove();
        highStakesBtn.remove();
        payBtn.remove();
        const rentResult = this.game.payRent(player.id, spaceId, 0);
        this.showMoneyTransfer(rentResult.rent, player.name, owner.name, `Paid ${this.formatMoney(rentResult.rent)} rent to ${owner.name}`, this.gameContainer);
        this.setDialogText(`Paid ${this.formatMoney(rentResult.rent)} rent to ${owner.name}. Cash left: ${this.formatMoney(player.cash)}.`);
        this.resolveDuesCheck(player.id, ownerIdx, () => {
          this.updateUI();
          this.endBtn.style.display = "inline-block";
        });
      });
    }
  }

  // Draw Card Display Popup
  showCardDrawModal(deckName, card) {
    Sound.playClick();
    this.cardDrawTitle.innerText = deckName;
    this.cardDrawText.innerText = card.text;
    this.cardDrawOverlay.style.display = "flex";
    
    const resolveAndClose = () => {
      this.cardDrawOverlay.style.display = "none";
      this.cardDrawOkBtn.removeEventListener("click", resolveAndClose);
      
      const playerIdx = this.game.currentPlayerIdx;
      const player = this.game.getCurrentPlayer();
      
      this.game.resolveCard(playerIdx, card);
      this.updateUI();

      this.resolveDuesCheck(playerIdx, null, () => {
        this.checkAndProcessPassedGo(player, () => {
          if (player.isAI) {
            this.executeAITurnEnd();
          } else {
            this.endBtn.style.display = "inline-block";
          }
        });
      });
    };

    this.cardDrawOkBtn.addEventListener("click", resolveAndClose);

    // Auto-dismiss for AI players after 2 seconds
    const currentPlayer = this.game.getCurrentPlayer();
    if (currentPlayer && currentPlayer.isAI) {
      setTimeout(resolveAndClose, 2000);
    }
  }

  // Manage dues & Mortgage loop if player runs out of money
  resolveDuesCheck(debtorIdx, creditorIdx, callback) {
    const player = this.game.players[debtorIdx];
    if (player.cash >= 0) {
      callback();
      return;
    }

    // Check if net worth is sufficient to pay debt
    const netWorth = this.game.getNetWorth(debtorIdx);
    const absoluteDebt = Math.abs(player.cash);

    if (netWorth < absoluteDebt) {
      // Bankruptcy
      this.game.declareBankruptcy(debtorIdx, creditorIdx);
      this.updateUI();
      
      // If Human goes bankrupt, game over!
      if (debtorIdx === 0) {
        alert("Game Over! You went bankrupt. Better luck next time!");
        location.reload();
      } else {
        alert(`${player.name} went bankrupt and was eliminated!`);
        callback();
      }
    } else {
      // Must liquidate assets
      if (debtorIdx === 0) {
        // Human player: must mortgage things
        this.setDialogText(`⚠️ You owe a debt of $${absoluteDebt}! Mortgage properties or sell Camps to clear balance.`);
        
        const resolveDebtBtn = document.createElement("button");
        resolveDebtBtn.className = "btn-comic btn-buy";
        resolveDebtBtn.id = "resolve-debt-btn";
        resolveDebtBtn.innerText = "CONFIRM RESOLVE DEBT";
        this.rollBtn.parentNode.appendChild(resolveDebtBtn);

        const checkDebt = () => {
          if (player.cash >= 0) {
            resolveDebtBtn.remove();
            this.updateUI();
            callback();
          } else {
            alert(`You are still short by $${Math.abs(player.cash)}. Mortgage more properties!`);
          }
        };
        resolveDebtBtn.addEventListener("click", checkDebt);
      } else {
        // AI player: Automatically mortgage property or sell buildings until debt cleared
        this.game.spaces.forEach((s) => {
          if (player.cash < 0 && this.game.ownership[s.id] === debtorIdx) {
            // Sell buildings first
            const bCount = this.game.buildings[s.id] || 0;
            if (bCount > 0) {
              while (this.game.buildings[s.id] > 0 && player.cash < 0) {
                this.game.sellUpgrade(debtorIdx, s.id);
              }
            }
            // Mortgage properties
            if (player.cash < 0 && !this.game.mortgages[s.id]) {
              this.game.mortgageProperty(debtorIdx, s.id);
            }
          }
        });
        this.updateUI();
        callback();
      }
    }
  }


  promptPokemonSelection(callback) {
    const player = this.game.players[0];
    this.game.ensurePokemonProgress(player);
    const collection = player.collection || [];

    // If player has no extra Pokemon, skip selection and use default/starter
    if (collection.length === 0) {
      callback(player.pokemon);
      return;
    }

    // Otherwise, show selection overlay
    this.pokemonSelectionOverlay.style.display = "flex";
    this.pokemonSelectionOverlay.querySelector(".pokemon-selection-title").innerText = "CHOOSE YOUR FIGHTER";
    this.pokemonSelectionOverlay.querySelector(".pokemon-selection-subtitle").innerText = "Select a Pokémon from your inventory for this battle:";
    this.pokemonSelectionConfirmBtn.innerText = "SEND INTO BATTLE!";
    Sound.playClick();

    // Prepare list of options: active partner + one current form per evolution line.
    const options = [
      { name: player.pokemon, isStarter: true, index: -1 }
    ];
    this.getCanonicalCollectionBattleOptions(player).forEach(option => options.push(option));

    let selectedOptionIndex = 0; // Default to active starter (index 0 in options array)

    const renderGrid = () => {
      let html = "";
      options.forEach((opt, idx) => {
        const isSelected = selectedOptionIndex === idx;
        const lowerName = opt.name.toLowerCase();
        let spriteHtml = "";
        if (AVAILABLE_PNGS.includes(lowerName)) {
          spriteHtml = `<img src="images/${lowerName}.png" alt="${opt.name}">`;
        } else {
          spriteHtml = PokemonSVGs[opt.name] || "";
        }

        const pokeInfo = PokemonDB[opt.name] || { type: "Normal" };
        const typeClass = `move-type-tag ${pokeInfo.type.toLowerCase()}`;
        const currentLevel = this.game.getPokemonLevel(player, opt.name);

        html += `
          <div class="fighter-card ${isSelected ? 'selected' : ''}" data-opt-idx="${idx}">
            ${opt.isStarter ? '<div class="fighter-badge">PARTNER</div>' : ''}
            <div class="fighter-level-badge">Lv. ${currentLevel}</div>
            <div class="fighter-sprite">${spriteHtml}</div>
            <div class="fighter-name">${opt.name}</div>
            <span class="${typeClass}">${pokeInfo.type}</span>
          </div>
        `;
      });
      this.pokemonSelectionGrid.innerHTML = html;

      // Attach click listeners to cards
      const cards = this.pokemonSelectionGrid.querySelectorAll(".fighter-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          selectedOptionIndex = parseInt(card.getAttribute("data-opt-idx"));
          Sound.playClick();
          renderGrid();
        });
      });
    };

    renderGrid();

    // Setup confirm button
    this.pokemonSelectionConfirmBtn.onclick = () => {
      this.pokemonSelectionOverlay.style.display = "none";
      Sound.playClick();
      const chosenPokemon = options[selectedOptionIndex].name;
      callback(chosenPokemon);
    };
  }

  getEligibleWagerOptions(playerIdx) {
    const player = this.game.players[playerIdx];
    if (!player) return [];
    this.game.normalizeCollectionMeta(player);
    if (!Array.isArray(player.collection)) player.collection = [];
    return player.collection
      .map((name, idx) => ({ name, idx }))
      .filter(option => !this.isCollectionPokemonLocked(player, option.name));
  }

  promptWagerSelection(playerIdx, callback) {
    const player = this.game.players[playerIdx];
    const options = this.getEligibleWagerOptions(playerIdx);
    if (!player || options.length === 0) {
      this.setDialogText(`${player?.name || "This trainer"} has no unlocked non-partner Pokémon to wager.`);
      callback(null);
      return;
    }
    if (player.isAI) {
      callback(options[0]);
      return;
    }

    this.pokemonSelectionOverlay.style.display = "flex";
    this.pokemonSelectionOverlay.querySelector(".pokemon-selection-title").innerText = "CHOOSE YOUR WAGER";
    this.pokemonSelectionOverlay.querySelector(".pokemon-selection-subtitle").innerText = "High Stakes: if you lose, this Pokémon goes to the property owner.";
    this.pokemonSelectionConfirmBtn.innerText = "WAGER THIS POKÉMON";
    Sound.playClick();

    let selectedOptionIndex = 0;
    const renderGrid = () => {
      this.pokemonSelectionGrid.innerHTML = options.map((opt, idx) => {
        const lowerName = opt.name.toLowerCase();
        const spriteHtml = AVAILABLE_PNGS.includes(lowerName)
          ? `<img src="images/${lowerName}.png" alt="${this.escapeHTML(opt.name)}">`
          : (PokemonSVGs[opt.name] || "");
        const pokeInfo = PokemonDB[opt.name] || { type: "Normal" };
        const currentLevel = this.game.getPokemonLevel(player, opt.name);
        return `
          <div class="fighter-card ${selectedOptionIndex === idx ? "selected" : ""}" data-opt-idx="${idx}">
            <div class="fighter-badge">WAGER</div>
            <div class="fighter-level-badge">Lv. ${currentLevel}</div>
            <div class="fighter-sprite">${spriteHtml}</div>
            <div class="fighter-name">${this.escapeHTML(opt.name)}</div>
            <span class="move-type-tag ${pokeInfo.type.toLowerCase()}">${this.escapeHTML(pokeInfo.type)}</span>
          </div>
        `;
      }).join("");
      this.pokemonSelectionGrid.querySelectorAll(".fighter-card").forEach(card => {
        card.addEventListener("click", () => {
          selectedOptionIndex = parseInt(card.getAttribute("data-opt-idx"), 10);
          Sound.playClick();
          renderGrid();
        });
      });
    };

    renderGrid();
    this.pokemonSelectionConfirmBtn.onclick = () => {
      this.pokemonSelectionOverlay.style.display = "none";
      Sound.playClick();
      callback(options[selectedOptionIndex]);
    };
  }

  transferWagerPokemon(fromIdx, toIdx, wager) {
    const fromPlayer = this.game.players[fromIdx];
    const toPlayer = this.game.players[toIdx];
    if (!fromPlayer || !toPlayer || !wager) return false;
    if (!Array.isArray(fromPlayer.collection)) fromPlayer.collection = [];
    if (!Array.isArray(toPlayer.collection)) toPlayer.collection = [];
    this.game.normalizeCollectionMeta(fromPlayer);
    this.game.normalizeCollectionMeta(toPlayer);

    let idx = wager.idx;
    if (fromPlayer.collection[idx] !== wager.name) {
      idx = fromPlayer.collection.indexOf(wager.name);
    }
    if (idx < 0 || this.isCollectionPokemonLocked(fromPlayer, fromPlayer.collection[idx])) return false;

    const [pokemonName] = fromPlayer.collection.splice(idx, 1);
    const [meta] = fromPlayer.collectionMeta.splice(idx, 1);
    toPlayer.collection.push(pokemonName);
    toPlayer.collectionMeta.push(meta || null);
    fromPlayer.lockedCollectionPokemon = (fromPlayer.lockedCollectionPokemon || []).filter(name => name !== pokemonName);
    this.game.log(`${toPlayer.name} won ${pokemonName} from ${fromPlayer.name} in a High Stakes battle!`);
    this.renderCollection();
    this.updateUI();
    return true;
  }

  getCanonicalCollectionBattleOptions(player) {
    const activeBase = this.game.normalizePokemonName(player, player.pokemon);
    const byBase = new Map();
    (player.collection || []).forEach((name, idx) => {
      const baseName = this.game.normalizePokemonName(player, name);
      if (baseName === activeBase) return;
      const chain = this.game.getEvolutionChain(baseName);
      const stage = chain ? Math.max(0, chain.indexOf(name)) : 0;
      const existing = byBase.get(baseName);
      if (!existing || stage > existing.stage) {
        byBase.set(baseName, { name, isStarter: false, index: idx, stage });
      }
    });
    return [...byBase.values()].map(({ stage, ...option }) => option);
  }

  checkAndProcessPassedGo(player, callback) {
    if (!player || !player.passedGo) {
      callback();
      return;
    }

    player.passedGo = false; // Reset the flag

    if (player.isAI) {
      // AI automatically levels up its partner/starter Pokémon
      const starterName = player.pokemon;
      const normName = this.game.normalizePokemonName(player, starterName);
      player.pokemonLevelUps[normName] = (player.pokemonLevelUps[normName] || 0) + 1;
      this.game.recalculatePlayerStats(player.id);
      const newLvl = this.game.getPokemonLevel(player, starterName);
      this.game.log(`${player.name} leveled up ${starterName} to Lv. ${newLvl}!`);
      this.updateUI();
      callback();
    } else {
      // Human player level up interaction
      Sound.playVictory();
      this.pokemonLevelupOverlay.style.display = "flex";

      // Prepare options list: active starter + all Pokémon in collection
      const options = [
        { name: player.pokemon, isStarter: true }
      ];
      player.collection.forEach(name => {
        // Avoid duplicates if same Pokémon caught twice
        if (!options.some(opt => opt.name === name)) {
          options.push({ name, isStarter: false });
        }
      });

      let selectedIdx = 0;

      const renderLevelupGrid = () => {
        let html = "";
        options.forEach((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const lowerName = opt.name.toLowerCase();
          let spriteHtml = "";
          if (AVAILABLE_PNGS.includes(lowerName)) {
            spriteHtml = `<img src="images/${lowerName}.png" alt="${opt.name}">`;
          } else {
            spriteHtml = PokemonSVGs[opt.name] || "";
          }

          const currentLvl = this.game.getPokemonLevel(player, opt.name);
          const nextLvl = currentLvl + 1;

          const base = PokemonDB[opt.name] || { hp: 100, speed: 50, type: "Normal" };
          
          // Calculate current stats
          const currentHp = base.hp + (currentLvl - 1) * 15;
          const currentSpeed = base.speed + (currentLvl - 1) * 2;
          const currentPowerPct = (currentLvl - 1) * 10;

          // Calculate upgraded stats
          const nextHp = base.hp + (nextLvl - 1) * 15;
          const nextSpeed = base.speed + (nextLvl - 1) * 2;
          const nextPowerPct = (nextLvl - 1) * 10;

          const typeClass = `move-type-tag ${base.type.toLowerCase()}`;

          html += `
            <div class="levelup-card ${isSelected ? 'selected' : ''}" data-opt-idx="${idx}">
              ${opt.isStarter ? '<div class="levelup-badge">PARTNER</div>' : ''}
              <div class="levelup-sprite">${spriteHtml}</div>
              <div class="levelup-name">${opt.name}</div>
              <span class="${typeClass}" style="margin-bottom: 8px;">${base.type}</span>
              <div class="levelup-level">Level ${currentLvl}</div>
              
              <div class="levelup-stats">
                <div class="levelup-stat-line">
                  <span>HP:</span>
                  <span>${currentHp} <span class="levelup-stat-change">→ ${nextHp} (+15)</span></span>
                </div>
                <div class="levelup-stat-line">
                  <span>Speed:</span>
                  <span>${currentSpeed} <span class="levelup-stat-change">→ ${nextSpeed} (+2)</span></span>
                </div>
                <div class="levelup-stat-line">
                  <span>Power:</span>
                  <span>+${currentPowerPct}% <span class="levelup-stat-change">→ +${nextPowerPct}% (+10%)</span></span>
                </div>
              </div>
            </div>
          `;
        });

        this.pokemonLevelupGrid.innerHTML = html;

        // Attach event listeners
        const cards = this.pokemonLevelupGrid.querySelectorAll(".levelup-card");
        cards.forEach(card => {
          card.addEventListener("click", () => {
            selectedIdx = parseInt(card.getAttribute("data-opt-idx"));
            Sound.playClick();
            renderLevelupGrid();
          });
        });
      };

      renderLevelupGrid();

      this.pokemonLevelupConfirmBtn.onclick = () => {
        this.pokemonLevelupOverlay.style.display = "none";
        Sound.playVictory();
        
        const chosen = options[selectedIdx].name;
        const normName = this.game.normalizePokemonName(player, chosen);
        player.pokemonLevelUps[normName] = (player.pokemonLevelUps[normName] || 0) + 1;
        this.game.recalculatePlayerStats(player.id);
        
        const newLvl = this.game.getPokemonLevel(player, chosen);
        this.game.log(`🎉 You leveled up ${chosen} to Lv. ${newLvl}! Stats increased!`);
        this.updateUI();

        this.maybeTriggerMysteryEncounter(player, "passGo", callback);
      };
    }
  }

  maybeTriggerMysteryEncounter(player, trigger, continuation) {
    if (!player || player.id !== 0 || player.isBankrupt || this.victoryShown) {
      continuation();
      return;
    }
    if (this.isEncounterActive || this.isOverlayVisible(this.battleOverlay) || this.isOverlayVisible(this.catchOverlay)) {
      continuation();
      return;
    }

    const state = this.game.mysteryEncounterState || this.game.createMysteryEncounterState();
    this.game.mysteryEncounterState = state;
    const baseChanceByTrigger = {
      passGo: 0.16,
      freeParking: 0.28,
      card: 0.14,
      propertyClaim: 0.12,
      defenseWin: 0.18,
      turnEnd: 0.08
    };
    const pityChance = Math.min(0.18, (state.sinceLastEncounter || 0) * 0.015);
    const chance = (baseChanceByTrigger[trigger] || 0.08) + pityChance;
    if (Math.random() > chance) {
      continuation();
      return;
    }

    const encounter = this.createMysteryEncounter(trigger);
    state.sinceLastEncounter = 0;
    state.totalMysteryEncounters = (state.totalMysteryEncounters || 0) + 1;
    if (encounter.isShiny) state.shinyEncounters = (state.shinyEncounters || 0) + 1;
    this.showMysteryEncounterModal(encounter, continuation);
  }

  isOverlayVisible(element) {
    return !!element && window.getComputedStyle(element).display !== "none";
  }

  createMysteryEncounter(trigger = "turnEnd") {
    const pick = MYSTERY_POKEMON_POOL[Math.floor(Math.random() * MYSTERY_POKEMON_POOL.length)];
    const roll = Math.random();
    let kind = "Rare";
    if (roll < 0.08) kind = "Roaming Legendary";
    else if (roll < 0.20) kind = "Titan";
    else if (roll < 0.36) kind = "Tera";
    else if (roll < 0.52) kind = "Swarm";
    const isShiny = Math.random() < 0.18;
    const quirk = MYSTERY_QUIRKS[Math.floor(Math.random() * MYSTERY_QUIRKS.length)];
    const type = PokemonDB[pick.name]?.type || "Normal";
    const costBoost = kind === "Titan" ? 80 : kind === "Roaming Legendary" ? 120 : 0;
    return {
      id: `mystery_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: pick.name,
      title: pick.title,
      trigger,
      kind,
      rarity: pick.rarity,
      isShiny,
      quirk,
      type,
      cost: pick.cost + costBoost,
      watched: false,
      baited: false
    };
  }

  showMysteryEncounterModal(encounter, continuation) {
    const overlay = this.ensureMysteryEncounterOverlay();
    const render = () => {
      const shiny = encounter.isShiny ? `<span class="mystery-tag shiny">SHINY</span>` : "";
      overlay.innerHTML = `
        <div class="mystery-card ${encounter.isShiny ? "shiny" : ""}">
          <div class="mystery-kicker">A mysterious sparkle flashes across the board...</div>
          <div class="mystery-title">${this.escapeHTML(encounter.isShiny ? `SHINY ${encounter.name}!` : encounter.title)}</div>
          <div class="mystery-body">
            <div class="mystery-sprite ${encounter.isShiny ? "shiny" : ""}">${this.getMysterySpriteMarkup(encounter)}</div>
            <div class="mystery-info">
              <div class="mystery-name">${this.escapeHTML(encounter.name)}</div>
              <div class="mystery-tags">
                ${shiny}
                <span class="mystery-tag">${this.escapeHTML(encounter.kind)}</span>
                <span class="mystery-tag">${this.escapeHTML(encounter.rarity)}</span>
                <span class="move-type-tag ${encounter.type.toLowerCase()}">${this.escapeHTML(encounter.type)}</span>
              </div>
              <p>${this.escapeHTML(this.getMysteryFlavorText(encounter))}</p>
              <div class="mystery-quirk"><strong>Quirk:</strong> ${this.escapeHTML(encounter.quirk.name)} - ${this.escapeHTML(encounter.quirk.text)}</div>
              ${encounter.baited ? `<div class="mystery-note">Bait tossed: catch odds improved.</div>` : ""}
              ${encounter.watched ? `<div class="mystery-note">Watched carefully: battle level scouted.</div>` : ""}
            </div>
          </div>
          <div class="mystery-actions">
            <button class="btn-comic mystery-battle">BATTLE & CATCH</button>
            <button class="btn-comic mystery-bait">TOSS BAIT $50</button>
            <button class="btn-comic mystery-watch">WATCH CAREFULLY</button>
            <button class="btn-comic mystery-ignore">IGNORE</button>
          </div>
        </div>
      `;
      overlay.querySelector(".mystery-battle").addEventListener("click", () => {
        overlay.style.display = "none";
        this.promptPokemonSelection(selectedPoke => this.initiateMysteryBattle(selectedPoke, encounter, continuation));
      });
      overlay.querySelector(".mystery-bait").addEventListener("click", () => {
        const player = this.game.players[0];
        if (player.cash < 50) {
          this.setDialogText("Not enough cash to toss bait.");
          return;
        }
        player.cash -= 50;
        encounter.baited = true;
        this.game.log(`${player.name} tossed bait for the mysterious ${encounter.name}.`);
        this.updateUI();
        render();
      });
      overlay.querySelector(".mystery-watch").addEventListener("click", () => {
        encounter.watched = true;
        this.game.log(`${this.game.players[0].name} watched ${encounter.name} carefully and learned its quirk.`);
        render();
      });
      overlay.querySelector(".mystery-ignore").addEventListener("click", () => {
        overlay.style.display = "none";
        this.setDialogText(`The mysterious ${encounter.name} vanished into Paldea.`);
        continuation();
      });
    };
    render();
    overlay.style.display = "flex";
    Sound.playVictory();
  }

  ensureMysteryEncounterOverlay() {
    let overlay = document.getElementById("mystery-encounter-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "mystery-encounter-overlay";
    overlay.className = "mystery-encounter-overlay";
    document.body.appendChild(overlay);
    return overlay;
  }

  getMysteryFlavorText(encounter) {
    if (encounter.kind === "Titan") return `${encounter.name} is huge, glowing, and shaking the board. Win the battle for a trophy catch.`;
    if (encounter.kind === "Tera") return `${encounter.name} sparkles with Tera energy. Its catch will carry a special badge.`;
    if (encounter.kind === "Swarm") return `A quick swarm surrounds ${encounter.name}. This is a short-lived chance.`;
    if (encounter.kind === "Roaming Legendary") return `${encounter.name} is roaming fast. It may not appear again soon.`;
    return `${encounter.name} appears in a comic burst outside the normal board spaces.`;
  }

  getMysterySpriteMarkup(encounter) {
    const lowerName = encounter.name.toLowerCase();
    if (AVAILABLE_PNGS.includes(lowerName)) {
      return `<img src="images/${lowerName}.png" alt="${this.escapeHTML(encounter.name)}">`;
    }
    if (PokemonSVGs[encounter.name]) return PokemonSVGs[encounter.name];
    const initials = encounter.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    return `<div class="mystery-fallback-sprite ${encounter.type.toLowerCase()}"><span>${this.escapeHTML(initials)}</span></div>`;
  }

  initiateMysteryBattle(playerPoke, encounter, continuation) {
    this.resetBattleUIState();
    Sound.playBattleBGM();
    this.battleOverlay.style.display = "grid";
    this.battleTeraBtn.disabled = encounter.kind !== "Tera";
    this.playerPokeTera.style.display = "none";
    this.enemyPokeTera.style.display = encounter.kind === "Tera" ? "inline-block" : "none";

    const player = this.game.players[0];
    this.game.resetBattleItemUse(player);
    const pLevel = this.game.getPokemonLevel(player, playerPoke);
    const eLevel = Math.max(2, Math.floor(encounter.cost / 70) + (encounter.kind === "Titan" ? 2 : 0));
    const pMoves = this.getBattleMovesForPlayer(player, playerPoke);
    const pTraining = this.game.getPokemonTraining(player, playerPoke);
    Battle.startBattle(playerPoke, encounter.name, false, null, 0, null, pLevel, eLevel, player.powerUpgrades || 0, 0, (won) => {
      Sound.stopBattleBGM();
      this.battleOverlay.style.display = "none";
      this.awardBattleItemDrop(player, won, encounter.kind === "Titan" || encounter.rarity === "Ultra Rare" ? "rare" : "battle");
      if (won) this.awardEvolutionPoints(player, playerPoke, 1, "battle win", this.gameContainer);
      if (!won) {
        this.setDialogText(`${encounter.name} escaped after the battle. The board goes quiet again.`);
        this.game.log(`Mystery encounter ${encounter.name} escaped after defeating ${playerPoke}.`);
        continuation();
        return;
      }
      this.initiateMysteryCatchMiniGame(encounter, success => {
        if (success) {
          this.addMysteryPokemonToCollection(encounter);
          this.awardEvolutionPoints(player, playerPoke, 1, "caught a Pokémon", this.gameContainer);
          this.setDialogText(`${encounter.isShiny ? "Shiny " : ""}${encounter.name} joined your collection with ${encounter.quirk.name}!`);
          this.game.log(`✨ ${player.name} caught ${encounter.isShiny ? "Shiny " : ""}${encounter.name} (${encounter.kind}, ${encounter.quirk.name}).`);
          this.renderCollection();
          this.updateUI();
        } else {
          this.setDialogText(`${encounter.name} broke free and disappeared in a flash.`);
          this.game.log(`Mystery ${encounter.name} broke free and vanished.`);
        }
        continuation();
      });
    }, pMoves, null, pTraining);

    this.updateBattleHUDs();
    this.setBattleLog(`${encounter.kind} mystery encounter! ${encounter.name} wants to battle!`);
  }

  initiateMysteryCatchMiniGame(encounter, callback) {
    const catchSpace = {
      id: MYSTERY_CATCH_SPACE_ID,
      name: `${encounter.kind} ${encounter.name}`,
      pokemon: encounter.name,
      cost: encounter.baited ? Math.max(60, encounter.cost - 80) : encounter.cost,
      mysteryEncounter: encounter
    };
    this.initiateCatchMiniGame(MYSTERY_CATCH_SPACE_ID, callback, catchSpace, 0);
  }

  addMysteryPokemonToCollection(encounter) {
    const player = this.game.players[0];
    this.game.normalizeCollectionMeta(player);
    player.collection.push(encounter.name);
    player.collectionMeta.push({
      source: "mystery",
      kind: encounter.kind,
      rarity: encounter.rarity,
      shiny: !!encounter.isShiny,
      quirk: encounter.quirk.name,
      caughtAt: Date.now()
    });
    const normName = this.game.normalizePokemonName(player, encounter.name);
    if (encounter.quirk.levelBonus) {
      player.pokemonLevelUps[normName] = (player.pokemonLevelUps[normName] || 0) + encounter.quirk.levelBonus;
    }
    if (encounter.quirk.cashBonus) {
      player.cash += encounter.quirk.cashBonus;
      this.showCenterActionToast(`+$${encounter.quirk.cashBonus} ${encounter.quirk.name} quirk!`, "money", this.gameContainer);
    }
    if (encounter.quirk.pityBonus && this.game.mysteryEncounterState) {
      this.game.mysteryEncounterState.sinceLastEncounter += encounter.quirk.pityBonus;
    }
    if (this.game.mysteryEncounterState) {
      this.game.mysteryEncounterState.rareCaught = (this.game.mysteryEncounterState.rareCaught || 0) + 1;
    }
  }

  /* --- BATTLE LOGIC WRAPPERS --- */
  initiateWildBattle(playerPoke, enemyPoke, spaceId) {
    this.resetBattleUIState();
    this.prevPlayerTera = false;
    this.prevEnemyTera = false;
    Sound.playBattleBGM();
    this.battleOverlay.style.display = "grid";
    this.battleTeraBtn.disabled = false;
    this.playerPokeTera.style.display = "none";
    this.enemyPokeTera.style.display = "none";

    const pLevel = this.game.getPokemonLevel(this.game.players[0], playerPoke);
    const eLevel = Math.max(1, Math.floor(this.game.spaces[spaceId].cost / 60));
    const pPower = this.game.players[0].powerUpgrades || 0;
    const pMoves = this.getBattleMovesForPlayer(this.game.players[0], playerPoke);
    const pTraining = this.game.getPokemonTraining(this.game.players[0], playerPoke);
    this.game.resetBattleItemUse(this.game.players[0]);

    Battle.startBattle(playerPoke, enemyPoke, false, spaceId, 0, null, pLevel, eLevel, pPower, 0, (won) => {
      Sound.stopBattleBGM();
      this.battleOverlay.style.display = "none";
      this.awardBattleItemDrop(this.game.players[0], won, "battle");
      if (won) this.awardEvolutionPoints(this.game.players[0], playerPoke, 1, "battle win", this.gameContainer);
      if (won) {
        // human wins the battle: transition to the catch mini-game!
        this.initiateCatchMiniGame(spaceId, (success) => {
          const space = this.game.spaces[spaceId];
          if (success) {
            this.game.log(`GOTCHA! Player successfully caught wild ${space.pokemon} and added it to their Collection!`);
            const player0 = this.game.players[0];
            if (!player0.collection) player0.collection = [];
            this.game.normalizeCollectionMeta(player0);
            if (!player0.collection.includes(space.pokemon)) {
              player0.collection.push(space.pokemon);
              player0.collectionMeta.push(null);
            }
            this.awardEvolutionPoints(player0, playerPoke, 1, "caught a Pokémon", this.gameContainer);
            this.renderCollection();
            this.game.buyProperty(player0.id, spaceId, 100);
            this.setDialogText(`You caught and claimed ${space.name} for FREE!`);
            this.buyBtn.style.display = "none";
            this.endBtn.innerText = "END TURN";
            this.endBtn.style.display = "inline-block";
            this.updateUI();
            this.showColorSetUpgradePrompt(spaceId);
          } else {
            this.game.log(`Oh no! The wild ${space.pokemon} broke free and fled.`);
            this.showFullPriceBuyAfterFailedWildClaim(spaceId, `Oh no! Wild ${space.pokemon} broke free and fled. You can still buy ${space.name} at full price.`);
          }
        });
      } else {
        // Human loses the free-claim battle, but may still buy the unowned property normally.
        this.game.log(`Wild ${enemyPoke} defeated player and fled!`);
        const space = this.game.spaces[spaceId];
        this.showFullPriceBuyAfterFailedWildClaim(spaceId, `Defeat! Wild ${enemyPoke} fled. You can still buy ${space.name} at full price.`);
      }
    }, pMoves, null, pTraining);

    this.updateBattleHUDs();
    this.setBattleLog("A wild Pokémon appeared! Start the battle!");
  }

  showFullPriceBuyAfterFailedWildClaim(spaceId, message) {
    const space = this.game.spaces[spaceId];
    if (this.game.ownership[spaceId] !== undefined) {
      this.buyBtn.style.display = "none";
      this.endBtn.innerText = "END TURN";
      this.endBtn.style.display = "inline-block";
      this.updateUI();
      return;
    }

    this.currentWildDiscount = 0;
    this.isEncounterActive = false;
    this.hideEncounterSprite();
    this.setDialogText(message);
    this.updateUI();
    this.buyBtn.innerText = `BUY AT FULL ($${space.cost})`;
    this.buyBtn.classList.add("btn-buy-small");
    this.buyBtn.style.display = "inline-block";
    this.endBtn.innerText = "END TURN";
    this.endBtn.style.display = "inline-block";
  }

  initiateCatchMiniGame(spaceId, onCatchResult = null, customCatchSpace = null, catchPlayerIdx = null) {
    this.catchSpaceId = spaceId;
    this.onCatchResult = onCatchResult;
    this.activeCatchSpace = customCatchSpace || this.game.spaces[spaceId];
    this.activeCatchPlayerIdx = catchPlayerIdx;
    const space = this.getActiveCatchSpace();
    this.selectedBall = "poke";
    this.hasCatchGameStarted = false;
    this.ballCostPaid = false;
    this.pendingCatchQuality = "Miss";

    // Update active UI state for default Poke Ball
    this.ballBtnPoke.classList.add("active");
    this.ballBtnGreat.classList.remove("active");
    this.ballBtnUltra.classList.remove("active");

    // Display overlay
    this.catchOverlay.style.display = "flex";
    this.catchFeedback.classList.remove("show");
    this.pokeballProjectile.style.display = "none";
    this.pokeballProjectile.className = "pokeball-projectile";
    this.catchPokemonSprite.style.transform = "scale(1)";
    this.catchPokemonSprite.style.opacity = "1";
    this.throwBallBtn.disabled = false;
    this.throwBallBtn.style.display = "inline-block";

    // Randomly select game type
    const gameTypes = ["circle", "bar", "spam", "qte"];
    this.catchGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];

    // Render wild Pokemon sprite
    const lowerPoke = space.pokemon.toLowerCase();
    const availablePNGs = AVAILABLE_PNGS;
    if (availablePNGs.includes(lowerPoke)) {
      this.catchPokemonSprite.innerHTML = `<img src="images/${lowerPoke}.png" alt="${space.pokemon}">`;
    } else {
      this.catchPokemonSprite.innerHTML = PokemonSVGs[space.pokemon] || this.getMysterySpriteMarkup({
        name: space.pokemon,
        type: PokemonDB[space.pokemon]?.type || "Normal"
      });
    }

    // Hide all minigame elements initially
    this.catchBarContainer.style.display = "none";
    this.catchSpamContainer.style.display = "none";
    this.catchQteContainer.style.display = "none";
    this.catchRingOuter.style.display = "none";
    this.catchRingInner.style.display = "none";
    this.ballSelectionPanel.style.display = "flex";

    // Set visibility of circle guides based on active game
    const guides = this.catchOverlay.querySelectorAll(".catch-guide");
    guides.forEach(g => g.style.display = (this.catchGameType === "circle" ? "block" : "none"));

    const legendEl = this.catchOverlay.querySelector(".catch-legend");

    // Set difficulty config
    this.updateCatchRingSpecs();

    // Start appropriate mini-game setup
    if (this.catchGameType === "circle") {
      this.catchRingOuter.style.display = "block";
      this.catchRingInner.style.display = "block";
      this.throwBallBtn.innerText = "THROW BALL!";
      document.getElementById("catch-subtitle-text").innerText = "Time your throw! Catch the Pokémon when the shrinking circle is smallest!";
      if (legendEl) {
        legendEl.innerText = "🎯 Ring Guide: Colored circle must shrink inside dashed guides. Yellow = Nice, Blue = Great, Purple = Excellent.";
      }
      
      this.ringProgress = 100;
      this.ringDirection = -1;
      this.isCatchAnimRunning = true;
      this.animateCatchRing();
    } else if (this.catchGameType === "bar") {
      this.catchBarContainer.style.display = "block";
      this.throwBallBtn.innerText = "THROW BALL!";
      document.getElementById("catch-subtitle-text").innerText = "Stop the slider in the middle sweet spot for the highest catch rate!";
      if (legendEl) {
        legendEl.innerText = "🎯 Slider Guide: Stop the slider in the green sweet spot. Yellow = Nice, Blue = Great, Purple = Excellent.";
      }
      
      this.sliderProgress = 0;
      this.sliderDirection = 1;
      this.isCatchAnimRunning = true;
      this.animateBarGame();
    } else if (this.catchGameType === "spam") {
      this.catchSpamContainer.style.display = "flex";
      this.throwBallBtn.innerText = "START CATCH!";
      document.getElementById("catch-subtitle-text").innerText = "Spam Spacebar or click/tap as fast as possible to fill the power meter!";
      if (legendEl) {
        legendEl.innerText = "🎯 Spam Guide: Click/mash as fast as possible. The more the bar is filled at 0s, the higher the catch rate!";
      }
      
      this.spamProgress = 0;
      this.catchSpamFill.style.width = "0%";
      this.spamTimeLeft = 4.0;
      this.catchSpamTimer.innerText = "Time: 4.0s";
      this.isCatchAnimRunning = false;
    } else if (this.catchGameType === "qte") {
      this.catchQteContainer.style.display = "flex";
      this.throwBallBtn.innerText = "START CATCH!";
      document.getElementById("catch-subtitle-text").innerText = "Type the arrow keys (or click buttons) in sequence before time runs out!";
      if (legendEl) {
        legendEl.innerText = "🎯 QTE Guide: Enter the arrow keys in sequence. Completing it faster gives a higher catch rate!";
      }
      
      this.qteTimeLeft = 5.0;
      this.catchQteTimer.innerText = "Time: 5.0s";
      this.isCatchAnimRunning = false;
      this.generateQteSequence();
    }
  }

  updateCatchRingSpecs() {
    const space = this.getActiveCatchSpace();
    if (!space) return;

    // Difficulty config based on cost: Easy (<=120), Medium (<=240), Hard (>240)
    let baseSpeed = 2.0;
    let ringColor = "#2ECC71"; // Green (Easy)

    if (space.cost <= 120) {
      baseSpeed = 1.8;
      ringColor = "#2ECC71"; // Green
    } else if (space.cost > 120 && space.cost <= 240) {
      baseSpeed = 2.8;
      ringColor = "#E67E22"; // Orange (Medium)
    } else {
      baseSpeed = 4.0;
      ringColor = "#E74C3C"; // Red (Hard)
    }

    // Adjustments based on chosen ball type
    let multiplier = 1.0;
    if (this.selectedBall === "great") {
      baseSpeed *= 0.65; // 35% slower
      multiplier = 1.3;
    } else if (this.selectedBall === "ultra") {
      baseSpeed *= 0.4;  // 60% slower
      multiplier = 1.6;
    }

    this.ringSpeed = baseSpeed;

    if (this.catchGameType === "circle") {
      this.catchRingInner.style.borderColor = ringColor;
      this.catchRingInner.style.boxShadow = `0 0 10px ${ringColor}`;

      // Update guides visually
      const niceGuide = this.catchOverlay.querySelector(".catch-guide.nice");
      const greatGuide = this.catchOverlay.querySelector(".catch-guide.great");
      const excellentGuide = this.catchOverlay.querySelector(".catch-guide.excellent");

      if (niceGuide && greatGuide && excellentGuide) {
        niceGuide.style.width = `${136 * multiplier}px`;
        niceGuide.style.height = `${136 * multiplier}px`;
        greatGuide.style.width = `${96 * multiplier}px`;
        greatGuide.style.height = `${96 * multiplier}px`;
        excellentGuide.style.width = `${60 * multiplier}px`;
        excellentGuide.style.height = `${60 * multiplier}px`;
      }
    } else if (this.catchGameType === "bar") {
      // Size horizontal sweet spot based on difficulty and ball multiplier
      let sweetSpotWidth = 40;
      if (space.cost <= 120) {
        sweetSpotWidth = 60;
      } else if (space.cost > 240) {
        sweetSpotWidth = 24;
      }

      const finalSweetSpotWidth = sweetSpotWidth * multiplier;
      this.catchBarSweetspot.style.height = "100%";
      this.catchBarSweetspot.style.top = "0";
      this.catchBarSweetspot.style.width = `${finalSweetSpotWidth}px`;
      // Centers the sweet spot inside the 260px container
      this.catchBarSweetspot.style.left = `${130 - (finalSweetSpotWidth / 2)}px`;
    }
  }

  animateCatchRing() {
    if (!this.isCatchAnimRunning || this.catchGameType !== "circle") return;

    this.ringProgress += this.ringDirection * this.ringSpeed;
    if (this.ringProgress <= 10) {
      this.ringProgress = 100; // Reset to full circle size
    }

    // Update inner circle radius scale
    this.catchRingInner.style.width = `${this.ringProgress}%`;
    this.catchRingInner.style.height = `${this.ringProgress}%`;

    // Dynamic ring coloring based on current size and ball type
    let multiplier = 1.0;
    if (this.selectedBall === "great") multiplier = 1.3;
    else if (this.selectedBall === "ultra") multiplier = 1.6;

    const excellentMin = 15;
    const excellentMax = 30 * multiplier;
    const greatMax = 48 * multiplier;
    const niceMax = 68 * multiplier;

    let ringColor = "rgba(0, 0, 0, 0.45)"; // Grey (Miss / Neutral)
    if (this.ringProgress >= excellentMin && this.ringProgress <= excellentMax) {
      ringColor = "#9B59B6"; // Purple (Excellent)
    } else if (this.ringProgress > excellentMax && this.ringProgress <= greatMax) {
      ringColor = "#3498DB"; // Blue (Great)
    } else if (this.ringProgress > greatMax && this.ringProgress <= niceMax) {
      ringColor = "#F1C40F"; // Yellow (Nice)
    }

    this.catchRingInner.style.borderColor = ringColor;
    this.catchRingInner.style.boxShadow = `0 0 10px ${ringColor}`;

    this.catchAnimationId = requestAnimationFrame(() => this.animateCatchRing());
  }

  animateBarGame() {
    if (!this.isCatchAnimRunning || this.catchGameType !== "bar") return;

    this.sliderProgress += this.sliderDirection * this.ringSpeed;
    if (this.sliderProgress >= 100) {
      this.sliderProgress = 100;
      this.sliderDirection = -1;
    } else if (this.sliderProgress <= 0) {
      this.sliderProgress = 0;
      this.sliderDirection = 1;
    }

    // Update indicator left position (centered via calc(-4px) for width 8px indicator in 260px container)
    this.catchBarIndicator.style.left = `calc(${this.sliderProgress}% - 4px)`;
    this.catchBarIndicator.style.top = "-2px";

    // Dynamic indicator coloring depending on proximity to center (50%)
    const diff = Math.abs(this.sliderProgress - 50);
    let color = "rgba(0, 0, 0, 0.45)";
    if (diff <= 5) {
      color = "#9B59B6"; // Purple (Excellent)
    } else if (diff <= 15) {
      color = "#3498DB"; // Blue (Great)
    } else if (diff <= 30) {
      color = "#F1C40F"; // Yellow (Nice)
    }

    this.catchBarIndicator.style.backgroundColor = color;
    this.catchBarIndicator.style.boxShadow = `0 0 8px ${color}`;

    this.catchAnimationId = requestAnimationFrame(() => this.animateBarGame());
  }

  startActiveCatchGame() {
    const player = this.getActiveCatchPlayer();
    let costOfBall = 0;
    if (this.selectedBall === "great") costOfBall = 50;
    else if (this.selectedBall === "ultra") costOfBall = 100;

    if (player.cash < costOfBall) {
      alert("Not enough cash to buy this Poke Ball! Swapping back to standard Poke Ball.");
      this.selectedBall = "poke";
      this.ballBtnPoke.click();
      return;
    }

    // Deduct ball cost
    if (costOfBall > 0) {
      player.cash -= costOfBall;
      this.game.log(`${player.name} bought a ${this.selectedBall === "great" ? "Great Ball" : "Ultra Ball"} for $${costOfBall}.`);
      this.updateUI();
    }
    this.ballCostPaid = true;
    this.hasCatchGameStarted = true;

    // Hide ball selection buttons
    this.ballSelectionPanel.style.display = "none";

    if (this.catchGameType === "spam") {
      this.spamProgress = 0;
      this.spamTimeLeft = 4.0;
      this.throwBallBtn.innerText = "MASH!";
      this.isCatchAnimRunning = true;
      this.lastSpamFrameTime = performance.now();
      this.spamLoop();
    } else if (this.catchGameType === "qte") {
      this.throwBallBtn.style.display = "none";
      this.qteTimeLeft = 5.0;
      this.isCatchAnimRunning = true;
      this.lastQteFrameTime = performance.now();
      this.qteLoop();
      // Render sequence to update state colors
      this.renderQteSequence();
    }
  }

  spamLoop() {
    if (!this.isCatchAnimRunning || this.catchGameType !== "spam") return;

    const now = performance.now();
    const dt = (now - this.lastSpamFrameTime) / 1000;
    this.lastSpamFrameTime = now;

    // Slowly decay the spam meter
    this.spamProgress = Math.max(0, this.spamProgress - 8 * dt);
    this.catchSpamFill.style.width = `${this.spamProgress}%`;

    // Decrement time limit
    this.spamTimeLeft = Math.max(0, this.spamTimeLeft - dt);
    this.catchSpamTimer.innerText = `Time: ${this.spamTimeLeft.toFixed(1)}s`;

    if (this.spamTimeLeft <= 0) {
      this.isCatchAnimRunning = false;
      this.resolveSpamThrow();
    } else {
      requestAnimationFrame(() => this.spamLoop());
    }
  }

  handleSpamPress() {
    if (!this.isCatchAnimRunning || this.catchGameType !== "spam" || !this.hasCatchGameStarted) return;
    
    // Add progress based on selected ball difficulty
    let increment = 4;
    if (this.selectedBall === "great") increment = 6;
    else if (this.selectedBall === "ultra") increment = 8;

    this.spamProgress = Math.min(100, this.spamProgress + increment);
    this.catchSpamFill.style.width = `${this.spamProgress}%`;
    Sound.playClick();
  }

  resolveSpamThrow() {
    // 100% spam progress maps to targetSize = 10 (Excellent)
    // 0% spam progress maps to targetSize = 100 (Miss)
    this.ringProgress = 100 - (this.spamProgress * 0.9);
    this.throwBall();
  }

  generateQteSequence() {
    const directions = ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];
    const space = this.getActiveCatchSpace();
    
    // Sequence length scales with cost difficulty
    let length = 5;
    if (space.cost <= 120) length = 4;
    else if (space.cost > 240) length = 6;

    this.qteSequence = [];
    for (let i = 0; i < length; i++) {
      this.qteSequence.push(directions[Math.floor(Math.random() * directions.length)]);
    }

    this.qteCurrentIndex = 0;
    this.renderQteSequence();
  }

  renderQteSequence() {
    const keyMap = {
      ArrowUp: "▲",
      ArrowLeft: "◀",
      ArrowDown: "▼",
      ArrowRight: "▶"
    };

    this.catchQteSequence.innerHTML = this.qteSequence.map((key, index) => {
      let className = "qte-arrow-node";
      if (this.hasCatchGameStarted) {
        if (index < this.qteCurrentIndex) className += " success";
        else if (index === this.qteCurrentIndex) className += " current";
      }
      return `<div class="${className}">${keyMap[key]}</div>`;
    }).join("");
  }

  qteLoop() {
    if (!this.isCatchAnimRunning || this.catchGameType !== "qte") return;

    const now = performance.now();
    const dt = (now - this.lastQteFrameTime) / 1000;
    this.lastQteFrameTime = now;

    // Decrement time limit
    this.qteTimeLeft = Math.max(0, this.qteTimeLeft - dt);
    this.catchQteTimer.innerText = `Time: ${this.qteTimeLeft.toFixed(1)}s`;

    if (this.qteTimeLeft <= 0) {
      this.isCatchAnimRunning = false;
      this.resolveQteThrow(false);
    } else {
      requestAnimationFrame(() => this.qteLoop());
    }
  }

  handleQtePress(key) {
    if (!this.isCatchAnimRunning || this.catchGameType !== "qte" || !this.hasCatchGameStarted) return;

    const expectedKey = this.qteSequence[this.qteCurrentIndex];
    if (key === expectedKey) {
      this.qteCurrentIndex++;
      Sound.playClick();
      this.renderQteSequence();

      if (this.qteCurrentIndex >= this.qteSequence.length) {
        this.isCatchAnimRunning = false;
        this.resolveQteThrow(true);
      }
    } else {
      // Error penalty: Reset sequence to starting node
      this.qteCurrentIndex = 0;
      Sound.playHitNormal();
      
      const nodes = this.catchQteSequence.querySelectorAll(".qte-arrow-node");
      nodes.forEach(n => n.classList.add("error"));
      setTimeout(() => {
        this.renderQteSequence();
      }, 200);
    }
  }

  resolveQteThrow(success) {
    if (success) {
      const pct = this.qteTimeLeft / 5.0; // Initial time is 5 seconds
      if (pct >= 0.6) {
        this.ringProgress = 15; // Excellent
      } else if (pct >= 0.3) {
        this.ringProgress = 35; // Great
      } else {
        this.ringProgress = 55; // Nice
      }
    } else {
      this.ringProgress = 100; // Miss
    }
    this.throwBall();
  }

  cleanupCatchMiniGame() {
    this.isCatchAnimRunning = false;
    cancelAnimationFrame(this.catchAnimationId);
    
    this.hasCatchGameStarted = false;
    this.ballCostPaid = false;
    this.pendingCatchQuality = "Miss";
    this.activeCatchSpace = null;
    this.activeCatchPlayerIdx = null;

    // Reset panels layout visibility
    this.ballSelectionPanel.style.display = "flex";
    this.throwBallBtn.style.display = "inline-block";
    
    // Hide all subcontainers
    this.catchBarContainer.style.display = "none";
    this.catchSpamContainer.style.display = "none";
    this.catchQteContainer.style.display = "none";
    this.catchRingOuter.style.display = "block";
    this.catchRingInner.style.display = "block";

    const guides = this.catchOverlay.querySelectorAll(".catch-guide");
    guides.forEach(g => g.style.display = "block");
  }

  getActiveCatchSpace() {
    return this.activeCatchSpace || this.game.spaces[this.catchSpaceId];
  }

  getActiveCatchPlayer() {
    if (Number.isInteger(this.activeCatchPlayerIdx)) {
      return this.game.players[this.activeCatchPlayerIdx];
    }
    return this.game.getCurrentPlayer();
  }

  throwBall() {
    this.isCatchAnimRunning = false;
    cancelAnimationFrame(this.catchAnimationId);
    this.throwBallBtn.disabled = true;

    const space = this.getActiveCatchSpace();
    const player = this.getActiveCatchPlayer();
    
    // Check if player has enough money to throw the selected ball
    let costOfBall = 0;
    if (this.selectedBall === "great") costOfBall = 50;
    else if (this.selectedBall === "ultra") costOfBall = 100;

    if (!this.ballCostPaid) {
      if (player.cash < costOfBall) {
        alert("Not enough cash to buy this Poke Ball! Swapping back to standard Poke Ball.");
        this.selectedBall = "poke";
        this.ballBtnPoke.click();
        this.throwBallBtn.disabled = false;
        this.isCatchAnimRunning = true;
        if (this.catchGameType === "circle") this.animateCatchRing();
        else if (this.catchGameType === "bar") this.animateBarGame();
        return;
      }

      // Deduct ball cost
      if (costOfBall > 0) {
        player.cash -= costOfBall;
        this.game.log(`${player.name} bought a ${this.selectedBall === "great" ? "Great Ball" : "Ultra Ball"} for $${costOfBall}.`);
        this.updateUI();
      }
    }

    // Sizing and styling the projectile
    this.pokeballProjectile.className = `pokeball-projectile ball-icon ${this.selectedBall}`;
    this.pokeballProjectile.style.display = "block";

    // Play throw sound
    Sound.playClick();

    // Accuracy checking based on ringProgress scale
    if (this.catchGameType === "bar") {
      const diff = Math.abs(this.sliderProgress - 50);
      this.ringProgress = 10 + diff * 1.8;
    }
    const targetSize = this.ringProgress;
    let throwQuality = "Miss";
    let isSuccess = false;

    // Define capture zones based on difficulty
    let excellentMin = 15, excellentMax = 30;
    let greatMin = 30, greatMax = 48;
    let niceMin = 48, niceMax = 68;

    // Expand zones if using Great/Ultra balls
    let multiplier = 1.0;
    if (this.selectedBall === "great") multiplier = 1.3;
    else if (this.selectedBall === "ultra") multiplier = 1.6;

    excellentMax *= multiplier;
    greatMax *= multiplier;
    niceMax *= multiplier;

    if (targetSize >= 0 && targetSize <= excellentMax) {
      throwQuality = "Excellent";
    } else if (targetSize > excellentMax && targetSize <= greatMax) {
      throwQuality = "Great";
    } else if (targetSize > greatMax && targetSize <= niceMax) {
      throwQuality = "Nice";
    }

    // Quality drives the outcome. Make catching significantly easier to feel rewarding!
    const baseChanceByQuality = {
      Miss: 0.25,
      Nice: 0.60,
      Great: 0.80,
      Excellent: 0.95
    };

    let ballBonus = 0;
    if (this.selectedBall === "great") ballBonus = 0.20;
    else if (this.selectedBall === "ultra") ballBonus = 0.40;

    let difficultyModifier = -0.05; // Hard properties
    let difficultyLabel = "Hard";
    if (space.cost <= 120) {
      difficultyModifier = 0.15;
      difficultyLabel = "Easy";
    } else if (space.cost <= 240) {
      difficultyModifier = 0.05;
      difficultyLabel = "Medium";
    }

    let finalCatchChance = baseChanceByQuality[throwQuality] + ballBonus + difficultyModifier;

    if (throwQuality === "Miss") {
      // Better balls help bad throws, but they should not turn misses into free catches.
      finalCatchChance = baseChanceByQuality.Miss + (ballBonus * 0.4) + (difficultyModifier * 0.5);
    }

    const maxChanceByQuality = {
      Miss: 0.40,
      Nice: 0.90,
      Great: 0.98,
      Excellent: 1.00 // Guaranteed catch on Excellent!
    };
    const clampedChance = Math.max(0.02, Math.min(maxChanceByQuality[throwQuality], finalCatchChance));
    
    console.log(`[Catch Success Check] targetSize: ${targetSize.toFixed(1)}, quality: ${throwQuality}, ball: ${this.selectedBall}, difficulty: ${difficultyLabel}, finalChance: ${(clampedChance * 100).toFixed(1)}%`);

	    isSuccess = Math.random() < clampedChance;
    this.pendingCatchQuality = throwQuality;

    // Throw animation trigger
    this.pokeballProjectile.classList.add("throwing");

    // Hide active minigame elements during throw flight
    this.catchBarContainer.style.display = "none";
    this.catchSpamContainer.style.display = "none";
    this.catchQteContainer.style.display = "none";

    setTimeout(() => {
      // Hit Pokemon: hide rings, shrink Pokemon, drop ball to ground
      this.catchRingOuter.style.display = "none";
      this.catchRingInner.style.display = "none";
      this.catchPokemonSprite.style.transform = "scale(0)";
      this.catchPokemonSprite.style.opacity = "0";
      
      this.pokeballProjectile.classList.remove("throwing");
      this.pokeballProjectile.classList.add("dropping");

	      // Show quality feedback pop
	      if (throwQuality !== "Miss") {
	        this.showCatchFeedback(this.getCatchQualityRewardLabel(throwQuality) + "!");
	      } else {
	        this.showCatchFeedback("Missed!");
	      }

      setTimeout(() => {
        // Drop complete: start wiggling checks
        this.pokeballProjectile.classList.remove("dropping");
        this.wiggleBallSequence(1, isSuccess);
      }, 350);

    }, 500);
  }

  showCatchFeedback(text) {
    this.catchFeedback.innerText = text;
    this.catchFeedback.classList.add("show");
    setTimeout(() => {
      this.catchFeedback.classList.remove("show");
    }, 1000);
  }

  wiggleBallSequence(count, isSuccess) {
    // If it's a catch, wiggle 3 times. If failed, wiggle 1-2 times and escape.
    const maxWiggles = isSuccess ? 3 : (Math.random() < 0.5 ? 1 : 2);

    if (count <= maxWiggles) {
      this.pokeballProjectile.classList.add("wiggling");
      // play wiggle sound
      Sound.playClick();
      
      setTimeout(() => {
        this.pokeballProjectile.classList.remove("wiggling");
        
        setTimeout(() => {
          this.wiggleBallSequence(count + 1, isSuccess);
        }, 300);
      }, 400);
    } else {
      // Resolving Catch Outcome
      if (isSuccess) {
        // SUCCESS BURST
        this.pokeballProjectile.classList.add("success-burst");
        this.showCatchFeedback("GOTCHA!");
        Sound.playVictory();
        this.awardCatchQualityReward(this.pendingCatchQuality);
        
        setTimeout(() => {
          this.catchOverlay.style.display = "none";
          this.cleanupCatchMiniGame();
          if (this.onCatchResult) {
            this.onCatchResult(true);
          }
        }, 1500);
      } else {
        // ESCAPE & FLEE
        this.showCatchFeedback("FLED!");
        
        setTimeout(() => {
          this.catchOverlay.style.display = "none";
          this.cleanupCatchMiniGame();
          if (this.onCatchResult) {
            this.onCatchResult(false);
          }
        }, 1500);
      }
    }
  }

  awardCatchQualityReward(quality) {
    const rewards = {
      Excellent: 200,
      Great: 100,
      Nice: 50
    };
    const reward = rewards[quality] || 0;
    if (reward <= 0) return;

    const player = this.getActiveCatchPlayer();
    if (!player) return;
    player.cash += reward;
    const label = this.getCatchQualityRewardLabel(quality);
    const article = label === "Excellent" ? "an" : "a";
    this.game.log(`${player.name} earned $${reward} for ${article} ${label} catch!`);
    this.setDialogText(`${label} catch bonus! You earned $${reward}.`);
    this.showCenterActionToast(`+$${reward} ${label} catch!`, "money", this.catchOverlay);
    if (quality === "Excellent") this.awardEvolutionPoints(player, player.pokemon, 2, "Excellent catch", this.catchOverlay);
    else if (quality === "Great") this.awardEvolutionPoints(player, player.pokemon, 1, "Good catch", this.catchOverlay);
    this.updateUI();
  }

  getCatchQualityRewardLabel(quality) {
    return quality === "Great" ? "Good" : quality;
  }

  initiateTrainerBattle(playerPoke, enemyPoke, spaceId, challengerIdx, ownerIdx, battleOptions = {}) {
    this.resetBattleUIState();
    this.prevPlayerTera = false;
    this.prevEnemyTera = false;
    Sound.playBattleBGM();
    this.battleOverlay.style.display = "grid";
    this.battleTeraBtn.disabled = false;
    this.playerPokeTera.style.display = "none";
    this.enemyPokeTera.style.display = "none";

    // The battle UI always puts the human-controlled side in the player slot.
    // When an AI challenges a human-owned property, playerPoke belongs to the owner/defender.
    const isHumanChallenger = challengerIdx === 0;
    const battleMode = battleOptions.mode || "normal";
    const isHighStakes = battleMode === "high";
    const attackerWager = battleOptions.attackerWager || null;
    const playerSideIdx = isHumanChallenger ? challengerIdx : ownerIdx;
    const enemySideIdx = isHumanChallenger ? ownerIdx : challengerIdx;
    const pLevel = this.game.getPokemonLevel(this.game.players[playerSideIdx], playerPoke);
    const eLevel = this.game.getPokemonLevel(this.game.players[enemySideIdx], enemyPoke);
    const pPower = this.game.players[playerSideIdx].powerUpgrades || 0;
    const ePower = this.game.players[enemySideIdx].powerUpgrades || 0;
    const pMoves = this.getBattleMovesForPlayer(this.game.players[playerSideIdx], playerPoke);
    const eMoves = this.getBattleMovesForPlayer(this.game.players[enemySideIdx], enemyPoke);
    const pTraining = this.game.getPokemonTraining(this.game.players[playerSideIdx], playerPoke);
    const eTraining = this.game.getPokemonTraining(this.game.players[enemySideIdx], enemyPoke);
    this.game.resetBattleItemUse(this.game.players[playerSideIdx]);

    Battle.startBattle(playerPoke, enemyPoke, true, spaceId, challengerIdx, ownerIdx, pLevel, eLevel, pPower, ePower, (won) => {
      Sound.stopBattleBGM();
      this.battleOverlay.style.display = "none";
      this.awardBattleItemDrop(this.game.players[playerSideIdx], won, won ? "battle" : "loss");
      if (won) this.awardEvolutionPoints(this.game.players[playerSideIdx], playerPoke, 1, "battle win", this.gameContainer);
      
      const activePlayer = this.game.players[challengerIdx] || this.game.getCurrentPlayer();
      const space = this.game.spaces[spaceId];
      const owner = this.game.players[ownerIdx];

      if (isHumanChallenger) {
        if (won) {
          this.initiateCatchMiniGame(spaceId, (success) => {
            if (success) {
              this.awardEvolutionPoints(this.game.players[0], playerPoke, 1, "caught a Pokémon", this.gameContainer);
              if (isHighStakes) {
                const player0 = this.game.players[0];
                if (!player0.collection) player0.collection = [];
                this.game.normalizeCollectionMeta(player0);
                if (!player0.collection.includes(enemyPoke)) {
                  player0.collection.push(enemyPoke);
                  player0.collectionMeta.push(null);
                }
                const rentResult = this.game.payRent(0, spaceId, 50);
                this.showMoneyTransfer(rentResult.rent, this.game.players[0].name, owner.name, `High Stakes win: discount rent ${this.formatMoney(rentResult.rent)}`, this.gameContainer);
                this.renderCollection();
                this.showCenterActionToast(`Caught ${enemyPoke} and paid 50% rent!`, "money", this.gameContainer);
                this.setDialogText(`GOTCHA! You caught ${enemyPoke} for your collection and paid discounted rent ${this.formatMoney(rentResult.rent)} to ${owner.name}. ${owner.name} keeps ${space.name}.`);
                this.updateUI();
                this.resolveDuesCheck(0, ownerIdx, () => {
                  this.endBtn.style.display = "inline-block";
                });
              } else {
                const player0 = this.game.players[0];
                if (!player0.collection) player0.collection = [];
                this.game.normalizeCollectionMeta(player0);
                if (!player0.collection.includes(enemyPoke)) {
                  player0.collection.push(enemyPoke);
                  player0.collectionMeta.push(null);
                }
                const rentResult = this.game.payRent(0, spaceId, 50);
                this.showMoneyTransfer(rentResult.rent, this.game.players[0].name, owner.name, `Normal battle discount rent: ${this.formatMoney(rentResult.rent)}`, this.gameContainer);
                this.renderCollection();
                this.showCenterActionToast(`Caught ${enemyPoke} and paid 50% rent!`, "money", this.gameContainer);
                this.setDialogText(`GOTCHA! You caught ${enemyPoke} for your collection and paid discounted rent ${this.formatMoney(rentResult.rent)} to ${owner.name}. ${owner.name} keeps ${space.name}.`);
                this.updateUI();
                this.resolveDuesCheck(0, ownerIdx, () => {
                  this.endBtn.style.display = "inline-block";
                });
              }
            } else {
              const rentResult = this.game.payRent(0, spaceId, 50);
              this.showMoneyTransfer(rentResult.rent, this.game.players[0].name, owner.name, `Battle discount rent: ${this.formatMoney(rentResult.rent)}`, this.gameContainer);
              this.setDialogText(`The Pokémon broke free and fled! You paid discount rent ${this.formatMoney(rentResult.rent)} to ${owner.name}.`);
              this.resolveDuesCheck(0, ownerIdx, () => {
                this.updateUI();
                this.endBtn.style.display = "inline-block";
              });
            }
          });
        } else {
          const rentResult = this.game.payRent(0, spaceId, -50);
          this.showMoneyTransfer(rentResult.rent, this.game.players[0].name, owner.name, `Penalty rent paid: ${this.formatMoney(rentResult.rent)}`, this.gameContainer);
          let wagerText = "";
          if (isHighStakes && attackerWager && this.transferWagerPokemon(0, ownerIdx, attackerWager)) {
            wagerText = ` You also lost ${attackerWager.name} to ${owner.name}.`;
          }
          this.setDialogText(`Defeat! You paid 1.5x penalty rent ${this.formatMoney(rentResult.rent)} to ${owner.name}.${wagerText}`);
          this.resolveDuesCheck(0, ownerIdx, () => {
            this.updateUI();
            this.endBtn.style.display = "inline-block";
          });
        }
      } else {
        // AI challenged Human: Human is owner (Defender)
        // Battle engine's "won" means the human-side battler won. Here, the human is the property defender.
        if (won) {
          const humanOwner = this.game.players[0];
          this.awardEvolutionPoints(humanOwner, playerPoke, 1, "property defense", this.gameContainer);
          const rentResult = this.game.payRent(activePlayer.id, spaceId, isHighStakes ? -50 : 0);
          if (rentResult.rent > 0) {
            const label = isHighStakes
              ? `High Stakes defense: collected ${this.formatMoney(rentResult.rent)} penalty rent!`
              : `Defense won: collected ${this.formatMoney(rentResult.rent)} rent!`;
            this.showMoneyTransfer(rentResult.rent, activePlayer.name, humanOwner.name, label, this.gameContainer);
          }
          let wagerText = "";
          if (isHighStakes && attackerWager && this.transferWagerPokemon(activePlayer.id, 0, attackerWager)) {
            wagerText = ` You also won ${attackerWager.name} from ${activePlayer.name}.`;
          }
          this.setDialogText(isHighStakes
            ? `High Stakes defended! ${activePlayer.name} paid 1.5x rent ${this.formatMoney(rentResult.rent)}.${wagerText}`
            : `Property defended! ${activePlayer.name} pays full rent ${this.formatMoney(rentResult.rent)}.`
          );
          this.game.log(`🛡️ ${owner.name} defended ${space.name}. ${activePlayer.name} paid ${this.formatMoney(rentResult.rent)} rent.`);
          this.isEncounterActive = false;
          this.resolveDuesCheck(activePlayer.id, 0, () => {
            this.updateUI();
            this.maybeTriggerMysteryEncounter(humanOwner, "defenseWin", () => {
              setTimeout(() => this.executeAITurnEnd(), 800);
            });
          });
        } else {
          if (isHighStakes) {
            const catchSuccess = Math.random() < 0.65;
            const rentResult = this.game.payRent(activePlayer.id, spaceId, 50);
            if (rentResult.rent > 0) {
              this.showMoneyTransfer(rentResult.rent, activePlayer.name, owner.name, `High Stakes defense lost: collected ${this.formatMoney(rentResult.rent)} discount rent.`, this.gameContainer);
            }
            if (catchSuccess) {
              this.setDialogText(`High Stakes defense failed! ${activePlayer.name} caught ${space.pokemon} and paid discount rent ${this.formatMoney(rentResult.rent)}. You keep ${space.name}.`);
              this.game.log(`High Stakes defense loss: ${activePlayer.name} caught ${space.pokemon}, paid discount rent, and ${owner.name} kept ${space.name}.`);
              this.isEncounterActive = false;
              this.resolveDuesCheck(activePlayer.id, 0, () => {
                this.updateUI();
                setTimeout(() => this.executeAITurnEnd(), 800);
              });
            } else {
              this.setDialogText(`Defense failed, but ${activePlayer.name} failed the catch. You keep ${space.name}; they paid discount rent ${this.formatMoney(rentResult.rent)}.`);
              this.game.log(`High Stakes catch failed on ${space.name}. ${owner.name} kept the property.`);
              this.isEncounterActive = false;
              this.resolveDuesCheck(activePlayer.id, 0, () => {
                this.updateUI();
                setTimeout(() => this.executeAITurnEnd(), 800);
              });
            }
          } else {
            this.setDialogText(`Defense failed! ${activePlayer.name} avoided paying rent this time. You keep ${space.name}.`);
            this.game.log(`Defense failed on ${space.name}. ${activePlayer.name} paid $0 rent, and ${owner.name} kept the property.`);
            this.isEncounterActive = false;
            this.resolveDuesCheck(activePlayer.id, 0, () => {
              this.updateUI();
              setTimeout(() => this.executeAITurnEnd(), 800);
            });
          }
        }
      }
    }, pMoves, eMoves, pTraining, eTraining);

    this.updateBattleHUDs();
    this.setBattleLog(`Trainer Battle initiated! Defender vs Challenger.`);
  }

  resetBattleUIState() {
    this.combatAnimating = false;
    this.battleMove0.disabled = false;
    this.battleMove1.disabled = false;
    if (this.battleMove2) this.battleMove2.disabled = false;
    if (this.battleMove3) this.battleMove3.disabled = false;
    if (this.battleItemBtn) this.battleItemBtn.disabled = false;
    this.playerBattleSprite.classList.remove("strike-player", "strike-enemy", "shake", "tera-active");
    this.enemyBattleSprite.classList.remove("strike-player", "strike-enemy", "shake", "tera-active");
    this.playerBattleSprite.className = "battle-sprite-container";
    this.enemyBattleSprite.className = "battle-sprite-container";
    this.toggleBattleStatsOverlay(false);
  }

  updateBattleHUDs() {
    const battle = Battle.activeBattle;
    if (!battle) return;

    // Check for new Terastallization triggers to play visual effects
    if (battle.player.terastallized && !this.prevPlayerTera) {
      this.prevPlayerTera = true;
      this.triggerTeraVisuals();
    }
    if (battle.enemy.terastallized && !this.prevEnemyTera) {
      this.prevEnemyTera = true;
      this.triggerTeraVisuals();
    }

    const renderTypeTags = pokemon => {
      const types = pokemon.types?.length ? pokemon.types : [pokemon.type];
      return types.map(type => `<span class="move-type-tag ${type.toLowerCase()}">${type}</span>`).join(" ");
    };
    const renderStatusBadge = pokemon => {
      if (!pokemon.status) return "";
      const status = this.escapeHTML(pokemon.status);
      return `<span class="battle-status-badge ${status}">${this.formatBattleStatus(status)}</span>`;
    };
    const renderMoveLabel = move => {
      const category = move.category ? `<span class="move-category-tag">${this.escapeHTML(move.category)}</span>` : "";
      const power = move.category === "status" || !move.power ? "Status" : move.power;
      return `<span class="move-type-tag ${move.type.toLowerCase()}">${move.type}</span> ${category} ${this.escapeHTML(move.name)} (${power})`;
    };

    // Player HUD
    this.playerPokeName.innerHTML = `${battle.player.name} (Lv. ${battle.player.level}) ${renderTypeTags(battle.player)} ${renderStatusBadge(battle.player)}`;
    this.playerHpText.innerText = `${battle.player.hp} / ${battle.player.maxHp} HP`;
    this.playerHpBar.style.width = `${(battle.player.hp / battle.player.maxHp) * 100}%`;
    
    const isPlayerTera = battle.player.terastallized;
    this.playerBattleSprite.innerHTML = this.getBattlePokemonSpriteMarkup(battle.player, isPlayerTera);

    if (isPlayerTera) {
      this.playerBattleSprite.classList.add("tera-active");
    } else {
      this.playerBattleSprite.classList.remove("tera-active");
    }

    // Enemy HUD
    this.enemyPokeName.innerHTML = `${battle.enemy.name} (Lv. ${battle.enemy.level}) ${renderTypeTags(battle.enemy)} ${renderStatusBadge(battle.enemy)}`;
    this.enemyHpText.innerText = `${battle.enemy.hp} / ${battle.enemy.maxHp} HP`;
    this.enemyHpBar.style.width = `${(battle.enemy.hp / battle.enemy.maxHp) * 100}%`;
    
    const isEnemyTera = battle.enemy.terastallized;
    this.enemyBattleSprite.innerHTML = this.getBattlePokemonSpriteMarkup(battle.enemy, isEnemyTera);

    if (isEnemyTera) {
      this.enemyBattleSprite.classList.add("tera-active");
    } else {
      this.enemyBattleSprite.classList.remove("tera-active");
    }

    // Move names with element labels
    const moveButtons = [this.battleMove0, this.battleMove1, this.battleMove2, this.battleMove3];
    moveButtons.forEach((button, idx) => {
      if (!button) return;
      const move = battle.player.moves[idx];
      if (move) {
        button.style.display = "flex";
        button.innerHTML = renderMoveLabel(move);
        button.disabled = battle.turn !== 0;
      } else {
        button.style.display = "none";
      }
    });

    // Turn indicator
    this.battleMove0.disabled = battle.turn !== 0;
    this.battleMove1.disabled = battle.turn !== 0;
    if (this.battleMove2) this.battleMove2.disabled = battle.turn !== 0 || !battle.player.moves[2];
    if (this.battleMove3) this.battleMove3.disabled = battle.turn !== 0 || !battle.player.moves[3];
    const battlePlayer = this.getActiveBattlePlayer();
    if (this.battleItemBtn) {
      const hasBattleItems = battlePlayer && Object.entries(battlePlayer.inventory || {}).some(([itemId, count]) => BattleItems[itemId]?.kind === "battle" && count > 0);
      this.battleItemBtn.style.display = "flex";
      this.battleItemBtn.disabled = battle.turn !== 0 || this.combatAnimating || !hasBattleItems || !!battlePlayer?.battleItemUsed;
      this.battleItemBtn.innerHTML = `🧪 ITEM ${battlePlayer?.battleItemUsed ? "(USED)" : ""}`;
    }
    if (this.battleTeraBtn && battlePlayer) {
      const teraCharge = `${battlePlayer.teraCharge || 0}/${battlePlayer.maxTeraCharge || 1}`;
      this.battleTeraBtn.innerHTML = `🌟 TERASTALLIZE (${teraCharge})`;
      this.battleTeraBtn.disabled = battle.turn !== 0 || battle.player.terastallized || (battlePlayer.teraCharge || 0) <= 0;
    }

    if (this.battleStatsOverlay && getComputedStyle(this.battleStatsOverlay).display !== "none") {
      this.toggleBattleStatsOverlay(true);
    }
  }

  setBattleLog(msg) {
    this.battleLogText.innerHTML = msg;
  }

  toggleBattleStatsOverlay(forceOpen = null) {
    if (!this.battleStatsOverlay) return;
    const shouldOpen = forceOpen === null ? this.battleStatsOverlay.style.display === "none" : forceOpen;
    if (!shouldOpen) {
      this.battleStatsOverlay.style.display = "none";
      return;
    }
    const battle = Battle.activeBattle;
    if (!battle) return;
    const renderStatPanel = pokemon => {
      const stats = pokemon.stats || {};
      const stages = pokemon.statStages || {};
      const statRows = [
        ["HP", stats.hp, null],
        ["ATK", stats.attack, "attack"],
        ["DEF", stats.defense, "defense"],
        ["SPA", stats.specialAttack, "specialAttack"],
        ["SPD", stats.specialDefense, "specialDefense"],
        ["SPE", stats.speed, "speed"],
        ["ACC", 100, "accuracy"],
        ["EVA", 0, "evasion"]
      ].map(([label, value, statKey]) => {
        const stage = statKey ? Number(stages[statKey] || 0) : 0;
        const stageClass = stage > 0 ? "positive" : stage < 0 ? "negative" : "neutral";
        const stageText = statKey && stage !== 0 ? `<em class="battle-stat-stage ${stageClass}">${stage > 0 ? "+" : ""}${stage}</em>` : "";
        return `<div class="battle-stat-pill"><span>${label}</span><strong>${Number.isFinite(value) ? value : "--"}</strong>${stageText}</div>`;
      }).join("");
      return `<div class="battle-stat-grid">${statRows}</div>`;
    };
    if (this.playerBattleStatsName) {
      this.playerBattleStatsName.innerHTML = `${battle.player.name} (Lv. ${battle.player.level})`;
    }
    if (this.enemyBattleStatsName) {
      this.enemyBattleStatsName.innerHTML = `${battle.enemy.name} (Lv. ${battle.enemy.level})`;
    }
    if (this.playerBattleStats) this.playerBattleStats.innerHTML = renderStatPanel(battle.player);
    if (this.enemyBattleStats) this.enemyBattleStats.innerHTML = renderStatPanel(battle.enemy);
    this.battleStatsOverlay.style.display = "flex";
  }

  triggerTeraVisuals() {
    this.battleOverlay.classList.add("screenshake-active");
    
    const flashOverlay = document.createElement("div");
    flashOverlay.className = "crystal-flash-overlay active";
    this.battleOverlay.appendChild(flashOverlay);
    
    Sound.playMoneyGain(); 
    setTimeout(() => { Sound.playMoneyGain(); }, 150);
    setTimeout(() => { Sound.playMoneyGain(); }, 300);

    setTimeout(() => {
      this.battleOverlay.classList.remove("screenshake-active");
      flashOverlay.remove();
    }, 1200);
  }

  handlePlayerBattleMove(moveIdx) {
    const battle = Battle.activeBattle;
    if (!battle || battle.turn !== 0 || this.combatAnimating) return;
    if (!battle.player.moves[moveIdx]) return;

    Battle.executePlayerMove(moveIdx);
  }

  getActiveBattlePlayer() {
    const battle = Battle.activeBattle;
    if (!battle) return this.game.players[0];
    const idx = battle.challengerIdx === 0 ? 0 : (battle.ownerIdx === 0 ? 0 : battle.challengerIdx);
    return this.game.players[idx] || this.game.players[0];
  }

  showBattleItemMenu() {
    const player = this.getActiveBattlePlayer();
    const battle = Battle.activeBattle;
    if (!player || !battle || battle.turn !== 0 || player.battleItemUsed) {
      this.setBattleLog(player?.battleItemUsed ? "You already used an item this battle." : "You cannot use an item right now.");
      return;
    }
    const battleItems = Object.entries(player.inventory || {})
      .filter(([itemId, count]) => BattleItems[itemId]?.kind === "battle" && count > 0)
      .map(([itemId, count]) => ({ ...BattleItems[itemId], count }));
    if (!battleItems.length) {
      this.setBattleLog("No battle items available.");
      return;
    }

    if (!this.battleItemOverlay || !this.battleItemGrid) return;
    this.battleItemGrid.innerHTML = battleItems.map(item => {
      const usableState = this.getBattleItemUsableState(item);
      return `
      <button class="battle-item-card ${usableState.ok ? "" : "disabled"}" type="button" data-item-id="${this.escapeHTML(item.id)}" ${usableState.ok ? "" : "disabled"}>
        <span class="battle-item-icon">${this.getBattleItemIcon(item)}</span>
        <span class="battle-item-info">
          <span class="battle-item-name">${this.escapeHTML(item.name)}</span>
          <span class="battle-item-text">${this.escapeHTML(usableState.ok ? item.text : usableState.reason)}</span>
        </span>
        <span class="battle-item-count">x${item.count}</span>
      </button>
    `;
    }).join("");

    this.battleItemGrid.querySelectorAll(".battle-item-card").forEach(card => {
      card.addEventListener("click", () => this.useBattleItem(card.getAttribute("data-item-id")));
    });

    this.battleItemOverlay.style.display = "flex";
  }

  hideBattleItemMenu() {
    if (this.battleItemOverlay) this.battleItemOverlay.style.display = "none";
  }

  getBattleItemIcon(item) {
    if (item.heal) return "✚";
    const changes = item.stats || (item.stat ? [{ stat: item.stat }] : []);
    const firstStat = changes[0]?.stat || "";
    if (firstStat.includes("attack")) return "ATK";
    if (firstStat.includes("defense")) return "DEF";
    if (firstStat.includes("speed")) return "SPD";
    return "ITEM";
  }

  getBattleItemUsableState(item) {
    const battle = Battle.activeBattle;
    if (!battle || !item) return { ok: false, reason: "No active battle." };
    if (item.heal && battle.player.hp >= battle.player.maxHp) {
      return { ok: false, reason: "Already at full HP." };
    }
    return { ok: true, reason: "" };
  }

  useBattleItem(itemId) {
    const player = this.getActiveBattlePlayer();
    const item = BattleItems[itemId];
    if (!player || !item || item.kind !== "battle") return;
    if (player.battleItemUsed) {
      this.setBattleLog("You already used an item this battle.");
      return;
    }
    if (!this.game.consumeItem(player, itemId, 1)) {
      this.setBattleLog(`No ${item.name} left.`);
      return;
    }
    const result = Battle.applyBattleItemToPlayer(item);
    if (!result.ok) {
      player.inventory[itemId] = (player.inventory[itemId] || 0) + 1;
      this.setBattleLog(result.message);
      return;
    }
    player.battleItemUsed = true;
    this.hideBattleItemMenu();
    this.showCenterActionToast(result.message, "buff", this.battleOverlay);
    this.updateBattleHUDs();
    this.setBattleLog(result.message);
  }

  awardBattleItemDrop(player, won, tier = "battle") {
    if (!player || player.isAI) return null;
    const chance = won ? 0.7 : 0.3;
    if (tier !== "rare" && Math.random() > chance) return null;
    const itemId = this.game.rollItemDrop(tier);
    this.game.addItem(player, itemId, 1);
    const item = BattleItems[itemId];
    this.showCenterActionToast(`Found ${item.name}!`, "money", this.gameContainer, 5000);
    this.setDialogText(`${won ? "Battle reward" : "Consolation drop"}: found ${item.name}.`);
    this.updateUI();
    return itemId;
  }

  awardEvolutionPoints(player, pokemonName, points, reason, host = this.gameContainer) {
    if (!player || player.isAI || !pokemonName || points <= 0) return;
    this.game.addEvolutionPoints(player, pokemonName, points, reason);
    this.showCenterActionToast(`+${points} EP ${pokemonName}!`, "buff", host, 5000);
    this.updateUI();
  }


  /* --- ASYNC AI GAMEPLAY TURNS --- */
  executeAITurn() {
    const ai = this.game.getCurrentPlayer();
    if (ai.isBankrupt) {
      this.game.nextTurn();
      return;
    }

    this.setDialogText(`${ai.name} is thinking...`);

    // AI upgrades properties if possible (25% chance)
    this.game.spaces.forEach(s => {
      if (this.game.ownership[s.id] === ai.id && Math.random() < 0.25) {
        if (this.game.canBuildGym(ai.id, s.id) && ai.cash > s.houseCost * 2) {
          this.game.buildGym(ai.id, s.id);
        } else if (this.game.canBuildCamp(ai.id, s.id) && ai.cash > s.houseCost * 2) {
          this.game.buildCamp(ai.id, s.id);
        }
      }
    });

    this.updateUI();

    // Roll Dice Sequence for AI
    setTimeout(() => {
      Sound.playDiceRoll();
      const result = this.game.rollDice();
      this.updateUI();

      if (!result) return;

      if (result.sentToJail) {
        this.setDialogText(`${ai.name} rolled 3 doubles and was sent to detention.`);
        setTimeout(() => this.executeAITurnEnd(), 1500);
        return;
      }

      if (result.stillInJail) {
        this.setDialogText(`${ai.name} is in detention. Fails to roll doubles.`);
        setTimeout(() => this.executeAITurnEnd(), 1500);
        return;
      }

      if (result.escapedJail) {
        this.setDialogText(`${ai.name} rolled doubles and escaped detention!`);
      }

      if (result.jailFineRequired) {
        const paidFine = this.game.payJailFine(ai);
        if (!paidFine) {
          this.setDialogText(`${ai.name} needs $50 to leave detention.`);
          setTimeout(() => this.executeAITurnEnd(), 1500);
          return;
        }
        this.game.movePlayer(ai, result.spacesMoved);
        this.updateUI();
      }

      // Animate AI move
      this.setDialogText(`${ai.name} is moving ${result.spacesMoved} spaces...`);
      const steps = result.spacesMoved;
      
      // Reset position temporarily for step sync
      const finalPos = ai.position;
      const startPos = (finalPos - steps + 40) % 40;

      this.animateMovePlayer(ai, steps, () => {
        this.checkAndProcessPassedGo(ai, () => {
          this.handleLandingSpace(ai.id, finalPos);
        });
      }, startPos);
    }, 1500);
  }

  executeAITurnEnd() {
    const activePlayer = this.game.getCurrentPlayer();
    const turnShifted = this.game.nextTurn();
    this.updateUI();

    const current = this.game.getCurrentPlayer();
    if (!turnShifted) {
      // Same player gets another turn because they rolled doubles!
      this.setDialogText(`${current.name} rolled doubles! Taking another turn.`);
      if (current.isAI) {
        setTimeout(() => this.executeAITurn(), 1500);
      } else {
        this.rollBtn.style.display = "inline-block";
      }
    } else {
      // Turn shifted to next player
      this.setDialogText(`It's ${current.name}'s turn.`);
      if (current.isAI) {
        setTimeout(() => this.executeAITurn(), 1500);
      } else {
        this.rollBtn.style.display = "inline-block";
      }
    }
  }

  renderCollection() {
    const player = this.game.players[0];
    const container = document.getElementById("collection-panel-box");
    if (!container) return;

    if (!player.collection) player.collection = [];
    this.game.normalizePlayerItems(player);
    this.game.normalizeCollectionMeta(player);
    if (!player.lockedCollectionPokemon) player.lockedCollectionPokemon = [];
    player.lockedCollectionPokemon = player.lockedCollectionPokemon.filter(name => player.collection.includes(name));
    if (!this.selectedCollectionIndices) this.selectedCollectionIndices = [];

    // Ensure selection is valid
    this.selectedCollectionIndices = this.selectedCollectionIndices.filter(idx => {
      return idx < player.collection.length && !this.isCollectionPokemonLocked(player, player.collection[idx]);
    });

    let html = this.renderInventoryPanel(player);
    if (player.collection.length === 0) {
      html += `<div style="font-size:0.82rem; color:#7F8C8D; text-align:center; padding: 10px 0;">No Pokémon caught yet. Win wild battles to catch them!</div>`;
    } else {
      html += `<div class="collection-list">`;
      const availablePNGs = AVAILABLE_PNGS;

      player.collection.forEach((poke, idx) => {
        const isSelected = this.selectedCollectionIndices.includes(idx);
        const isLocked = this.isCollectionPokemonLocked(player, poke);
        const meta = player.collectionMeta[idx];
        const lowerPoke = poke.toLowerCase();
        let spriteHtml = "";
        if (availablePNGs.includes(lowerPoke)) {
          spriteHtml = `<img src="images/${lowerPoke}.png" alt="${poke}">`;
        } else {
          spriteHtml = PokemonSVGs[poke] || "";
        }

        const currentLvl = this.game.getPokemonLevel(player, poke);
        const metaBadges = meta ? `
          <div class="collection-meta-badges">
            ${meta.shiny ? '<span class="collection-meta-badge shiny">★</span>' : ''}
            ${meta.kind ? `<span class="collection-meta-badge">${this.escapeHTML(meta.kind[0])}</span>` : ''}
            ${meta.quirk ? `<span class="collection-meta-badge quirk" title="${this.escapeHTML(meta.quirk)}">${this.escapeHTML(meta.quirk[0])}</span>` : ''}
          </div>
        ` : "";
        html += `
          <div class="collection-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${meta?.shiny ? 'shiny' : ''}" data-idx="${idx}" title="${poke}${meta?.quirk ? ` (${meta.quirk})` : ''}${isLocked ? ' (Locked)' : ''}" style="position: relative;">
            ${spriteHtml}
            ${metaBadges}
            <button class="collection-lock-btn ${isLocked ? 'locked' : ''}" data-lock-idx="${idx}" title="${isLocked ? 'Unlock' : 'Lock'} ${poke}">${isLocked ? '🔒' : '🔓'}</button>
            <button class="collection-partner-btn" data-partner-idx="${idx}" title="Make ${poke} your board partner">⭐</button>
            <div style="position: absolute; bottom: -3px; right: -3px; background: #000; color: #FFF; font-size: 0.55rem; padding: 1px 4px; border-radius: 4px; font-weight: 800; border: 1.5px solid #000; box-shadow: 1px 1px 0px #000;">Lv. ${currentLvl}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    const selectedCount = this.selectedCollectionIndices.length;
    const powerTradeDisabled = selectedCount !== 1;
    const evolveTradeDisabled = selectedCount !== 3;
    const tradeHint = selectedCount === 0
      ? "Select 1 Pokémon for Power, or 3 for Evolution."
      : `${selectedCount} selected`;
    html += `
      <div class="trade-controls">
        <button class="btn-trade btn-trade-power ${powerTradeDisabled ? 'disabled' : 'ready'}" id="btn-trade-power" ${powerTradeDisabled ? 'disabled' : ''}>TRADE 1 FOR POWER</button>
        <button class="btn-trade btn-trade-evolve ${evolveTradeDisabled ? 'disabled' : 'ready'}" id="btn-trade-evolve" ${evolveTradeDisabled ? 'disabled' : ''}>TRADE 3 FOR EVOLUTION</button>
      </div>
      <div class="trade-hint">${tradeHint}</div>
    `;

    container.innerHTML = html;

    // Attach click listeners to selection
    if (player.collection.length > 0) {
      const lockButtons = container.querySelectorAll(".collection-lock-btn");
      lockButtons.forEach(button => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const idx = parseInt(button.getAttribute("data-lock-idx"));
          this.toggleCollectionLock(idx);
        });
      });

      const partnerButtons = container.querySelectorAll(".collection-partner-btn");
      partnerButtons.forEach(button => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const idx = parseInt(button.getAttribute("data-partner-idx"));
          this.setCollectionPokemonAsPartner(idx);
        });
      });

      const items = container.querySelectorAll(".collection-item");
      items.forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-idx"));
          if (this.isCollectionPokemonLocked(player, player.collection[idx])) {
            this.setDialogText(`${player.collection[idx]} is locked. Unlock it before trading or evolving it.`);
            Sound.playClick();
            return;
          }
          const selectedIdx = this.selectedCollectionIndices.indexOf(idx);
          if (selectedIdx > -1) {
            this.selectedCollectionIndices.splice(selectedIdx, 1);
          } else {
            if (this.selectedCollectionIndices.length < 3) {
              this.selectedCollectionIndices.push(idx);
            }
          }
          Sound.playClick();
          this.renderCollection();
        });
      });
    }

    // Attach click listeners to trade buttons independently because power and evolution have different costs.
    const btnPower = document.getElementById("btn-trade-power");
    const btnEvolve = document.getElementById("btn-trade-evolve");
    if (btnPower && !powerTradeDisabled) {
      btnPower.addEventListener("click", () => {
        this.executeTrade("power");
      });
    }
    if (btnEvolve && !evolveTradeDisabled) {
      btnEvolve.addEventListener("click", () => {
        this.executeTrade("evolve");
      });
    }

    container.querySelectorAll(".inventory-chip.usable").forEach(button => {
      button.addEventListener("click", () => this.useInventoryItem(button.getAttribute("data-item-id")));
    });
    const evolveWithEpBtn = document.getElementById("evolve-with-ep-btn");
    if (evolveWithEpBtn && !evolveWithEpBtn.disabled) {
      evolveWithEpBtn.addEventListener("click", () => this.evolvePartnerWithEvolutionPoints());
    }
  }

  renderInventoryPanel(player) {
    const entries = Object.entries(player.inventory || {}).filter(([itemId, count]) => BattleItems[itemId] && count > 0);
    const teraText = `${player.teraCharge || 0}/${player.maxTeraCharge || 1}`;
    const evolutionPanel = this.renderEvolutionProgressPanel(player);
    if (!entries.length) {
      return `${evolutionPanel}<div class="inventory-panel"><div class="inventory-title">ITEMS <span>TERA ${teraText}</span></div><div class="inventory-empty">Win battles or visit Free Parking to find items.</div></div>`;
    }
    const itemButtons = entries.map(([itemId, count]) => {
      const item = BattleItems[itemId];
      const usable = item.kind === "training" || item.rechargeTera;
      return `
        <button class="inventory-chip ${usable ? "usable" : ""}" ${usable ? `data-item-id="${itemId}"` : "disabled"} title="${this.escapeHTML(item.text)}">
          <span>${this.escapeHTML(item.name)}</span><strong>x${count}</strong>
        </button>
      `;
    }).join("");
    return `
      ${evolutionPanel}
      <div class="inventory-panel">
        <div class="inventory-title">ITEMS <span>TERA ${teraText}</span></div>
        <div class="inventory-list">${itemButtons}</div>
        <div class="inventory-note">Training items apply to your current board partner. Battle items are used during fights.</div>
      </div>
    `;
  }

  renderEvolutionProgressPanel(player) {
    const pokemonName = player.pokemon;
    const points = this.game.getEvolutionPoints(player, pokemonName);
    const required = this.game.getEvolutionPointRequirement(player, pokemonName);
    const nextNames = this.getNextEvolutionNames(pokemonName);
    const canEvolve = points >= required;
    const pct = Math.min(100, Math.round((points / required) * 100));
    const nextLabel = nextNames.length ? `Next: ${nextNames.join(" / ")}` : "Fully evolved: EP gives bonus levels";
    return `
      <div class="evolution-progress-panel">
        <div class="evolution-progress-head">
          <span>${this.escapeHTML(pokemonName)} EP</span>
          <strong>${points}/${required}</strong>
        </div>
        <div class="evolution-progress-track">
          <div class="evolution-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="evolution-progress-foot">
          <span>${this.escapeHTML(nextLabel)}</span>
          <button class="evolution-progress-btn" id="evolve-with-ep-btn" ${canEvolve ? "" : "disabled"}>${nextNames.length ? "EVOLVE" : "+LEVEL"}</button>
        </div>
      </div>
    `;
  }

  useInventoryItem(itemId) {
    const player = this.game.players[0];
    const item = BattleItems[itemId];
    if (!player || !item) return;
    if (item.rechargeTera) {
      if ((player.teraCharge || 0) >= (player.maxTeraCharge || 1)) {
        this.setDialogText("Your Tera Orb is already charged.");
        return;
      }
      if (this.game.consumeItem(player, itemId, 1)) {
        this.game.rechargeTera(player, "Tera Orb recharged with a Tera Shard");
        this.setDialogText("Used Tera Shard. Your Tera Orb is charged.");
        this.showCenterActionToast("Tera Orb charged!", "buff", this.gameContainer);
        this.updateUI();
      }
      return;
    }
    if (item.kind === "training") {
      const result = this.game.applyTrainingItem(player, player.pokemon, itemId);
      this.setDialogText(result.message);
      if (result.ok) this.showCenterActionToast(result.message, "buff", this.gameContainer);
      this.updateUI();
    }
  }

  executeTrade(type) {
    const player = this.game.players[0];
    const requiredCount = type === "power" ? 1 : 3;
    if (!player.collection || this.selectedCollectionIndices.length !== requiredCount) return;

    if (type === "power") {
      this.showMoveLearnModal(this.selectedCollectionIndices[0]);
      return;
    }

    if (type === "evolve") {
      this.showEvolutionTargetModal([...this.selectedCollectionIndices]);
      return;
    }

    // Get Pokémon traded
    const tradedNames = this.selectedCollectionIndices.map(idx => player.collection[idx]);

    // Sort descending to splice safely
    const sortedIndices = [...this.selectedCollectionIndices].sort((a, b) => b - a);
    this.game.normalizeCollectionMeta(player);
    sortedIndices.forEach(idx => {
      player.collection.splice(idx, 1);
      player.collectionMeta.splice(idx, 1);
    });

    this.selectedCollectionIndices = [];

    this.renderCollection();
    this.updateUI();
  }

  isCollectionPokemonLocked(player, pokemonName) {
    return Array.isArray(player.lockedCollectionPokemon) && player.lockedCollectionPokemon.includes(pokemonName);
  }

  toggleCollectionLock(idx) {
    const player = this.game.players[0];
    if (!player.collection || !player.collection[idx]) return;
    if (!player.lockedCollectionPokemon) player.lockedCollectionPokemon = [];
    const pokemonName = player.collection[idx];
    const lockIdx = player.lockedCollectionPokemon.indexOf(pokemonName);
    if (lockIdx >= 0) {
      player.lockedCollectionPokemon.splice(lockIdx, 1);
      this.setDialogText(`${pokemonName} unlocked. It can now be traded or evolved.`);
    } else {
      player.lockedCollectionPokemon.push(pokemonName);
      this.selectedCollectionIndices = this.selectedCollectionIndices.filter(selectedIdx => selectedIdx !== idx);
      this.setDialogText(`${pokemonName} locked. It cannot be traded or evolved.`);
    }
    Sound.playClick();
    this.renderCollection();
  }

  setCollectionPokemonAsPartner(idx) {
    const player = this.game.players[0];
    if (!player.collection || !player.collection[idx]) return;
    this.game.ensurePokemonProgress(player);
    this.game.normalizeCollectionMeta(player);
    const nextPartner = player.collection[idx];
    if (this.isCollectionPokemonLocked(player, nextPartner)) {
      this.setDialogText(`${nextPartner} is locked. Unlock it before making it your partner.`);
      Sound.playClick();
      return;
    }

    if (!player.partnerMoveSets) player.partnerMoveSets = {};
    const oldPartner = player.pokemon;
    const oldBase = this.game.normalizePokemonName(player, oldPartner);
    const oldChain = this.game.getEvolutionChain(oldBase);
    if (oldChain) {
      player.pokemonEvolutionStages[oldBase] = Math.max(0, this.game.getStageOfPokemon(oldChain, oldPartner));
    }
    if (Array.isArray(player.partnerMoves)) {
      player.partnerMoveSets[oldBase] = player.partnerMoves.map(move => ({ ...move }));
    }

    const nextBase = this.game.normalizePokemonName(player, nextPartner);
    const chain = this.game.getEvolutionChain(nextBase);
    const selectedStage = chain ? Math.max(0, this.game.getStageOfPokemon(chain, nextPartner)) : 0;

    player.collection.splice(idx, 1);
    player.collectionMeta.splice(idx, 1);
    if (oldPartner && !player.collection.includes(oldPartner)) {
      player.collection.push(oldPartner);
      player.collectionMeta.push(null);
    }
    player.lockedCollectionPokemon = (player.lockedCollectionPokemon || []).filter(name => player.collection.includes(name));

    player.baseStarter = nextBase;
    player.pokemon = nextPartner;
    player.pokemonEvolutionStages[nextBase] = selectedStage;
    player.partnerMoves = player.partnerMoveSets[nextBase]
      ? player.partnerMoveSets[nextBase].map(move => ({ ...move }))
      : null;

    this.selectedCollectionIndices = [];
    this.game.recalculatePlayerStats(0);
    this.setDialogText(`${player.pokemon} is now your partner on the board.`);
    this.game.log(`⭐ ${player.name} chose ${player.pokemon} as their active partner.`);
    Sound.playVictory();
    this.renderCollection();
    this.updateUI();
  }

  getEvolutionChainForPokemon(pokemonName) {
    if (!this.game) return null;
    const chains = Object.values(this.game.getEvolutionChains());
    return chains.find(chain => {
      return chain.some(element => {
        if (Array.isArray(element)) {
          return element.includes(pokemonName);
        }
        return element === pokemonName;
      });
    }) || null;
  }

  getNextEvolutionNames(pokemonName) {
    const chain = this.getEvolutionChainForPokemon(pokemonName);
    if (!chain) return [];
    let idx = -1;
    for (let i = 0; i < chain.length; i++) {
      const element = chain[i];
      if (Array.isArray(element)) {
        if (element.includes(pokemonName)) {
          idx = i;
          break;
        }
      } else if (element === pokemonName) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return [];
    const nextElement = chain[idx + 1];
    if (!nextElement) return [];
    if (Array.isArray(nextElement)) {
      return nextElement.filter(name => PokemonDB[name]);
    }
    return PokemonDB[nextElement] ? [nextElement] : [];
  }

  getNextEvolutionName(pokemonName) {
    const nextNames = this.getNextEvolutionNames(pokemonName);
    return nextNames.length > 0 ? nextNames[0] : null;
  }

  getPokemonSpriteHTML(pokemonName, className = "") {
    if (!pokemonName) return "";
    const lowerName = pokemonName.toLowerCase();
    const sprite = AVAILABLE_PNGS.includes(lowerName)
      ? `<img src="images/${lowerName}.png" alt="${this.escapeHTML(pokemonName)}">`
      : (PokemonSVGs[pokemonName] || "");
    return `<div class="${className}">${sprite}</div>`;
  }

  getEvolutionTargets(costIndices) {
    const player = this.game.players[0];
    const targets = [];
    
    const partnerNexts = this.getNextEvolutionNames(player.pokemon);
    if (partnerNexts.length > 0) {
      partnerNexts.forEach(nextName => {
        targets.push({
          type: "partner",
          label: "Partner",
          name: player.pokemon,
          nextName: nextName,
          detail: `Evolve to ${nextName}`
        });
      });
    } else {
      targets.push({
        type: "partner",
        label: "Partner",
        name: player.pokemon,
        nextName: null,
        detail: "Fully evolved: gain +2 levels"
      });
    }

    player.collection.forEach((pokemonName, idx) => {
      if (costIndices.includes(idx)) return;
      if (this.isCollectionPokemonLocked(player, pokemonName)) return;
      const nextNames = this.getNextEvolutionNames(pokemonName);
      nextNames.forEach(nextName => {
        targets.push({
          type: "collection",
          index: idx,
          label: "Collection",
          name: pokemonName,
          nextName,
          detail: `Evolve to ${nextName}`
        });
      });
    });
    return targets;
  }

  showEvolutionTargetModal(costIndices) {
    const player = this.game.players[0];
    if (!player.collection || costIndices.length !== 3) return;
    if (costIndices.some(idx => this.isCollectionPokemonLocked(player, player.collection[idx]))) {
      this.setDialogText("Locked Pokémon cannot be used for evolution trades.");
      this.renderCollection();
      return;
    }

    const targets = this.getEvolutionTargets(costIndices);
    if (targets.length === 0) {
      this.setDialogText("No eligible unlocked Pokémon can evolve right now.");
      return;
    }

    let selectedTargetIdx = 0;
    const overlay = this.ensureEvolutionTargetOverlay();
    const costNames = costIndices.map(idx => player.collection[idx]);
    const render = () => {
      const cards = targets.map((target, idx) => {
        const currentSprite = this.getPokemonSpriteHTML(target.name, "evolution-target-sprite");
        const targetSprite = target.nextName
          ? this.getPokemonSpriteHTML(target.nextName, "evolution-target-sprite")
          : `<div class="evolution-target-sprite evolution-target-bonus">+2</div>`;
        return `
          <button class="evolution-target-card ${idx === selectedTargetIdx ? 'selected' : ''}" data-target-idx="${idx}">
            <div class="evolution-target-visuals">
              ${currentSprite}
              <span class="evolution-target-arrow-big">${target.nextName ? '→' : '+'}</span>
              ${targetSprite}
            </div>
            <span class="evolution-target-label">${this.escapeHTML(target.label)}</span>
            <span class="move-learn-name">${this.escapeHTML(target.name)}</span>
            <span class="evolution-arrow">${target.nextName ? `→ ${this.escapeHTML(target.nextName)}` : '+2 Levels'}</span>
            <span class="move-learn-text">${this.escapeHTML(target.detail)}</span>
          </button>
        `;
      }).join("");

      overlay.innerHTML = `
        <div class="move-learn-modal">
          <div class="move-learn-title">CHOOSE EVOLUTION TARGET</div>
          <div class="move-learn-subtitle">Trading: ${costNames.map(name => this.escapeHTML(name)).join(", ")}</div>
          <div class="move-learn-grid">${cards}</div>
          <div class="move-learn-actions">
            <button class="btn-comic move-learn-cancel">CANCEL</button>
            <button class="btn-comic move-learn-confirm">EVOLVE</button>
          </div>
        </div>
      `;
      overlay.querySelectorAll("[data-target-idx]").forEach(button => {
        button.addEventListener("click", () => {
          selectedTargetIdx = Number(button.dataset.targetIdx);
          Sound.playClick();
          render();
        });
      });
      overlay.querySelector(".move-learn-cancel").addEventListener("click", () => {
        Sound.playClick();
        overlay.style.display = "none";
      });
      overlay.querySelector(".move-learn-confirm").addEventListener("click", () => {
        Sound.playVictory();
        this.confirmEvolutionTrade(costIndices, targets[selectedTargetIdx]);
        overlay.style.display = "none";
      });
    };

    render();
    overlay.style.display = "flex";
  }

  ensureEvolutionTargetOverlay() {
    let overlay = document.getElementById("evolution-target-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "evolution-target-overlay";
    overlay.className = "move-learn-overlay";
    overlay.style.display = "none";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.style.display = "none";
    });
    return overlay;
  }

  evolvePartnerWithEvolutionPoints() {
    const player = this.game.players[0];
    const currentName = player.pokemon;
    const nextNames = this.getNextEvolutionNames(currentName);
    if (!this.game.spendEvolutionPoints(player, currentName)) {
      const points = this.game.getEvolutionPoints(player, currentName);
      const required = this.game.getEvolutionPointRequirement(player, currentName);
      this.setDialogText(`${currentName} needs ${required - points} more EP to evolve.`);
      return;
    }

    if (!nextNames.length) {
      const baseName = this.game.normalizePokemonName(player, currentName);
      player.pokemonBonusLevels[baseName] = (player.pokemonBonusLevels[baseName] || 0) + 1;
      this.game.recalculatePlayerStats(0);
      this.game.log(`${currentName} used 10 EP for +1 bonus level!`);
      this.setDialogText(`${currentName} is fully evolved and gained +1 bonus level!`);
      this.showCenterActionToast(`${currentName} +1 level!`, "buff", this.gameContainer);
      this.renderCollection();
      this.updateUI();
      return;
    }

    const nextName = nextNames[0];
    const baseName = this.game.normalizePokemonName(player, currentName);
    const chain = this.game.getEvolutionChain(baseName);
    const newStage = this.game.getStageOfPokemon(chain, nextName);
    player.pokemonEvolutionStages[baseName] = Math.max(0, newStage);
    player.pokemon = nextName;
    this.game.recalculatePlayerStats(0);
    this.game.log(`${currentName} evolved into ${nextName} using Evolution Points!`);
    this.setDialogText(`${currentName} evolved into ${nextName}!`);
    this.renderCollection();
    this.updateUI();
    this.showEvolutionCelebration(currentName, nextName);
  }

  showEvolutionCelebration(oldName, newName) {
    const overlay = this.ensureEvolutionCelebrationOverlay();
    Sound.playVictory();
    overlay.innerHTML = `
      <div class="evolution-celebration-confetti">${this.createConfettiHTML(110)}</div>
      <div class="evolution-energy-ring ring-one"></div>
      <div class="evolution-energy-ring ring-two"></div>
      <div class="evolution-burst-card">
        <div class="evolution-burst-kicker">Evolution Complete</div>
        <div class="evolution-burst-title">WHAT?!</div>
        <div class="evolution-burst-subtitle">${this.escapeHTML(oldName)} is evolving!</div>
        <div class="evolution-stage">
          <div class="evolution-mon old-form">
            <div class="evolution-sprite">${this.getPokemonSpriteMarkup(oldName)}</div>
            <span>${this.escapeHTML(oldName)}</span>
          </div>
          <div class="evolution-light-column">
            <span class="evolution-arrow-flash">→</span>
            <span class="evolution-spark spark-one">✦</span>
            <span class="evolution-spark spark-two">✧</span>
            <span class="evolution-spark spark-three">✦</span>
          </div>
          <div class="evolution-mon new-form">
            <div class="evolution-sprite">${this.getPokemonSpriteMarkup(newName)}</div>
            <span>${this.escapeHTML(newName)}</span>
          </div>
        </div>
        <div class="evolution-result">Congratulations! Your ${this.escapeHTML(oldName)} evolved into ${this.escapeHTML(newName)}!</div>
        <button class="btn-comic evolution-continue-btn" type="button">CONTINUE</button>
      </div>
    `;

    const close = () => {
      overlay.style.display = "none";
      this.showCenterActionToast(`${newName} evolved!`, "buff", this.gameContainer);
    };

    overlay.querySelector(".evolution-continue-btn").addEventListener("click", close, { once: true });
    overlay.style.display = "flex";
  }

  ensureEvolutionCelebrationOverlay() {
    let overlay = document.getElementById("evolution-celebration-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "evolution-celebration-overlay";
    overlay.className = "evolution-celebration-overlay";
    overlay.style.display = "none";
    document.body.appendChild(overlay);
    return overlay;
  }

  confirmEvolutionTrade(costIndices, target) {
    const player = this.game.players[0];
    this.game.normalizeCollectionMeta(player);
    const tradedNames = costIndices.map(idx => player.collection[idx]);
    let celebration = null;

    if (target.type === "partner") {
      const oldPoke = player.pokemon;
      this.game.ensurePokemonProgress(player);
      const baseName = this.game.normalizePokemonName(player, oldPoke);
      const chain = this.game.getEvolutionChain(baseName);
      if (target.nextName) {
        const newStage = this.game.getStageOfPokemon(chain, target.nextName);
        player.pokemonEvolutionStages[baseName] = Math.max(0, newStage);
        player.pokemon = target.nextName;
        this.game.recalculatePlayerStats(0);
        this.game.log(`🔄 Traded 3 Pokémon (${tradedNames.join(", ")}) to evolve partner ${oldPoke} into ${player.pokemon}!`);
        this.setDialogText(`Evolved! Partner evolved from ${oldPoke} to ${player.pokemon}!`);
        celebration = { oldName: oldPoke, newName: player.pokemon };
      } else {
        player.pokemonBonusLevels[baseName] = (player.pokemonBonusLevels[baseName] || 0) + 2;
        this.game.recalculatePlayerStats(0);
        this.game.log(`🔄 Traded 3 Pokémon (${tradedNames.join(", ")}) for +2 partner levels.`);
        this.setDialogText("Fully evolved! Partner gained +2 Levels (+30 Max HP, +20% damage).");
      }
    } else if (target.type === "collection") {
      const oldName = player.collection[target.index];
      player.collection[target.index] = target.nextName;
      if (player.lockedCollectionPokemon) {
        player.lockedCollectionPokemon = player.lockedCollectionPokemon.filter(name => name !== oldName);
      }
      this.game.log(`🔄 Traded 3 Pokémon (${tradedNames.join(", ")}) to evolve ${oldName} into ${target.nextName}!`);
      this.setDialogText(`${oldName} evolved into ${target.nextName}!`);
      celebration = { oldName, newName: target.nextName };
    }

    [...costIndices].sort((a, b) => b - a).forEach(idx => {
      player.collection.splice(idx, 1);
      player.collectionMeta.splice(idx, 1);
    });
    this.selectedCollectionIndices = [];
    this.renderCollection();
    this.updateUI();
    if (celebration) {
      this.showEvolutionCelebration(celebration.oldName, celebration.newName);
    }
  }

  getDefaultMovesForPokemon(pokemonName) {
    const base = PokemonDB[pokemonName];
    if (!base || !Array.isArray(base.moves)) return [];
    return base.moves.map(move => ({ ...move }));
  }

  getBattleMovesForPlayer(player, pokemonName) {
    const defaultMoves = this.getDefaultMovesForPokemon(pokemonName);
    if (!player) return defaultMoves;
    const normName = this.game.normalizePokemonName(player, pokemonName);
    const isPartner = normName === player.baseStarter;
    if (!isPartner || !Array.isArray(player.partnerMoves) || player.partnerMoves.length === 0) {
      return defaultMoves.slice(0, 4);
    }
    const savedMoves = player.partnerMoves.map(move => ({ ...move }));
    const moveCount = Math.max(defaultMoves.length, savedMoves.length, 4);
    const resolved = [];
    for (let idx = 0; idx < moveCount; idx++) {
      const savedMove = savedMoves[idx];
      const defaultMove = defaultMoves[idx];
      if (savedMove || defaultMove) resolved.push(savedMove || defaultMove);
    }
    return resolved.slice(0, 4);
  }

  showMoveLearnModal(tradedIdx) {
    const player = this.game.players[0];
    const tradedName = player.collection[tradedIdx];
    const tradedMoves = this.getDefaultMovesForPokemon(tradedName);
    const partnerMoves = this.getBattleMovesForPlayer(player, player.pokemon).slice(0, 2);
    if (!tradedName || tradedMoves.length === 0 || partnerMoves.length < 2) return;

    let selectedMoveIdx = 0;
    let selectedSlotIdx = 1;
    const overlay = this.ensureMoveLearnOverlay();
    const render = () => {
      const moveCards = tradedMoves.map((move, idx) => `
        <button class="move-learn-card ${idx === selectedMoveIdx ? "selected" : ""}" data-move-idx="${idx}">
          <span class="move-learn-name">${this.escapeHTML(move.name)}</span>
          <span class="move-type-tag ${move.type.toLowerCase()}">${this.escapeHTML(move.type)}</span>
          <span class="move-learn-power">Power ${move.power}</span>
          <span class="move-learn-text">${this.escapeHTML(move.text || "")}</span>
        </button>
      `).join("");
      const slotCards = partnerMoves.map((move, idx) => `
        <button class="move-slot-card ${idx === selectedSlotIdx ? "selected" : ""}" data-slot-idx="${idx}">
          <span class="move-slot-label">Replace Slot ${idx + 1}</span>
          <span class="move-learn-name">${this.escapeHTML(move.name)}</span>
          <span class="move-type-tag ${move.type.toLowerCase()}">${this.escapeHTML(move.type)}</span>
          <span class="move-learn-power">Power ${move.power}</span>
        </button>
      `).join("");

      overlay.innerHTML = `
        <div class="move-learn-modal">
          <div class="move-learn-title">LEARN A NEW MOVE</div>
          <div class="move-learn-subtitle">Trade ${this.escapeHTML(tradedName)} to teach ${this.escapeHTML(player.pokemon)} one of its moves.</div>
          <div class="move-learn-section-title">${this.escapeHTML(tradedName)}'s Moves</div>
          <div class="move-learn-grid">${moveCards}</div>
          <div class="move-learn-section-title">${this.escapeHTML(player.pokemon)} Move Slot</div>
          <div class="move-slot-grid">${slotCards}</div>
          <div class="move-learn-actions">
            <button class="btn-comic move-learn-cancel">CANCEL</button>
            <button class="btn-comic move-learn-confirm">LEARN MOVE</button>
          </div>
        </div>
      `;

      overlay.querySelectorAll("[data-move-idx]").forEach(button => {
        button.addEventListener("click", () => {
          selectedMoveIdx = Number(button.dataset.moveIdx);
          Sound.playClick();
          render();
        });
      });
      overlay.querySelectorAll("[data-slot-idx]").forEach(button => {
        button.addEventListener("click", () => {
          selectedSlotIdx = Number(button.dataset.slotIdx);
          Sound.playClick();
          render();
        });
      });
      overlay.querySelector(".move-learn-cancel").addEventListener("click", () => {
        Sound.playClick();
        overlay.style.display = "none";
      });
      overlay.querySelector(".move-learn-confirm").addEventListener("click", () => {
        Sound.playVictory();
        this.confirmMoveLearnTrade(tradedIdx, tradedMoves[selectedMoveIdx], selectedSlotIdx);
        overlay.style.display = "none";
      });
    };

    render();
    overlay.style.display = "flex";
  }

  ensureMoveLearnOverlay() {
    let overlay = document.getElementById("move-learn-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "move-learn-overlay";
    overlay.className = "move-learn-overlay";
    overlay.style.display = "none";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.style.display = "none";
    });
    return overlay;
  }

  confirmMoveLearnTrade(tradedIdx, learnedMove, slotIdx) {
    const player = this.game.players[0];
    this.game.normalizeCollectionMeta(player);
    const tradedName = player.collection[tradedIdx];
    if (!tradedName || !learnedMove) return;
    const currentMoves = this.getBattleMovesForPlayer(player, player.pokemon).slice(0, 2);
    currentMoves[slotIdx] = { ...learnedMove };
    player.partnerMoves = currentMoves;
    player.collection.splice(tradedIdx, 1);
    player.collectionMeta.splice(tradedIdx, 1);
    this.selectedCollectionIndices = [];
    this.game.log(`🔄 Traded ${tradedName} so ${player.pokemon} learned ${learnedMove.name}!`);
    this.setDialogText(`${player.pokemon} learned ${learnedMove.name}! The new move is saved to your team.`);
    this.renderCollection();
    this.updateUI();
  }

  formatBattleStatus(status) {
    if (status === "burn") return "BRN";
    if (status === "poison") return "PSN";
    if (status === "paralysis") return "PAR";
    return String(status || "").slice(0, 3).toUpperCase();
  }

  formatBattleEffectWord(event) {
    if (!event) return "";
    if (event.kind === "status") {
      if (event.status === "burn") return "BURNED!";
      if (event.status === "poison") return "POISONED!";
      if (event.status === "paralysis") return "PARALYZED!";
      return "STATUS!";
    }
    if (event.kind === "stat") {
      const labels = {
        attack: "ATK",
        defense: "DEF",
        specialAttack: "SP. ATK",
        specialDefense: "SP. DEF",
        speed: "SPEED",
        accuracy: "ACC",
        evasion: "EVA"
      };
      return `${labels[event.stat] || "STAT"} ${event.amount > 0 ? "UP" : "DOWN"}!`;
    }
    return event.text || "";
  }

  showBattleEffectFeedback(attackerSide, defenderSide, effectEvent = {}) {
    const events = Array.isArray(effectEvent.effects) ? effectEvent.effects : [];
    events.forEach((event, idx) => {
      if (event.kind !== "status" && event.kind !== "stat") return;
      const side = event.target === "attacker" ? attackerSide : defenderSide;
      const word = this.formatBattleEffectWord(event);
      setTimeout(() => {
        this.showActionTextPopup(side, word);
        const variant = event.kind === "status" ? `status ${event.status || ""}` : event.amount > 0 ? "buff" : "debuff";
        this.showCenterActionToast(event.text, variant, this.battleOverlay);
      }, 120 * idx);
    });
  }

  animateCombatMove(attackerSide, defenderSide, move, effectiveness, damage, effectEvent = {}) {
    this.combatAnimating = true;

    // Determine DOM elements based on sides
    const attackerSprite = attackerSide === "player" ? this.playerBattleSprite : this.enemyBattleSprite;
    const defenderSprite = defenderSide === "player" ? this.playerBattleSprite : this.enemyBattleSprite;

    // Disable move buttons during animation
    [this.battleMove0, this.battleMove1, this.battleMove2, this.battleMove3, this.battleItemBtn].forEach(button => {
      if (button) button.disabled = true;
    });

    // 1. Attack / Lunge Phase (0ms)
    const lungeClass = attackerSide === "player" ? "strike-player" : "strike-enemy";
    attackerSprite.classList.add(lungeClass);

    // Play attack sound
    Sound.playAttackSound(move.type);

    // Floating text word
    let word = "BOOM!";
    if (effectiveness > 1.0) word = "SUPER EFFECTIVE!";
    else if (effectiveness === 0) word = "NO EFFECT!";
    else if (effectiveness < 1.0) word = "NOT EFFECTIVE";
    this.showActionTextPopup(attackerSide, word);
    if (damage > 0) this.showDamageNumber(defenderSide, damage);
    if (attackerSide === "player" && damage > 0) {
      this.showCenterActionToast(`${move.name}: ${damage} damage!`, effectiveness > 1 ? "damage super" : "damage", this.battleOverlay);
    }

    // 2. Hit Phase (150ms)
    setTimeout(() => {
      attackerSprite.classList.remove(lungeClass);
      
      defenderSprite.classList.add("shake");
      const hitClass = `hit-${move.type.toLowerCase()}`;
      defenderSprite.classList.add(hitClass);

      // Play hit sound
      if (effectiveness > 1.0) {
        Sound.playHitSuperEffective();
      } else {
        Sound.playHitNormal();
      }

      // Flash overlay
      this.flashScreen(move.type);

      // Trigger particle burst
      this.createAttackParticles(defenderSide, move.type);

      // Update HP bars and print log
      const battle = Battle.activeBattle;
      if (battle) {
        this.playerHpText.innerText = `${battle.player.hp} / ${battle.player.maxHp} HP`;
        this.playerHpBar.style.width = `${(battle.player.hp / battle.player.maxHp) * 100}%`;
        this.enemyHpText.innerText = `${battle.enemy.hp} / ${battle.enemy.maxHp} HP`;
        this.enemyHpBar.style.width = `${(battle.enemy.hp / battle.enemy.maxHp) * 100}%`;

        const recentLogs = battle.logs.slice(-3);
        if (recentLogs.length) {
          this.setBattleLog(recentLogs.map(log => this.escapeHTML(log)).join("<br>"));
        }
        this.showBattleEffectFeedback(attackerSide, defenderSide, effectEvent);
      }
    }, 150);

    // 3. Reset Phase (600ms)
    setTimeout(() => {
      defenderSprite.classList.remove("shake");
      defenderSprite.classList.remove(`hit-${move.type.toLowerCase()}`);
      
      this.combatAnimating = false;

      const battle = Battle.activeBattle;
      if (battle) {
        this.updateBattleHUDs();
      }
    }, 600);
  }

  createAttackParticles(side, type) {
    const parent = side === "player" ? this.playerBattleSprite : this.enemyBattleSprite;
    
    const oldBox = parent.querySelector(".attack-particle-box");
    if (oldBox) oldBox.remove();
    
    const box = document.createElement("div");
    box.className = "attack-particle-box";
    parent.appendChild(box);

    const colors = {
      grass: "#2ECC71",
      fire: "#E74C3C",
      water: "#3498DB",
      electric: "#F1C40F",
      ground: "#E67E22",
      rock: "#95A5A6",
      fairy: "#FDA7DF",
      steel: "#7F8C8D",
      poison: "#9B59B6",
      ghost: "#8E44AD",
      bug: "#27AE60",
      normal: "#BDC3C7",
      fighting: "#D35400",
      dark: "#2C3E50",
      dragon: "#1ABC9C"
    };

    const color = colors[type.toLowerCase()] || "#FFFFFF";

    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      p.className = `combat-particle element-${type.toLowerCase()}`;
      p.style.setProperty("--particle-color", color);

      const angle = Math.random() * Math.PI * 2;
      const distance = 45 + Math.random() * 75;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      p.style.setProperty("--tx", `${tx}px`);
      p.style.setProperty("--ty", `${ty}px`);
      
      const size = 12 + Math.random() * 14;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = "50%";
      p.style.top = "50%";

      box.appendChild(p);
    }

    setTimeout(() => {
      box.remove();
    }, 600);
  }
}

// Instantiate and bind onload
window.addEventListener("DOMContentLoaded", () => {
  const UI = new UIManager();
  UI.init();
  window.uiManager = UI;
});
