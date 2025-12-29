/**
 * Generates and renders the sacred geometry foundation
 * Based on Fibonacci spirals and polar petal forms
 */
export class GeometrySystem {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    // Fibonacci constants
    this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    this.petalCount = 8;
    this.spiralTurns = 3;

    // Precompute geometry
    this.spiralPoints = [];
    this.petalModules = [];

    this._generateSpiral();
    this._generatePetals();
  }

  _generateSpiral() {
    const points = 200;
    const maxRadius = 0.4; // Relative to canvas unit

    for (let i = 0; i < points; i++) {
      const t = i / points;
      const angle = t * this.spiralTurns * this.p.TWO_PI;
      const radius = t * maxRadius;

      // Apply golden ratio scaling
      const scaledRadius = radius * Math.pow(this.phi, t * 2 - 1);

      const x = scaledRadius * Math.cos(angle);
      const y = scaledRadius * Math.sin(angle);

      this.spiralPoints.push({ x, y, t });
    }
  }

  _generatePetals() {
    const petalRadius = 0.35;
    const arcSpan = this.p.PI / 3; // 60 degrees

    for (let i = 0; i < this.petalCount; i++) {
      const angle = (i / this.petalCount) * this.p.TWO_PI;

      // Add some variation based on seed
      const radiusVar = this.seed.randRange(0.9, 1.1);
      const angleOffset = this.seed.randRange(-0.05, 0.05);

      const petal = {
        centerAngle: angle + angleOffset,
        radius: petalRadius * radiusVar,
        arcSpan: arcSpan,
        points: []
      };

      // Generate arc points for this petal
      const arcPoints = 30;
      for (let j = 0; j < arcPoints; j++) {
        const t = j / (arcPoints - 1);
        const a = petal.centerAngle + (t - 0.5) * petal.arcSpan;
        const r = petal.radius * (1 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.3);

        petal.points.push({
          x: r * Math.cos(a),
          y: r * Math.sin(a)
        });
      }

      this.petalModules.push(petal);
    }
  }

  /**
   * Render the geometry system
   */
  render(params, unit, colors) {
    const completion = params.geometryCompletion;
    const noiseAmp = params.noiseAmp;
    const zLift = params.zLiftStrength;

    if (completion <= 0) return;

    this.p.push();

    // Draw Fibonacci spiral (faint guide, early phase)
    if (completion < 0.3) {
      this._renderSpiral(completion / 0.3, unit, colors, noiseAmp);
    }

    // Draw petal modules
    if (completion > 0.1) {
      const petalCompletion = this.p.map(completion, 0.1, 1.0, 0, 1, true);
      this._renderPetals(petalCompletion, unit, colors, noiseAmp, zLift);
    }

    this.p.pop();
  }

  _renderSpiral(alpha, unit, colors, noiseAmp) {
    this.p.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, alpha * 80);
    this.p.strokeWeight(unit * 0.001);
    this.p.noFill();

    this.p.beginShape();
    for (const pt of this.spiralPoints) {
      const x = pt.x * unit;
      const y = pt.y * unit;
      this.p.vertex(x, y);
    }
    this.p.endShape();
  }

  _renderPetals(completion, unit, colors, noiseAmp, zLift) {
    const numPetalsToShow = Math.ceil(completion * this.petalCount);

    for (let i = 0; i < numPetalsToShow; i++) {
      const petal = this.petalModules[i];
      const petalAlpha = i < numPetalsToShow - 1 ? 1.0 : (completion * this.petalCount) % 1;

      this.p.push();

      // Petal-specific z-lift during breach
      const zOffset = zLift * unit * 0.15 * Math.sin(i / this.petalCount * this.p.TWO_PI);
      this.p.translate(0, 0, zOffset);

      this.p.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, petalAlpha * 180);
      this.p.strokeWeight(unit * 0.002);
      this.p.noFill();

      this.p.beginShape();
      for (const pt of petal.points) {
        let x = pt.x * unit;
        let y = pt.y * unit;

        // Apply noise displacement
        if (noiseAmp > 0) {
          const nX = this.p.noise(pt.x * 5 + i, pt.y * 5, this.p.millis() * 0.0001);
          const nY = this.p.noise(pt.x * 5 + i + 100, pt.y * 5, this.p.millis() * 0.0001);
          x += (nX - 0.5) * noiseAmp * unit * 0.1;
          y += (nY - 0.5) * noiseAmp * unit * 0.1;
        }

        this.p.vertex(x, y);
      }
      this.p.endShape();

      this.p.pop();
    }
  }

  /**
   * Render to an offscreen graphics buffer for export
   */
  renderToGraphics(pg, params, unit, colors) {
    const completion = params.geometryCompletion;
    const noiseAmp = params.noiseAmp;

    if (completion <= 0) return;

    pg.push();

    // Draw petal modules only (skip spiral in export)
    if (completion > 0.1) {
      const numPetalsToShow = this.petalCount; // Show all in final export

      for (let i = 0; i < numPetalsToShow; i++) {
        const petal = this.petalModules[i];

        pg.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, 180);
        pg.strokeWeight(unit * 0.002);
        pg.noFill();

        pg.beginShape();
        for (const pt of petal.points) {
          let x = pt.x * unit;
          let y = pt.y * unit;

          // Frozen noise for export
          if (noiseAmp > 0) {
            const nX = this.p.noise(pt.x * 5 + i, pt.y * 5, 1000);
            const nY = this.p.noise(pt.x * 5 + i + 100, pt.y * 5, 1000);
            x += (nX - 0.5) * noiseAmp * unit * 0.1;
            y += (nY - 0.5) * noiseAmp * unit * 0.1;
          }

          pg.vertex(x, y);
        }
        pg.endShape();
      }
    }

    pg.pop();
  }
}
