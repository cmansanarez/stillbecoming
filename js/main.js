/**
 * main.js
 * Bootstrap for stillbecoming
 */

import { sketch } from './sketch.js';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Create p5 instance in instance mode
  const p5Instance = new p5(sketch, 'canvas-container');

  // Store reference globally for debugging (optional)
  window.stillbecoming = p5Instance;
}
