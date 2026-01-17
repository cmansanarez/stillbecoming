/**
 * Manages audio playback for the ritual
 */
export class AudioManager {
  constructor(audioPath) {
    this.audioPath = audioPath;
    this.audio = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.isInitialized = false;
  }

  /**
   * Initialize audio element
   */
  init() {
    if (this.isInitialized) return;

    this.audio = new Audio(this.audioPath);
    this.audio.loop = true;
    this.audio.volume = 0.7; // Start at 70% volume

    this.isInitialized = true;
  }

  /**
   * Start playback (call after user interaction)
   */
  async play() {
    if (!this.isInitialized) {
      this.init();
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      console.log('Audio playback started');
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    if (!this.audio) return;

    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;

    return this.isMuted;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Fade out over duration (in seconds)
   */
  fadeOut(duration = 2) {
    if (!this.audio || !this.isPlaying) return;

    const startVolume = this.audio.volume;
    const steps = 60; // 60 steps for smooth fade
    const stepDuration = (duration * 1000) / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume - (volumeStep * currentStep);

      if (currentStep >= steps || newVolume <= 0) {
        this.audio.volume = 0;
        this.pause();
        clearInterval(fadeInterval);
      } else {
        this.audio.volume = newVolume;
      }
    }, stepDuration);
  }

  /**
   * Fade in over duration (in seconds)
   */
  fadeIn(duration = 2, targetVolume = 0.7) {
    if (!this.audio) return;

    this.audio.volume = 0;
    this.play();

    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = volumeStep * currentStep;

      if (currentStep >= steps || newVolume >= targetVolume) {
        this.audio.volume = targetVolume;
        clearInterval(fadeInterval);
      } else {
        this.audio.volume = newVolume;
      }
    }, stepDuration);
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.audio ? this.audio.volume : 0
    };
  }
}
