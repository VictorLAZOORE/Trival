"use client";

class SoundManager {
  private audioCtx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  correct() {
    this.playTone(523, 0.15);
    setTimeout(() => this.playTone(659, 0.15), 100);
    setTimeout(() => this.playTone(784, 0.3), 200);
  }

  wrong() {
    this.playTone(200, 0.3, "sawtooth");
  }

  tick() {
    this.playTone(800, 0.05, "square");
  }

  countdown() {
    this.playTone(440, 0.1);
  }

  gameStart() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15), i * 120);
    });
  }

  winner() {
    const melody = [523, 659, 784, 1047, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2), i * 150);
    });
  }
}

export const sounds = new SoundManager();
