
export enum GameState {
  START = 'START',
  TUTORIAL = 'TUTORIAL',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  NAME_ENTRY = 'NAME_ENTRY',
  RANKING = 'RANKING'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum ObstacleType {
  REP = 'REP',
  PAPER = 'PAPER',
  SUSPENDED_FILES = 'SUSPENDED_FILES'
}

export interface Obstacle extends GameObject {
  type: ObstacleType;
  passed: boolean;
}

export interface HighScore {
  name: string;
  score: number;
}
