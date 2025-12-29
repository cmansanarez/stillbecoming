/**
 * Applies subtle weathering effects: grain, dithering, and glitch residue
 */
export class WeatheringPass {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    // Pre-generate glitch residue positions
    this.glitchFlecks = [];
    this._generateGlitchFlecks();
  }

  _generateGlitchFlecks() {
    const count = 20;

    for (let i = 0; i < count; i++) {
      this.glitchFlecks.push({
        x: this.seed.randRange(-0.5, 0.5),
        y: this.seed.randRange(-0.5, 0.5),
        size: this.seed.randRange(0.0005, 0.002),
        opacity: this.seed.randRange(0.3, 0.8)
      });
    }
  }

  /**
   * Render weathering effects
   */
  render(params, unit, colors) {
    const amount = params.weatheringAmount;
    const glitchRate = params.glitchRate;

    if (amount <= 0) return;

    this.p.push();

    // Apply grain texture
    this._renderGrain(amount, unit);

    // Apply glitch residue (golden flecks)
    if (glitchRate > 0.2) {
      this._renderGlitchResidue(glitchRate, amount, unit, colors);
    }

    this.p.pop();
  }

  _renderGrain(amount, unit) {
    // Subtle grain overlay using random points
    const grainDensity = 300;
    const grainAlpha = amount * 15;

    for (let i = 0; i < grainDensity * amount; i++) {
      const x = this.p.random(-unit * 0.5, unit * 0.5);
      const y = this.p.random(-unit * 0.5, unit * 0.5);

      this.p.stroke(255, grainAlpha);
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
      const alpha = fleck.opacity * glitchRate * weathering * 200;

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

    // Apply grain
    const grainDensity = 500;
    const grainAlpha = amount * 15;

    for (let i = 0; i < grainDensity * amount; i++) {
      const x = this.p.random(-unit * 0.5, unit * 0.5);
      const y = this.p.random(-unit * 0.5, unit * 0.5);

      pg.stroke(255, grainAlpha);
      pg.strokeWeight(1);
      pg.point(x, y);
    }

    // Apply fixed glitch residue
    const visibleCount = Math.floor(0.6 * this.glitchFlecks.length); // Fixed amount for export

    for (let i = 0; i < visibleCount; i++) {
      const fleck = this.glitchFlecks[i];

      const x = fleck.x * unit;
      const y = fleck.y * unit;
      const alpha = fleck.opacity * amount * 200;

      pg.noStroke();
      pg.fill(colors.golden.r, colors.golden.g, colors.golden.b, alpha);
      pg.circle(x, y, fleck.size * unit);
    }

    pg.pop();
  }
}
