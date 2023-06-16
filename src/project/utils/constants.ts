import { Point } from "pixi.js";

/** El tamaño de la grilla */
export const GRID_SIZE: Point = new Point(6, 10);
/** El tamaño de cada celda */
export const CELL_SIZE: Point = new Point(1, 1);
/** El tamaño real del tablero */
export const BOARD_SIZE: Point = new Point(GRID_SIZE.x * CELL_SIZE.x, GRID_SIZE.y * CELL_SIZE.y);
