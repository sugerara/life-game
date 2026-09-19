import { GameOfLife } from "../game-of-life.js";

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error });
  }
}

function assertEqual(actual, expected, message = "") {
  if (actual !== expected) {
    throw new Error(`${message ? `${message}: ` : ""}expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message = "expected truthy value") {
  if (!value) throw new Error(message);
}

test("constructor creates a grid with all cells dead", () => {
  const game = new GameOfLife(3, 3);
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      assertTrue(!game.isAlive(x, y), `cell (${x},${y}) should be dead`);
    }
  }
});

test("toggle flips a cell's state", () => {
  const game = new GameOfLife(3, 3);
  game.toggle(1, 1);
  assertTrue(game.isAlive(1, 1));
  game.toggle(1, 1);
  assertTrue(!game.isAlive(1, 1));
});

test("setAlive sets an explicit state", () => {
  const game = new GameOfLife(3, 3);
  game.setAlive(0, 0, true);
  assertTrue(game.isAlive(0, 0));
  game.setAlive(0, 0, false);
  assertTrue(!game.isAlive(0, 0));
});

test("clear resets all cells and the generation counter", () => {
  const game = new GameOfLife(3, 3);
  game.setAlive(0, 0, true);
  game.step();
  game.clear();
  assertTrue(!game.isAlive(0, 0));
  assertEqual(game.generation, 0);
  assertEqual(game.aliveCount, 0);
});

test("randomize with density 0 leaves every cell dead", () => {
  const game = new GameOfLife(5, 5);
  game.randomize(0);
  assertEqual(game.aliveCount, 0);
});

test("randomize with density 1 makes every cell alive", () => {
  const game = new GameOfLife(5, 5);
  game.randomize(1);
  assertEqual(game.aliveCount, 25);
});

test("underpopulation: a live cell with fewer than 2 neighbors dies", () => {
  const game = new GameOfLife(5, 5);
  game.setAlive(2, 2, true);
  game.step();
  assertTrue(!game.isAlive(2, 2));
});

test("overpopulation: a live cell with more than 3 neighbors dies", () => {
  const game = new GameOfLife(5, 5);
  for (const [x, y] of [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2]]) {
    game.setAlive(x, y, true);
  }
  game.step();
  assertTrue(!game.isAlive(2, 2));
});

test("reproduction: a dead cell with exactly 3 neighbors becomes alive", () => {
  const game = new GameOfLife(5, 5);
  game.setAlive(1, 1, true);
  game.setAlive(1, 2, true);
  game.setAlive(1, 3, true);
  game.step();
  assertTrue(game.isAlive(2, 2));
});

test("still life: a 2x2 block is stable across generations", () => {
  const game = new GameOfLife(5, 5);
  const block = [[1, 1], [2, 1], [1, 2], [2, 2]];
  for (const [x, y] of block) game.setAlive(x, y, true);
  game.step();
  for (const [x, y] of block) assertTrue(game.isAlive(x, y));
  assertEqual(game.aliveCount, 4);
});

test("oscillator: a blinker flips between horizontal and vertical", () => {
  const game = new GameOfLife(5, 5);
  for (const [x, y] of [[1, 2], [2, 2], [3, 2]]) game.setAlive(x, y, true);

  game.step();
  assertTrue(game.isAlive(2, 1));
  assertTrue(game.isAlive(2, 2));
  assertTrue(game.isAlive(2, 3));
  assertEqual(game.aliveCount, 3);

  game.step();
  assertTrue(game.isAlive(1, 2));
  assertTrue(game.isAlive(2, 2));
  assertTrue(game.isAlive(3, 2));
  assertEqual(game.aliveCount, 3);
});

test("toroidal wraparound: neighbors are counted across board edges", () => {
  const game = new GameOfLife(3, 3);
  game.setAlive(0, 0, true);
  game.setAlive(1, 0, true);
  game.setAlive(2, 0, true);
  game.step();
  assertTrue(game.isAlive(1, 2), "cell wrapping to the bottom row should be born");
});

test("generation counter increments on step and resets on clear/randomize", () => {
  const game = new GameOfLife(3, 3);
  assertEqual(game.generation, 0);
  game.step();
  game.step();
  assertEqual(game.generation, 2);
  game.clear();
  assertEqual(game.generation, 0);
  game.step();
  game.randomize(0);
  assertEqual(game.generation, 0);
});

test("aliveCount reflects the number of live cells", () => {
  const game = new GameOfLife(4, 4);
  assertEqual(game.aliveCount, 0);
  game.setAlive(0, 0, true);
  game.setAlive(1, 1, true);
  assertEqual(game.aliveCount, 2);
});

test("resize preserves overlapping cells when growing", () => {
  const game = new GameOfLife(3, 3);
  game.setAlive(0, 0, true);
  game.setAlive(2, 2, true);
  game.resize(5, 4);
  assertEqual(game.cols, 5);
  assertEqual(game.rows, 4);
  assertTrue(game.isAlive(0, 0));
  assertTrue(game.isAlive(2, 2));
  assertEqual(game.aliveCount, 2);
});

test("resize drops cells outside the new bounds when shrinking", () => {
  const game = new GameOfLife(4, 4);
  game.setAlive(1, 1, true);
  game.setAlive(3, 3, true);
  game.resize(2, 2);
  assertTrue(game.isAlive(1, 1));
  assertEqual(game.aliveCount, 1);
});

test("resize keeps the generation counter", () => {
  const game = new GameOfLife(4, 4);
  game.setAlive(1, 0, true);
  game.setAlive(1, 1, true);
  game.setAlive(1, 2, true);
  game.step();
  const generationBefore = game.generation;
  game.resize(5, 5);
  assertEqual(game.generation, generationBefore);
});

test("newly placed cells have age 1 and dead cells have age 0", () => {
  const game = new GameOfLife(3, 3);
  assertEqual(game.ageAt(1, 1), 0);
  game.setAlive(1, 1, true);
  assertEqual(game.ageAt(1, 1), 1);
  game.setAlive(1, 1, false);
  assertEqual(game.ageAt(1, 1), 0);
});

test("setAlive on a living cell keeps its age", () => {
  const game = new GameOfLife(4, 4);
  game.setAlive(1, 1, true);
  game.setAlive(2, 1, true);
  game.setAlive(1, 2, true);
  game.setAlive(2, 2, true);
  game.step();
  assertEqual(game.ageAt(1, 1), 2);
  game.setAlive(1, 1, true);
  assertEqual(game.ageAt(1, 1), 2);
});

test("surviving cells age each generation and newborn cells start at 1", () => {
  const game = new GameOfLife(5, 5);
  game.setAlive(1, 2, true);
  game.setAlive(2, 2, true);
  game.setAlive(3, 2, true);
  game.step();
  assertEqual(game.ageAt(2, 2), 2, "center survives");
  assertEqual(game.ageAt(2, 1), 1, "newborn above");
  assertEqual(game.ageAt(2, 3), 1, "newborn below");
  assertEqual(game.ageAt(1, 2), 0, "dead end cell");
});

test("age is capped at 255", () => {
  const game = new GameOfLife(4, 4);
  game.setAlive(1, 1, true);
  game.setAlive(2, 1, true);
  game.setAlive(1, 2, true);
  game.setAlive(2, 2, true);
  for (let i = 0; i < 300; i++) game.step();
  assertEqual(game.ageAt(1, 1), 255);
});

test("toggle, clear and randomize keep ages consistent", () => {
  const game = new GameOfLife(4, 4);
  game.toggle(0, 0);
  assertEqual(game.ageAt(0, 0), 1);
  game.toggle(0, 0);
  assertEqual(game.ageAt(0, 0), 0);
  game.randomize(1);
  assertEqual(game.ageAt(3, 3), 1);
  game.clear();
  assertEqual(game.ageAt(3, 3), 0);
});

test("resize preserves ages of retained cells", () => {
  const game = new GameOfLife(4, 4);
  game.setAlive(1, 1, true);
  game.setAlive(2, 1, true);
  game.setAlive(1, 2, true);
  game.setAlive(2, 2, true);
  game.step();
  game.resize(6, 6);
  assertEqual(game.ageAt(1, 1), 2);
  assertEqual(game.ageAt(5, 5), 0);
});

let failures = 0;
for (const { name, passed, error } of results) {
  console.log(`${passed ? "✓" : "✗"} ${name}`);
  if (!passed) {
    failures++;
    console.log(`    ${error.message}`);
  }
}
console.log(`\n${results.length - failures}/${results.length} passed`);

if (typeof document !== "undefined") {
  const summary = document.createElement("p");
  summary.textContent = `${results.length - failures}/${results.length} passed`;
  const list = document.createElement("ul");
  for (const { name, passed, error } of results) {
    const item = document.createElement("li");
    item.className = passed ? "pass" : "fail";
    item.textContent = `${passed ? "✓" : "✗"} ${name}${error ? ` — ${error.message}` : ""}`;
    list.appendChild(item);
  }
  document.body.append(summary, list);
}

if (typeof process !== "undefined" && failures > 0) {
  process.exitCode = 1;
}
