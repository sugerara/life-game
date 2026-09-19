export const COLOR_MODES = Object.freeze({ MONO: "mono", AGE: "age" });

const PALETTE_STEPS = 16;
const HUE_YOUNG = 250;
const HUE_OLD = 25;

export class BoardRenderer {
  #canvas;
  #ctx;
  #game;
  #colorMode = COLOR_MODES.MONO;
  #palette = [];
  #paletteKey = "";

  constructor(canvas, game) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#game = game;
  }

  set colorMode(mode) {
    this.#colorMode = mode;
  }

  #ageColor(age) {
    return this.#palette[Math.min(PALETTE_STEPS - 1, Math.round(Math.log2(age) * 3))];
  }

  #updatePalette(styles) {
    const lightness = styles.getPropertyValue("--color-age-lightness").trim();
    const chroma = styles.getPropertyValue("--color-age-chroma").trim();
    const key = `${lightness}/${chroma}`;
    if (key === this.#paletteKey) return;
    this.#paletteKey = key;
    this.#palette = Array.from({ length: PALETTE_STEPS }, (_, i) => {
      const hue = HUE_YOUNG + ((HUE_OLD - HUE_YOUNG) * i) / (PALETTE_STEPS - 1);
      return `oklch(${lightness} ${chroma} ${hue.toFixed(1)})`;
    });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = this.#canvas;
    this.#canvas.width = clientWidth * dpr;
    this.#canvas.height = clientHeight * dpr;
    this.#ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  cellAt(clientX, clientY) {
    const rect = this.#canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * this.#game.cols);
    const y = Math.floor(((clientY - rect.top) / rect.height) * this.#game.rows);
    return { x, y };
  }

  draw() {
    const ctx = this.#ctx;
    const { clientWidth: width, clientHeight: height } = this.#canvas;
    const cellWidth = width / this.#game.cols;
    const cellHeight = height / this.#game.rows;

    const styles = getComputedStyle(this.#canvas);
    const aliveColor = styles.getPropertyValue("--color-cell-alive").trim();
    const gridColor = styles.getPropertyValue("--color-grid-line").trim();

    ctx.clearRect(0, 0, width, height);

    const byAge = this.#colorMode === COLOR_MODES.AGE;
    if (byAge) this.#updatePalette(styles);

    ctx.fillStyle = aliveColor;
    let currentColor = aliveColor;
    for (let y = 0; y < this.#game.rows; y++) {
      for (let x = 0; x < this.#game.cols; x++) {
        if (this.#game.isAlive(x, y)) {
          if (byAge) {
            const color = this.#ageColor(this.#game.ageAt(x, y));
            if (color !== currentColor) {
              ctx.fillStyle = color;
              currentColor = color;
            }
          }
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    }

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 1; x < this.#game.cols; x++) {
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, height);
    }
    for (let y = 1; y < this.#game.rows; y++) {
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(width, y * cellHeight);
    }
    ctx.stroke();
  }
}
