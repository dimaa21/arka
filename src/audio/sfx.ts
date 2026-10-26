type WinSize = 'small' | 'medium' | 'big';

/**
 * Short tones synthesized with the Web Audio API. No sample files.
 * The context is created on the first gesture so autoplay policies allow it.
 */
export class Sfx {
  muted: boolean;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  constructor(muted: boolean) {
    this.muted = muted;
  }

  /** Resume audio after a user gesture. */
  unlock(): void {
    if (this.muted) return;
    const context = this.ensure();
    if (context?.state === 'suspended') void context.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.context || !this.master) return;
    this.master.gain.setValueAtTime(muted ? 0 : 0.22, this.context.currentTime);
  }

  playClick(): void {
    this.blip(740, 0.045, 'sine', 0.04);
  }

  playSpin(): void {
    if (this.muted) return;
    const context = this.ensure();
    const master = this.master;
    if (!context || !master) return;
    const time = context.currentTime;
    this.tone(context, master, 196, time, 0.16, 'sawtooth', 0.035);
    this.tone(context, master, 98, time, 0.2, 'sine', 0.05);
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(context);
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(880, time);
    filter.frequency.exponentialRampToValueAtTime(240, time + 0.24);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.06, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.26);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(time);
    source.stop(time + 0.28);
  }

  /** A knock when one reel lands. `reel` slightly raises the pitch. */
  playStop(reel: number): void {
    this.blip(150 + reel * 32, 0.09, 'square', 0.045);
  }

  playWin(size: WinSize): void {
    if (this.muted) return;
    const context = this.ensure();
    const master = this.master;
    if (!context || !master) return;
    const time = context.currentTime;
    const notes =
      size === 'big'
        ? [523.25, 659.25, 783.99, 1046.5]
        : size === 'medium'
          ? [392, 523.25, 659.25]
          : [440, 554.37];
    notes.forEach((frequency, index) => {
      this.tone(context, master, frequency, time + index * 0.09, 0.24, 'triangle', 0.07);
    });
  }

  private blip(frequency: number, duration: number, type: OscillatorType, volume: number): void {
    if (this.muted) return;
    const context = this.ensure();
    const master = this.master;
    if (!context || !master) return;
    this.tone(context, master, frequency, context.currentTime, duration, type, volume);
  }

  private tone(
    context: AudioContext,
    master: GainNode,
    frequency: number,
    time: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private ensure(): AudioContext | null {
    if (this.context) return this.context;
    try {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = this.muted ? 0 : 0.22;
      master.connect(context.destination);
      this.context = context;
      this.master = master;
      return context;
    } catch {
      return null;
    }
  }

  private noiseBuffer(context: AudioContext): AudioBuffer {
    if (this.noise) return this.noise;
    const length = Math.floor(context.sampleRate * 0.3);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    this.noise = buffer;
    return buffer;
  }
}
