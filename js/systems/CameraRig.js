/**
 * Manages smooth camera transformations in WEBGL space
 */
export class CameraRig {
  constructor(p5Instance) {
    this.p = p5Instance;
    this.tiltX = 0;
    this.tiltY = 0;
    this.zoom = 1;
  }

  /**
   * Update camera parameters from ritual controller
   */
  update(tiltX, tiltY, zoom) {
    this.tiltX = tiltX;
    this.tiltY = tiltY;
    this.zoom = zoom;
  }

  /**
   * Apply camera transforms
   * Call this at the start of draw, after translate(0, 0, 0)
   */
  apply() {
    // Apply rotations for 3D tilt
    this.p.rotateX(this.tiltX);
    this.p.rotateY(this.tiltY);

    // Apply zoom (scale)
    this.p.scale(this.zoom);
  }

  /**
   * Apply camera to an offscreen graphics buffer
   */
  applyToGraphics(pg) {
    pg.rotateX(this.tiltX);
    pg.rotateY(this.tiltY);
    pg.scale(this.zoom);
  }
}
