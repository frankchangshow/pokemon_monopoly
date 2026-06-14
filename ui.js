/**
 * ui.js - Frontend User Interface & Controller
 * Integrates assets, sounds, Monopoly engine, and Battle engine to render a dynamic comic-book game.
 */

import { PokemonSVGs, PokemonDB, BoardSpaces, SpecialSVGs } from './assets.js?v=8';
import { Sound } from './sound.js?v=8';
import { GameEngine } from './game.js?v=8';
import { Battle } from './battle.js?v=8';

window.Battle = Battle;

const AVAILABLE_PNGS = [
  "sprigatito", "fuecoco", "quaxly", "pawmi",
  "floragato", "meowscarada", "crocalor", "skeledirge", "quaxwell", "quaquaval", "pawmo", "pawmot",
  "tinkaton", "ceruledge", "koraidon", "miraidon", "lechonk", "charcadet", "tinkatink", "fidough", "smoliv",
  "tarountula", "corviknight", "tandemaus", "rotom", "nacli", "orthworm", "toedscool", "capsakid", "grafaiai", "shroodle", "wattrel", "bellibolt",
  "dondozo", "tatsugiri", "veluza",
  "sprigatito_tera", "fuecoco_tera", "quaxly_tera", "pawmi_tera",
  "go_sprite", "jail_sprite", "free_parking_sprite", "go_to_jail_sprite",
  "go_full", "jail_full", "free_parking_full", "go_to_jail_full",
  "tera_raid_chest", "academy_class", "poke_mart_tax", "league_assessment_tax"
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

    // DOM Elements Cache
    this.setupScreen = document.getElementById("setup-screen");
    this.gameContainer = document.getElementById("game-container");
    this.boardGrid = document.getElementById("board-grid");
    this.logsPanel = document.getElementById("logs-panel-box");
    this.trainerList = document.getElementById("trainer-list-box");
    this.statusDialog = document.getElementById("status-dialog");
    
    this.rollBtn = document.getElementById("roll-dice-btn");
    this.buyBtn = document.getElementById("buy-prop-btn");
    this.buildBtn = document.getElementById("build-btn");
    this.manageBtn = document.getElementById("manage-assets-btn");
    this.endBtn = document.getElementById("end-turn-btn");
    
    this.die1 = document.getElementById("die-1");
    this.die2 = document.getElementById("die-2");
    this.diceZone = document.querySelector(".dice-zone");
    this.dashboardUtilities = document.getElementById("utility-menu-container");
    this.utilityPopupMenu = document.getElementById("utility-popup-menu");
    this.utilityMenuBtn = document.getElementById("utility-menu-btn");
    
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
    this.playerBattleSprite = document.getElementById("player-battle-sprite");
    
    this.enemyPokeName = document.getElementById("enemy-poke-name");
    this.enemyPokeTera = document.getElementById("enemy-poke-tera");
    this.enemyHpBar = document.getElementById("enemy-hp-bar");
    this.enemyHpText = document.getElementById("enemy-hp-text");
    this.enemyBattleSprite = document.getElementById("enemy-battle-sprite");
    
    this.battleMove0 = document.getElementById("move-btn-0");
    this.battleMove1 = document.getElementById("move-btn-1");
    this.battleTeraBtn = document.getElementById("terastallize-btn");
    this.battleLogText = document.getElementById("battle-log-text");

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
    this.setupEventListeners();

    // Bind battle callback for combat animations & chiptune audio
    Battle.onMoveExecuted = (attacker, defender, move, effectiveness, damage) => {
      this.animateCombatMove(attacker, defender, move, effectiveness, damage);
    };
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
      this.game.buyProperty(player.id, pos, discount);
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

      this.setDialogText(`You bought ${space.name} (${space.pokemon}) for ₽${space.cost}!`);
      this.updateUI();
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
    
    this.battleTeraBtn.addEventListener("click", () => {
      Battle.terastallizePlayer();
      this.playerPokeTera.style.display = "inline-block";
      this.battleTeraBtn.disabled = true;
      this.updateBattleHUDs();
    });

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
          icon.innerHTML = `<img src="images/${lowerPoke}.png" alt="${space.pokemon}">`;
        } else if (PokemonSVGs[space.pokemon]) {
          icon.innerHTML = PokemonSVGs[space.pokemon];
        }
      } else if (space.type === "GO") {
        icon.innerHTML = `<img src="images/go_full.png" alt="GO">`;
      } else if (space.type === "jail") {
        icon.innerHTML = `<img src="images/jail_full.png" alt="Jail">`;
      } else if (space.type === "parking") {
        icon.innerHTML = `<img src="images/free_parking_full.png" alt="Free Parking">`;
      } else if (space.type === "gotojail") {
        icon.innerHTML = `<img src="images/go_to_jail_full.png" alt="Go to Jail">`;
      } else if (space.type === "tax") {
        if (space.id === 4) {
          icon.innerHTML = `<img src="images/poke_mart_tax.png" alt="Poke Mart Tax">`;
        } else {
          icon.innerHTML = `<img src="images/league_assessment_tax.png" alt="League Assessment Tax">`;
        }
      } else if (space.type === "raid") {
        icon.innerHTML = `<img src="images/tera_raid_chest.png" alt="Tera Raid Chest">`;
      } else if (space.type === "academy") {
        icon.innerHTML = `<img src="images/academy_class.png" alt="Academy Class">`;
      }
      content.appendChild(icon);

      // Pricing info
      if (space.cost > 0) {
        const price = document.createElement("div");
        price.className = "tile-price";
        price.innerText = `₽${space.cost}`;
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
        <div class="deed-info-row"><span>Base Rent (Unimproved):</span><span>₽${space.rent[0]}</span></div>
        <div class="deed-info-row"><span>With 1 Camp:</span><span>₽${space.rent[1]}</span></div>
        <div class="deed-info-row"><span>With 2 Camps:</span><span>₽${space.rent[2]}</span></div>
        <div class="deed-info-row"><span>With 3 Camps:</span><span>₽${space.rent[3]}</span></div>
        <div class="deed-info-row"><span>With 4 Camps:</span><span>₽${space.rent[4]}</span></div>
        <div class="deed-info-row"><span>With Gym Station:</span><span>₽${space.rent[5]}</span></div>
        <div class="deed-info-row bold"><span>Camp Upgrade Cost:</span><span>₽${space.houseCost}</span></div>
      `;
    } else if (space.type === "station") {
      colorClass = "station";
      rentInfoHTML = `
        <div class="deed-info-row"><span>1 Taxi Owned:</span><span>₽${space.rent[0]}</span></div>
        <div class="deed-info-row"><span>2 Taxis Owned:</span><span>₽${space.rent[1]}</span></div>
        <div class="deed-info-row"><span>3 Taxis Owned:</span><span>₽${space.rent[2]}</span></div>
        <div class="deed-info-row"><span>4 Taxis Owned:</span><span>₽${space.rent[3]}</span></div>
      `;
    } else if (space.type === "utility") {
      colorClass = "utility";
      rentInfoHTML = `
        <div class="deed-info-row"><span>1 Utility Owned:</span><span>4x Dice Sum</span></div>
        <div class="deed-info-row"><span>2 Utilities Owned:</span><span>10x Dice Sum</span></div>
      `;
    }

    const upgradeBtnState = this.game.canBuildCamp(0, spaceId) || this.game.canBuildGym(0, spaceId) ? "" : "disabled";
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
      <div class="deed-info-row"><span>Purchase Price:</span><span>₽${space.cost}</span></div>
      <div class="deed-info-row"><span>Mortgage Value:</span><span>₽${Math.floor(space.cost / 2)}</span></div>
      <hr style="margin: 10px 0; border: 0; border-top: 1.5px solid #CCC;"/>
      ${rentInfoHTML}
      
      ${isPlayerOwned ? `
        <div class="deed-actions">
          <button class="btn-comic btn-buy" id="deed-upgrade-btn" ${upgradeBtnState}>UPGRADE</button>
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

  // Update game board visual tokens, houses, sidebar, logs
  updateUI() {
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
            priceTag.innerText = `₽${space.cost}`;
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
    this.logsPanel.innerHTML = this.game.logs.map(log => `<div class="log-entry">${log}</div>`).join("");
    this.logsPanel.scrollTop = this.logsPanel.scrollHeight;

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
          <span class="trainer-card-cash">₽${p.cash}</span>
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
          floatEl.innerText = `${diff > 0 ? '+' : '-'}₽${Math.abs(diff)}`;
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

    this.uploadLogsToServer();
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
      }).catch(err => console.error("Error uploading logs:", err));
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
    const idsToClean = ["wild-battle-btn", "trainer-battle-btn", "pay-rent-btn", "accept-challenge-btn", "resolve-debt-btn", "pay-rent-fallback-btn"];
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
            this.setDialogText("Detention limit reached, but you need ₽50 to pay the escape fine.");
            this.rollBtn.style.display = "none";
            this.endBtn.style.display = "inline-block";
            return;
          }
          this.game.movePlayer(player, result.spacesMoved);
          this.updateUI();
          this.setDialogText("Detention limit reached! Paid ₽50 escape fine.");
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
    const idsToClean = ["wild-battle-btn", "trainer-battle-btn", "pay-rent-btn", "accept-challenge-btn", "resolve-debt-btn", "pay-rent-fallback-btn"];
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
      this.setDialogText("Rest stop! Free parking.");
      if (player.isAI) {
        setTimeout(() => this.executeAITurnEnd(), 1500);
      } else {
        this.endBtn.style.display = "inline-block";
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
      this.game.log(`${player.name} paid ₽${taxCost} for ${space.name}.`);
      player.cash -= taxCost;
      this.setDialogText(`Landed on ${space.name}. Paid ₽${taxCost} tax.`);
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
        this.buyBtn.innerText = `BUY AT FULL (₽${space.cost})`;
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
        this.setDialogText(`${player.name} challenges you to a Trainer Battle for rent discount on ${space.name}!`);
        this.isEncounterActive = true;
        this.showEncounterSprite(player.pokemon, `${player.name} CHALLENGE!`);
        
        const acceptChallengeBtn = document.createElement("button");
        acceptChallengeBtn.className = "btn-comic btn-roll btn-battle-highlight";
        acceptChallengeBtn.id = "accept-challenge-btn";
        acceptChallengeBtn.innerText = "DEFEND PROPERTY (Battle!)";
        this.rollBtn.parentNode.appendChild(acceptChallengeBtn);

        // Also provide a fallback: pay full rent without battle
        const payRentFallbackBtn = document.createElement("button");
        payRentFallbackBtn.className = "btn-comic btn-buy btn-buy-small";
        payRentFallbackBtn.id = "pay-rent-fallback-btn";
        payRentFallbackBtn.innerText = `COLLECT FULL RENT (₽${this.game.calculateRent(spaceId)})`;
        this.rollBtn.parentNode.appendChild(payRentFallbackBtn);
        
        const cleanupChallenge = () => {
          this.isEncounterActive = false;
          this.hideEncounterSprite();
          const ac = document.getElementById("accept-challenge-btn");
          if (ac) ac.remove();
          const prf = document.getElementById("pay-rent-fallback-btn");
          if (prf) prf.remove();
        };

        acceptChallengeBtn.addEventListener("click", () => {
          cleanupChallenge();
          this.promptPokemonSelection((selectedPoke) => {
            this.initiateTrainerBattle(selectedPoke, player.pokemon, spaceId, player.id, owner.id);
          });
        });

        payRentFallbackBtn.addEventListener("click", () => {
          cleanupChallenge();
          // Human owner just collects full rent without battling; AI pays normally
          this.game.payRent(player.id, spaceId, 0);
          this.setDialogText(`${player.name} pays full rent ₽${this.game.calculateRent(spaceId)} to you.`);
          this.resolveDuesCheck(player.id, 0, () => {
            this.updateUI();
            this.executeAITurnEnd();
          });
        });
      } else {
        // AI lands on AI: Quick simulate
        const challengerWins = Math.random() < 0.5;
        if (challengerWins) {
          this.game.degradeProperty(spaceId);
          this.game.transferPropertyOwnership(spaceId, player.id);
          this.resolveDuesCheck(player.id, null, () => {
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
      this.setDialogText(`Landed on ${owner.name}'s property. Pay rent or Challenge Trainer to a battle?`);
      this.isEncounterActive = true;
      this.showEncounterSprite(owner.pokemon, "TRAINER CHALLENGE!");
      
      const challengeBtn = document.createElement("button");
      challengeBtn.className = "btn-comic btn-roll btn-battle-highlight";
      challengeBtn.id = "trainer-battle-btn";
      challengeBtn.innerText = "CHALLENGE OWNER (50% Rent on win / 1.5x on loss)";
      this.buyBtn.parentNode.insertBefore(challengeBtn, this.buyBtn);

      const payBtn = document.createElement("button");
      payBtn.className = "btn-comic btn-buy btn-buy-small";
      payBtn.id = "pay-rent-btn";
      payBtn.innerText = `PAY FULL RENT (₽${this.game.calculateRent(spaceId)})`;
      this.buyBtn.parentNode.insertBefore(payBtn, this.buyBtn);

      challengeBtn.addEventListener("click", () => {
        this.isEncounterActive = false;
        this.hideEncounterSprite();
        challengeBtn.remove();
        payBtn.remove();
        this.promptPokemonSelection((selectedPoke) => {
          this.initiateTrainerBattle(selectedPoke, owner.pokemon, spaceId, player.id, owner.id);
        });
      });

      payBtn.addEventListener("click", () => {
        this.isEncounterActive = false;
        this.hideEncounterSprite();
        challengeBtn.remove();
        payBtn.remove();
        this.game.payRent(player.id, spaceId, 0);
        this.setDialogText(`Paid ₽${this.game.calculateRent(spaceId)} rent to ${owner.name}.`);
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
        this.setDialogText(`⚠️ You owe a debt of ₽${absoluteDebt}! Mortgage properties or sell Camps to clear balance.`);
        
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
            alert(`You are still short by ₽${Math.abs(player.cash)}. Mortgage more properties!`);
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
    const collection = player.collection || [];

    // If player has no extra Pokemon, skip selection and use default/starter
    if (collection.length === 0) {
      callback(player.pokemon);
      return;
    }

    // Otherwise, show selection overlay
    this.pokemonSelectionOverlay.style.display = "flex";
    Sound.playClick();

    // Prepare list of options: active starter + everything in collection
    const options = [
      { name: player.pokemon, isStarter: true, index: -1 }
    ];
    collection.forEach((name, idx) => {
      options.push({ name, isStarter: false, index: idx });
    });

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

        html += `
          <div class="fighter-card ${isSelected ? 'selected' : ''}" data-opt-idx="${idx}">
            ${opt.isStarter ? '<div class="fighter-badge">PARTNER</div>' : ''}
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

        callback();
      };
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

    Battle.startBattle(playerPoke, enemyPoke, false, spaceId, 0, null, pLevel, eLevel, pPower, 0, (won) => {
      Sound.stopBattleBGM();
      this.battleOverlay.style.display = "none";
      if (won) {
        // human wins the battle: transition to the catch mini-game!
        this.initiateCatchMiniGame(spaceId, (success) => {
          const space = this.game.spaces[spaceId];
          if (success) {
            this.game.log(`GOTCHA! Player successfully caught wild ${space.pokemon} and added it to their Collection!`);
            const player0 = this.game.players[0];
            if (!player0.collection) player0.collection = [];
            if (!player0.collection.includes(space.pokemon)) {
              player0.collection.push(space.pokemon);
            }
            this.renderCollection();
            this.game.buyProperty(player0.id, spaceId, 100);
            this.setDialogText(`You caught and claimed ${space.name} for FREE!`);
          } else {
            this.game.log(`Oh no! The wild ${space.pokemon} broke free and fled.`);
            this.setDialogText(`Oh no! Wild ${space.pokemon} broke free and fled.`);
          }
          this.buyBtn.style.display = "none";
          this.endBtn.innerText = "END TURN";
          this.endBtn.style.display = "inline-block";
          this.updateUI();
        });
      } else {
        // human loses: Pokémon escapes and fled, turn ends
        this.setDialogText(`Defeat! Wild ${enemyPoke} fled.`);
        this.game.log(`Wild ${enemyPoke} defeated player and fled!`);
        this.buyBtn.style.display = "none";
        this.endBtn.innerText = "END TURN";
        this.endBtn.style.display = "inline-block";
        this.updateUI();
      }
    });

    this.updateBattleHUDs();
    this.setBattleLog("A wild Pokémon appeared! Start the battle!");
  }

  initiateCatchMiniGame(spaceId, onCatchResult = null) {
    this.catchSpaceId = spaceId;
    this.onCatchResult = onCatchResult;
    const space = this.game.spaces[spaceId];
    this.selectedBall = "poke";
    this.hasCatchGameStarted = false;
    this.ballCostPaid = false;

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
      this.catchPokemonSprite.innerHTML = PokemonSVGs[space.pokemon];
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
    const space = this.game.spaces[this.catchSpaceId];
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
    const player = this.game.getCurrentPlayer();
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
      this.game.log(`${player.name} bought a ${this.selectedBall === "great" ? "Great Ball" : "Ultra Ball"} for ₽${costOfBall}.`);
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
    const space = this.game.spaces[this.catchSpaceId];
    
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

  throwBall() {
    this.isCatchAnimRunning = false;
    cancelAnimationFrame(this.catchAnimationId);
    this.throwBallBtn.disabled = true;

    const space = this.game.spaces[this.catchSpaceId];
    const player = this.game.getCurrentPlayer();
    
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
        this.game.log(`${player.name} bought a ${this.selectedBall === "great" ? "Great Ball" : "Ultra Ball"} for ₽${costOfBall}.`);
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
        this.showCatchFeedback(throwQuality + "!");
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

  initiateTrainerBattle(playerPoke, enemyPoke, spaceId, challengerIdx, ownerIdx) {
    this.resetBattleUIState();
    this.prevPlayerTera = false;
    this.prevEnemyTera = false;
    Sound.playBattleBGM();
    this.battleOverlay.style.display = "grid";
    this.battleTeraBtn.disabled = false;
    this.playerPokeTera.style.display = "none";
    this.enemyPokeTera.style.display = "none";

    // Challenger is playerPoke, Owner is enemyPoke
    const isHumanChallenger = challengerIdx === 0;
    const pLevel = this.game.getPokemonLevel(this.game.players[challengerIdx], playerPoke);
    const eLevel = this.game.getPokemonLevel(this.game.players[ownerIdx], enemyPoke);
    const pPower = this.game.players[challengerIdx].powerUpgrades || 0;
    const ePower = this.game.players[ownerIdx].powerUpgrades || 0;

    Battle.startBattle(playerPoke, enemyPoke, true, spaceId, challengerIdx, ownerIdx, pLevel, eLevel, pPower, ePower, (won) => {
      Sound.stopBattleBGM();
      this.battleOverlay.style.display = "none";
      
      const activePlayer = this.game.getCurrentPlayer();
      const space = this.game.spaces[spaceId];
      const owner = this.game.players[ownerIdx];

      if (isHumanChallenger) {
        if (won) {
          this.game.degradeProperty(spaceId);
          this.initiateCatchMiniGame(spaceId, (success) => {
            if (success) {
              this.game.transferPropertyOwnership(spaceId, 0);
              this.setDialogText(`GOTCHA! You caught ${enemyPoke} and claimed ownership of ${space.name} for FREE!`);
              this.updateUI();
              this.resolveDuesCheck(0, null, () => {
                this.endBtn.style.display = "inline-block";
              });
            } else {
              this.setDialogText(`The Pokémon broke free and fled! You must pay 50% rent to ${owner.name}.`);
              this.game.payRent(0, spaceId, 50);
              this.resolveDuesCheck(0, ownerIdx, () => {
                this.updateUI();
                this.endBtn.style.display = "inline-block";
              });
            }
          });
        } else {
          this.setDialogText(`Defeat! You lost trainer battle! Pay 1.5x rent penalty.`);
          this.game.payRent(0, spaceId, -50);
          this.resolveDuesCheck(0, ownerIdx, () => {
            this.updateUI();
            this.endBtn.style.display = "inline-block";
          });
        }
      } else {
        // AI challenged Human: Human is owner (Defender)
        // If human won battle, AI pays 1.5x rent to human. If human lost, AI pays 50% rent to human.
        // Wait, the callback winner index is 0 (which means battle champion wins. But in battle engine, Player 0 is always the attacker/challenger!)
        // Oh! In battle engine, player is ALWAYS Player index 0 (which represents the user) and enemy is the AI.
        // So, if "won" (which means User won battle): The Defender (Human) won! So AI pays 1.5x penalty to human.
        // If User lost battle: The Attacker (AI) won! So AI pays 50% rent to human.
        // NOW under new rules, if AI (challenger) wins: AI degrades property by 1 level and takes ownership for free.
        if (won) {
          this.setDialogText(`Property defended! ${activePlayer.name} pays 1.5x rent penalty.`);
          this.game.payRent(activePlayer.id, spaceId, -50);
          this.isEncounterActive = false;
          this.resolveDuesCheck(activePlayer.id, 0, () => {
            this.updateUI();
            setTimeout(() => this.executeAITurnEnd(), 800);
          });
        } else {
          this.game.degradeProperty(spaceId);
          this.game.transferPropertyOwnership(spaceId, activePlayer.id);
          this.setDialogText(`Defense failed! ${activePlayer.name} defeated you and claimed ownership of ${space.name} for FREE!`);
          this.isEncounterActive = false;
          this.resolveDuesCheck(activePlayer.id, null, () => {
            this.updateUI();
            setTimeout(() => this.executeAITurnEnd(), 800);
          });
        }
      }
    });

    this.updateBattleHUDs();
    this.setBattleLog(`Trainer Battle initiated! Defender vs Challenger.`);
  }

  resetBattleUIState() {
    this.combatAnimating = false;
    this.battleMove0.disabled = false;
    this.battleMove1.disabled = false;
    this.playerBattleSprite.classList.remove("strike-player", "strike-enemy", "shake", "tera-active");
    this.enemyBattleSprite.classList.remove("strike-player", "strike-enemy", "shake", "tera-active");
    this.playerBattleSprite.className = "battle-sprite-container";
    this.enemyBattleSprite.className = "battle-sprite-container";
  }

  updateBattleHUDs() {
    const battle = Battle.activeBattle;
    if (!battle) return;

    const availablePNGs = AVAILABLE_PNGS;

    // Check for new Terastallization triggers to play visual effects
    if (battle.player.terastallized && !this.prevPlayerTera) {
      this.prevPlayerTera = true;
      this.triggerTeraVisuals();
    }
    if (battle.enemy.terastallized && !this.prevEnemyTera) {
      this.prevEnemyTera = true;
      this.triggerTeraVisuals();
    }

    // Player HUD
    this.playerPokeName.innerHTML = `${battle.player.name} (Lv. ${battle.player.level}) <span class="move-type-tag ${battle.player.type.toLowerCase()}">${battle.player.type}</span>`;
    this.playerHpText.innerText = `${battle.player.hp} / ${battle.player.maxHp} HP`;
    this.playerHpBar.style.width = `${(battle.player.hp / battle.player.maxHp) * 100}%`;
    
    const lowerPlayer = battle.player.name.toLowerCase();
    const isPlayerTera = battle.player.terastallized;
    const playerImgName = isPlayerTera && availablePNGs.includes(`${lowerPlayer}_tera`) ? `${lowerPlayer}_tera` : lowerPlayer;

    if (availablePNGs.includes(playerImgName)) {
      this.playerBattleSprite.innerHTML = `<img src="images/${playerImgName}.png" alt="${battle.player.name}" style="width:100%; height:100%; object-fit:contain; border:3px solid #000; border-radius:12px; box-shadow:var(--box-shadow-comic);">`;
    } else {
      this.playerBattleSprite.innerHTML = PokemonSVGs[battle.player.name];
    }

    if (isPlayerTera) {
      this.playerBattleSprite.classList.add("tera-active");
    } else {
      this.playerBattleSprite.classList.remove("tera-active");
    }

    // Enemy HUD
    this.enemyPokeName.innerHTML = `${battle.enemy.name} (Lv. ${battle.enemy.level}) <span class="move-type-tag ${battle.enemy.type.toLowerCase()}">${battle.enemy.type}</span>`;
    this.enemyHpText.innerText = `${battle.enemy.hp} / ${battle.enemy.maxHp} HP`;
    this.enemyHpBar.style.width = `${(battle.enemy.hp / battle.enemy.maxHp) * 100}%`;
    
    const lowerEnemy = battle.enemy.name.toLowerCase();
    const isEnemyTera = battle.enemy.terastallized;
    const enemyImgName = isEnemyTera && availablePNGs.includes(`${lowerEnemy}_tera`) ? `${lowerEnemy}_tera` : lowerEnemy;

    if (availablePNGs.includes(enemyImgName)) {
      this.enemyBattleSprite.innerHTML = `<img src="images/${enemyImgName}.png" alt="${battle.enemy.name}" style="width:100%; height:100%; object-fit:contain; border:3px solid #000; border-radius:12px; box-shadow:var(--box-shadow-comic);">`;
    } else {
      this.enemyBattleSprite.innerHTML = PokemonSVGs[battle.enemy.name];
    }

    if (isEnemyTera) {
      this.enemyBattleSprite.classList.add("tera-active");
    } else {
      this.enemyBattleSprite.classList.remove("tera-active");
    }

    // Move names with element labels
    const move0 = battle.player.moves[0];
    const move1 = battle.player.moves[1];
    this.battleMove0.innerHTML = `<span class="move-type-tag ${move0.type.toLowerCase()}">${move0.type}</span> ${move0.name} (${move0.power})`;
    this.battleMove1.innerHTML = `<span class="move-type-tag ${move1.type.toLowerCase()}">${move1.type}</span> ${move1.name} (${move1.power})`;

    // Turn indicator
    this.battleMove0.disabled = battle.turn !== 0;
    this.battleMove1.disabled = battle.turn !== 0;
  }

  setBattleLog(msg) {
    this.battleLogText.innerHTML = msg;
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

    Battle.executePlayerMove(moveIdx);
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
          this.setDialogText(`${ai.name} needs ₽50 to leave detention.`);
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
    if (!this.selectedCollectionIndices) this.selectedCollectionIndices = [];

    // Ensure selection is valid
    this.selectedCollectionIndices = this.selectedCollectionIndices.filter(idx => idx < player.collection.length);

    let html = "";
    if (player.collection.length === 0) {
      html += `<div style="font-size:0.82rem; color:#7F8C8D; text-align:center; padding: 10px 0;">No Pokémon caught yet. Win wild battles to catch them!</div>`;
    } else {
      html += `<div class="collection-list">`;
      const availablePNGs = AVAILABLE_PNGS;

      player.collection.forEach((poke, idx) => {
        const isSelected = this.selectedCollectionIndices.includes(idx);
        const lowerPoke = poke.toLowerCase();
        let spriteHtml = "";
        if (availablePNGs.includes(lowerPoke)) {
          spriteHtml = `<img src="images/${lowerPoke}.png" alt="${poke}">`;
        } else {
          spriteHtml = PokemonSVGs[poke] || "";
        }

        const currentLvl = this.game.getPokemonLevel(player, poke);
        html += `
          <div class="collection-item ${isSelected ? 'selected' : ''}" data-idx="${idx}" title="${poke}" style="position: relative;">
            ${spriteHtml}
            <div style="position: absolute; bottom: -3px; right: -3px; background: #000; color: #FFF; font-size: 0.55rem; padding: 1px 4px; border-radius: 4px; font-weight: 800; border: 1.5px solid #000; box-shadow: 1px 1px 0px #000;">Lv. ${currentLvl}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    const tradeDisabled = this.selectedCollectionIndices.length !== 3;
    html += `
      <div class="trade-controls">
        <button class="btn-trade ${tradeDisabled ? 'disabled' : ''}" id="btn-trade-power" ${tradeDisabled ? 'disabled' : ''}>TRADE FOR POWER</button>
        <button class="btn-trade ${tradeDisabled ? 'disabled' : ''}" id="btn-trade-evolve" ${tradeDisabled ? 'disabled' : ''}>TRADE FOR EVOLUTION</button>
      </div>
    `;

    container.innerHTML = html;

    // Attach click listeners to selection
    if (player.collection.length > 0) {
      const items = container.querySelectorAll(".collection-item");
      items.forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-idx"));
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

    // Attach click listeners to trade buttons
    if (!tradeDisabled) {
      const btnPower = document.getElementById("btn-trade-power");
      const btnEvolve = document.getElementById("btn-trade-evolve");

      btnPower.addEventListener("click", () => {
        this.executeTrade("power");
      });

      btnEvolve.addEventListener("click", () => {
        this.executeTrade("evolve");
      });
    }
  }

  executeTrade(type) {
    const player = this.game.players[0];
    if (!player.collection || this.selectedCollectionIndices.length !== 3) return;

    // Get Pokémon traded
    const tradedNames = this.selectedCollectionIndices.map(idx => player.collection[idx]);

    // Sort descending to splice safely
    const sortedIndices = [...this.selectedCollectionIndices].sort((a, b) => b - a);
    sortedIndices.forEach(idx => {
      player.collection.splice(idx, 1);
    });

    this.selectedCollectionIndices = [];

    if (type === "power") {
      player.powerUpgrades = (player.powerUpgrades || 0) + 1;
      this.game.log(`🔄 Traded 3 Pokémon (${tradedNames.join(", ")}) for a Power Upgrade! Permanent +20% damage in battle (Total boost: +${player.powerUpgrades * 20}%).`);
      this.setDialogText("Trade successful! Partner Pokémon battle damage increased by +20%.");
      Sound.playVictory();
    } else if (type === "evolve") {
      player.evolutionUpgrades = (player.evolutionUpgrades || 0) + 1;
      const oldPoke = player.pokemon;
      const oldLevel = player.level;

      // Recalculate partner stats
      this.game.recalculatePlayerStats(0);

      if (player.pokemon === oldPoke) {
        // Did not evolve because already Stage 2, apply bonus levels
        player.bonusLevels = (player.bonusLevels || 0) + 2;
        this.game.recalculatePlayerStats(0);
        this.game.log(`🔄 Traded 3 Pokémon (${tradedNames.join(", ")}) for an Evolution Upgrade! Partner already fully evolved, gained +2 Levels instead!`);
        this.setDialogText("Fully evolved! Partner gained +2 Levels (+30 Max HP, +20% damage).");
      } else {
        // Evolved
        this.game.log(`🔄 Traded 3 Pokémon (${tradedNames.join(", ")}) for an Evolution Upgrade! Partner evolved from ${oldPoke} to ${player.pokemon}!`);
        this.setDialogText(`Evolved! Partner evolved to ${player.pokemon}!`);
      }
      Sound.playVictory();
    }

    this.renderCollection();
    this.updateUI();
  }

  animateCombatMove(attackerSide, defenderSide, move, effectiveness, damage) {
    this.combatAnimating = true;

    // Determine DOM elements based on sides
    const attackerSprite = attackerSide === "player" ? this.playerBattleSprite : this.enemyBattleSprite;
    const defenderSprite = defenderSide === "player" ? this.playerBattleSprite : this.enemyBattleSprite;

    // Disable move buttons during animation
    this.battleMove0.disabled = true;
    this.battleMove1.disabled = true;

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

        const lastLog = battle.logs[battle.logs.length - 1];
        if (lastLog) {
          this.setBattleLog(lastLog);
        }
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
