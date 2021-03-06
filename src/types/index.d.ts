interface GameProps {
  lives: number,
  onDie: Function,
  onScore: Function,
  onFinished: (didWin: boolean) => void
}

interface Brick {
  x: number;
  y: number;
  color: string
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number
}