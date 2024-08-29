// src/AnnotationTool.js

import React, { useEffect } from 'react';
import './AnnotationTool.css';

const AnnotationTool = ({ onToggleAnnotation, canActivate, isAnnotationActive }) => {
  const handleToggleAnnotation = () => {
    if (!canActivate) return;
    const newAnnotationState = !isAnnotationActive;
    onToggleAnnotation(newAnnotationState);
  };

  return (
    <button
      className={`annotate-button ${isAnnotationActive ? 'active' : ''} ${!canActivate ? 'disabled' : ''}`}
      onClick={handleToggleAnnotation}
      disabled={!canActivate}
    >
      Annotate
    </button>
  );
};

export default AnnotationTool;
