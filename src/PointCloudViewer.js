import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RiMapPin2Fill, RiCloseLine } from "react-icons/ri";
import Path from './Path'; // Import Path object
import './PointCloudViewer.css'; // Import the CSS file

const PointCloudViewer = ({
  view,
  isAnnotationActive,
  setIsAnnotationActive,
  isPOIActive,
  setIsPOIActive,
  isPathActive,
  isAddingPoint,
  setIsPathActive,
  setIsAddingPoint,
  annotations,
  setAnnotations,
  pois,
  setPOIs,
  paths,
  setPaths
}) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [cameraState, setCameraState] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pathPoints, setPathPoints] = useState([]);
  const [showPathDialog, setShowPathDialog] = useState(false);
  const [pathName, setPathName] = useState('');
  const [pathDescription, setPathDescription] = useState('');
  const [selectedPathIndex, setSelectedPathIndex] = useState(null);
  const [isEditingPath, setIsEditingPath] = useState(false);
    
  const pathObjects = useRef([]); // To store references to path geometries (spheres and tubes)

  const chunks = useRef([]);
  const loadedChunks = useRef(new Set());
  const frustum = new THREE.Frustum();

  // Function to delete an annotation
  const handleDeleteAnnotation = (index) => {
    setAnnotations((prevAnnotations) => prevAnnotations.filter((_, i) => i !== index));
  };

  // Function to delete a POI
  const handleDeletePOI = (index) => {
    setPOIs((prevPOIs) => prevPOIs.filter((_, i) => i !== index));
  };

  const handleDeletePath = () => {
    if (selectedPathIndex !== null) {
      // Make the associated path geometries invisible and remove them from the scene
      const group = pathObjects.current[selectedPathIndex];
      if (group && group.children) {
        group.children.forEach((object) => {
          object = {}// Make the object invisible
        });
        scene.remove(group); // Optionally remove the group from the scene
      }
  
      // Optionally, you can remove the path from the paths array
      setPaths((prevPaths) => prevPaths.filter((_, i) => i !== selectedPathIndex));
      
      setShowPathDialog(false);
      setPathPoints([]);
      setPathName('');
      setPathDescription('');
      setIsAddingPoint(false);
      setIsPathActive(false);
      setIsEditingPath(false);
      setSelectedPathIndex(null);
    }
  };
  
  
  
  
  
  
  
  

  useEffect(() => {
    const mount = mountRef.current;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    setScene(scene);
    const aspect = mount.clientWidth / mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 300);
    camera.position.set(0, 0, 5);
    setCamera(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Add AxesHelper to visualize the three axes
    const axesHelper = new THREE.AxesHelper(5); // Size of the axes helper
    scene.add(axesHelper);

    // Load initial chunks for demonstration
    loadChunk(0, scene);
    loadChunk(1, scene);
    loadChunk(2, scene);
    loadChunk(3, scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      updateAnnotationsPosition();
      updatePOIsPosition();
      updatePathPointsPosition();
    };

    animate(); // Start the animation loop

    // Handle window resize
    const handleResize = () => {
      const aspect = mount.clientWidth / mount.clientHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  const loadChunk = (index, scene) => {
    if (loadedChunks.current.has(index)) return;

    const loader = new PCDLoader();
    loader.load(
      `${process.env.PUBLIC_URL}/assets/chunks/infy_campus_v6_chunk_${index}.pcd`,
      (points) => {
        console.log(`Loaded chunk ${index}`);
        // Apply the specified transformations to the point cloud
        points.translateX(-100)
        points.translateY(30)
        points.translateZ(200);
        points.rotateX(-1.65);
        points.rotateY(0.125);

        // Store the chunk with its bounding box
        const boundingBox = new THREE.Box3().setFromObject(points);
        chunks.current[index] = { points, boundingBox };

        // Ensure the scene is set before adding the points
        if (scene) {
          scene.add(points);
          loadedChunks.current.add(index);
          console.log(`Added chunk ${index} to scene`);
        } else {
          console.error(`Scene not set for chunk ${index}`);
        }
      },
      undefined,
      (error) => {
        console.error(`Error loading PCD file ${index}:`, error);
      }
    );
  };

  const checkChunksInFrustum = () => {
    if (!scene || !camera) return;

    const cameraMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraMatrix);

    for (let i = 0; i < 100; i++) {
      if (chunks.current[i] && frustum.intersectsBox(chunks.current[i].boundingBox)) {
        if (!loadedChunks.current.has(i)) {
          loadChunk(i, scene);
        }
      } else if (chunks.current[i] && loadedChunks.current.has(i)) {
        scene.remove(chunks.current[i].points);
        loadedChunks.current.delete(i);
        console.log(`Removed chunk ${i} from scene`);
      }
    }
  };

  useEffect(() => {
    const camera = controlsRef.current.object;

    switch (view) {
      case 'Free':
        camera.fov = 75;
        camera.position.set(0, 0, 5);
        camera.far = 300;
        camera.up.set(0, 1, 0); // Ensure default up direction
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'XY':
        camera.fov = 5;
        camera.position.set(0, 0, 1000);
        camera.far = 5000;
        camera.up.set(0, 1, 0); // Ensure default up direction
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'XZ':
        camera.fov = 5;
        camera.position.set(0, 3000, 0);
        camera.far = 15000;
        camera.up.set(1, 0, 0); // Set up direction to +x
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'YZ':
        camera.fov = 5;
        camera.position.set(1000, 0, 0);
        camera.far = 5000;
        camera.up.set(0, 1, 0); // Ensure default up direction
        camera.lookAt(0, 0, 0);
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      default:
        break;
    }

    camera.updateProjectionMatrix();
  }, [view]);

  useEffect(() => {
    const camera = controlsRef.current.object;
    if (isAnnotationActive || isPOIActive || isAddingPoint) {
      setCameraState({
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
        zoom: camera.zoom,
      });
      controlsRef.current.enableRotate = false;
      controlsRef.current.enablePan = false;
      controlsRef.current.enableZoom = false;
    } else if (cameraState) {
      camera.position.copy(cameraState.position);
      camera.rotation.copy(cameraState.rotation);
      if (camera.isOrthographicCamera) {
        camera.zoom = cameraState.zoom;
        camera.updateProjectionMatrix();
      }
      controlsRef.current.enableRotate = true;
      controlsRef.current.enablePan = true;
      controlsRef.current.enableZoom = true;
    }
  }, [isAnnotationActive, isPOIActive, isAddingPoint]);

  useEffect(() => {
    const handleUpdate = () => {
      updateAnnotationsPosition();
      updatePOIsPosition();
      updatePathPointsPosition();
    };

    // Update positions on controls update
    controlsRef.current.addEventListener('change', handleUpdate);

    return () => {
      controlsRef.current.removeEventListener('change', handleUpdate);
    };
  }, [annotations, pois, paths]);

  const handleMouseClick = (event) => {
    if ((!isAnnotationActive && !isPOIActive && !isAddingPoint) || isEditing || !camera || !scene) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    let closestIntersect = null;

    // Iterate through all loaded chunks to find the closest intersection
    loadedChunks.current.forEach((chunkIndex) => {
      const points = chunks.current[chunkIndex]?.points;
      if (points) {
        const intersect = getClosestPoint(raycaster, points, 0.5);
        if (intersect && (!closestIntersect || intersect.distance < closestIntersect.distance)) {
          closestIntersect = intersect;
        }
      }
    });

    if (closestIntersect) {
      if (isAnnotationActive) {
        console.log('Intersection point:', closestIntersect.point);
        const annotation = {
          point: closestIntersect.point,
          text: '',
          isEditing: true,
        };
        setAnnotations((prevAnnotations) => {
          const newAnnotations = [...prevAnnotations, annotation];
          setTimeout(() => updateAnnotationsPosition(newAnnotations), 0); // Update positions immediately after state update
          return newAnnotations;
        });
        setIsEditing(true);
      } else if (isPOIActive) {
        console.log('POI point:', closestIntersect.point);
        const poi = {
          point: closestIntersect.point,
          name: '',
          description: '',
          isEditing: true,
          isVisible: true, // For toggling visibility of the text box
        };
        setPOIs((prevPOIs) => {
          const newPOIs = [...prevPOIs, poi];
          setTimeout(() => updatePOIsPosition(newPOIs), 0); // Update positions immediately after state update
          return newPOIs;
        });
        setIsEditing(true);
      } else if (isAddingPoint) {
        console.log('Path point:', closestIntersect.point);
        setPathPoints((prevPoints) => [...prevPoints, closestIntersect.point]);

        // Create a red sphere for the path point
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(closestIntersect.point);
        scene.add(sphere);
      }
    }
  };

  const getClosestPoint = (raycaster, points, radius) => {
    const geometry = points.geometry;
    const positions = geometry.attributes.position.array;
    const matrixWorld = points.matrixWorld;

    let closestPoint = null;
    let closestDistance = Infinity;

    for (let i = 0; i < positions.length; i += 3) {
      const point = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      point.applyMatrix4(matrixWorld);

      const distance = raycaster.ray.distanceToPoint(point);
      if (distance < closestDistance && distance < radius) {
        closestPoint = point;
        closestDistance = distance;
      }
    }

    if (closestPoint) {
      return { point: closestPoint, distance: closestDistance };
    } else {
      return null;
    }
  };

  const handleSave = (index, event) => {
    event.stopPropagation(); // Stop the event from propagating to the canvas
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((annotation, i) =>
        i === index ? { ...annotation, isEditing: false } : annotation
      )
    );
    setIsEditing(false);
    setIsAnnotationActive(false); // Exit annotation mode
    setTimeout(() => updateAnnotationsPosition(), 0); // Update positions immediately after state update
  };

  const handleEdit = (index, event) => {
    event.stopPropagation(); // Stop the event from propagating to the canvas
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((annotation, i) =>
        i === index ? { ...annotation, isEditing: true } : annotation
      )
    );
    setIsEditing(true);
    setTimeout(() => updateAnnotationsPosition(), 0); // Update positions immediately after state update
  };

  const handleTextChange = (index, text) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((annotation, i) =>
        i === index ? { ...annotation, text } : annotation
      )
    );
  };

  const handlePOISave = (index, event) => {
    event.stopPropagation(); // Stop the event from propagating to the canvas
    setPOIs((prevPOIs) =>
      prevPOIs.map((poi, i) =>
        i === index ? { ...poi, isEditing: false } : poi
      )
    );
    setIsEditing(false);
    setIsPOIActive(false); // Exit POI mode
    setTimeout(() => updatePOIsPosition(), 0); // Update positions immediately after state update
  };

  const handlePOIEdit = (index, event) => {
    event.stopPropagation(); // Stop the event from propagating to the canvas
    setPOIs((prevPOIs) =>
      prevPOIs.map((poi, i) =>
        i === index ? { ...poi, isEditing: true } : poi
      )
    );
    setIsEditing(true);
    setTimeout(() => updatePOIsPosition(), 0); // Update positions immediately after state update
  };

  const handlePOITextChange = (index, key, value) => {
    setPOIs((prevPOIs) =>
      prevPOIs.map((poi, i) =>
        i === index ? { ...poi, [key]: value } : poi
      )
    );
  };

  const handlePOIClose = (index, event) => {
    event.stopPropagation(); // Stop the event from propagating to the canvas
    setPOIs((prevPOIs) =>
      prevPOIs.map((poi, i) =>
        i === index ? { ...poi, isVisible: false } : poi
      )
    );
  };

  const handlePOIIconClick = (index, event) => {
    event.stopPropagation(); // Stop the event from propagating to the canvas
    setPOIs((prevPOIs) =>
      prevPOIs.map((poi, i) =>
        i === index ? { ...poi, isVisible: true } : poi
      )
    );
  };

  const handleSavePath = () => {
    const newPath = new Path(pathName, pathDescription, pathPoints);
    const currentPathObjects = []; // Array to store current path's objects
  
    setPaths((prevPaths) => [...prevPaths, newPath]);
    setShowPathDialog(false);
    setPathPoints([]);
    setPathName('');
    setPathDescription('');
    setIsAddingPoint(false);
    setIsPathActive(false);
  
    // Create a spline curve from the path points
    if (pathPoints.length > 1) {
      const curve = new THREE.CatmullRomCurve3(pathPoints);
      const tubeGeometry = new THREE.TubeGeometry(curve, 200, 0.2, 8, false); // Radius of 0.2 for thicker tube
      const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      scene.add(tube);
      currentPathObjects.push(tube); // Store reference to the tube
    }
  
    // Store spheres and add them to the scene
    pathPoints.forEach((point) => {
      const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(point);
      scene.add(sphere);
      currentPathObjects.push(sphere); // Store reference to the sphere
    });
  
    // Store references to this path's objects in pathObjects
    const group = new THREE.Group();
    currentPathObjects.forEach(object => group.add(object));
    scene.add(group);
    pathObjects.current.push(group);

  
    console.log('Path Objects:', pathObjects.current); // Debugging line to check the contents
  };
  
  
  
  
    

  const handleUpdatePath = () => {
    const updatedPath = new Path(pathName, pathDescription, pathPoints);
  
    setPaths((prevPaths) => {
      const updatedPaths = [...prevPaths];
      updatedPaths[selectedPathIndex] = updatedPath;
      return updatedPaths;
    });
  
    setShowPathDialog(false);
    setPathPoints([]);
    setPathName('');
    setPathDescription('');
    setIsAddingPoint(false);
    setIsPathActive(false);
    setIsEditingPath(false);
    setSelectedPathIndex(null);
  
    // // Update the spline curve for the updated path
    // if (pathPoints.length > 1) {
    //   const curve = new THREE.CatmullRomCurve3(pathPoints);
    //   const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.2, 8, false); // Radius of 0.2 for thicker tube
    //   const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    //   const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    //   scene.add(tube);
    // }

    console.log(paths)
  };  
  
  const handlePathPointClick = (pathIndex) => {
    setSelectedPathIndex(pathIndex);
    setIsEditingPath(true);
    setShowPathDialog(true);
  
    const selectedPath = paths[pathIndex];
    setPathName(selectedPath.name);
    setPathDescription(selectedPath.description);
    setPathPoints(selectedPath.points);
  };  

  const updateAnnotationsPosition = (annotationsToUpdate = annotations) => {
    annotationsToUpdate.forEach((annotation, index) => {
      const vector = new THREE.Vector3(annotation.point.x, annotation.point.y, annotation.point.z);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * mountRef.current.clientWidth;
      const y = (vector.y * -0.5 + 0.5) * mountRef.current.clientHeight;

      const element = document.getElementById(`annotation-${index}`);
      if (element) {
        const height = element.getBoundingClientRect().height;
        if (view !== 'Free') {
          element.style.display = 'none';
        } else if (
          vector.x >= -1 && vector.x <= 1 &&
          vector.y >= -1 && vector.y <= 1 &&
          vector.z >= -1 && vector.z <= 1
        ) {
          element.style.display = 'block';
          element.style.left = `${x - 50}px`; // Adjust to position bottom-left
          element.style.top = `${y - height}px`;  // Adjust to position bottom-left based on height
        } else {
          element.style.display = 'none';
        }
      }
    });
  };

  const updatePOIsPosition = (poisToUpdate = pois) => {
    poisToUpdate.forEach((poi, index) => {
      const vector = new THREE.Vector3(poi.point.x, poi.point.y, poi.point.z);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * mountRef.current.clientWidth;
      const y = (vector.y * -0.5 + 0.5) * mountRef.current.clientHeight;

      const iconElement = document.getElementById(`poi-icon-${index}`);
      const boxElement = document.getElementById(`poi-${index}`);
      if (iconElement && boxElement) {
        const height = boxElement.getBoundingClientRect().height;
        if (view !== 'Free') {
          iconElement.style.display = 'none';
          boxElement.style.display = 'none';
        } else if (
          vector.x >= -1 && vector.x <= 1 &&
          vector.y >= -1 && vector.y <= 1 &&
          vector.z >= -1 && vector.z <= 1
        ) {
          iconElement.style.display = 'block';
          boxElement.style.display = poi.isVisible ? 'block' : 'none';
          iconElement.style.left = `${x}px`; // Center the POI icon
          iconElement.style.top = `${y}px`; // Center the POI icon
          boxElement.style.left = `${x}px`; // Adjust to position bottom-left
          boxElement.style.top = `${y - height}px`;  // Adjust to position bottom-left based on height
        } else {
          iconElement.style.display = 'none';
          boxElement.style.display = 'none';
        }
      }
    });
  };

  const updatePathPointsPosition = () => {
    paths.forEach((path, pathIndex) => {
      path.points.forEach((point, pointIndex) => {
        const vector = new THREE.Vector3(point.x, point.y, point.z);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * mountRef.current.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * mountRef.current.clientHeight;

        const element = document.getElementById(`path-point-${pathIndex}-${pointIndex}`);
        if (element) {
          if (view !== 'Free') {
            element.style.display = 'none';
          } else if (
            vector.x >= -1 && vector.x <= 1 &&
            vector.y >= -1 && vector.y <= 1 &&
            vector.z >= -1 && vector.z <= 1
          ) {
            element.style.display = 'block';
            element.style.left = `${x - 5}px`; // Adjust to position center
            element.style.top = `${y - 5}px`;  // Adjust to position center
          } else {
            element.style.display = 'none';
          }
        }
      });
    });
  };

  useEffect(() => {
    if (isAnnotationActive || isPOIActive || isAddingPoint) {
      mountRef.current.addEventListener('click', handleMouseClick);
    } else {
      mountRef.current.removeEventListener('click', handleMouseClick);
    }

    return () => {
      mountRef.current.removeEventListener('click', handleMouseClick);
    };
  }, [isAnnotationActive, isPOIActive, isAddingPoint, isEditing, annotations, pois]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {view === 'Free' && paths.map((path, pathIndex) =>
        path.points.map((point, pointIndex) => (
          <div
            key={`${pathIndex}-${pointIndex}`}
            id={`path-point-${pathIndex}-${pointIndex}`}
            className="path-point"
            onClick={() => handlePathPointClick(pathIndex)}
          />
        ))
      )}
      {view === 'Free' && annotations.map((annotation, index) => (
        <div
          key={index}
          id={`annotation-${index}`}
          className="annotation"
        >
          {annotation.isEditing ? (
            <>
              <textarea
                value={annotation.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
              />
              <button className="save-button" onClick={(e) => handleSave(index, e)}>Save</button>
              <button className="delete-button" onClick={() => handleDeleteAnnotation(index)}>Delete</button>
            </>
          ) : (
            <>
              <p>{annotation.text}</p>
              <button className="save-button" onClick={(e) => handleEdit(index, e)}>Edit</button>
              <button className="delete-button" onClick={() => handleDeleteAnnotation(index)}>Delete</button>
            </>
          )}
        </div>
      ))}
      {view === 'Free' && pois.map((poi, index) => (
        <React.Fragment key={index}>
          <div
            id={`poi-icon-${index}`}
            className="poi-icon"
            onClick={(e) => handlePOIIconClick(index, e)}
          >
            <RiMapPin2Fill color="red" />
          </div>
          <div
            id={`poi-${index}`}
            className="poi"
            style={{ display: poi.isVisible ? 'block' : 'none' }}
          >
            <div className="poi-close" onClick={(e) => handlePOIClose(index, e)}>
              <RiCloseLine />
            </div>
            {poi.isEditing ? (
              <>
                <input
                  value={poi.name}
                  onChange={(e) => handlePOITextChange(index, 'name', e.target.value)}
                  placeholder="Name"
                />
                <textarea
                  value={poi.description}
                  onChange={(e) => handlePOITextChange(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <button className="save-button" onClick={(e) => handlePOISave(index, e)}>Save</button>
                <button className="delete-button" onClick={() => handleDeletePOI(index)}>Delete</button>
              </>
            ) : (
              <>
                <p><strong>{poi.name}</strong></p>
                <p>{poi.description}</p>
                <button className="save-button" onClick={(e) => handlePOIEdit(index, e)}>Edit</button>
                <button className="delete-button" onClick={() => handleDeletePOI(index)}>Delete</button>
              </>
            )}
          </div>
        </React.Fragment>
      ))}
      {view === 'Free' && ((isPathActive && !isAddingPoint) || isEditingPath) && (
        <div className="path-dialog" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            placeholder="Path Name"
            value={pathName}
            onChange={(e) => setPathName(e.target.value)}
          />
          <textarea
            placeholder="Path Description"
            value={pathDescription}
            onChange={(e) => setPathDescription(e.target.value)}
          />
          <button className="save-button" onClick={isEditingPath ? handleUpdatePath : handleSavePath}>
            Save Path
          </button>
          {isEditingPath && (
            <button className="delete-button" onClick={handleDeletePath}>
              Delete Path
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PointCloudViewer;
