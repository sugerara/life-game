export class BoardRenderer {
  #canvas;
  #ctx;
  #game;

  constructor(canvas, game) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#game = game;
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

    ctx.fillStyle = aliveColor;
    for (let y = 0; y < this.#game.rows; y++) {
      for (let x = 0; x < this.#game.cols; x++) {
        if (this.#game.isAlive(x, y)) {
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
