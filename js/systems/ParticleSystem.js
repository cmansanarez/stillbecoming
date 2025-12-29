/**
 * Particles that trace edges like a pen
 */
export class ParticleSystem {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    this.particles = [];
    this.maxParticles = 120;

    // Initialize particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this._createParticle());
    }
  }

  _createParticle() {
    const angle = this.seed.randRange(0, this.p.TWO_PI);
    const radius = this.seed.randRange(0, 0.4);

    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      vx: this.seed.randRange(-0.001, 0.001),
      vy: this.seed.randRange(-0.001, 0.001),
      life: this.seed.randRange(0.5, 1.0),
      size: this.seed.randRange(0.0008, 0.002),
      path: [], // Trail of previous positions
      active: false
    };
  }

  /**
   * Update particle positions
   */
  update(params, deltaTime) {
    const energy = params.particleEnergy;
    const noiseAmp = params.noiseAmp;

    const activeCount = Math.floor(energy * this.maxParticles);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Activate particles based on energy level
      if (i < activeCount) {
        p.active = true;
      } else {
        p.active = false;
        continue;
      }

      // Move particle
      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;

      // Apply noise-based force
      if (noiseAmp > 0) {
        const noiseForce = this.p.noise(p.x * 3, p.y * 3, this.p.millis() * 0.0003);
        const angle = noiseForce * this.p.TWO_PI * 2;
        p.vx += Math.cos(angle) * 0.00005 * energy;
        p.vy += Math.sin(angle) * 0.00005 * energy;
      }

      // Apply damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Boundary check (wrap around)
      const maxDist = 0.6;
      const dist = Math.sqrt(p.x * p.x + p.y * p.y);
      if (dist > maxDist) {
        const angle = Math.atan2(p.y, p.x) + this.p.PI;
        p.x = maxDist * 0.5 * Math.cos(angle);
        p.y = maxDist * 0.5 * Math.sin(angle);
      }

      // Store trail
      p.path.push({ x: p.x, y: p.y });
      if (p.path.length > 5) {
        p.path.shift();
      }

      // Update life
      p.life -= deltaTime * 0.2;
      if (p.life <= 0) {
        p.life = 1.0;
      }
    }
  }

  /**
   * Render particles
   */
  render(params, unit, colors) {
    const energy = params.particleEnergy;

    if (energy <= 0) return;

    this.p.push();

    for (const p of this.particles) {
      if (!p.active) continue;

      const alpha = p.life * energy * 180;

      // Render particle
      this.p.noStroke();
      this.p.fill(colors.periwinkle.r, colors.periwinkle.g, colors.periwinkle.b, alpha);

      const x = p.x * unit;
      const y = p.y * unit;
      const size = p.size * unit;

      this.p.circle(x, y, size);

      // Render trail (very faint)
      if (p.path.length > 1) {
        this.p.stroke(colors.periwinkle.r, colors.periwinkle.g, colors.periwinkle.b, alpha * 0.3);
        this.p.strokeWeight(unit * 0.0003);
        this.p.noFill();

        this.p.beginShape();
        for (const pt of p.path) {
          this.p.vertex(pt.x * unit, pt.y * unit);
        }
        this.p.endShape();
      }
    }

    this.p.pop();
  }

  /**
   * Render to offscreen graphics (minimal particles for export)
   */
  renderToGraphics(pg, params, unit, colors) {
    // Don't render particles in final export to keep it clean
    return;
  }
}
