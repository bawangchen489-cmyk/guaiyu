
import React, { useState, useEffect, useRef } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOS } from '../constants';
import { TetrisPiece, TetrisPosition } from '../types';

interface TetrisGameProps {
  active: boolean;
  controlRef: React.MutableRefObject<any>;
}

const getRandomTetromino = () => {
  const keys = 'IJLOSTZ';
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randKey];
};

const TetrisGame: React.FC<TetrisGameProps> = ({ active, controlRef }) => {
  const [board, setBoard] = useState<(string | number)[][]>(() => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [position, setPosition] = useState<TetrisPosition>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const spawnPiece = () => {
    const piece = getRandomTetromino();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    setCurrentPiece(piece);
    setPosition(startPos);
    if (checkCollision(piece.shape, startPos, board)) {
      setGameOver(true);
    }
  };

  const checkCollision = (pieceShape: number[][], pos: TetrisPosition, currentBoard: (string | number)[][]) => {
    for (let y = 0; y < pieceShape.length; y++) {
      for (let x = 0; x < pieceShape[y].length; x++) {
        if (pieceShape[y][x] !== 0) {
          const newY = y + pos.y;
          const newX = x + pos.x;
          if (newY >= BOARD_HEIGHT || newX < 0 || newX >= BOARD_WIDTH || (newY >= 0 && (!currentBoard[newY] || currentBoard[newY][newX] !== 0))) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    if (!currentPiece) return;
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && y + position.y >= 0) {
          newBoard[y + position.y][x + position.x] = currentPiece.color;
        }
      });
    });

    let linesCleared = 0;
    const sweptBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (sweptBoard.length < BOARD_HEIGHT) {
      sweptBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    setBoard(sweptBoard);
    setScore(prev => prev + linesCleared * 100);
    spawnPiece();
  };

  const move = (dir: number) => {
    if (!currentPiece || gameOver) return;
    if (!checkCollision(currentPiece.shape, { x: position.x + dir, y: position.y }, board)) {
      setPosition(prev => ({ ...prev, x: prev.x + dir }));
    }
  };

  const moveDown = () => {
    if (!currentPiece || gameOver) return;
    if (!checkCollision(currentPiece.shape, { x: position.x, y: position.y + 1 }, board)) {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      mergePiece();
    }
  };

  const rotate = () => {
    if (!currentPiece || gameOver) return;
    const rotatedShape = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
    if (!checkCollision(rotatedShape, position, board)) {
      setCurrentPiece({ ...currentPiece, shape: rotatedShape });
    }
  };

  useEffect(() => {
    if (active && !currentPiece && !gameOver) spawnPiece();
  }, [active, currentPiece, gameOver]);

  useEffect(() => {
    if (!active || gameOver) return;
    const animate = (time: number) => {
      if (lastTimeRef.current !== undefined) {
        // Fall speed: 800ms
        if (time - lastTimeRef.current > 800) {
          moveDown();
          lastTimeRef.current = time;
        }
      } else {
        lastTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [active, gameOver, currentPiece, position, board]);

  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        moveLeft: () => move(-1),
        moveRight: () => move(1),
        moveDown: () => moveDown(),
        rotate: () => rotate()
      };
    }
  }, [currentPiece, position, board, active]);

  const displayBoard = board.map(row => [...row]);
  if (currentPiece && !gameOver) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const drawY = y + position.y;
          const drawX = x + position.x;
          if (drawY >= 0 && drawY < BOARD_HEIGHT && drawX >= 0 && drawX < BOARD_WIDTH) {
            displayBoard[drawY][drawX] = currentPiece.color;
          }
        }
      });
    });
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/90 text-[#ffeb3b] font-mono p-4">
        <h2 className="text-xl font-bold mb-2">游戏结束</h2>
        <p>得分: {score}</p>
        <button 
          onClick={() => { 
            setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))); 
            setGameOver(false); 
            setScore(0); 
            spawnPiece(); 
          }} 
          className="mt-4 border-2 border-[#ffeb3b] px-4 py-1 text-xs hover:bg-[#ffeb3b] hover:text-black transition-colors"
        >
          重新开始
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1a1a1a] p-1 flex flex-col font-mono relative">
      <div className="flex-1 grid grid-rows-15 gap-px border-2 border-[#333] bg-[#0a0a0a]">
        {displayBoard.map((row, y) => (
          <div key={y} className="grid grid-cols-10 gap-px">
            {row.map((cell, x) => (
              <div 
                key={x} 
                className={`w-full h-full ${cell !== 0 ? (cell as string) + ' border-[0.5px] border-black/20' : 'bg-[#151515]'}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute top-1 right-2 text-[10px] font-bold text-white z-30">SCORE: {score}</div>
    </div>
  );
};

export default TetrisGame;
