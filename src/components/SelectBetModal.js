/** @format */

import React, { useEffect, useState } from "react";

const SelectBetModal = ({
 isOpen,
 playerName,
 pendingSuit,
 pendingDrinks,
 suits,
 suitColors,
 onConfirm,
 onCancel,
}) => {
 const [selectedSuit, setSelectedSuit] = useState(pendingSuit || "");
 const MIN_DRINKS = 1;
 const MAX_DRINKS = 20;
 const sanitizeDrinkCount = (value) => {
  const numericValue = Number(value);
  const parsed = Number.isFinite(numericValue) ? numericValue : MIN_DRINKS;
  if (parsed < MIN_DRINKS) {
   return MIN_DRINKS;
  }
  if (parsed > MAX_DRINKS) {
   return MAX_DRINKS;
  }
  return Math.round(parsed);
 };
 const [drinkCount, setDrinkCount] = useState(sanitizeDrinkCount(pendingDrinks || MIN_DRINKS));

 useEffect(() => {
  if (isOpen) {
   setSelectedSuit(pendingSuit || "");
   setDrinkCount(sanitizeDrinkCount(pendingDrinks || MIN_DRINKS));
  }
 }, [isOpen, pendingSuit, pendingDrinks]);

 if (!isOpen) {
  return null;
 }

 const adjustDrinkCount = (delta) => {
  setDrinkCount((previous) => {
   const nextValue = previous + delta;
   if (nextValue < MIN_DRINKS) {
    return MIN_DRINKS;
   }
   if (nextValue > MAX_DRINKS) {
    return MAX_DRINKS;
   }
   return nextValue;
  });
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
     <div className="modal-drink-selector">
      <button
       type="button"
       className="modal-drink-control"
       onClick={() => adjustDrinkCount(-1)}
       disabled={drinkCount <= MIN_DRINKS}
       aria-label="Decrease drinks"
      >
       -
      </button>
      <input
       type="text"
       className="modal-drink-display"
       value={drinkCount}
       disabled
       aria-label="Selected drinks"
      />
      <button
       type="button"
       className="modal-drink-control"
       onClick={() => adjustDrinkCount(1)}
       disabled={drinkCount >= MAX_DRINKS}
       aria-label="Increase drinks"
      >
       +
      </button>
     </div>
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
