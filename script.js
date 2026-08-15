import { GameOfLifeApp } from "./app.js";

new GameOfLifeApp({
  canvas: document.getElementById("board"),
  toggleBtn: document.getElementById("toggle-btn"),
  randomBtn: document.getElementById("random-btn"),
  clearBtn: document.getElementById("clear-btn"),
  statusEl: document.getElementById("status"),
});
