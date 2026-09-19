const RANDOM_DENSITY = 0.35;
const MAX_AGE = 255;

export class GameOfLife {
  #cols;
  #rows;
  #cells;
  #ages;
  #generation = 0;

  constructor(cols, rows) {
    this.#cols = cols;
    this.#rows = rows;
    this.#cells = new Uint8Array(cols * rows);
    this.#ages = new Uint8Array(cols * rows);
  }

  get cols() {
    return this.#cols;
  }

  get rows() {
    return this.#rows;
  }

  get generation() {
    return this.#generation;
  }

  get aliveCount() {
    return this.#cells.reduce((sum, cell) => sum + cell, 0);
  }

  #index(x, y) {
    return y * this.#cols + x;
  }

  isAlive(x, y) {
    return this.#cells[this.#index(x, y)] === 1;
  }

  ageAt(x, y) {
    return this.#ages[this.#index(x, y)];
  }

  toggle(x, y) {
    this.setAlive(x, y, !this.isAlive(x, y));
  }

  setAlive(x, y, alive) {
    const i = this.#index(x, y);
    if (alive) {
      if (!this.#cells[i]) this.#ages[i] = 1;
      this.#cells[i] = 1;
    } else {
      this.#cells[i] = 0;
      this.#ages[i] = 0;
    }
  }

  resize(cols, rows) {
    const next = new Uint8Array(cols * rows);
    const nextAges = new Uint8Array(cols * rows);
    const copyCols = Math.min(cols, this.#cols);
    const copyRows = Math.min(rows, this.#rows);
    for (let y = 0; y < copyRows; y++) {
      for (let x = 0; x < copyCols; x++) {
        next[y * cols + x] = this.#cells[this.#index(x, y)];
        nextAges[y * cols + x] = this.#ages[this.#index(x, y)];
      }
    }
    this.#cols = cols;
    this.#rows = rows;
    this.#cells = next;
    this.#ages = nextAges;
  }

  clear() {
    this.#cells.fill(0);
    this.#ages.fill(0);
    this.#generation = 0;
  }

  randomize(density = RANDOM_DENSITY) {
    for (let i = 0; i < this.#cells.length; i++) {
      this.#cells[i] = Math.random() < density ? 1 : 0;
      this.#ages[i] = this.#cells[i];
    }
    this.#generation = 0;
  }

  #countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + this.#cols) % this.#cols;
        const ny = (y + dy + this.#rows) % this.#rows;
        count += this.#cells[this.#index(nx, ny)];
      }
    }
    return count;
  }

  step() {
    const next = new Uint8Array(this.#cells.length);
    const nextAges = new Uint8Array(this.#cells.length);
    for (let y = 0; y < this.#rows; y++) {
      for (let x = 0; x < this.#cols; x++) {
        const i = this.#index(x, y);
        const alive = this.isAlive(x, y);
        const neighbors = this.#countNeighbors(x, y);
        const survives = alive
          ? neighbors === 2 || neighbors === 3
          : neighbors === 3;
        next[i] = Number(survives);
        if (survives) {
          nextAges[i] = alive ? Math.min(MAX_AGE, this.#ages[i] + 1) : 1;
        }
      }
    }
    this.#cells = next;
    this.#ages = nextAges;
    this.#generation++;
  }
}
