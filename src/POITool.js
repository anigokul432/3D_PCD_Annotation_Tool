// src/POITool.js

import React, { useState } from 'react';
import './POITool.css';

const POITool = ({ onTogglePOI, canActivate, isPOIActive }) => {
  const handleTogglePOI = () => {
    if (!canActivate) return;
    const newPOIState = !isPOIActive;
    onTogglePOI(newPOIState);
  };

  return (
    <button
      className={`poi-button ${isPOIActive ? 'active' : ''} ${!canActivate ? 'disabled' : ''}`}
      onClick={handleTogglePOI}
      disabled={!canActivate}
    >
      Add POI
    </button>
  );
};

export default POITool;
