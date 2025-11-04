/** @format */

import React from "react";

const WinnerScreen = ({ winnerSuit, suitColors, players, onReset }) => {
 const winners = players.filter((player) => player.suit === winnerSuit);
 const totalPlayers = players.length;

 return (
  <div className="winner-overlay">
   <div className="winner-box">
    <h2 style={{ color: suitColors[winnerSuit] }}>🎉 {winnerSuit} wins the race! 🎉</h2>

    <div className="winners">
     <h3>Payout</h3>
     {winners.length > 0 ? (
      winners.map((player) => (
       <div key={player.id}>
        {player.name}: {player.drinks * 2} drinks
       </div>
      ))
     ) : (
      <div>No one picked this suit. Everyone drinks {totalPlayers}!</div>
     )}
    </div>

    <button type="button" className="reset-button" onClick={onReset}>
     New Game
    </button>
   </div>
  </div>
 );
};

export default WinnerScreen;
