import { formatFilenameTimestamp } from '../utils/time.js';

/**
 * Manages high-resolution export of the final relic
 */
export class ExportManager {
  constructor(p5Instance) {
    this.p = p5Instance;
    this.exportSize = 3000;
    this.isExporting = false;
  }

  /**
   * Export the current state as a high-res PNG
   * @param {Function} renderCallback - Function that renders the scene, receives (p5Instance, graphics, scale)
   * @param {string} editionNumber - Three-digit edition number
   * @param {string} timestamp - Formatted timestamp
   */
  exportRelic(renderCallback, editionNumber, timestamp) {
    if (this.isExporting) return;

    this.isExporting = true;

    try {
      // Create offscreen graphics buffer
      const pg = this.p.createGraphics(this.exportSize, this.exportSize, this.p.WEBGL);

      // Calculate scale factor
      const scale = this.exportSize / Math.min(this.p.width, this.p.height);

      // Render the final frame into the buffer
      renderCallback(this.p, pg, scale);

      // Generate filename
      const filenameTimestamp = formatFilenameTimestamp(new Date());
      const filename = `stillbecoming-ed${editionNumber}-${filenameTimestamp}.png`;

      // Save the image
      pg.save(filename);

      // Clean up
      pg.remove();

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Check if currently exporting
   */
  isCurrentlyExporting() {
    return this.isExporting;
  }
}
