/** @format */

import React from "react";

const PlayScreen = ({
 suits,
 suitColors,
 horsePositions,
 sideCards,
 revealedSideCards,
 currentCard,
 deckLength,
 onDrawCard,
 isWinner,
 horseAnimation,
 flashingBonusIndices = [],
 isAnimating = false,
}) => {
 return (
  <>
   <div className="race-container">
    <div className="horse-column">
     <div className="column-header">Bonus</div>
     {[4, 3, 2, 1, 0].map((stageIndex) => {
      const isRevealed = revealedSideCards.length > stageIndex;
      const card = sideCards[stageIndex];

      return (
       <div
        key={stageIndex}
        className={`side-card ${isRevealed ? "revealed" : "hidden"} ${
         flashingBonusIndices.includes(stageIndex) ? "side-card-flash" : ""
        }`}
       >
        {isRevealed && card ? (
         <span style={{ color: suitColors[card.suit], fontSize: "1.5rem" }}>
          {card.suit}
          {card.value}
         </span>
        ) : (
         <span style={{ fontSize: "2rem" }}>🂠</span>
        )}
       </div>
      );
     })}
     <div className="suit-label">&nbsp;</div>
    </div>

    {suits.map((suit) => (
     <div key={suit} className="horse-column">
      <div className="column-header">-{suit}-</div>
      {[4, 3, 2, 1, 0].map((position) => {
       const isOccupied = horsePositions[suit] === position;
       const isActiveHorse = isOccupied && horseAnimation?.suit === suit;
       const directionClass =
        isActiveHorse && horseAnimation?.direction ? `horse-${horseAnimation.direction}` : "";

       return (
        <div key={position} className="track-cell">
         {isOccupied && (
          <div
           key={`${suit}-${isActiveHorse ? horseAnimation.key : "still"}`}
           className={`horse ${directionClass}`}
          >
           🐎
          </div>
         )}
        </div>
       );
      })}
      <div className="suit-label" style={{ color: suitColors[suit] }}>
       {suit}
      </div>
     </div>
    ))}
   </div>

   <div className="card-controls">
    <button
     className="draw-button"
     onClick={onDrawCard}
     disabled={deckLength === 0 || isWinner || isAnimating}
    >
     Draw Card ({deckLength} left)
    </button>

    {currentCard && (
     <div className="current-card">
      <span style={{ color: suitColors[currentCard.suit] }}>
       {currentCard.suit}
       {currentCard.value}
      </span>
     </div>
    )}
   </div>
  </>
 );
};

export default PlayScreen;
