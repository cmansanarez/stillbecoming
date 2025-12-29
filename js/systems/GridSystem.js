/**
 * Renders a prominent architectural grid inspired by drafting paper
 */
export class GridSystem {
  constructor(p5Instance, seedManager) {
    this.p = p5Instance;
    this.seed = seedManager;

    // Much denser grid to match reference images
    this.gridSize = Math.floor(seedManager.randRange(16, 24)); // 16-24 cells
    this.gridExtent = 0.6; // Cover more of the canvas

    // Generate some grid cells with fills (like colored squares in references)
    this.filledCells = [];
    this._generateFilledCells();

    // Grid fragments that can detach
    this.fragments = [];
    this._generateFragments();
  }

  _generateFilledCells() {
    // Some cells get translucent color fills
    const numFilledCells = Math.floor(this.seed.randRange(5, 15));

    for (let i = 0; i < numFilledCells; i++) {
      const gridX = Math.floor(this.seed.randRange(0, this.gridSize));
      const gridY = Math.floor(this.seed.randRange(0, this.gridSize));
      const colorIndex = Math.floor(this.seed.randRange(0, 3)); // 0=blue, 1=periwinkle, 2=golden
      const alpha = this.seed.randRange(0.1, 0.25);

      this.filledCells.push({
        gridX,
        gridY,
        colorIndex,
        alpha
      });
    }
  }

  _generateFragments() {
    // Select a few random tiles that can detach during destabilize
    const fragmentCount = 6;

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

    // Draw filled cells first (background layer)
    if (visibility > 0.3) {
      this._renderFilledCells(visibility, unit, colors, cellSize);
    }

    // Draw main grid lines (more prominent now)
    this.p.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, visibility * 140);
    this.p.strokeWeight(unit * 0.0015); // Thicker grid lines

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

    // Draw accent lines (thicker boundary lines every few cells, like in references)
    if (visibility > 0.5) {
      this._renderAccentLines(visibility, unit, colors, cellSize);
    }

    // Draw detached fragments
    if (zLift > 0.3) {
      this._renderFragments(params, unit, colors, cellSize);
    }

    this.p.pop();
  }

  _renderFilledCells(visibility, unit, colors, cellSize) {
    for (const cell of this.filledCells) {
      let color = colors.twilight;
      if (cell.colorIndex === 1) color = colors.periwinkle;
      if (cell.colorIndex === 2) color = colors.golden;

      const x = -this.gridExtent * unit + cell.gridX * cellSize;
      const y = -this.gridExtent * unit + cell.gridY * cellSize;

      this.p.fill(color.r, color.g, color.b, cell.alpha * visibility * 255);
      this.p.noStroke();
      this.p.rect(x, y, cellSize, cellSize);
    }
  }

  _renderAccentLines(visibility, unit, colors, cellSize) {
    // Draw thicker lines every 4 cells (like major grid divisions)
    const accentInterval = 4;

    this.p.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, visibility * 200);
    this.p.strokeWeight(unit * 0.003);

    // Vertical accent lines
    for (let i = 0; i <= this.gridSize; i += accentInterval) {
      const x = -this.gridExtent * unit + i * cellSize;
      const y1 = -this.gridExtent * unit;
      const y2 = this.gridExtent * unit;

      this.p.line(x, y1, 0, x, y2, 0);
    }

    // Horizontal accent lines
    for (let j = 0; j <= this.gridSize; j += accentInterval) {
      const y = -this.gridExtent * unit + j * cellSize;
      const x1 = -this.gridExtent * unit;
      const x2 = this.gridExtent * unit;

      this.p.line(x1, y, 0, x2, y, 0);
    }
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
      this.p.stroke(colors.golden.r, colors.golden.g, colors.golden.b, zLift * 180);
      this.p.strokeWeight(unit * 0.002);
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

    // Draw filled cells
    for (const cell of this.filledCells) {
      let color = colors.twilight;
      if (cell.colorIndex === 1) color = colors.periwinkle;
      if (cell.colorIndex === 2) color = colors.golden;

      const x = -this.gridExtent * unit + cell.gridX * cellSize;
      const y = -this.gridExtent * unit + cell.gridY * cellSize;

      pg.fill(color.r, color.g, color.b, cell.alpha * visibility * 255);
      pg.noStroke();
      pg.rect(x, y, cellSize, cellSize);
    }

    // Main grid lines
    pg.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, visibility * 140);
    pg.strokeWeight(unit * 0.0015);

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

    // Accent lines
    const accentInterval = 4;
    pg.stroke(colors.twilight.r, colors.twilight.g, colors.twilight.b, visibility * 200);
    pg.strokeWeight(unit * 0.003);

    for (let i = 0; i <= this.gridSize; i += accentInterval) {
      const x = -this.gridExtent * unit + i * cellSize;
      const y1 = -this.gridExtent * unit;
      const y2 = this.gridExtent * unit;

      pg.line(x, y1, 0, x, y2, 0);
    }

    for (let j = 0; j <= this.gridSize; j += accentInterval) {
      const y = -this.gridExtent * unit + j * cellSize;
      const x1 = -this.gridExtent * unit;
      const x2 = this.gridExtent * unit;

      pg.line(x1, y, 0, x2, y, 0);
    }

    pg.pop();
  }
}
