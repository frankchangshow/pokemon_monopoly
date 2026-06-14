/**
 * sound.js - Web Audio API Sound Generator
 * Synthesizes retro game sound effects on-the-fly without downloading audio assets.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
  }

  init() {
    if (this.ctx) return;
    // Initialize Web Audio Context after user interaction
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Helper: Create oscillators and envelope
  playTone(freqStart, freqEnd, duration, type = "sine", volume = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Resume context if suspended (browser security policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    }

    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Play white noise for hit/dice effects
  playNoise(duration, lowPassFreq = 1000, volume = 0.1, decay = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(lowPassFreq, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    if (decay) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    }

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noiseSource.start();
    noiseSource.stop(this.ctx.currentTime + duration);
  }

  // Optimized scheduling helpers for rapid BGM sequence playback
  playToneForBGM(freqStart, freqEnd, duration, type = "sine", volume = 0.1) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
      }

      gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("BGM playTone error", e);
    }
  }

  playNoiseForBGM(duration, lowPassFreq = 1000, volume = 0.1) {
    if (this.muted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(lowPassFreq, this.ctx.currentTime);

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start();
      noiseSource.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("BGM playNoise error", e);
    }
  }

  // Preset Sounds
  playClick() {
    this.playTone(600, 600, 0.05, "sine", 0.05);
  }

  playTextBlip() {
    this.playTone(450, 450, 0.03, "square", 0.02);
  }

  playDiceRoll() {
    // Generate 5 quick clack sounds separated in time
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(150 + Math.random() * 100, 80, 0.06, "triangle", 0.1);
      }, i * 120);
    }
  }

  playHitNormal() {
    // Sharp noise burst + low thud
    this.playNoise(0.15, 800, 0.15);
    this.playTone(180, 60, 0.15, "triangle", 0.2);
  }

  playHitSuperEffective() {
    // Two quick high pitches + major explosion noise
    this.playNoise(0.25, 2000, 0.2);
    this.playTone(400, 100, 0.2, "sawtooth", 0.15);
    setTimeout(() => {
      this.playTone(800, 200, 0.15, "square", 0.1);
    }, 50);
  }

  playCatchBall() {
    // Three soft wiggle clicks, then a chime
    const playWiggle = (delay) => {
      setTimeout(() => {
        this.playTone(300, 150, 0.08, "triangle", 0.1);
      }, delay);
    };

    playWiggle(0);
    playWiggle(350);
    playWiggle(700);

    // Chime on success
    setTimeout(() => {
      this.playTone(523.25, 1046.50, 0.15, "sine", 0.08); // C5 to C6
      setTimeout(() => {
        this.playTone(659.25, 1318.51, 0.2, "sine", 0.08); // E5 to E6
      }, 100);
      setTimeout(() => {
        this.playTone(783.99, 1567.98, 0.3, "sine", 0.08); // G5 to G6
      }, 200);
    }, 1050);
  }

  playVictory() {
    // Upbeat retro chiptune fanfare
    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 523.25, d: 0.1 },  // C5
      { f: 523.25, d: 0.1 },  // C5
      { f: 523.25, d: 0.2 },  // C5
      { f: 659.25, d: 0.2 },  // E5
      { f: 587.33, d: 0.2 },  // D5
      { f: 659.25, d: 0.2 },  // E5
      { f: 698.46, d: 0.2 },  // F5
      { f: 783.99, d: 0.5 }   // G5
    ];

    let accum = 0;
    notes.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.f, n.d, "square", 0.06);
      }, accum * 1000);
      accum += n.d;
    });
  }

  playDefeat() {
    // Descending sad melody
    const notes = [
      { f: 392.00, d: 0.2 },  // G4
      { f: 349.23, d: 0.2 },  // F4
      { f: 311.13, d: 0.2 },  // Eb4
      { f: 246.94, d: 0.5 }   // B3 (sad slide down)
    ];

    let accum = 0;
    notes.forEach((n) => {
      setTimeout(() => {
        if (n.f === 246.94) {
          this.playTone(n.f, 150, n.d, "sawtooth", 0.08);
        } else {
          this.playTone(n.f, n.f, n.d, "sawtooth", 0.08);
        }
      }, accum * 1000);
      accum += n.d;
    });
  }

  playJaildetention() {
    // Descending siren-like buzzer
    this.playTone(300, 100, 0.4, "sawtooth", 0.12);
  }

  playBuyCamp() {
    // Level up type rise
    this.playTone(300, 600, 0.2, "sine", 0.1);
  }

  playGrassAttack() {
    // Leaf rustle noise bursts
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playNoise(0.08, 1200 + Math.random() * 400, 0.08, true);
        this.playTone(400, 200, 0.05, "sine", 0.05);
      }, i * 70);
    }
  }

  playFireAttack() {
    // Flame blast: low pass noise decaying + sweep up in frequency
    this.playNoise(0.35, 600, 0.15, true);
    this.playTone(80, 220, 0.35, "sawtooth", 0.1);
  }

  playWaterAttack() {
    // Water splash bubble sequence
    this.playNoise(0.2, 1200, 0.1, true);
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(300 + i * 150, 450 + i * 200, 0.08, "sine", 0.08);
      }, i * 60);
    }
  }

  playElectricAttack() {
    // Distorted sawtooth lightning zap buzz
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(600 - Math.random() * 200, 100, 0.04, "sawtooth", 0.12);
      }, i * 40);
    }
  }

  playGroundAttack() {
    // Deep rumbling explosion thud
    this.playNoise(0.4, 250, 0.25, true);
    this.playTone(100, 30, 0.4, "triangle", 0.3);
  }

  playFairyAttack() {
    // Twinkling ascending chimes
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq, 0.15, "sine", 0.08);
      }, idx * 50);
    });
  }

  playPoisonAttack() {
    // Creepy gurgle pitch slide down
    this.playNoise(0.3, 400, 0.08, true);
    this.playTone(300, 80, 0.3, "sawtooth", 0.08);
  }

  playSteelAttack() {
    // Metallic chime clash + heavy thud
    this.playTone(1200, 1200, 0.08, "square", 0.08);
    this.playTone(900, 900, 0.12, "triangle", 0.08);
    setTimeout(() => {
      this.playTone(180, 60, 0.15, "triangle", 0.15);
      this.playNoise(0.15, 600, 0.1, true);
    }, 20);
  }

  playFightingAttack() {
    // Punch punch slam combo
    this.playTone(150, 80, 0.08, "triangle", 0.12);
    setTimeout(() => {
      this.playTone(160, 80, 0.08, "triangle", 0.12);
    }, 100);
    setTimeout(() => {
      this.playTone(200, 50, 0.15, "sawtooth", 0.18);
      this.playNoise(0.12, 1000, 0.12, true);
    }, 200);
  }

  playDragonAttack() {
    // Space sweep and pitch roar
    this.playNoise(0.4, 1500, 0.1, true);
    this.playTone(150, 400, 0.25, "sawtooth", 0.08);
    setTimeout(() => {
      this.playTone(400, 100, 0.2, "sawtooth", 0.08);
    }, 200);
  }

  playNormalAttack() {
    // Simple physical swipe / slam
    this.playNoise(0.12, 1000, 0.12, true);
    this.playTone(200, 70, 0.12, "sine", 0.15);
  }

  playAttackSound(type) {
    switch(type) {
      case "Grass": this.playGrassAttack(); break;
      case "Fire": this.playFireAttack(); break;
      case "Water": this.playWaterAttack(); break;
      case "Electric": this.playElectricAttack(); break;
      case "Ground":
      case "Rock":
        this.playGroundAttack(); break;
      case "Fairy": this.playFairyAttack(); break;
      case "Poison":
      case "Ghost":
        this.playPoisonAttack(); break;
      case "Steel": this.playSteelAttack(); break;
      case "Fighting": this.playFightingAttack(); break;
      case "Dragon": this.playDragonAttack(); break;
      default: this.playNormalAttack(); break;
    }
  }

  playEncounterSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Rapid ascending pitch-sweep
    this.playTone(100, 900, 0.45, "sawtooth", 0.10);
    this.playNoise(0.45, 1800, 0.06);

    // Followed by quick alarm beeps
    setTimeout(() => {
      const alarmNotes = [880, 880, 880, 1046.5];
      alarmNotes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, freq, 0.07, "square", 0.07);
        }, idx * 90);
      });
    }, 450);
  }

  playBattleBGM() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.bgmInterval) {
      this.stopBattleBGM();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const bpm = 150;
    const stepTime = 60 / bpm / 2; // Eighth notes
    let step = 0;

    // Intense high-beat driving bassline
    const bassline = [
      110, 110, 130, 110, 146.8, 110, 130, 123.47, // A2, A2, C3, A2, D3, A2, C3, B2
      110, 110, 130, 110, 165.0, 146.8, 130, 123.47 // A2, A2, C3, A2, E3, D3, C3, B2
    ];

    // High energetic retro melody accents
    const leadline = [
      220, 0, 261.63, 220, 293.66, 0, 329.63, 0,
      349.23, 329.63, 293.66, 261.63, 246.94, 220, 196, 220
    ];

    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;

      // Ensure context hasn't been suspended
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      // 1. Play bass thud
      const bassFreq = bassline[step % bassline.length];
      if (bassFreq > 0) {
        this.playToneForBGM(bassFreq, bassFreq, stepTime * 0.95, "sawtooth", 0.045);
      }

      // 2. Play lead chiptune melody
      const leadFreq = leadline[step % leadline.length];
      if (leadFreq > 0 && step % 2 === 0) {
        this.playToneForBGM(leadFreq, leadFreq, stepTime * 1.4, "square", 0.018);
      }

      // 3. Play drum snare on backbeats (beats 2 and 4)
      if (step % 4 === 2) {
        this.playNoiseForBGM(0.08, 1600, 0.035);
      }

      // 4. Play hi-hat tick on off-beats
      if (step % 2 === 1) {
        this.playNoiseForBGM(0.03, 5500, 0.015);
      }

      step++;
    }, stepTime * 1000);
  }

  stopBattleBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playMoneyGain() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playTone(987.77, 987.77, 0.08, "sine", 0.08);
    setTimeout(() => {
      this.playTone(1318.51, 1318.51, 0.15, "sine", 0.08);
    }, 70);
  }

  playMoneyLoss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playTone(350, 100, 0.25, "triangle", 0.1);
  }
}

export const Sound = new SoundManager();
export default Sound;
