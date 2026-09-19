import { GameOfLifeApp } from "./app.js";

new GameOfLifeApp({
  canvas: document.getElementById("board"),
  toggleBtn: document.getElementById("toggle-btn"),
  randomBtn: document.getElementById("random-btn"),
  clearBtn: document.getElementById("clear-btn"),
  colorModeSelect: document.getElementById("color-mode"),
  statusEl: document.getElementById("status"),
});
