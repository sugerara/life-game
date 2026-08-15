import { GameOfLife } from "./game-of-life.js";
import { BoardRenderer } from "./board-renderer.js";

const CELL_SIZE = 14;
const GENERATIONS_PER_SECOND = 10;

export class GameOfLifeApp {
  #game;
  #renderer;
  #canvas;
  #toggleBtn;
  #randomBtn;
  #clearBtn;
  #statusEl;
  #running = false;
  #lastStepTime = 0;
  #isPointerDown = false;
  #paintValue = true;

  constructor({ canvas, toggleBtn, randomBtn, clearBtn, statusEl }) {
    this.#canvas = canvas;
    this.#toggleBtn = toggleBtn;
    this.#randomBtn = randomBtn;
    this.#clearBtn = clearBtn;
    this.#statusEl = statusEl;

    const { cols, rows } = this.#calculateGrid();
    this.#game = new GameOfLife(cols, rows);
    this.#renderer = new BoardRenderer(canvas, this.#game);

    this.#bindEvents();
    this.#handleResize();
  }

  #calculateGrid() {
    const rect = this.#canvas.getBoundingClientRect();
    const cols = Math.max(1, Math.floor(rect.width / CELL_SIZE));
    const rows = Math.max(1, Math.floor(rect.height / CELL_SIZE));
    return { cols, rows };
  }

  #bindEvents() {
    this.#toggleBtn.addEventListener("click", () => this.#toggleRunning());
    this.#randomBtn.addEventListener("click", () => this.#handleRandom());
    this.#clearBtn.addEventListener("click", () => this.#handleClear());

    this.#canvas.addEventListener("pointerdown", (e) => this.#handlePointerDown(e));
    this.#canvas.addEventListener("pointermove", (e) => this.#handlePointerMove(e));
    window.addEventListener("pointerup", () => {
      this.#isPointerDown = false;
    });

    window.addEventListener("resize", () => this.#handleResize());
  }

  #handleResize() {
    const { cols, rows } = this.#calculateGrid();
    if (cols !== this.#game.cols || rows !== this.#game.rows) {
      this.#game = new GameOfLife(cols, rows);
      this.#renderer = new BoardRenderer(this.#canvas, this.#game);
    }
    this.#renderer.resize();
    this.#renderer.draw();
  }

  #handlePointerDown(e) {
    this.#isPointerDown = true;
    const { x, y } = this.#renderer.cellAt(e.clientX, e.clientY);
    this.#paintValue = !this.#game.isAlive(x, y);
    this.#game.setAlive(x, y, this.#paintValue);
    this.#renderer.draw();
    this.#updateStatus();
  }

  #handlePointerMove(e) {
    if (!this.#isPointerDown) return;
    const { x, y } = this.#renderer.cellAt(e.clientX, e.clientY);
    if (x < 0 || y < 0 || x >= this.#game.cols || y >= this.#game.rows) return;
    this.#game.setAlive(x, y, this.#paintValue);
    this.#renderer.draw();
    this.#updateStatus();
  }

  #toggleRunning() {
    this.#running = !this.#running;
    this.#toggleBtn.textContent = this.#running ? "停止" : "再生";
    if (this.#running) {
      this.#lastStepTime = 0;
      requestAnimationFrame((t) => this.#loop(t));
    }
  }

  #handleRandom() {
    this.#game.randomize();
    this.#renderer.draw();
    this.#updateStatus();
  }

  #handleClear() {
    this.#game.clear();
    this.#renderer.draw();
    this.#updateStatus();
  }

  #loop(timestamp) {
    if (!this.#running) return;

    const interval = 1000 / GENERATIONS_PER_SECOND;
    if (timestamp - this.#lastStepTime >= interval) {
      this.#lastStepTime = timestamp;
      this.#game.step();
      this.#renderer.draw();
      this.#updateStatus();
    }

    requestAnimationFrame((t) => this.#loop(t));
  }

  #updateStatus() {
    this.#statusEl.textContent = `世代: ${this.#game.generation} / 生存セル: ${this.#game.aliveCount}`;
  }
}
