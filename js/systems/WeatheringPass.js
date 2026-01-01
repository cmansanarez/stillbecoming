/**
 * Applies aged paper texture, staining, and subtle weathering
 */
export class WeatheringPass {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    // Pre-generate stain positions (like water damage or aging spots)
    this.stains = [];
    this._generateStains();

    // Pre-generate glitch residue positions
    this.glitchFlecks = [];
    this._generateGlitchFlecks();
  }

  _generateStains() {
    // Create organic stain shapes (like aged paper)
    const numStains = Math.floor(this.seed.randRange(3, 8));

    for (let i = 0; i < numStains; i++) {
      const x = this.seed.randRange(-0.5, 0.5);
      const y = this.seed.randRange(-0.5, 0.5);
      const size = this.seed.randRange(0.1, 0.3);
      const opacity = this.seed.randRange(0.03, 0.08);
      const colorIndex = Math.floor(this.seed.randRange(0, 2)); // 0=golden (aged), 1=twilight

      this.stains.push({
        x,
        y,
        size,
        opacity,
        colorIndex
      });
    }
  }

  _generateGlitchFlecks() {
    const count = 30;

    for (let i = 0; i < count; i++) {
      this.glitchFlecks.push({
        x: this.seed.randRange(-0.5, 0.5),
        y: this.seed.randRange(-0.5, 0.5),
        size: this.seed.randRange(0.0005, 0.003),
        opacity: this.seed.randRange(0.3, 0.8)
      });
    }
  }

  /**
   * Render weathering effects
   */
  render(params, unit, colors, ritualStateName) {
    const amount = params.weatheringAmount;
    const glitchRate = params.glitchRate;

    if (amount <= 0) return;

    this.p.push();

    // Render aged paper stains first (background layer)
    if (amount > 0.2) {
      this._renderStains(amount, unit, colors);
    }

    // Apply pixelation effect during resolution (REASSEMBLE, CONSECRATE_2D, RELIC)
    const pixelationStates = ['REASSEMBLE', 'CONSECRATE_2D', 'RELIC'];
    if (pixelationStates.includes(ritualStateName)) {
      this._renderPixelation(amount, unit);
    }

    // Apply subtle grain texture
    this._renderGrain(amount, unit);

    // Apply glitch residue (golden flecks)
    if (glitchRate > 0.2) {
      this._renderGlitchResidue(glitchRate, amount, unit, colors);
    }

    this.p.pop();
  }

  _renderStains(amount, unit, colors) {
    // Render organic stain shapes
    for (const stain of this.stains) {
      const color = stain.colorIndex === 0 ? colors.golden : colors.twilight;

      const x = stain.x * unit;
      const y = stain.y * unit;
      const size = stain.size * unit * amount;

      // Draw soft circular stain with radial gradient effect
      const steps = 20;
      for (let i = steps; i > 0; i--) {
        const t = i / steps;
        const alpha = stain.opacity * amount * t * 255;

        this.p.noStroke();
        this.p.fill(color.r, color.g, color.b, alpha);
        this.p.circle(x, y, size * t);
      }
    }
  }

  _renderPixelation(amount, unit) {
    // Apply subtle pixelation overlay effect during resolution
    // This creates a mosaic-like texture without affecting the export
    const pixelSize = unit * 0.015; // Size of each pixel block
    const gridExtent = unit * 0.6;
    const steps = Math.floor((gridExtent * 2) / pixelSize);

    this.p.noStroke();

    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        const x = -gridExtent + i * pixelSize;
        const y = -gridExtent + j * pixelSize;

        // Sample random brightness for each pixel
        const brightness = this.p.random(0, 50);
        const alpha = amount * brightness * 0.15;

        // Draw semi-transparent pixel blocks
        this.p.fill(brightness, brightness, brightness, alpha);
        this.p.rect(x, y, pixelSize, pixelSize);
      }
    }
  }

  _renderGrain(amount, unit) {
    // Subtle grain overlay using random points (like paper texture)
    const grainDensity = 400;
    const grainAlpha = amount * 12;

    for (let i = 0; i < grainDensity * amount; i++) {
      const x = this.p.random(-unit * 0.6, unit * 0.6);
      const y = this.p.random(-unit * 0.6, unit * 0.6);

      // Vary grain color slightly (some darker, some lighter)
      const brightness = this.p.random(200, 255);

      this.p.stroke(brightness, grainAlpha);
      this.p.strokeWeight(1);
      this.p.point(x, y);
    }
  }

  _renderGlitchResidue(glitchRate, weathering, unit, colors) {
    // Render golden glitch flecks
    const visibleCount = Math.floor(glitchRate * this.glitchFlecks.length);

    for (let i = 0; i < visibleCount; i++) {
      const fleck = this.glitchFlecks[i];

      const x = fleck.x * unit;
      const y = fleck.y * unit;
      const alpha = fleck.opacity * glitchRate * weathering * 220;

      this.p.noStroke();
      this.p.fill(colors.golden.r, colors.golden.g, colors.golden.b, alpha);
      this.p.circle(x, y, fleck.size * unit);
    }
  }

  /**
   * Render to offscreen graphics for export
   */
  renderToGraphics(pg, params, unit, colors) {
    const amount = params.weatheringAmount;

    if (amount <= 0) return;

    pg.push();

    // Render stains
    for (const stain of this.stains) {
      const color = stain.colorIndex === 0 ? colors.golden : colors.twilight;

      const x = stain.x * unit;
      const y = stain.y * unit;
      const size = stain.size * unit * amount;

      // Draw soft circular stain
      const steps = 20;
      for (let i = steps; i > 0; i--) {
        const t = i / steps;
        const alpha = stain.opacity * amount * t * 255;

        pg.noStroke();
        pg.fill(color.r, color.g, color.b, alpha);
        pg.circle(x, y, size * t);
      }
    }

    // Apply grain
    const grainDensity = 600;
    const grainAlpha = amount * 12;

    for (let i = 0; i < grainDensity * amount; i++) {
      const x = this.p.random(-unit * 0.6, unit * 0.6);
      const y = this.p.random(-unit * 0.6, unit * 0.6);

      const brightness = this.p.random(200, 255);

      pg.stroke(brightness, grainAlpha);
      pg.strokeWeight(1);
      pg.point(x, y);
    }

    // Apply fixed glitch residue
    const visibleCount = Math.floor(0.6 * this.glitchFlecks.length);

    for (let i = 0; i < visibleCount; i++) {
      const fleck = this.glitchFlecks[i];

      const x = fleck.x * unit;
      const y = fleck.y * unit;
      const alpha = fleck.opacity * amount * 220;

      pg.noStroke();
      pg.fill(colors.golden.r, colors.golden.g, colors.golden.b, alpha);
      pg.circle(x, y, fleck.size * unit);
    }

    pg.pop();
  }
}
