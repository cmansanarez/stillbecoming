import { easeInOutCubic, easeOutCubic, easeInCubic, lerp } from '../utils/easing.js';

/**
 * Ritual states and their configurations
 */
const STATES = {
  BOOT: {
    duration: 0.8,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0, glitchRate: 0,
      geometryCompletion: 0, gridVisibility: 0,
      particleEnergy: 0, weatheringAmount: 0
    }
  },
  TITLE: {
    duration: 2.2,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0, glitchRate: 0,
      geometryCompletion: 0, gridVisibility: 0,
      particleEnergy: 0.1, weatheringAmount: 0.05
    }
  },
  INVOKE_2D: {
    duration: 3.0,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0.02, glitchRate: 0,
      geometryCompletion: 0.15, gridVisibility: 0,
      particleEnergy: 0.3, weatheringAmount: 0.1
    }
  },
  BLOOM_BUILD: {
    duration: 10.0,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0.05, glitchRate: 0.05,
      geometryCompletion: 1.0, gridVisibility: 0,
      particleEnergy: 0.8, weatheringAmount: 0.15
    }
  },
  GRID_ASSERT: {
    duration: 6.0,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0.08, glitchRate: 0.1,
      geometryCompletion: 1.0, gridVisibility: 1.0,
      particleEnergy: 0.9, weatheringAmount: 0.2
    }
  },
  BREACH_3D: {
    duration: 3.0,
    targets: {
      cameraTiltX: 0.4, cameraTiltY: 0.3, cameraZoom: 0.65,
      zLiftStrength: 0.6, noiseAmp: 0.12, glitchRate: 0.15,
      geometryCompletion: 1.0, gridVisibility: 1.0,
      particleEnergy: 1.0, weatheringAmount: 0.25
    }
  },
  DESTABILIZE: {
    duration: 5.0,
    targets: {
      cameraTiltX: 0.5, cameraTiltY: 0.4, cameraZoom: 0.55,
      zLiftStrength: 1.0, noiseAmp: 0.3, glitchRate: 0.4,
      geometryCompletion: 1.0, gridVisibility: 0.7,
      particleEnergy: 1.2, weatheringAmount: 0.4
    }
  },
  REASSEMBLE: {
    duration: 5.0,
    targets: {
      cameraTiltX: 0.1, cameraTiltY: 0.05, cameraZoom: 0.95,
      zLiftStrength: 0.3, noiseAmp: 0.1, glitchRate: 0.1,
      geometryCompletion: 1.0, gridVisibility: 0.9,
      particleEnergy: 0.6, weatheringAmount: 0.3
    }
  },
  CONSECRATE_2D: {
    duration: 1.8,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0.02, glitchRate: 0,
      geometryCompletion: 1.0, gridVisibility: 1.0,
      particleEnergy: 0.2, weatheringAmount: 0.5
    }
  },
  RELIC: {
    duration: Infinity,
    targets: {
      cameraTiltX: 0, cameraTiltY: 0, cameraZoom: 1,
      zLiftStrength: 0, noiseAmp: 0, glitchRate: 0,
      geometryCompletion: 1.0, gridVisibility: 1.0,
      particleEnergy: 0, weatheringAmount: 0.6
    }
  }
};

const STATE_SEQUENCE = [
  'BOOT', 'TITLE', 'INVOKE_2D', 'BLOOM_BUILD', 'GRID_ASSERT',
  'BREACH_3D', 'DESTABILIZE', 'REASSEMBLE', 'CONSECRATE_2D', 'RELIC'
];

/**
 * State machine that orchestrates the ritual sequence
 */
export class RitualController {
  constructor() {
    this.currentStateIndex = 0;
    this.currentStateName = STATE_SEQUENCE[0];
    this.timeInState = 0;
    this.globalTime = 0;

    // Current parameter values (smoothly interpolated)
    this.params = {
      cameraTiltX: 0,
      cameraTiltY: 0,
      cameraZoom: 1,
      zLiftStrength: 0,
      noiseAmp: 0,
      glitchRate: 0,
      geometryCompletion: 0,
      gridVisibility: 0,
      particleEnergy: 0,
      weatheringAmount: 0
    };

    // Target values (from state definitions)
    this.targets = { ...STATES[this.currentStateName].targets };

    // Callbacks for state transitions
    this.onStateChangeCallbacks = [];

    // Ritual completion flag
    this.ritualComplete = false;
    this.completionTimestamp = null;
  }

  /**
   * Register a callback for state changes
   */
  onStateChange(callback) {
    this.onStateChangeCallbacks.push(callback);
  }

  /**
   * Update the ritual controller
   */
  update(deltaTime) {
    this.globalTime += deltaTime;
    this.timeInState += deltaTime;

    const currentState = STATES[this.currentStateName];
    const stateProgress = Math.min(this.timeInState / currentState.duration, 1.0);

    // Check for state transition
    if (this.timeInState >= currentState.duration && this.currentStateIndex < STATE_SEQUENCE.length - 1) {
      this._transitionToNextState();
    }

    // Smoothly interpolate parameters toward targets
    this._updateParameters(deltaTime, stateProgress);
  }

  _transitionToNextState() {
    this.currentStateIndex++;
    this.currentStateName = STATE_SEQUENCE[this.currentStateIndex];
    this.timeInState = 0;

    // Update targets
    this.targets = { ...STATES[this.currentStateName].targets };

    // Check if entering RELIC state
    if (this.currentStateName === 'RELIC') {
      this.ritualComplete = true;
      this.completionTimestamp = new Date();
    }

    // Notify listeners
    this.onStateChangeCallbacks.forEach(callback => {
      callback(this.currentStateName, this.currentStateIndex);
    });
  }

  _updateParameters(deltaTime, stateProgress) {
    // Choose easing function based on state
    let easingFunc = easeInOutCubic;

    if (this.currentStateName === 'BOOT' || this.currentStateName === 'TITLE') {
      easingFunc = easeOutCubic;
    } else if (this.currentStateName === 'DESTABILIZE') {
      easingFunc = easeInCubic;
    } else if (this.currentStateName === 'CONSECRATE_2D') {
      easingFunc = easeOutCubic;
    }

    const easedProgress = easingFunc(stateProgress);

    // Smoothly interpolate each parameter
    for (const key in this.params) {
      const target = this.targets[key];
      const smoothing = 0.05; // Dampening factor
      this.params[key] = lerp(this.params[key], target, smoothing);
    }
  }

  /**
   * Get current state name
   */
  getStateName() {
    return this.currentStateName;
  }

  /**
   * Get normalized progress within current state (0-1)
   */
  getStateProgress() {
    const currentState = STATES[this.currentStateName];
    return Math.min(this.timeInState / currentState.duration, 1.0);
  }

  /**
   * Get global normalized progress through entire ritual (0-1)
   */
  getGlobalProgress() {
    if (this.currentStateName === 'RELIC') return 1.0;

    let totalDuration = 0;
    let elapsedDuration = 0;

    for (let i = 0; i < STATE_SEQUENCE.length - 1; i++) {
      const stateDuration = STATES[STATE_SEQUENCE[i]].duration;
      totalDuration += stateDuration;

      if (i < this.currentStateIndex) {
        elapsedDuration += stateDuration;
      } else if (i === this.currentStateIndex) {
        elapsedDuration += this.timeInState;
      }
    }

    return elapsedDuration / totalDuration;
  }

  /**
   * Get current parameter value
   */
  getParam(name) {
    return this.params[name];
  }

  /**
   * Check if ritual is complete
   */
  isComplete() {
    return this.ritualComplete;
  }

  /**
   * Get completion timestamp
   */
  getCompletionTimestamp() {
    return this.completionTimestamp;
  }

  /**
   * Get time elapsed in current state
   */
  getTimeInState() {
    return this.timeInState;
  }

  /**
   * Get global elapsed time
   */
  getGlobalTime() {
    return this.globalTime;
  }
}
