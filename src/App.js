/** @format */

import React, { useEffect, useMemo, useRef, useState } from "react";
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

const MAX_PLAYER_NAME_LENGTH = 20;

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

const clampPlayerName = (rawName) => {
 const safeName = typeof rawName === "string" ? rawName.trim() : "";
 return safeName.slice(0, MAX_PLAYER_NAME_LENGTH);
};

const buildPlayer = (name, suit, drinks, id = createPlayerId()) => ({
 id,
 name: clampPlayerName(name),
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

 const deriveInitialGameState = () => {
  const previousState = savedState?.gameState;

  if (!previousState) {
   return "setup";
  }

  if (previousState === "betting") {
   return "setup";
  }

  if (previousState === "racing") {
   return "play";
  }

  if (previousState === "finished") {
   return savedState?.winner ? "winner" : "play";
  }

  return previousState;
 };

 const [gameState, setGameState] = useState(deriveInitialGameState);
 const [players, setPlayers] = useState(() => hydratePlayers(savedState));
 const [playerInput, setPlayerInput] = useState("");
 const [pendingPlayerName, setPendingPlayerName] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingPlayerId, setEditingPlayerId] = useState(null);
 const [horsePositions, setHorsePositions] = useState(
  savedState?.horsePositions || { ...DEFAULT_POSITIONS }
 );
 const [sideCards, setSideCards] = useState(savedState?.sideCards || []);
 const [revealedSideCards, setRevealedSideCards] = useState(savedState?.revealedSideCards || []);
 const [deck, setDeck] = useState(savedState?.deck || []);
 const [currentCard, setCurrentCard] = useState(savedState?.currentCard || null);
 const [winner, setWinner] = useState(savedState?.winner || null);
 const [horseAnimation, setHorseAnimation] = useState(null);
 const [flashingBonusIndices, setFlashingBonusIndices] = useState([]);
 const animationTimeoutsRef = useRef([]);
 const [isAnimating, setIsAnimating] = useState(false);
 const editingPlayer = useMemo(() => {
  if (!editingPlayerId) {
   return null;
  }
  return players.find((player) => player.id === editingPlayerId) || null;
 }, [editingPlayerId, players]);

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

 const PLAYER_NAME_ALIASES = {
  jens: "Jensi",
  oli: "OchsenCock",
  nils: "Ogrin",
  paul: "Paulie",
  florian: "Flori",
 };

 const normalizePlayerName = (rawName) => {
  const trimmed = rawName.trim();
  if (!trimmed) {
   return "";
  }

  const alias = PLAYER_NAME_ALIASES[trimmed.toLowerCase()];
  if (!alias) {
   return trimmed;
  }

  return alias;
 };

 const handlePlayerInputChange = (value) => {
  setPlayerInput(value.slice(0, MAX_PLAYER_NAME_LENGTH));
 };

 const openModal = () => {
  const normalizedName = normalizePlayerName(playerInput);

  if (!normalizedName) {
   return;
  }

  if (normalizedName.length > MAX_PLAYER_NAME_LENGTH) {
   alert(`Player names cannot exceed ${MAX_PLAYER_NAME_LENGTH} characters.`);
   setPlayerInput(clampPlayerName(normalizedName));
   return;
  }

  const sanitizedName = clampPlayerName(normalizedName);

  const alreadyExists = players.some(
   (player) => player.name.toLowerCase() === sanitizedName.toLowerCase()
  );

  if (alreadyExists) {
   alert("Player name already exists.");
   setPlayerInput("");
   return;
  }

  setPendingPlayerName(sanitizedName);
  setPlayerInput("");
  setEditingPlayerId(null);
  setIsModalOpen(true);
 };

 const closeModal = (restoreInput = false) => {
  const wasEditing = editingPlayerId !== null;

  if (restoreInput && pendingPlayerName && !wasEditing) {
   setPlayerInput(pendingPlayerName);
  }

  setPendingPlayerName("");
  setEditingPlayerId(null);
  setIsModalOpen(false);
 };

 const confirmPlayer = ({ suit, drinks }) => {
  if (!pendingPlayerName) {
   return;
  }

  if (pendingPlayerName.length > MAX_PLAYER_NAME_LENGTH) {
   alert(`Player names cannot exceed ${MAX_PLAYER_NAME_LENGTH} characters.`);
   return;
  }

  const duplicateName = players.some(
   (player) =>
    player.id !== editingPlayerId && player.name.toLowerCase() === pendingPlayerName.toLowerCase()
  );

  if (duplicateName) {
   alert("Player name already exists.");
   return;
  }

  if (editingPlayerId) {
   setPlayers((prevPlayers) =>
    prevPlayers.map((player) =>
     player.id === editingPlayerId
      ? { ...player, name: clampPlayerName(pendingPlayerName), suit, drinks }
      : player
    )
   );
  } else {
   setPlayers((prevPlayers) => [
    ...prevPlayers,
    buildPlayer(clampPlayerName(pendingPlayerName), suit, drinks),
   ]);
  }

  closeModal();
 };

 const removePlayer = (playerId) => {
  setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== playerId));
 };

 const editPlayer = (playerId) => {
  const targetPlayer = players.find((player) => player.id === playerId);
  if (!targetPlayer) {
   return;
  }

  setEditingPlayerId(playerId);
  setPendingPlayerName(clampPlayerName(targetPlayer.name));
  setPlayerInput("");
  setIsModalOpen(true);
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
  setHorseAnimation(null);
  setFlashingBonusIndices([]);
  setIsAnimating(false);
  setGameState("play");
 };

 const clearAnimationTimeouts = () => {
  animationTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
  animationTimeoutsRef.current = [];
 };

 useEffect(
  () => () => {
   clearAnimationTimeouts();
  },
  []
 );

 const scheduleAnimationTimeout = (callback, delay) => {
  const timeoutId = setTimeout(() => {
   callback();
   animationTimeoutsRef.current = animationTimeoutsRef.current.filter((id) => id !== timeoutId);
  }, delay);
  animationTimeoutsRef.current.push(timeoutId);
 };

 const checkWinner = (positions) => {
  const winningSuit = Object.keys(positions).find((suit) => positions[suit] >= 5);
  if (winningSuit) {
   setWinner(winningSuit);
   setGameState("winner");
  }
 };

 const drawCard = () => {
  if (deck.length === 0 || winner) {
   return;
  }

  clearAnimationTimeouts();
  setFlashingBonusIndices([]);
  setIsAnimating(true);

  const [drawnCard, ...restDeck] = deck;
  setDeck(restDeck);
  setCurrentCard(drawnCard);

  const advancedPositions = {
   ...horsePositions,
   [drawnCard.suit]: (horsePositions[drawnCard.suit] || 0) + 1,
  };

  setHorsePositions(advancedPositions);
  setHorseAnimation({ suit: drawnCard.suit, direction: "advance", key: Date.now() });

  const animationSteps = [];
  const adjustedPositions = { ...advancedPositions };
  const maxStages = Math.min(sideCards.length, 5);
  let nextStageIndex = revealedSideCards.length;
  let minPosition = Math.min(...Object.values(adjustedPositions));

  while (nextStageIndex < maxStages && minPosition > nextStageIndex) {
   const stageCard = sideCards[nextStageIndex];

   if (stageCard) {
    animationSteps.push({ index: nextStageIndex, card: stageCard });

    if (adjustedPositions[stageCard.suit] > 0) {
     adjustedPositions[stageCard.suit] -= 1;
    }
   }

   nextStageIndex += 1;
   minPosition = Math.min(...Object.values(adjustedPositions));
  }

  if (animationSteps.length === 0) {
   scheduleAnimationTimeout(() => {
    checkWinner(advancedPositions);
    setHorseAnimation(null);
    setIsAnimating(false);
   }, 350);
   return;
  }

  animationSteps.forEach((step, stepIndex) => {
   const revealDelay = 450 * (stepIndex + 1);
   const adjustDelay = revealDelay + 450;

   scheduleAnimationTimeout(() => {
    setRevealedSideCards((prevCards) => {
     if (prevCards.length > step.index) {
      return prevCards;
     }
     return [...prevCards, step.card];
    });
    setFlashingBonusIndices((prev) => [...prev, step.index]);
   }, revealDelay);

   scheduleAnimationTimeout(() => {
    setFlashingBonusIndices((prev) => prev.filter((value) => value !== step.index));
    setHorseAnimation({ suit: step.card.suit, direction: "retreat", key: Date.now() + step.index });
    setHorsePositions((prevPositions) => {
     const current = prevPositions[step.card.suit] || 0;
     const nextValue = current > 0 ? current - 1 : 0;
     return { ...prevPositions, [step.card.suit]: nextValue };
    });
   }, adjustDelay);
  });

  const finalDelay = 450 * animationSteps.length + 350;
  const animationPadding = animationSteps.length ? 450 : 0;

  scheduleAnimationTimeout(() => {
   setHorseAnimation(null);
   setFlashingBonusIndices([]);
   checkWinner(adjustedPositions);
   setIsAnimating(false);
  }, finalDelay + animationPadding);
 };

 const resetGame = () => {
  setGameState("setup");
  setPlayerInput("");
  setPendingPlayerName("");
  setEditingPlayerId(null);
  setIsModalOpen(false);
  setHorsePositions({ ...DEFAULT_POSITIONS });
  setSideCards([]);
  setRevealedSideCards([]);
  setDeck([]);
  setCurrentCard(null);
  setWinner(null);
  setHorseAnimation(null);
  setFlashingBonusIndices([]);
  setIsAnimating(false);
  clearAnimationTimeouts();
 };

 return (
  <div className="App">
   <h1>🐎 Horse Racing 🐎</h1>

   {gameState === "setup" && (
    <>
     <InitScreen
      players={players}
      playerInput={playerInput}
      onPlayerInputChange={handlePlayerInputChange}
      onAddPlayer={openModal}
      onEditPlayer={editPlayer}
      onRemovePlayer={removePlayer}
      onStartGame={startGame}
      suitColors={SUIT_COLORS}
      maxPlayerNameLength={MAX_PLAYER_NAME_LENGTH}
     />
     <SelectBetModal
      isOpen={isModalOpen}
      playerName={editingPlayer ? editingPlayer.name : pendingPlayerName}
      pendingSuit={editingPlayer?.suit ?? null}
      pendingDrinks={editingPlayer?.drinks ?? null}
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
     horseAnimation={horseAnimation}
     flashingBonusIndices={flashingBonusIndices}
     isAnimating={isAnimating}
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
      horseAnimation={horseAnimation}
      flashingBonusIndices={flashingBonusIndices}
      isAnimating={isAnimating}
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
