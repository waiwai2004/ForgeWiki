/**
 * ForgeCraft Web Audio API Sound Synthesizer Utility
 * Generates custom, theme-appropriate blacksmith/metallic feedback sound effects during user interactions.
 * Safe from layout-blocking errors and respects modern browser auto-play policies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    // Standard and vendor prefixed AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a synthesised custom sound effect.
 */
export function playSound(type: 'clang' | 'success' | 'click' | 'delete' | 'socket'): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'clang': {
        // Blacksmith Anvil Strike: Combining multiple metallic high frequency overtone waves and noise spike
        const duration = 1.2;
        
        // 1. Core metallic oscillators (inharmonically spaced)
        const freqs = [150, 440, 770, 1220, 1600, 2450, 3100];
        const oscs: { osc: OscillatorNode; gain: GainNode }[] = [];
        
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = idx === 0 ? 'triangle' : 'sine'; // low-frequency body uses triangle, others use sine
          osc.frequency.setValueAtTime(freq, now);
          
          // Custom pitch resonance decay
          osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + duration);
          
          // Amplitude envelope: instant attack, very rapid decay for higher frequencies
          const multiplier = idx === 0 ? 0.3 : (1 / (idx + 1)) * 0.15;
          gainNode.gain.setValueAtTime(multiplier, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (duration * (1.2 - idx * 0.1)));
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscs.push({ osc, gain: gainNode });
        });

        // 2. White noise burst for the hammer impact
        const bufferSize = ctx.sampleRate * 0.06; // short impact spike
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1500, now);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        // Start playing
        oscs.forEach(({ osc }) => osc.start(now));
        noiseSource.start(now);
        
        // Stop playing
        oscs.forEach(({ osc }) => osc.stop(now + duration));
        noiseSource.stop(now + duration);
        break;
      }

      case 'success': {
        // Resonant golden chime / major arpeggio sequence
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright chord)
        notes.forEach((freq, noteIndex) => {
          const noteTime = now + noteIndex * 0.08;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          
          // Golden sparkle vibrato
          osc.frequency.setValueAtTime(freq, noteTime);
          osc.frequency.linearRampToValueAtTime(freq + 5, noteTime + 0.15);
          osc.frequency.linearRampToValueAtTime(freq, noteTime + 0.3);
          
          gainNode.gain.setValueAtTime(0, noteTime);
          gainNode.gain.linearRampToValueAtTime(0.12, noteTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.4);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(noteTime);
          osc.stop(noteTime + 0.45);
        });
        break;
      }

      case 'click': {
        // High quality physical UI selector click
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
        
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'delete': {
        // Low pitch warning thud / structural failure mechanical scrape
        const osc = ctx.createOscillator();
        const noiseFilter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
        
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(200, now);
        
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        
        osc.connect(noiseFilter);
        noiseFilter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'socket': {
        // Mechanical heavy gear click / socket connection (lock in place)
        // Two quick short click impulses spaced closely to sound double-latched
        const clicks = [0, 0.05];
        clicks.forEach((delay) => {
          const clickTime = now + delay;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(450, clickTime);
          osc.frequency.exponentialRampToValueAtTime(120, clickTime + 0.03);
          
          gainNode.gain.setValueAtTime(0.12, clickTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.03);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(clickTime);
          osc.stop(clickTime + 0.04);
        });
        break;
      }
    }
  } catch (error) {
    // Silently ignore audio limitations/permissions blocker
    console.debug('Audio playback delayed until user interaction or codec missing:', error);
  }
}
