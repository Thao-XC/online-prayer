/**
 * Pure Web Audio API Sound Synthesizer for Shrine & Temple Pilgrimage
 * Generates zero-dependency procedural audio for bells, gongs, coins, water, and chants.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientInterval: number | null = null;
  private isAmbientRunning: boolean = false;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.15, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Shinto Suzu Bell: Brass hand-shaken bell with internal balls and resonant high shimmer
   */
  public playSuzuBell() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const frequencies = [1480, 2220, 2960, 3700, 4440];

    // Play 3 rapid shakes mimicking the rope pull
    [0, 0.12, 0.26].forEach((offset) => {
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), now + offset);

        const volume = (0.15 / (idx + 1)) * (offset === 0.26 ? 1.4 : 0.8);
        gain.gain.setValueAtTime(volume, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.2 + idx * 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 1.6);
      });
    });
  }

  /**
   * Buddhist Bonshō Temple Gong: Deep, meditative bronze bell with rich harmonic resonance
   */
  /** Filtered noise burst — the building block for thunder, splashes and rumbles */
  private noise(dur: number, freq: number, q: number, vol: number, attack = 0.01, type: BiquadFilterType = 'lowpass') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, now);
    f.Q.setValueAtTime(q, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    src.start(now);
  }

  /** Thunder: sharp crack, then a long rolling rumble */
  public playThunder() {
    this.noise(0.4, 2400, 0.7, 0.5, 0.005, 'highpass');
    setTimeout(() => this.noise(3.5, 180, 0.8, 0.7, 0.15), 120);
  }

  /** Deep underwater / stone rumble */
  public playRumble(seconds = 2.5) {
    this.noise(seconds, 90, 1.2, 0.6, 0.4);
  }

  /** Splash as you go into the water */
  public playSplash() {
    this.noise(0.9, 1200, 0.6, 0.45, 0.01, 'bandpass');
    this.noise(1.6, 400, 0.6, 0.25, 0.05);
  }

  /** Rooster crow: a rising-falling sawtooth with vibrato */
  public playRooster() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.25);
    osc.frequency.setValueAtTime(880, now + 0.7);
    osc.frequency.linearRampToValueAtTime(600, now + 1.2);
    lfo.frequency.setValueAtTime(28, now);
    lfoGain.gain.setValueAtTime(25, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(1400, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.05);
    g.gain.setValueAtTime(0.12, now + 1.0);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    osc.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 1.35);
    lfo.stop(now + 1.35);
  }

  /** Two notes up for gaining luck, two down for losing it */
  public playLuck(up: boolean) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    (up ? [784, 1175] : [392, 311]).forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = up ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.6);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.65);
    });
  }

  public playTempleGong() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Deep fundamental around 110Hz, with slight inharmonic partials
    const partials = [
      { freq: 108, gain: 0.5, decay: 6.0 },
      { freq: 216, gain: 0.35, decay: 4.5 },
      { freq: 328, gain: 0.22, decay: 3.5 },
      { freq: 442, gain: 0.15, decay: 2.8 },
      { freq: 654, gain: 0.08, decay: 1.8 },
      { freq: 880, gain: 0.04, decay: 1.2 }
    ];

    partials.forEach(({ freq, gain: vol, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.7, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  }

  /**
   * Saisen Offering: Metallic coin flick and rattle against wooden slats
   */
  public playCoinToss() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Metallic ping of 5-yen brass coin
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(4500, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);

    // Wood clatters inside the box
    [0.15, 0.24, 0.31].forEach((delay) => {
      const woodOsc = ctx.createOscillator();
      const woodGain = ctx.createGain();
      woodOsc.type = 'triangle';
      woodOsc.frequency.setValueAtTime(320 + Math.random() * 80, now + delay);

      woodGain.gain.setValueAtTime(0.18, now + delay);
      woodGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

      woodOsc.connect(woodGain);
      woodGain.connect(ctx.destination);
      woodOsc.start(now + delay);
      woodOsc.stop(now + delay + 0.12);
    });
  }

  /**
   * Temizu Water: Soothing stream pouring from bamboo pipe / wooden hishaku
   */
  public playTemizuWater() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.9));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.8);
    filter.Q.setValueAtTime(4.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  /**
   * Traditional Two Claps (Ni-hai)
   */
  public playClap(count = 2) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    for (let c = 0; c < count; c++) {
      const delay = c * 0.35;
      const now = ctx.currentTime + delay;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  /**
   * Omikuji Canister Shaking (wooden dowels knocking)
   */
  public playOmikujiShake() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const offset = i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 120, now + offset);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    }
  }

  /**
   * Wind Chime (Fuurin)
   */
  public playFuurin() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [2093, 2349, 2793, 3135, 3520];
    const pitch = notes[Math.floor(Math.random() * notes.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.0);
  }

  /**
   * Auspicious Milestone Bell Chime
   */
  public playBellChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  }

  /**
   * Gentle Footstep sound (gravel / wood)
   */
  public playFootstep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 + Math.random() * 30, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Zen Shakuhachi / Flute Note in Japanese Insen Pentatonic Scale
   */
  public playZenTone(noteIndex = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const scale = [293.66, 311.13, 392.00, 440.00, 523.25, 587.33]; // D, Eb, G, A, C, D
    const freq = scale[noteIndex % scale.length];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle breathy vibrato
    vibrato.frequency.setValueAtTime(5, now);
    vibratoGain.gain.setValueAtTime(3.5, now);
    vibrato.connect(osc.frequency);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + 3.0);
    osc.stop(now + 3.0);
  }

  /**
   * Start tranquil ambient nature soundscape
   */
  public startAmbient() {
    if (this.isAmbientRunning) return;
    this.isAmbientRunning = true;
    const ctx = this.initContext();
    if (!ctx) return;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, ctx.currentTime);
    this.ambientGain.connect(ctx.destination);

    // Periodically play gentle fuurin chime or zen flute note
    let step = 0;
    this.ambientInterval = window.setInterval(() => {
      if (this.isMuted) return;
      if (Math.random() > 0.4) {
        this.playFuurin();
      } else {
        this.playZenTone(step % 6);
        step++;
      }
    }, 4500);
  }

  public stopAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.isAmbientRunning = false;
  }
}

export const soundService = new SoundService();
