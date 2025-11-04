/** @format */

import React, { useEffect, useState } from "react";

const SelectBetModal = ({ isOpen, playerName, suits, suitColors, onConfirm, onCancel }) => {
 const [selectedSuit, setSelectedSuit] = useState("");
 const [drinkCount, setDrinkCount] = useState(1);

 useEffect(() => {
  if (isOpen) {
   setSelectedSuit("");
   setDrinkCount(1);
  }
 }, [isOpen]);

 if (!isOpen) {
  return null;
 }

 const handleDrinkChange = (event) => {
  const rawValue = parseInt(event.target.value, 10);
  if (Number.isNaN(rawValue)) {
   setDrinkCount(1);
   return;
  }
  setDrinkCount(Math.min(Math.max(rawValue, 1), 20));
 };

 const submit = () => {
  if (!selectedSuit) {
   return;
  }
  onConfirm({ suit: selectedSuit, drinks: drinkCount });
 };

 return (
  <div className="modal-overlay">
   <div className="modal">
    <h2>Select suit & drinks</h2>
    {playerName && <p className="modal-subtitle">{playerName}</p>}

    <div className="modal-section">
     <h3>Suit</h3>
     <div className="modal-suits">
      {suits.map((suit) => (
       <button
        key={suit}
        type="button"
        className={`modal-suit-button ${selectedSuit === suit ? "selected" : ""}`}
        style={{
         borderColor: selectedSuit === suit ? "#ff4d4f" : "rgba(245, 245, 245, 0.35)",
         color: suitColors[suit],
         boxShadow: selectedSuit === suit ? "0 0 16px rgba(255, 77, 79, 0.45)" : "none",
        }}
        onClick={() => setSelectedSuit(suit)}
       >
        {suit}
       </button>
      ))}
     </div>
    </div>

    <div className="modal-section">
     <h3>Number of drinks</h3>
     <input type="number" min="1" max="20" value={drinkCount} onChange={handleDrinkChange} />
    </div>

    <div className="modal-actions">
     <button type="button" className="modal-cancel" onClick={onCancel}>
      Cancel
     </button>
     <button type="button" className="modal-confirm" onClick={submit} disabled={!selectedSuit}>
      Confirm
     </button>
    </div>
   </div>
  </div>
 );
};

export default SelectBetModal;
