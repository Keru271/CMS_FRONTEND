import confetti from 'canvas-confetti';

/**
 * High-Energy Party Popper & Confetti Celebration Sound Effect
 * Synthesizes a celebratory party horn and sparkling fanfare via Web Audio API.
 */
export function playCelebrationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Fanfare Notes: C5 -> E5 -> G5 -> C6 (Joyful arpeggio)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.15 },
      { freq: 659.25, time: 0.12, dur: 0.15 },
      { freq: 783.99, time: 0.24, dur: 0.18 },
      { freq: 1046.5, time: 0.38, dur: 0.55 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });

    // Party Popper "POP" Noise Burst
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  } catch {
    // Gracefully ignore audio autoplay policies
  }
}

/**
 * Triggers a multi-stage celebratory Party Popper explosion across the screen.
 */
export function firePartyPopper() {
  if (typeof window === 'undefined') return;

  // 1. Play auditory fanfare and popper pop
  playCelebrationSound();

  const colors = [
    '#00E5FF', // Cyan / Neon Blue
    '#32D74B', // Emerald Green
    '#FF375F', // Pinkish Crimson
    '#FFD60A', // Gold Yellow
    '#BF5AF2', // Purple / Violet
    '#FF9F0A', // Vibrant Orange
  ];

  // Stage 1: Left and Right Cannons firing upward into center
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 65,
    origin: { x: 0.05, y: 0.8 },
    colors,
    startVelocity: 60,
    gravity: 0.9,
    scalar: 1.1,
    ticks: 250,
  });

  confetti({
    particleCount: 70,
    angle: 120,
    spread: 65,
    origin: { x: 0.95, y: 0.8 },
    colors,
    startVelocity: 60,
    gravity: 0.9,
    scalar: 1.1,
    ticks: 250,
  });

  // Stage 2: Center skyfire fireworks burst after 180ms
  setTimeout(() => {
    confetti({
      particleCount: 110,
      spread: 100,
      origin: { x: 0.5, y: 0.55 },
      colors,
      startVelocity: 45,
      gravity: 0.8,
      scalar: 1.25,
      shapes: ['circle', 'square'],
      ticks: 300,
    });
  }, 180);

  // Stage 3: Star and ribbon shimmer shower after 450ms
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FFD700', '#FFA500', '#00E5FF', '#FFFFFF', '#32D74B'],
      startVelocity: 35,
      gravity: 0.7,
      scalar: 1.3,
      ticks: 280,
    });
  }, 450);

  // Stage 4: Gentle celebratory rain after 800ms
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.2 },
      colors,
      startVelocity: 25,
      gravity: 0.6,
      scalar: 0.9,
      ticks: 200,
    });
  }, 800);
}
