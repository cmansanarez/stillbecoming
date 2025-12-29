import { simpleHash } from '../utils/hash.js';

/**
 * Manages edition numbering with a cap of 100
 */
export class EditionManager {
  constructor(masterSeed) {
    this.cap = 100;
    this.masterSeed = masterSeed;
    this.visitorToken = this._getOrCreateVisitorToken();
    this.editionNumber = this._computeEdition();
    this.editionLabel = this._formatEditionLabel();
  }

  _getOrCreateVisitorToken() {
    const storageKey = 'stillbecoming_visitor_token';
    let token = localStorage.getItem(storageKey);

    if (!token) {
      // Generate a unique visitor token
      token = this._generateUUID();
      localStorage.setItem(storageKey, token);
    }

    return token;
  }

  _generateUUID() {
    // Simple UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  _computeEdition() {
    // Deterministic edition based on visitor token + master seed
    const combined = this.visitorToken + this.masterSeed;
    const hash = simpleHash(combined);
    return (hash % this.cap) + 1;
  }

  _formatEditionLabel() {
    const paddedNumber = String(this.editionNumber).padStart(3, '0');
    return `Edition ${paddedNumber} of ${this.cap}`;
  }

  getEditionNumber() {
    return this.editionNumber;
  }

  getEditionLabel() {
    return this.editionLabel;
  }

  getEditionForFilename() {
    return String(this.editionNumber).padStart(3, '0');
  }
}
