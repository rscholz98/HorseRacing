/** @format */

import React from "react";

const InitScreen = ({
 players,
 playerInput,
 onPlayerInputChange,
 onAddPlayer,
 onEditPlayer,
 onRemovePlayer,
 onStartGame,
 suitColors,
 maxPlayerNameLength = 20,
}) => {
 return (
  <div className="setup-container">
   <h2>Add Players</h2>
   <div className="player-input">
    <input
     type="text"
     value={playerInput}
     onChange={(event) => onPlayerInputChange(event.target.value)}
     onKeyDown={(event) => {
      if (event.key === "Enter") {
       onAddPlayer();
      }
     }}
     placeholder="Enter player name"
     maxLength={maxPlayerNameLength}
    />
    <button onClick={onAddPlayer}>Add Player</button>
   </div>

   <div className="player-list">
    {players.length === 0 && <p className="player-empty">No players yet. Add the first one!</p>}
    {players.map((player) => (
     <div key={player.id} className="player-item">
      <div className="player-summary">
       <span className="player-summary-name">{player.name}</span>
       <span className="player-meta" style={{ color: suitColors[player.suit] }}>
        {player.suit}
       </span>
       <span className="player-meta">
        {player.drinks} drink{player.drinks === 1 ? "" : "s"}
       </span>
      </div>
      <div className="player-item-actions">
       <button type="button" className="player-edit" onClick={() => onEditPlayer(player.id)}>
        ✎
       </button>
       <button type="button" className="player-remove" onClick={() => onRemovePlayer(player.id)}>
        ✕
       </button>
      </div>
     </div>
    ))}
   </div>

   <button className="start-button" onClick={onStartGame} disabled={players.length === 0}>
    Start Game
   </button>
  </div>
 );
};

export default InitScreen;
