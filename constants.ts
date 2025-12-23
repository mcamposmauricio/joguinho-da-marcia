
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;
export const GROUND_Y = 495; // 330 * 1.5
export const CHARACTER_X = 150; // 100 * 1.5
export const CHARACTER_WIDTH = 159; // 106 * 1.5
export const CHARACTER_HEIGHT = 318; // 212 * 1.5
export const GRAVITY = 0.675; // 0.45 * 1.5
export const JUMP_FORCE = -17.25; // -11.5 * 1.5
export const INITIAL_SPEED = 5.25; // 3.5 * 1.5
export const SPEED_INCREMENT = 0.003; 
export const OBSTACLE_MIN_GAP = 9000; 
export const OBSTACLE_RANDOM_GAP = 5250; 

/**
 * ASSETS:
 * Mapeamento direto usando as strings do enum ObstacleType como chaves.
 * Convertidos para links RAW para garantir o carregamento no Canvas.
 */
export const ASSETS = {
  CHARACTER: 'https://raw.githubusercontent.com/mcamposmauricio/joguinho-da-marcia/eac93681a51169aa65d25c917c92ee62e28a90cf/image.png', 
  REP: 'https://raw.githubusercontent.com/mcamposmauricio/joguinho-da-marcia/3161d8ab68b2759fd71ab20dcd0980a2aaab78ed/control-id-fundo-transparente.png',
  PAPER: 'https://raw.githubusercontent.com/mcamposmauricio/joguinho-da-marcia/328329fdd200b602b39115f1abc2dd7c34ac3221/stack-of-old-papers-on-transparent-background-free-png.webp',
  SUSPENDED_FILES: 'https://raw.githubusercontent.com/mcamposmauricio/joguinho-da-marcia/0045db80e1fb2f4d815b9e935603ba942335ca58/Google-Gmail-Logo-PNG-Picture.png',
};

export const COLORS = {
  MARQ_BLUE: '#0066FF',
  MARQ_DARK: '#0f172a',
  OFFICE_FLOOR: '#1e293b', 
  OFFICE_WALL: '#94a3b8',  
  REP_RED: '#ef4444',
  PAPER_WHITE: '#ffffff'
};
