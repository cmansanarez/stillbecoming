/**
 * sketch.js
 * Main p5.js lifecycle and render orchestration
 */

import { SeedManager } from './controllers/SeedManager.js';
import { EditionManager } from './controllers/EditionManager.js';
import { RitualController } from './controllers/RitualController.js';
import { UIManager } from './controllers/UIManager.js';
import { ExportManager } from './controllers/ExportManager.js';
import { GeometrySystem } from './systems/GeometrySystem.js';
import { GridSystem } from './systems/GridSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { WeatheringPass } from './systems/WeatheringPass.js';
import { CameraRig } from './systems/CameraRig.js';
import { formatTimestamp } from './utils/time.js';

// Color palette
const COLORS = {
  carbon: { r: 28, g: 28, b: 31 },
  ghost: { r: 249, g: 249, b: 254 },
  twilight: { r: 23, g: 22, b: 100 },
  periwinkle: { r: 147, g: 129, b: 255 },
  golden: { r: 224, g: 202, b: 60 }
};

export function sketch(p) {
  // Managers and systems
  let seedManager;
  let editionManager;
  let ritualController;
  let uiManager;
  let exportManager;

  let geometrySystem;
  let gridSystem;
  let particleSystem;
  let weatheringPass;
  let cameraRig;

  // Canvas and sizing
  let unit; // Base unit for all scaling
  let canvasSize;

  // Time tracking
  let lastFrameTime;
  let deltaTime;

  // Ritual state
  let ritualTimestamp = null;
  let timestampFormatted = null;
  let ritualStarted = false; // Pause ritual until user clicks "Begin"

  /**
   * Setup
   */
  p.setup = function() {
    // Calculate canvas size (square, fits viewport)
    canvasSize = Math.min(p.windowWidth, p.windowHeight) * 0.9;
    unit = canvasSize;

    // Create WEBGL canvas
    p.createCanvas(canvasSize, canvasSize, p.WEBGL);

    // Set pixel density based on device (cap at 2 for performance on mobile)
    const isMobile = window.innerWidth < 900 || /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2));

    // Initialize managers
    seedManager = new SeedManager();
    editionManager = new EditionManager(seedManager.masterSeed);
    ritualController = new RitualController();
    uiManager = new UIManager();
    exportManager = new ExportManager(p);

    // Check if mobile modal should be shown
    const shouldShowMobileWarning = uiManager.shouldShowMobileModal();

    // Initialize systems
    geometrySystem = new GeometrySystem(p, seedManager);
    gridSystem = new GridSystem(p, seedManager);
    particleSystem = new ParticleSystem(p, seedManager);
    weatheringPass = new WeatheringPass(p, seedManager);
    cameraRig = new CameraRig(p);

    // Set up ritual state change listener
    ritualController.onStateChange((stateName) => {
      handleStateChange(stateName);
    });

    // Show edition label at start
    uiManager.showEditionLabel(editionManager.getEditionLabel());

    // Initialize time tracking
    lastFrameTime = p.millis();

    // Set up welcome modal "Begin" button
    const welcomeModal = document.getElementById('welcome-modal');
    const beginBtn = document.getElementById('begin-btn');

    // Function to start the ritual (called from either modal)
    const startRitual = () => {
      if (welcomeModal) {
        welcomeModal.classList.add('fade-out');
        setTimeout(() => {
          welcomeModal.style.display = 'none';
        }, 800);
      }
      ritualStarted = true;
      lastFrameTime = p.millis();
    };

    // If mobile modal should be shown, show it first
    if (shouldShowMobileWarning) {
      // Hide welcome modal initially
      if (welcomeModal) {
        welcomeModal.style.display = 'none';
      }

      // Show mobile modal
      uiManager.showMobileModal(
        () => {
          // On continue: show welcome modal
          if (welcomeModal) {
            welcomeModal.style.display = 'flex';
          }
        },
        () => {
          // On return later: do nothing (tab close was attempted)
        }
      );
    }

    // Set up begin button
    if (beginBtn && welcomeModal) {
      beginBtn.addEventListener('click', startRitual);
    }

    console.log('stillbecoming initialized');
    console.log('Edition:', editionManager.getEditionNumber());
    console.log('Seed:', seedManager.seedString);
  };

  /**
   * Draw loop
   */
  p.draw = function() {
    // Don't update ritual until user has clicked "Begin"
    if (!ritualStarted) {
      // Just render static background while waiting
      p.background(COLORS.carbon.r, COLORS.carbon.g, COLORS.carbon.b);
      return;
    }

    // Calculate delta time
    const currentTime = p.millis();
    deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;

    // Update ritual controller
    ritualController.update(deltaTime);

    // Get current parameters
    const params = {
      cameraTiltX: ritualController.getParam('cameraTiltX'),
      cameraTiltY: ritualController.getParam('cameraTiltY'),
      cameraZoom: ritualController.getParam('cameraZoom'),
      zLiftStrength: ritualController.getParam('zLiftStrength'),
      noiseAmp: ritualController.getParam('noiseAmp'),
      glitchRate: ritualController.getParam('glitchRate'),
      geometryCompletion: ritualController.getParam('geometryCompletion'),
      gridVisibility: ritualController.getParam('gridVisibility'),
      particleEnergy: ritualController.getParam('particleEnergy'),
      weatheringAmount: ritualController.getParam('weatheringAmount')
    };

    // Update particle system
    particleSystem.update(params, deltaTime);

    // Update camera rig
    cameraRig.update(params.cameraTiltX, params.cameraTiltY, params.cameraZoom);

    // Render scene
    renderScene(params);
  };

  /**
   * Main render function
   */
  function renderScene(params) {
    // Set background
    p.background(COLORS.carbon.r, COLORS.carbon.g, COLORS.carbon.b);

    // Reset transforms
    p.push();

    // Apply camera transforms
    cameraRig.apply();

    // Get current ritual state
    const currentState = ritualController.getStateName();

    // Render layers in order - grid goes behind geometry during resolution
    const resolutionStates = ['REASSEMBLE', 'CONSECRATE_2D', 'RELIC'];

    if (resolutionStates.includes(currentState)) {
      // During resolution: grid behind, then geometry on top
      gridSystem.render(params, unit, COLORS);
      geometrySystem.render(params, unit, COLORS);
      particleSystem.render(params, unit, COLORS);
    } else {
      // During build-up: normal layering
      geometrySystem.render(params, unit, COLORS);
      gridSystem.render(params, unit, COLORS);
      particleSystem.render(params, unit, COLORS);
    }

    weatheringPass.render(params, unit, COLORS, currentState);

    p.pop();
  }

  /**
   * Handle state changes
   */
  function handleStateChange(stateName) {
    console.log('State:', stateName);

    // Handle TITLE state
    if (stateName === 'TITLE') {
      uiManager.setEditionLabelOpacity(0.65);
    }

    // Handle CONSECRATE_2D state (show timestamp)
    if (stateName === 'CONSECRATE_2D') {
      if (!ritualTimestamp) {
        ritualTimestamp = new Date();
        timestampFormatted = formatTimestamp(ritualTimestamp);
        uiManager.showTimestamp(timestampFormatted);
      }
    }

    // Handle RELIC state
    if (stateName === 'RELIC') {
      // Ensure timestamp is set
      if (!ritualTimestamp) {
        ritualTimestamp = ritualController.getCompletionTimestamp() || new Date();
        timestampFormatted = formatTimestamp(ritualTimestamp);
        uiManager.showTimestamp(timestampFormatted);
      }

      // Show download button
      uiManager.showDownloadButton(() => {
        handleExport();
      });

      console.log('Ritual complete. Download available.');
    }
  }

  /**
   * Handle export
   */
  function handleExport() {
    console.log('Exporting relic...');

    // Get final parameters (frozen in RELIC state)
    const params = {
      cameraTiltX: 0,
      cameraTiltY: 0,
      cameraZoom: 1,
      zLiftStrength: 0,
      noiseAmp: ritualController.getParam('noiseAmp'),
      glitchRate: 0,
      geometryCompletion: 1.0,
      gridVisibility: 1.0,
      particleEnergy: 0,
      weatheringAmount: ritualController.getParam('weatheringAmount')
    };

    // Render callback for export
    const renderCallback = (p5Instance, pg, scale) => {
      const exportUnit = pg.width;

      // Background
      pg.background(COLORS.carbon.r, COLORS.carbon.g, COLORS.carbon.b);

      // Apply camera (flat 2D for relic)
      pg.push();

      // Render all systems to graphics buffer
      geometrySystem.renderToGraphics(pg, params, exportUnit, COLORS);
      gridSystem.renderToGraphics(pg, params, exportUnit, COLORS);
      particleSystem.renderToGraphics(pg, params, exportUnit, COLORS);
      weatheringPass.renderToGraphics(pg, params, exportUnit, COLORS);

      pg.pop();

      // Render text overlays
      renderExportText(pg, exportUnit);
    };

    // Export with edition and timestamp
    exportManager.exportRelic(
      renderCallback,
      editionManager.getEditionForFilename(),
      timestampFormatted
    );

    console.log('Export complete.');
  }

  /**
   * Render text overlays for export
   */
  function renderExportText(pg, unit) {
    pg.push();

    // Reset any transforms
    pg.translate(-unit / 2, -unit / 2);

    // Edition label (bottom center)
    pg.fill(COLORS.ghost.r, COLORS.ghost.g, COLORS.ghost.b, 160);
    pg.noStroke();
    pg.textAlign(pg.CENTER, pg.BOTTOM);
    pg.textSize(unit * 0.008);
    pg.text(
      editionManager.getEditionLabel(),
      unit / 2,
      unit * 0.96
    );

    // Timestamp (top right)
    if (timestampFormatted) {
      pg.fill(COLORS.ghost.r, COLORS.ghost.g, COLORS.ghost.b, 120);
      pg.textAlign(pg.RIGHT, pg.TOP);
      pg.textSize(unit * 0.007);
      pg.text(
        timestampFormatted,
        unit * 0.96,
        unit * 0.04
      );
    }

    pg.pop();
  }

  /**
   * Window resize
   */
  p.windowResized = function() {
    const newSize = Math.min(p.windowWidth, p.windowHeight) * 0.9;
    if (Math.abs(newSize - canvasSize) > 50) {
      canvasSize = newSize;
      unit = canvasSize;
      p.resizeCanvas(canvasSize, canvasSize);
    }
  };
}
