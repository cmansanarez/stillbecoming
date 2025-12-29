/**
 * Generates and renders concentric circles and spiral geometry
 * Based on reference images: layered circles with translucent fills
 */
export class GeometrySystem {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    // Fibonacci constants
    this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

    // Generate multiple concentric circle sets
    this.circleSets = [];
    this.spirals = [];
    this.radialGuides = [];

    this._generateCircleSets();
    this._generateSpirals();
    this._generateRadialGuides();
  }

  _generateCircleSets() {
    // Create 2-4 sets of concentric circles
    const numSets = Math.floor(this.seed.randRange(2, 5));

    for (let set = 0; set < numSets; set++) {
      const centerX = this.seed.randRange(-0.15, 0.15);
      const centerY = this.seed.randRange(-0.15, 0.15);
      const maxRadius = this.seed.randRange(0.25, 0.5);
      const numCircles = Math.floor(this.seed.randRange(4, 10));
      const hasFill = this.seed.randRange(0, 1) > 0.3; // 70% chance of fill
      const colorIndex = Math.floor(this.seed.randRange(0, 3)); // 0=blue, 1=periwinkle, 2=golden

      const circles = [];
      for (let i = 0; i < numCircles; i++) {
        const t = (i + 1) / numCircles;
        const radius = maxRadius * t;

        circles.push({
          radius,
          strokeWeight: this.seed.randRange(0.001, 0.004),
          hasFill: hasFill && i > numCircles * 0.5, // Only outer circles get fills
          fillAlpha: this.seed.randRange(0.15, 0.35)
        });
      }

      this.circleSets.push({
        centerX,
        centerY,
        circles,
        colorIndex
      });
    }
  }

  _generateSpirals() {
    // Create 1-3 spiral paths
    const numSpirals = Math.floor(this.seed.randRange(1, 4));

    for (let s = 0; s < numSpirals; s++) {
      const points = 150;
      const maxRadius = this.seed.randRange(0.3, 0.5);
      const turns = this.seed.randRange(2, 4);
      const offsetX = this.seed.randRange(-0.1, 0.1);
      const offsetY = this.seed.randRange(-0.1, 0.1);
      const colorIndex = Math.floor(this.seed.randRange(0, 3));

      const spiralPoints = [];
      for (let i = 0; i < points; i++) {
        const t = i / points;
        const angle = t * turns * this.p.TWO_PI;
        const radius = t * maxRadius;

        // Apply golden ratio scaling
        const scaledRadius = radius * Math.pow(this.phi, t * 2 - 1);

        const x = scaledRadius * Math.cos(angle) + offsetX;
        const y = scaledRadius * Math.sin(angle) + offsetY;

        spiralPoints.push({ x, y, t });
      }

      this.spirals.push({
        points: spiralPoints,
        colorIndex,
        strokeWeight: this.seed.randRange(0.002, 0.006)
      });
    }
  }

  _generateRadialGuides() {
    // Create radial construction lines from center
    const numGuides = Math.floor(this.seed.randRange(8, 16));

    for (let i = 0; i < numGuides; i++) {
      const angle = (i / numGuides) * this.p.TWO_PI + this.seed.randRange(-0.1, 0.1);
      const length = this.seed.randRange(0.3, 0.6);

      this.radialGuides.push({
        angle,
        length
      });
    }
  }

  /**
   * Blend two colors
   */
  _blendColors(color1, color2, t) {
    return {
      r: Math.floor(color1.r + (color2.r - color1.r) * t),
      g: Math.floor(color1.g + (color2.g - color1.g) * t),
      b: Math.floor(color1.b + (color2.b - color1.b) * t)
    };
  }

  /**
   * Get color from palette
   */
  _getColor(colorIndex, colors) {
    if (colorIndex === 0) return colors.twilight;
    if (colorIndex === 1) return colors.periwinkle;
    return colors.golden;
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

    // Render radial guides first (subtle construction marks)
    if (completion > 0.05) {
      this._renderRadialGuides(completion, unit, colors, noiseAmp);
    }

    // Render spirals
    if (completion > 0.1) {
      this._renderSpirals(completion, unit, colors, noiseAmp, zLift);
    }

    // Render concentric circle sets
    if (completion > 0.2) {
      this._renderCircleSets(completion, unit, colors, noiseAmp, zLift);
    }

    this.p.pop();
  }

  _renderRadialGuides(completion, unit, colors, noiseAmp) {
    const alpha = Math.min(completion * 2, 1.0); // Fade in early

    this.p.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, alpha * 60);
    this.p.strokeWeight(unit * 0.0005);

    const numGuidesToShow = Math.floor(alpha * this.radialGuides.length);

    for (let i = 0; i < numGuidesToShow; i++) {
      const guide = this.radialGuides[i];

      const x1 = 0;
      const y1 = 0;
      const x2 = Math.cos(guide.angle) * guide.length * unit;
      const y2 = Math.sin(guide.angle) * guide.length * unit;

      this.p.line(x1, y1, x2, y2);
    }
  }

  _renderSpirals(completion, unit, colors, noiseAmp, zLift) {
    for (const spiral of this.spirals) {
      const color = this._getColor(spiral.colorIndex, colors);

      this.p.noFill();
      this.p.stroke(color.r, color.g, color.b, 180);
      this.p.strokeWeight(spiral.strokeWeight * unit);

      const numPoints = Math.floor(completion * spiral.points.length);

      this.p.beginShape();
      for (let i = 0; i < numPoints; i++) {
        const pt = spiral.points[i];
        let x = pt.x * unit;
        let y = pt.y * unit;

        // Apply noise
        if (noiseAmp > 0) {
          const nX = this.p.noise(pt.x * 5, pt.y * 5, this.p.millis() * 0.0001);
          const nY = this.p.noise(pt.x * 5 + 100, pt.y * 5, this.p.millis() * 0.0001);
          x += (nX - 0.5) * noiseAmp * unit * 0.1;
          y += (nY - 0.5) * noiseAmp * unit * 0.1;
        }

        this.p.vertex(x, y);
      }
      this.p.endShape();
    }
  }

  _renderCircleSets(completion, unit, colors, noiseAmp, zLift) {
    const circleCompletion = this.p.map(completion, 0.2, 1.0, 0, 1, true);

    for (let setIdx = 0; setIdx < this.circleSets.length; setIdx++) {
      const circleSet = this.circleSets[setIdx];
      const color = this._getColor(circleSet.colorIndex, colors);

      this.p.push();

      // Apply z-lift to some circle sets during breach
      if (zLift > 0 && setIdx % 2 === 0) {
        const zOffset = zLift * unit * 0.2 * Math.sin(setIdx * 0.5);
        this.p.translate(0, 0, zOffset);
      }

      const centerX = circleSet.centerX * unit;
      const centerY = circleSet.centerY * unit;

      const numCirclesToShow = Math.ceil(circleCompletion * circleSet.circles.length);

      for (let i = 0; i < numCirclesToShow; i++) {
        const circle = circleSet.circles[i];
        const circleAlpha = i < numCirclesToShow - 1 ? 1.0 : (circleCompletion * circleSet.circles.length) % 1;

        const radius = circle.radius * unit;

        // Draw fill if applicable
        if (circle.hasFill && circleCompletion > 0.6) {
          this.p.fill(color.r, color.g, color.b, circle.fillAlpha * circleAlpha * 255);
          this.p.noStroke();
          this.p.circle(centerX, centerY, radius * 2);
        }

        // Draw stroke
        this.p.noFill();
        this.p.stroke(color.r, color.g, color.b, 200 * circleAlpha);
        this.p.strokeWeight(circle.strokeWeight * unit);
        this.p.circle(centerX, centerY, radius * 2);

        // Draw multiple passes for some circles
        if (i % 3 === 0 && circleCompletion > 0.7) {
          for (let pass = 1; pass <= 2; pass++) {
            const passAlpha = circleAlpha * (1 - pass * 0.3);
            const passOffset = pass * unit * 0.002;

            this.p.stroke(color.r, color.g, color.b, 150 * passAlpha);
            this.p.circle(centerX + passOffset, centerY + passOffset, radius * 2);
          }
        }
      }

      this.p.pop();
    }
  }

  /**
   * Render to an offscreen graphics buffer for export
   */
  renderToGraphics(pg, params, unit, colors) {
    const completion = 1.0; // Full completion for export
    const noiseAmp = params.noiseAmp;

    pg.push();

    // Render radial guides
    pg.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, 60);
    pg.strokeWeight(unit * 0.0005);

    for (const guide of this.radialGuides) {
      const x1 = 0;
      const y1 = 0;
      const x2 = Math.cos(guide.angle) * guide.length * unit;
      const y2 = Math.sin(guide.angle) * guide.length * unit;

      pg.line(x1, y1, x2, y2);
    }

    // Render spirals
    for (const spiral of this.spirals) {
      const color = this._getColor(spiral.colorIndex, colors);

      pg.noFill();
      pg.stroke(color.r, color.g, color.b, 180);
      pg.strokeWeight(spiral.strokeWeight * unit);

      pg.beginShape();
      for (const pt of spiral.points) {
        let x = pt.x * unit;
        let y = pt.y * unit;

        // Frozen noise for export
        if (noiseAmp > 0) {
          const nX = this.p.noise(pt.x * 5, pt.y * 5, 1000);
          const nY = this.p.noise(pt.x * 5 + 100, pt.y * 5, 1000);
          x += (nX - 0.5) * noiseAmp * unit * 0.1;
          y += (nY - 0.5) * noiseAmp * unit * 0.1;
        }

        pg.vertex(x, y);
      }
      pg.endShape();
    }

    // Render circle sets
    for (const circleSet of this.circleSets) {
      const color = this._getColor(circleSet.colorIndex, colors);

      const centerX = circleSet.centerX * unit;
      const centerY = circleSet.centerY * unit;

      for (const circle of circleSet.circles) {
        const radius = circle.radius * unit;

        // Draw fill
        if (circle.hasFill) {
          pg.fill(color.r, color.g, color.b, circle.fillAlpha * 255);
          pg.noStroke();
          pg.circle(centerX, centerY, radius * 2);
        }

        // Draw stroke
        pg.noFill();
        pg.stroke(color.r, color.g, color.b, 200);
        pg.strokeWeight(circle.strokeWeight * unit);
        pg.circle(centerX, centerY, radius * 2);
      }
    }

    pg.pop();
  }
}
