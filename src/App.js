import {  useRef, useState } from 'react';
import {Chess} from 'chess.js';
import axios from 'axios';
import { Chessboard } from 'react-chessboard';

const options = {
  method: 'GET',
  url: 'https://chess-puzzles.p.rapidapi.com/',
  params: {
    themes: '["middlegame","advantage"]',
    rating: '1500',
    themesType: 'ALL',
    playerMoves: '4',
    count: '25'
  },
  headers: {
    'content-type': 'application/octet-stream',
    'X-RapidAPI-Key': 'xxxxxxxxxxxxxxxxxxxxxxxx',
    'X-RapidAPI-Host': 'chess-puzzles.p.rapidapi.com'
  }
};

var currentmove = 0;
var currentpuzzle = 0;
var puzzles = [];
var Fens = [];
var Moveslist = [];
var Fen = 'start';
var Moves = [];
var isStarted = false;
var info = '';

var streak = 0;
export default function App({ boardWidth , puzzleNo}) {
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess(Fen));
  const [arrows, setArrows] = useState([]);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [currentTimeout, setCurrentTimeout] = useState(undefined);
  function GetPuzzles() {
    if (isStarted) return;
  
    try {
      axios.request(options).then((data) => {
      puzzles = data.data.puzzles;
    });
    } catch (error) {
      console.error(error);
    }
    const newTimeout = setTimeout(mapPuzzles,1000);
    setCurrentTimeout(newTimeout);
    isStarted = true;
  }
  function mapPuzzles() {
    puzzles.map ((item) => {
      Fens.push(item.fen);
      Moveslist.push(item.moves);
    });
  }
  GetPuzzles();
  function NextPuzzle(){
    currentmove=0;
    currentpuzzle++;
    info = '';
    console.log(Fens[currentpuzzle]);
    console.log(Moveslist[currentpuzzle])
    safeGameMutate((game) => {
      game.load(Fens[currentpuzzle]);
    });
    Moves = Moveslist[currentpuzzle];
    const newTimeout = setTimeout(start, 500);
    setCurrentTimeout(newTimeout);
  }
    function start() {
    currentmove = 0;
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
    if (sourceSquare === x[0] && targetSquare === x[1]) {
      if(currentmove === 7) {
        info = "Udało ci się przejść zagadkę!";
        return true;
      }
      info = "Poprawny ruch!";
      streak ++;
      console.log(streak);
      if (streak >= 2) {
        info += (" X" + streak);
      } 
      return true;
    }
    streak = 0;
    info = "Niepoprawny ruch!";
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
    if (currentmove === 8) return;
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
    
  }
  function onDrop(sourceSquare, targetSquare) {
    if (currentmove === 8) return false;
    if (!checkCorrectMove(sourceSquare,targetSquare)) return false;
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });
    setGame(gameCopy);

    if (move === null) return false;
    currentmove++;
    const newTimeout = setTimeout(MakeNextMove, 200);
    setCurrentTimeout(newTimeout);
    return true;
  }

  return (
    <div style={{padding: '100px'}}>
      <Chessboard
        id="Puzzle"
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
          setBoardOrientation((currentOrientation) => (currentOrientation === 'white' ? 'black' : 'white'));
        }}
      >
        Obróć szachownicę
      </button>
      <button
        onClick={NextPuzzle}>
        Kolejna zagadka
      </button>
      <br/><br/>
      <p>
        {info}
      </p>
    </div>
  );
}
