/**
 * Renders a minimal grid field that destabilizes during the ritual
 */
export class GridSystem {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    this.gridSize = 8; // 8x8 grid
    this.gridExtent = 0.5; // Half-width of grid in unit space

    // Grid fragments that can detach
    this.fragments = [];
    this._generateFragments();
  }

  _generateFragments() {
    // Select a few random tiles that can detach during destabilize
    const fragmentCount = 4;

    for (let i = 0; i < fragmentCount; i++) {
      const gridX = Math.floor(this.seed.randRange(0, this.gridSize));
      const gridY = Math.floor(this.seed.randRange(0, this.gridSize));

      this.fragments.push({
        gridX,
        gridY,
        zOffset: 0,
        drift: {
          x: this.seed.randRange(-0.02, 0.02),
          y: this.seed.randRange(-0.02, 0.02),
          z: this.seed.randRange(0.1, 0.3)
        }
      });
    }
  }

  /**
   * Render the grid system
   */
  render(params, unit, colors) {
    const visibility = params.gridVisibility;
    const noiseAmp = params.noiseAmp;
    const zLift = params.zLiftStrength;

    if (visibility <= 0) return;

    this.p.push();

    const cellSize = (this.gridExtent * 2 * unit) / this.gridSize;

    // Update fragment offsets
    for (const frag of this.fragments) {
      frag.zOffset = zLift * frag.drift.z * unit;
    }

    // Draw grid lines
    this.p.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, visibility * 60);
    this.p.strokeWeight(unit * 0.0008);

    // Vertical lines
    for (let i = 0; i <= this.gridSize; i++) {
      const x = -this.gridExtent * unit + i * cellSize;

      this.p.beginShape();
      for (let j = 0; j <= this.gridSize; j++) {
        const y = -this.gridExtent * unit + j * cellSize;

        let vx = x;
        let vy = y;
        let vz = 0;

        // Apply noise
        if (noiseAmp > 0) {
          const n = this.p.noise(i * 0.5, j * 0.5, this.p.millis() * 0.0002);
          vx += (n - 0.5) * noiseAmp * unit * 0.05;
          vy += (n - 0.5) * noiseAmp * unit * 0.05;
        }

        this.p.vertex(vx, vy, vz);
      }
      this.p.endShape();
    }

    // Horizontal lines
    for (let j = 0; j <= this.gridSize; j++) {
      const y = -this.gridExtent * unit + j * cellSize;

      this.p.beginShape();
      for (let i = 0; i <= this.gridSize; i++) {
        const x = -this.gridExtent * unit + i * cellSize;

        let vx = x;
        let vy = y;
        let vz = 0;

        // Apply noise
        if (noiseAmp > 0) {
          const n = this.p.noise(i * 0.5, j * 0.5, this.p.millis() * 0.0002);
          vx += (n - 0.5) * noiseAmp * unit * 0.05;
          vy += (n - 0.5) * noiseAmp * unit * 0.05;
        }

        this.p.vertex(vx, vy, vz);
      }
      this.p.endShape();
    }

    // Draw detached fragments
    if (zLift > 0.3) {
      this._renderFragments(params, unit, colors, cellSize);
    }

    this.p.pop();
  }

  _renderFragments(params, unit, colors, cellSize) {
    const zLift = params.zLiftStrength;

    for (const frag of this.fragments) {
      this.p.push();

      const x = -this.gridExtent * unit + (frag.gridX + 0.5) * cellSize;
      const y = -this.gridExtent * unit + (frag.gridY + 0.5) * cellSize;
      const z = frag.zOffset;

      // Apply drift
      const driftX = frag.drift.x * zLift * unit;
      const driftY = frag.drift.y * zLift * unit;

      this.p.translate(x + driftX, y + driftY, z);

      // Draw small square fragment
      this.p.stroke(colors.golden.r, colors.golden.g, colors.golden.b, zLift * 150);
      this.p.strokeWeight(unit * 0.0015);
      this.p.noFill();

      const halfCell = cellSize * 0.4;
      this.p.rect(-halfCell, -halfCell, cellSize * 0.8, cellSize * 0.8);

      this.p.pop();
    }
  }

  /**
   * Render to an offscreen graphics buffer for export
   */
  renderToGraphics(pg, params, unit, colors) {
    const visibility = params.gridVisibility;
    const noiseAmp = params.noiseAmp;

    if (visibility <= 0) return;

    pg.push();

    const cellSize = (this.gridExtent * 2 * unit) / this.gridSize;

    pg.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, visibility * 60);
    pg.strokeWeight(unit * 0.0008);

    // Vertical lines
    for (let i = 0; i <= this.gridSize; i++) {
      const x = -this.gridExtent * unit + i * cellSize;

      pg.beginShape();
      for (let j = 0; j <= this.gridSize; j++) {
        const y = -this.gridExtent * unit + j * cellSize;

        let vx = x;
        let vy = y;

        // Frozen noise for export
        if (noiseAmp > 0) {
          const n = this.p.noise(i * 0.5, j * 0.5, 100);
          vx += (n - 0.5) * noiseAmp * unit * 0.05;
          vy += (n - 0.5) * noiseAmp * unit * 0.05;
        }

        pg.vertex(vx, vy, 0);
      }
      pg.endShape();
    }

    // Horizontal lines
    for (let j = 0; j <= this.gridSize; j++) {
      const y = -this.gridExtent * unit + j * cellSize;

      pg.beginShape();
      for (let i = 0; i <= this.gridSize; i++) {
        const x = -this.gridExtent * unit + i * cellSize;

        let vx = x;
        let vy = y;

        if (noiseAmp > 0) {
          const n = this.p.noise(i * 0.5, j * 0.5, 100);
          vx += (n - 0.5) * noiseAmp * unit * 0.05;
          vy += (n - 0.5) * noiseAmp * unit * 0.05;
        }

        pg.vertex(vx, vy, 0);
      }
      pg.endShape();
    }

    pg.pop();
  }
}
