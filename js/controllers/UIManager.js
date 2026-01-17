/**
 * Manages UI elements and their visibility
 */
export class UIManager {
  constructor() {
    this.editionLabel = document.getElementById('edition-label');
    this.timestampLabel = document.getElementById('timestamp-label');
    this.downloadBtn = document.getElementById('download-btn');
    this.mobileModal = document.getElementById('mobile-modal');
    this.progressBarContainer = document.getElementById('progress-bar-container');
    this.progressBarFill = document.getElementById('progress-bar-fill');
    this.audioCredit = document.getElementById('audio-credit');
    this.muteBtn = document.getElementById('mute-btn');

    this.isRelicState = false;
    this.isMobileDevice = this._detectMobile();
    this.mobileAcknowledged = localStorage.getItem('stillbecoming_mobile_ack') === 'true';
  }

  /**
   * Detect if user is on mobile device
   */
  _detectMobile() {
    // Check multiple conditions for mobile detection
    const isSmallScreen = window.innerWidth < 900;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return isSmallScreen || isCoarsePointer || isMobileUA;
  }

  /**
   * Check if mobile modal should be shown
   */
  shouldShowMobileModal() {
    return this.isMobileDevice && !this.mobileAcknowledged;
  }

  /**
   * Show mobile warning modal
   */
  showMobileModal(onContinue, onReturnLater) {
    if (!this.mobileModal) return;

    this.mobileModal.style.display = 'flex';

    const continueBtn = document.getElementById('mobile-continue-btn');
    const laterBtn = document.getElementById('mobile-later-btn');

    if (continueBtn) {
      continueBtn.onclick = () => {
        this.hideMobileModal();
        localStorage.setItem('stillbecoming_mobile_ack', 'true');
        this.mobileAcknowledged = true;
        if (onContinue) onContinue();
      };
    }

    if (laterBtn) {
      laterBtn.onclick = () => {
        // Try to close the tab/window
        if (window.close) {
          window.close();
        }

        // If window.close() doesn't work (most modern browsers block it),
        // show a gentle message by changing button text
        setTimeout(() => {
          if (laterBtn) {
            laterBtn.textContent = 'You can return anytime';
            laterBtn.disabled = true;
            laterBtn.style.opacity = '0.6';
            laterBtn.style.cursor = 'default';
          }
        }, 100);

        if (onReturnLater) onReturnLater();
      };
    }
  }

  /**
   * Hide mobile modal
   */
  hideMobileModal() {
    if (this.mobileModal) {
      this.mobileModal.classList.add('fade-out');
      setTimeout(() => {
        this.mobileModal.style.display = 'none';
      }, 800);
    }
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

  showProgressBar() {
    if (this.progressBarContainer) {
      this.progressBarContainer.classList.remove('hidden');
    }
  }

  hideProgressBar() {
    if (this.progressBarContainer) {
      this.progressBarContainer.classList.add('hidden');
    }
  }

  updateProgressBar(progress) {
    if (this.progressBarFill) {
      // progress is 0-1, convert to percentage
      this.progressBarFill.style.width = `${progress * 100}%`;
    }
  }

  showAudioCredit() {
    if (this.audioCredit) {
      this.audioCredit.classList.remove('hidden');
    }
  }

  hideAudioCredit() {
    if (this.audioCredit) {
      this.audioCredit.classList.add('hidden');
    }
  }

  showMuteButton() {
    if (this.muteBtn) {
      this.muteBtn.classList.remove('hidden');
    }
  }

  hideMuteButton() {
    if (this.muteBtn) {
      this.muteBtn.classList.add('hidden');
    }
  }

  setMuteButtonState(isMuted) {
    if (this.muteBtn) {
      const icon = this.muteBtn.querySelector('.mute-icon');
      if (icon) {
        icon.textContent = isMuted ? '🔇' : '🔊';
      }
      if (isMuted) {
        this.muteBtn.classList.add('muted');
      } else {
        this.muteBtn.classList.remove('muted');
      }
    }
  }

  setupMuteButton(callback) {
    if (this.muteBtn) {
      this.muteBtn.onclick = callback;
    }
  }
}
