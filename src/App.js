/** @format */

import React, { useEffect, useMemo, useState } from "react";
import InitScreen from "./components/InitScreen";
import PlayScreen from "./components/PlayScreen";
import SelectBetModal from "./components/SelectBetModal";
import WinnerScreen from "./components/WinnerScreen";
import "./App.css";

const SUITS = ["♥", "♦", "♣", "♠"];
const SUIT_COLORS = {
 "♥": "#ff4d4f",
 "♦": "#ff4d4f",
 "♣": "#f5f5f5",
 "♠": "#f5f5f5",
};

const DEFAULT_POSITIONS = { "♥": 0, "♦": 0, "♣": 0, "♠": 0 };

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

const createPlayerId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const buildPlayer = (name, suit, drinks, id = createPlayerId()) => ({
 id,
 name,
 suit,
 drinks,
});

const hydratePlayers = (savedState) => {
 if (!savedState) {
  return [];
 }

 const rawPlayers = savedState.players;
 if (!Array.isArray(rawPlayers)) {
  return [];
 }

 if (rawPlayers.length === 0) {
  return [];
 }

 if (typeof rawPlayers[0] === "string") {
  const savedBets = savedState.bets || {};
  return rawPlayers.map((name, index) =>
   buildPlayer(
    name,
    savedBets[name]?.suit || SUITS[index % SUITS.length],
    savedBets[name]?.drinks || 1
   )
  );
 }

 return rawPlayers.map((player, index) =>
  buildPlayer(
   player.name || `Player ${index + 1}`,
   player.suit || SUITS[index % SUITS.length],
   player.drinks || 1,
   player.id || createPlayerId()
  )
 );
};

const createDeck = () => {
 const newDeck = [];
 SUITS.forEach((suit) => {
  for (let value = 2; value <= 10; value += 1) {
   newDeck.push({ suit, value });
  }
  ["J", "Q", "K"].forEach((face) => {
   newDeck.push({ suit, value: face });
  });
 });
 return shuffleDeck(newDeck);
};

const shuffleDeck = (deck) => {
 const shuffled = [...deck];
 for (let index = shuffled.length - 1; index > 0; index -= 1) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
 }
 return shuffled;
};

function App() {
 const savedState = useMemo(() => loadState(), []);

 const [gameState, setGameState] = useState(savedState?.gameState || "setup");
 const [players, setPlayers] = useState(() => hydratePlayers(savedState));
 const [playerInput, setPlayerInput] = useState("");
 const [pendingPlayerName, setPendingPlayerName] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [horsePositions, setHorsePositions] = useState(
  savedState?.horsePositions || { ...DEFAULT_POSITIONS }
 );
 const [sideCards, setSideCards] = useState(savedState?.sideCards || []);
 const [revealedSideCards, setRevealedSideCards] = useState(savedState?.revealedSideCards || []);
 const [deck, setDeck] = useState(savedState?.deck || []);
 const [currentCard, setCurrentCard] = useState(savedState?.currentCard || null);
 const [winner, setWinner] = useState(savedState?.winner || null);

 useEffect(() => {
  const state = {
   gameState,
   players,
   horsePositions,
   sideCards,
   revealedSideCards,
   deck,
   currentCard,
   winner,
  };
  localStorage.setItem("horseRacingGame", JSON.stringify(state));
 }, [gameState, players, horsePositions, sideCards, revealedSideCards, deck, currentCard, winner]);

 const openModal = () => {
  if (!playerInput.trim()) {
   return;
  }

  const alreadyExists = players.some(
   (player) => player.name.toLowerCase() === playerInput.trim().toLowerCase()
  );

  if (alreadyExists) {
   alert("Player name already exists.");
   setPlayerInput("");
   return;
  }

  setPendingPlayerName(playerInput.trim());
  setPlayerInput("");
  setIsModalOpen(true);
 };

 const closeModal = (restoreInput = false) => {
  if (restoreInput && pendingPlayerName) {
   setPlayerInput(pendingPlayerName);
  }
  setPendingPlayerName("");
  setIsModalOpen(false);
 };

 const confirmPlayer = ({ suit, drinks }) => {
  if (!pendingPlayerName) {
   return;
  }
  setPlayers((prevPlayers) => [...prevPlayers, buildPlayer(pendingPlayerName, suit, drinks)]);
  closeModal();
 };

 const removePlayer = (playerId) => {
  setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== playerId));
 };

 const startGame = () => {
  if (players.length === 0) {
   return;
  }

  const freshDeck = createDeck();
  setSideCards(freshDeck.slice(0, 5));
  setDeck(freshDeck.slice(5));
  setRevealedSideCards([]);
  setHorsePositions({ ...DEFAULT_POSITIONS });
  setCurrentCard(null);
  setWinner(null);
  setGameState("play");
 };

 const drawCard = () => {
  if (deck.length === 0 || winner) {
   return;
  }

  const [drawnCard, ...restDeck] = deck;
  setDeck(restDeck);
  setCurrentCard(drawnCard);

  setHorsePositions((prevPositions) => {
   const updated = { ...prevPositions, [drawnCard.suit]: prevPositions[drawnCard.suit] + 1 };

   const minPosition = Math.min(...Object.values(updated));
   const nextStageIndex = revealedSideCards.length;

   if (minPosition > nextStageIndex && nextStageIndex < 5) {
    const stagedCard = sideCards[nextStageIndex];
    setRevealedSideCards((prevCards) => [...prevCards, stagedCard]);

    if (updated[stagedCard.suit] > 0) {
     updated[stagedCard.suit] -= 1;
    }
   }

   const winningSuit = Object.keys(updated).find((suit) => updated[suit] >= 5);
   if (winningSuit) {
    setWinner(winningSuit);
    setGameState("winner");
   }

   return updated;
  });
 };

 const resetGame = () => {
  setGameState("setup");
  setPlayers([]);
  setPlayerInput("");
  setPendingPlayerName("");
  setIsModalOpen(false);
  setHorsePositions({ ...DEFAULT_POSITIONS });
  setSideCards([]);
  setRevealedSideCards([]);
  setDeck([]);
  setCurrentCard(null);
  setWinner(null);
  localStorage.removeItem("horseRacingGame");
 };

 return (
  <div className="App">
   <h1>🐎 Horse Racing 🐎</h1>

   {gameState === "setup" && (
    <>
     <InitScreen
      players={players}
      playerInput={playerInput}
      onPlayerInputChange={setPlayerInput}
      onAddPlayer={openModal}
      onRemovePlayer={removePlayer}
      onStartGame={startGame}
      suitColors={SUIT_COLORS}
     />
     <SelectBetModal
      isOpen={isModalOpen}
      playerName={pendingPlayerName}
      suits={SUITS}
      suitColors={SUIT_COLORS}
      onConfirm={confirmPlayer}
      onCancel={() => closeModal(true)}
     />
    </>
   )}

   {gameState === "play" && (
    <PlayScreen
     suits={SUITS}
     suitColors={SUIT_COLORS}
     horsePositions={horsePositions}
     sideCards={sideCards}
     revealedSideCards={revealedSideCards}
     currentCard={currentCard}
     deckLength={deck.length}
     onDrawCard={drawCard}
     isWinner={Boolean(winner)}
    />
   )}

   {gameState === "winner" && (
    <>
     <PlayScreen
      suits={SUITS}
      suitColors={SUIT_COLORS}
      horsePositions={horsePositions}
      sideCards={sideCards}
      revealedSideCards={revealedSideCards}
      currentCard={currentCard}
      deckLength={deck.length}
      onDrawCard={drawCard}
      isWinner
     />
     {winner && (
      <WinnerScreen
       winnerSuit={winner}
       suitColors={SUIT_COLORS}
       players={players}
       onReset={resetGame}
      />
     )}
    </>
   )}
  </div>
 );
}

export default App;
