/**
 * Manages UI elements and their visibility
 */
export class UIManager {
  constructor() {
    this.editionLabel = document.getElementById('edition-label');
    this.timestampLabel = document.getElementById('timestamp-label');
    this.downloadBtn = document.getElementById('download-btn');

    this.isRelicState = false;
  }

  showEditionLabel(text) {
    if (this.editionLabel) {
      this.editionLabel.textContent = text;
      this.editionLabel.classList.remove('hidden');
    }
  }

  hideEditionLabel() {
    if (this.editionLabel) {
      this.editionLabel.classList.add('hidden');
    }
  }

  showTimestamp(text) {
    if (this.timestampLabel) {
      this.timestampLabel.textContent = text;
      this.timestampLabel.classList.remove('hidden');
    }
  }

  hideTimestamp() {
    if (this.timestampLabel) {
      this.timestampLabel.classList.add('hidden');
    }
  }

  showDownloadButton(callback) {
    if (this.downloadBtn) {
      this.downloadBtn.classList.remove('hidden');
      this.downloadBtn.style.opacity = '1';

      // Remove previous listeners
      this.downloadBtn.onclick = null;

      // Attach new listener
      this.downloadBtn.onclick = callback;

      this.isRelicState = true;
    }
  }

  hideDownloadButton() {
    if (this.downloadBtn) {
      this.downloadBtn.classList.add('hidden');
      this.downloadBtn.style.opacity = '0';
      this.isRelicState = false;
    }
  }

  setEditionLabelOpacity(opacity) {
    if (this.editionLabel) {
      this.editionLabel.style.opacity = opacity;
    }
  }

  setTimestampOpacity(opacity) {
    if (this.timestampLabel) {
      this.timestampLabel.style.opacity = opacity;
    }
  }
}
