import { seedFromString } from '../utils/hash.js';

/**
 * Manages deterministic seeding for the entire artwork
 */
export class SeedManager {
  constructor() {
    this.masterSeed = "STILLBECOMING_2026";
    this.sessionSeed = null;
    this.seedInt = 0;
    this.seedString = "";

    // Check for URL parameter override
    const urlParams = new URLSearchParams(window.location.search);
    const urlSeed = urlParams.get('seed');

    if (urlSeed) {
      // Testing mode: use URL seed
      this.sessionSeed = urlSeed;
    } else {
      // Normal mode: use or create stored seed
      this.sessionSeed = this._getOrCreateSessionSeed();
    }

    // Generate deterministic seed integer
    this.seedString = this.masterSeed + this.sessionSeed;
    this.seedInt = seedFromString(this.seedString);

    // Initialize random number generator
    this._initRNG();
  }

  _getOrCreateSessionSeed() {
    const storageKey = 'stillbecoming_session_seed';
    let stored = localStorage.getItem(storageKey);

    if (!stored) {
      // Create new session seed
      stored = this._generateSessionSeed();
      localStorage.setItem(storageKey, stored);
    }

    return stored;
  }

  _generateSessionSeed() {
    // Generate a random string for this session
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  _initRNG() {
    // Set p5's noise seed
    if (window.noiseSeed) {
      window.noiseSeed(this.seedInt);
    }

    // Set p5's random seed
    if (window.randomSeed) {
      window.randomSeed(this.seedInt);
    }
  }

  /**
   * Get a seeded random number between 0 and 1
   */
  rand() {
    if (window.random) {
      return window.random();
    }
    return Math.random();
  }

  /**
   * Get a seeded random number between a and b
   */
  randRange(a, b) {
    if (window.random) {
      return window.random(a, b);
    }
    return a + Math.random() * (b - a);
  }

  /**
   * Get seeded noise value
   */
  noise(x, y = 0, z = 0) {
    if (window.noise) {
      return window.noise(x, y, z);
    }
    return 0.5;
  }
}
