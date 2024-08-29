import React, { useState } from 'react';
import './App.css';
import PointCloudViewer from './PointCloudViewer';
import AnnotationTool from './AnnotationTool';
import POITool from './POITool';
import PathTool from './PathTool';

function App() {
  const [view, setView] = useState('Free');
  const [isAnnotationActive, setIsAnnotationActive] = useState(false);
  const [isPOIActive, setIsPOIActive] = useState(false);
  const [isPathActive, setIsPathActive] = useState(false);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [pois, setPOIs] = useState([]);
  const [paths, setPaths] = useState([]);

  const handleViewChange = (event) => {
    setView(event.target.value);
    if (event.target.value !== 'Free') {
      setIsAnnotationActive(false); // Deactivate annotation mode if not in Free view
      setIsPOIActive(false); // Deactivate POI mode if not in Free view
      setIsPathActive(false); // Deactivate Path mode if not in Free view
      setIsAddingPoint(false); // Deactivate Add Point mode if not in Free view
    }
  };

  const handleToggleAnnotation = (isActive) => {
    setIsAnnotationActive(isActive);
  };

  const handleTogglePOI = (isActive) => {
    setIsPOIActive(isActive);
  };

  const handleTogglePath = (isActive) => {
    setIsPathActive(isActive);
  };

  const handleToggleAddPoint = (isActive) => {
    setIsAddingPoint(isActive);
  };

  const handleGenerateReport = () => {
    const annotationContent = annotations
      .map(
        (annotation, index) =>
          `Annotation ${index + 1}:\nLocation: (${annotation.point.x.toFixed(2)}, ${annotation.point.y.toFixed(2)}, ${annotation.point.z.toFixed(2)})\nComment: ${annotation.text}\n`
      )
      .join('\n');
  
    const poiContent = pois
      .map(
        (poi, index) =>
          `POI ${index + 1}:\nLocation: (${poi.point.x.toFixed(2)}, ${poi.point.y.toFixed(2)}, ${poi.point.z.toFixed(2)})\nName: ${poi.name}\nDescription: ${poi.description}\n`
      )
      .join('\n');
  
    const pathContent = paths
      .map((path, index) => {
        const points = path.points
          .map(
            (point, pointIndex) =>
              `\tPoint ${pointIndex + 1}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`
          )
          .join('\n');
        return `Path ${index + 1}:\nName: ${path.name}\nDescription: ${path.description}\nPoints:\n${points}\n`;
      })
      .join('\n');
  
    const reportContent = `Annotations:\n${annotationContent}\n\nPOIs:\n${poiContent}\n\nPaths:\n${pathContent}`;
  
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report.txt';
    link.click();
  };
  

  const canActivateAnnotation = view === 'Free';

  return (
    <div className="App">
      <header className="App-header">
        <h1>3D Point Cloud Viewer</h1>
        <div className="canvas-container">
          <div className="tools-container">
            <label htmlFor="view-select">View: </label>
            <select id="view-select" value={view} onChange={handleViewChange}>
              <option value="Free">Free</option>
              <option value="XY">Front</option>
              <option value="XZ">Top-Down</option>
              <option value="YZ">Side</option>
            </select>
            <AnnotationTool
              onToggleAnnotation={handleToggleAnnotation}
              canActivate={canActivateAnnotation}
              isAnnotationActive={isAnnotationActive}
            />
            <POITool
              onTogglePOI={handleTogglePOI}
              canActivate={canActivateAnnotation}
              isPOIActive={isPOIActive}
            />
            <PathTool
              onTogglePath={handleTogglePath}
              onToggleAddPoint={handleToggleAddPoint}
              canActivate={canActivateAnnotation}
              isPathActive={isPathActive}
              isAddingPoint={isAddingPoint}
            />
            <button className="generate-report-button" onClick={handleGenerateReport}>
              Generate Report
            </button>
          </div>
          <PointCloudViewer
            view={view}
            isAnnotationActive={isAnnotationActive}
            isPOIActive={isPOIActive}
            isPathActive={isPathActive}
            isAddingPoint={isAddingPoint}
            setIsAnnotationActive={setIsAnnotationActive}
            setIsPOIActive={setIsPOIActive}
            setIsPathActive={setIsPathActive}
            setIsAddingPoint={setIsAddingPoint}
            annotations={annotations}
            setAnnotations={setAnnotations}
            pois={pois}
            setPOIs={setPOIs}
            paths={paths}
            setPaths={setPaths}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
