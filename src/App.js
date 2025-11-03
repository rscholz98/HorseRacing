/** @format */

import React, { useState, useEffect } from "react";
import "./App.css";

const SUITS = ["♥", "♦", "♣", "♠"];
const SUIT_NAMES = ["Hearts", "Diamonds", "Clubs", "Spades"];
const SUIT_COLORS = {
 "♥": "#e74c3c",
 "♦": "#e74c3c",
 "♣": "#2c3e50",
 "♠": "#2c3e50",
};

// Load state from localStorage
const loadState = () => {
 try {
  const savedState = localStorage.getItem("horseRacingGame");
  if (savedState) {
   return JSON.parse(savedState);
  }
 } catch (error) {
  console.error("Error loading state:", error);
 }
 return null;
};

function App() {
 const savedState = loadState();

 const [gameState, setGameState] = useState(savedState?.gameState || "setup");
 const [players, setPlayers] = useState(savedState?.players || []);
 const [playerInput, setPlayerInput] = useState("");
 const [bets, setBets] = useState(savedState?.bets || {});
 const [horsePositions, setHorsePositions] = useState(
  savedState?.horsePositions || { "♥": 0, "♦": 0, "♣": 0, "♠": 0 }
 );
 const [sideCards, setSideCards] = useState(savedState?.sideCards || []);
 const [revealedSideCards, setRevealedSideCards] = useState(savedState?.revealedSideCards || []);
 const [deck, setDeck] = useState(savedState?.deck || []);
 const [currentCard, setCurrentCard] = useState(savedState?.currentCard || null);
 const [winner, setWinner] = useState(savedState?.winner || null);

 // Save state to localStorage whenever it changes
 useEffect(() => {
  const state = {
   gameState,
   players,
   bets,
   horsePositions,
   sideCards,
   revealedSideCards,
   deck,
   currentCard,
   winner,
  };
  localStorage.setItem("horseRacingGame", JSON.stringify(state));
 }, [
  gameState,
  players,
  bets,
  horsePositions,
  sideCards,
  revealedSideCards,
  deck,
  currentCard,
  winner,
 ]);

 // Initialize deck
 const createDeck = () => {
  const newDeck = [];
  SUITS.forEach((suit) => {
   for (let i = 2; i <= 10; i++) {
    newDeck.push({ suit, value: i });
   }
   ["J", "Q", "K"].forEach((value) => {
    newDeck.push({ suit, value });
   });
  });
  return shuffleDeck(newDeck);
 };

 const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
 };

 const addPlayer = () => {
  if (playerInput.trim() && !players.includes(playerInput.trim())) {
   setPlayers([...players, playerInput.trim()]);
   setPlayerInput("");
  }
 };

 const removePlayer = (playerName) => {
  setPlayers(players.filter((p) => p !== playerName));
 };

 const startBetting = () => {
  if (players.length === 0) {
   alert("Please add at least one player!");
   return;
  }

  const initialBets = {};
  players.forEach((player) => {
   initialBets[player] = { suit: null, drinks: 1 };
  });
  setBets(initialBets);

  const newDeck = createDeck();
  const side = newDeck.slice(0, 5);
  const remainingDeck = newDeck.slice(5);

  setSideCards(side);
  setDeck(remainingDeck);
  setRevealedSideCards([]);

  setGameState("betting");
 };

 const updateBet = (player, field, value) => {
  setBets({
   ...bets,
   [player]: {
    ...bets[player],
    [field]: value,
   },
  });
 };

 const startRacing = () => {
  // Check if all players have placed bets
  const allBetsPlaced = players.every((player) => bets[player].suit !== null);
  if (!allBetsPlaced) {
   alert("All players must place their bets!");
   return;
  }
  setGameState("racing");
 };

 const drawCard = () => {
  if (deck.length === 0 || winner) return;

  const drawnCard = deck[0];
  const remainingDeck = deck.slice(1);

  setDeck(remainingDeck);
  setCurrentCard(drawnCard);

  const newPositions = { ...horsePositions };
  newPositions[drawnCard.suit] += 1;

  // Check if all horses have reached or passed the current stage
  const minPosition = Math.min(...Object.values(newPositions));
  const nextStageToReveal = revealedSideCards.length;

  // If all horses are at position 1 or higher, reveal first card (stage 0)
  // If all horses are at position 2 or higher, reveal second card (stage 1), etc.
  if (minPosition > nextStageToReveal && nextStageToReveal < 5) {
   const revealedCard = sideCards[nextStageToReveal];
   setRevealedSideCards([...revealedSideCards, revealedCard]);

   // Move the revealed card's suit back one position
   if (newPositions[revealedCard.suit] > 0) {
    newPositions[revealedCard.suit] -= 1;
   }
  }

  setHorsePositions(newPositions);

  // Check for winner (needs to reach position 5)
  const winnerSuit = Object.keys(newPositions).find((suit) => newPositions[suit] >= 5);
  if (winnerSuit) {
   setWinner(winnerSuit);
   setGameState("finished");
  }
 };

 const resetGame = () => {
  setGameState("setup");
  setPlayers([]);
  setPlayerInput("");
  setBets({});
  setHorsePositions({ "♥": 0, "♦": 0, "♣": 0, "♠": 0 });
  setSideCards([]);
  setRevealedSideCards([]);
  setDeck([]);
  setCurrentCard(null);
  setWinner(null);
  // Clear localStorage
  localStorage.removeItem("horseRacingGame");
 };

 const getWinners = () => {
  return players.filter((player) => bets[player].suit === winner);
 };

 // Render different screens based on game state
 if (gameState === "setup") {
  return (
   <div className="App">
    <h1>🐎 Horse Racing Drinking Game 🐎</h1>
    <div className="setup-container">
     <h2>Add Players</h2>
     <div className="player-input">
      <input
       type="text"
       value={playerInput}
       onChange={(e) => setPlayerInput(e.target.value)}
       onKeyPress={(e) => e.key === "Enter" && addPlayer()}
       placeholder="Enter player name"
      />
      <button onClick={addPlayer}>Add Player</button>
     </div>

     <div className="player-list">
      {players.map((player) => (
       <div key={player} className="player-item">
        <span>{player}</span>
        <button onClick={() => removePlayer(player)}>Remove</button>
       </div>
      ))}
     </div>

     <button className="start-button" onClick={startBetting} disabled={players.length === 0}>
      Start Game
     </button>
    </div>
   </div>
  );
 }

 if (gameState === "betting") {
  return (
   <div className="App">
    <h1>🐎 Horse Racing - Place Your Bets 🐎</h1>
    <div className="betting-container">
     <h2>Each player: Choose a suit and number of drinks</h2>

     <div className="betting-grid">
      {players.map((player) => (
       <div key={player} className="bet-row">
        <div className="player-name">{player}</div>

        <div className="suit-selection">
         {SUITS.map((suit, idx) => (
          <button
           key={suit}
           className={`suit-button ${bets[player].suit === suit ? "selected" : ""}`}
           style={{
            color: SUIT_COLORS[suit],
            borderColor: bets[player].suit === suit ? SUIT_COLORS[suit] : "#ddd",
           }}
           onClick={() => updateBet(player, "suit", suit)}
          >
           {suit} {SUIT_NAMES[idx]}
          </button>
         ))}
        </div>

        <div className="drinks-selection">
         <label>Drinks:</label>
         <input
          type="number"
          min="1"
          max="20"
          value={bets[player].drinks}
          onChange={(e) => updateBet(player, "drinks", parseInt(e.target.value) || 1)}
         />
        </div>
       </div>
      ))}
     </div>

     <button className="start-button" onClick={startRacing}>
      Start Racing!
     </button>
    </div>
   </div>
  );
 }

 if (gameState === "racing" || gameState === "finished") {
  return (
   <div className="App">
    <h1>🐎 Horse Racing 🐎</h1>

    <div className="race-container">
     {/* Side cards column - 5th column aligned with horses */}
     <div className="horse-column">
      <div className="column-header">Side Deck</div>
      {[4, 3, 2, 1, 0].map((idx) => (
       <div
        key={idx}
        className={`side-card ${revealedSideCards.length > idx ? "revealed" : "hidden"}`}
       >
        {revealedSideCards.length > idx ? (
         <span style={{ color: SUIT_COLORS[sideCards[idx].suit], fontSize: "1.5rem" }}>
          {sideCards[idx].suit}
          {sideCards[idx].value}
         </span>
        ) : (
         <span style={{ fontSize: "2rem" }}>🂠</span>
        )}
       </div>
      ))}
      <div className="suit-label">&nbsp;</div>
     </div>

     {/* Horse racing columns */}
     {SUITS.map((suit) => (
      <div key={suit} className="horse-column">
       <div className="column-header">🏁</div>
       {[4, 3, 2, 1, 0].map((pos) => (
        <div key={pos} className="track-cell">
         {horsePositions[suit] === pos && <div className="horse">🐎</div>}
        </div>
       ))}
       <div className="suit-label" style={{ color: SUIT_COLORS[suit] }}>
        {suit}
       </div>
      </div>
     ))}
    </div>

    {/* Draw card controls - directly under columns */}
    <div className="card-controls">
     <button className="draw-button" onClick={drawCard} disabled={deck.length === 0 || winner}>
      Draw Card ({deck.length} left)
     </button>

     {currentCard && (
      <div className="current-card">
       <span style={{ color: SUIT_COLORS[currentCard.suit] }}>
        {currentCard.suit}
        {currentCard.value}
       </span>
      </div>
     )}
    </div>

    {/* Winner screen */}
    {gameState === "finished" && (
     <div className="winner-overlay">
      <div className="winner-box">
       <h2 style={{ color: SUIT_COLORS[winner] }}>🎉 {winner} WINS! 🎉</h2>
       <div className="winners">
        <h3>Winners can distribute:</h3>
        {getWinners().map((player) => (
         <div key={player}>
          {player}: {bets[player].drinks * 2} drinks (doubled!)
         </div>
        ))}
       </div>
       <button className="reset-button" onClick={resetGame}>
        New Game
       </button>
      </div>
     </div>
    )}
   </div>
  );
 }

 return null;
}

export default App;
