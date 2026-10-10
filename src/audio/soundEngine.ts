/**
 * Procedural Web Audio Sound Engine for Jumanji 16-Bit Arcade
 * Includes tribal Jumanji drums, sky-drop respawn thuds, attacks, and movie SFX.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private drumInterval: number | null = null;
  private drumBpm: number = 90;
  private drumStep: number = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopJungleDrums();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Jumanji Jungle Drums: Iconic syncopated polyrhythmic low percussion
  public startJungleDrums(bpm: number = 92) {
    if (this.isMuted) return;
    this.initCtx();
    this.drumBpm = bpm;
    if (this.drumInterval) clearInterval(this.drumInterval);

    const stepDuration = (60 / this.drumBpm / 4) * 1000;
    // Drum pattern: 16-step iconic rhythm
    const pattern = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0];

    this.drumInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      if (pattern[this.drumStep % 16] === 1) {
        this.playTomDrum(this.drumStep % 4 === 0 ? 80 : 110, 0.25);
      }
      this.drumStep++;
    }, stepDuration);
  }

  public stopJungleDrums() {
    if (this.drumInterval) {
      clearInterval(this.drumInterval);
      this.drumInterval = null;
    }
  }

  public setDrumSpeed(bpm: number) {
    if (this.drumInterval) {
      this.startJungleDrums(bpm);
    }
  }

  // Low tribal tom drum
  private playTomDrum(freq: number, decay: number) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + decay);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    } catch {
      // AudioContext safety
    }
  }

  // Sky Drop Respawn: High whistle drop down to gigantic earth-shattering THUD
  public playSkyDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Descending whistle / fall
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'triangle';
      whistleOsc.frequency.setValueAtTime(750, now);
      whistleOsc.frequency.exponentialRampToValueAtTime(120, now + 0.6);

      whistleGain.gain.setValueAtTime(0.2, now);
      whistleGain.gain.linearRampToValueAtTime(0.3, now + 0.55);
      whistleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      whistleOsc.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);
      whistleOsc.start(now);
      whistleOsc.stop(now + 0.6);

      // Delayed massive THUD (at 0.58s)
      window.setTimeout(() => {
        if (!this.ctx) return;
        const thudNow = this.ctx.currentTime;
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(140, thudNow);
        thudOsc.frequency.exponentialRampToValueAtTime(25, thudNow + 0.45);

        thudGain.gain.setValueAtTime(0.6, thudNow);
        thudGain.gain.exponentialRampToValueAtTime(0.001, thudNow + 0.45);

        thudOsc.connect(thudGain);
        thudGain.connect(this.ctx.destination);
        thudOsc.start(thudNow);
        thudOsc.stop(thudNow + 0.45);

        // Noise impact crash
        this.playNoiseBlast(0.35, 0.4);
      }, 580);
    } catch {
      // audio safety
    }
  }

  // Attack: Boomerang whoosh / Karate kick
  public playAttack(characterId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (characterId === 'bravestone') {
        // Boomerang whip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(680, now + 0.08);
        osc.frequency.linearRampToValueAtTime(320, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      } else if (characterId === 'ruby') {
        // Dance-fight karate strike
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      } else if (characterId === 'mouse') {
        // Valet ordinance toss
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      } else {
        // Shelly cartographer flare
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // audio safety
    }
  }

  // Jump
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio safety
    }
  }

  // Hit / Hurt sound
  public playHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio safety
    }
  }

  // Jewel pickup / socket chime
  public playJewelChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch {
      // Audio safety
    }
  }

  // Final Victory "JUMANJI!" Shout & Fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Arpeggiated grand brass chords
      const chords = [
        { freqs: [392, 523, 659], time: 0 },
        { freqs: [440, 587, 698], time: 0.25 },
        { freqs: [523, 659, 783], time: 0.5 },
        { freqs: [659, 783, 1046], time: 0.8 },
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((f) => {
          const now = this.ctx!.currentTime + chord.time;
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now);
          osc.stop(now + 0.65);
        });
      });
    } catch {
      // Audio safety
    }
  }

  // Noise blast for explosions or heavy thuds
  private playNoiseBlast(duration: number, volume: number) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio safety
    }
  }
}

export const sound = new SoundEngine();
