import React from 'react';
import './PathTool.css';

const PathTool = ({ onTogglePath, onToggleAddPoint, canActivate, isPathActive, isAddingPoint }) => {
  return (
    <>
      <button
        className={`path-button ${isPathActive ? 'active' : ''}`}
        onClick={() => onTogglePath(!isPathActive)}
        disabled={!canActivate}
      >
        Path Tool
      </button>
      {isPathActive && (
        <button
          className={`path-button ${isAddingPoint ? 'active' : ''}`}
          onClick={() => onToggleAddPoint(!isAddingPoint)}
        >
          {isAddingPoint ? 'Stop Point' : 'Add Point'}
        </button>
      )}
    </>
  );
};

export default PathTool;
