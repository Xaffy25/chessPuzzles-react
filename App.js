import {  useRef, useState } from 'react';
import {Chess} from 'chess.js';

import { Chessboard } from 'react-chessboard';
var currentmove = 0;
export default function App({ boardWidth }) {
  var Fen = "r1bqk2r/pp3pp1/2p1p2p/4N3/2PpP2P/1Q2b3/PP2P1P1/1K1R1B1R b kq - 0 1";
  var Moves = ["h6h5","b3e3","d4e3","d1d8","e8d8","e5f7","d8e7","f7h8"];
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess(Fen));
  var GameStarted = false;
  const [arrows, setArrows] = useState([]);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [currentTimeout, setCurrentTimeout] = useState(undefined);

    function start() {
    GameStarted = true;
    console.log(GameStarted);
    var move1s =  Moves[currentmove].match(/.{1,2}/g);
    const gameCopy = { ...game };
    console.log(move1s);
    safeGameMutate((gameCopy) => {
      gameCopy.move({
        from: move1s[0],
        to: move1s[1],
        promotion:"q"
      });
    });
    currentmove++;
    console.log(currentmove);
    
  }
  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }
  function checkCorrectMove(sourceSquare,targetSquare) {
    var x =  Moves[currentmove].match(/.{1,2}/g);
    if (sourceSquare == x[0] && targetSquare == x[1]) {
      return true;
    }
    return false;
  }
  /*function makeRandomMove() {
    const possibleMoves = game.moves();

    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex]);
    });
  }
  */
  function MakeNextMove(){
    var move1s =  Moves[currentmove].match(/.{1,2}/g);
    console.log("Moving " +Moves[0]);
    const gameCopy = { ...game };
    safeGameMutate((gameCopy) => {
      gameCopy.move({
        from: move1s[0],
        to: move1s[1],
        promotion:"q"
      });
    })
    currentmove++;
    console.log(currentmove);
    
  }
  function onDrop(sourceSquare, targetSquare) {
    if (!checkCorrectMove(sourceSquare,targetSquare) && GameStarted && currentmove <= 8) return false;
    console.log("Moving " +Moves[0]);
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });
    setGame(gameCopy);

    if (move === null) return false;
    currentmove++;
    console.log(currentmove);

    console.log('Remaining Moves : ' + Moves.toString());
    const newTimeout = setTimeout(MakeNextMove, 200);
    setCurrentTimeout(newTimeout);
    return true;
  }

  return (
    <div style={{padding: '100px'}}>
      <Chessboard
        id="PlayVsRandom"
        animationDuration={200}
        boardOrientation={boardOrientation}
        boardWidth={boardWidth}
        customArrows={arrows}
        position={game.fen()}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        ref={chessboardRef}
        
      />
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
          });
          clearTimeout(currentTimeout);
        }}
      >
        reset
      </button>
      <button
        className="rc-button"
        onClick={() => {
          setBoardOrientation((currentOrientation) => (currentOrientation === 'white' ? 'black' : 'white'));
        }}
      >
        flip board
      </button>
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.undo();
          });
          clearTimeout(currentTimeout);
        }}
      >
        undo
      </button>
      <button
        onClick={start}
        disabled={GameStarted}
      >
        Start Game
      </button>
    </div>
  );
}