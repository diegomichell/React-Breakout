/**
 * @author Diego Michel
 */
import React, {Component, useState, useRef, useEffect} from "react";
import Konva from "konva";
import {Circle, Layer, Rect, Stage} from "react-konva";
import StartGameModal from "./components/start-game-modal/StartGameModal";
import FinishedGameModal from "./components/finished-game-modal/FinishedGameModal";

import "./App.scss";

const HEIGHT = 495;
const WIDTH = 370;
const initialBallRadius = 10;
const initialBallX = WIDTH / 2 - initialBallRadius / 2;
const initialBallY = HEIGHT / 2 - initialBallRadius / 2;
const paddleHeight = 10;
const paddleWidth = 60;
const initialPaddleX = WIDTH / 2;
const initialPaddleY = HEIGHT - paddleHeight * 5;
const bricksWidth = 40;
const bricksHeight = 10;
const bricksRows = 5;
const bricksCols = 7;

class Game extends Component<GameProps> {
  state = {
    paddle: {
      x: initialPaddleX,
      y: initialPaddleY
    },
    ball: {
      x: initialBallX,
      y: initialBallY,
      radius: initialBallRadius,
      color: '#16817a'
    },
    bricks: this.initBricks(),
    velocityX: 0,
    velocityY: 0
  };

  initBricks() {
    const bricks: Brick[] = [];
    let x = 12.5;
    let y = 40;

    for (let v = 0; v < bricksRows; v++) {
      const rowColor = Konva.Util.getRandomColor();

      for (let h = 0; h < bricksCols; h++) {
        bricks.push({x, y, color: rowColor});
        x += 50;
      }

      y += 20;
      x = 12.5;
    }

    return bricks;
  }

  componentDidMount() {
    window.onmousemove = (e) => {
      const x = e.offsetX;

      if (x + paddleWidth / 2 >= WIDTH || x - paddleWidth / 2 <= 0) {
        return;
      }

      setTimeout(() => {
        this.setState({
          paddle: {
            ...this.state.paddle,
            x,
          }
        });
      }, 30);
    };

  }

  startGame() {
    this.restartPositionAndVelocityOfBall();
    // If need to reset bricks for a new game
    if(this.state.bricks.length !== bricksCols * bricksRows) {
      this.setState({bricks: this.initBricks()});
    }
    this.runGameLoop();
  }

  runGameLoop() {
    const {lives, onDie, onScore, onFinished} = this.props;
    const {bricks, ball, velocityX, velocityY} = this.state;
    const updatedBall = {
      ...ball,
      x: ball.x + velocityX,
      y: ball.y + velocityY
    };

    // move ball
    this.setState({
      ball: updatedBall
    });

    // bounce off right edge of window
    if ((updatedBall.x + updatedBall.radius) >= WIDTH) {
      this.setState({
        velocityX: -velocityX
      });
    }
    // bounce off left edge of window
    else if (updatedBall.x <= 0) {
      this.setState({
        velocityX: -velocityX
      });
    }
    // bounce off BOTTOM edge of window
    else if (updatedBall.y + updatedBall.radius >= HEIGHT) {
      onDie();
      this.restartPositionAndVelocityOfBall();
    }
    // bounce off TOP edge of window
    else if (updatedBall.y <= 0) {
      this.setState({
        velocityY: -velocityY
      });
    }

    const brickHit = this.detectCollisionWithBricks();
    const paddleHit = this.detectCollisionWithPaddle();

    if (brickHit) {
      this.setState({
        bricks: [...bricks.filter(b => b !== brickHit)],
        velocityY: -velocityY
      });
      onScore();
    }

    if (paddleHit) {
      this.setState({
        velocityY: -velocityY
      });
    }

    if (lives > 0 && bricks.length > 0) {
      setTimeout(this.runGameLoop.bind(this), 5);
    } else  {
      onFinished(bricks.length === 0);
    }
  }

  detectCollisionWithBricks() {
    const {ball, bricks} = this.state;
    return bricks.find(brick => {
      return this.haveIntersection(
        {x: ball.x, y: ball.y, width: ball.radius, height: ball.radius},
        {x: brick.x, y: brick.y, width: bricksWidth, height: bricksHeight}
      );
    });
  }

  detectCollisionWithPaddle() {
    const {ball, paddle} = this.state;
    return this.haveIntersection(
      {x: ball.x, y: ball.y, width: ball.radius, height: ball.radius},
      {x: paddle.x - paddleWidth / 2, y: paddle.y, width: paddleWidth, height: paddleHeight}
    );
  }

  haveIntersection(r1: Box, r2: Box) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }

  restartPositionAndVelocityOfBall() {
    const rand = Math.random();

    if (rand >= 0 && rand < 0.33) {
      this.setState({
        velocityX: -1,
        velocityY: 1.5
      });
    } else if (rand >= 0.33 && rand < 0.66) {
      this.setState({
        velocityX: 2,
        velocityY: 1.75
      });
    } else {
      this.setState({
        velocityX: 1.25,
        velocityY: 1
      });
    }

    this.setState({
      ball: {
        ...this.state.ball,
        x: initialBallX,
        y: initialBallY
      }
    });
  }

  renderBricks() {
    return this.state.bricks.map((brick, i) => (
      <Rect
        key={i}
        x={brick.x}
        y={brick.y}
        width={bricksWidth}
        height={bricksHeight}
        fill={brick.color}
        shadowBlur={2}
        cornerRadius={2}
      />
    ));
  }

  render() {
    const {paddle, ball} = this.state;
    return (
      <>
        {this.renderBricks()}
        <Circle
          x={ball.x}
          y={ball.y}
          radius={ball.radius}
          fill={ball.color}
        />
        <Rect
          x={paddle.x - paddleWidth / 2}
          y={paddle.y}
          width={paddleWidth}
          height={paddleHeight}
          cornerRadius={5}
          fill="orange"
        />
      </>
    )
  }
}

const App = () => {
  const gameRef: React.MutableRefObject<Game|any> = useRef(null);
  const [lives, setLives] = useState(0);
  const [scores, setScores] = useState(0);
  const [showStart, setShowStart] = useState(true);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState({isFinished: false, didWin: false});

  useEffect(() => {
    if(lives === 3) {
      gameRef.current.startGame();
    }
  }, [lives]);

  return (
    <div className="container App">
      <h1 className="app-title">Breakout</h1>
      <span className="app-description">React breakout game</span>
      <div className="game-info">
        <span className="lives mr-5"><strong>Lives:</strong> {lives}</span>
        <span className="scores mr-5"><strong>Scores:</strong> {scores}</span>
        {username && <span className="username"><strong>Player:</strong> {username}</span>}
      </div>
      <StartGameModal
        show={showStart}
        handleClose={() => setShowStart(false)}
        onStart={user => {
          setUsername(user);
          setLives(3);
        }}
      />
      <FinishedGameModal
        show={status.isFinished}
        didWin={status.didWin}
        handleClose={() => setStatus({...status, isFinished: false})}
        onPlayAgain={() => {
          setScores(0);
          setLives(3);
        }}
      />
      <Stage
        className="game-stage"
        width={WIDTH}
        height={HEIGHT}
        style={{width: WIDTH, height: HEIGHT}}
      >
        <Layer>
          <Game
            ref={gameRef}
            onFinished={didWin => setStatus({isFinished: true, didWin})}
            lives={lives}
            onDie={() => {
              setLives(lives - 1);
            }}
            onScore={() => {
              setScores(scores + 1);
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
