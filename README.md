# 3D Point Cloud Viewer

## Overview

The 3D Point Cloud Viewer is an interactive web application designed for visualizing and annotating point cloud data. The application allows users to load 3D point cloud chunks, annotate points of interest (POIs), create paths through the cloud, and switch between different views for better analysis. The app also supports generating a detailed report of all annotations, POIs, and paths created during the session.

## Features

### 1. **View Modes**
   - **Free View:** The default interactive view that allows users to freely rotate, pan, and zoom into the point cloud.
   - **XY View (Front):** A front-facing orthographic view for precise analysis along the XY plane.
   - **XZ View (Top-Down):** A top-down orthographic view focusing on the XZ plane.
   - **YZ View (Side):** A side orthographic view for analyzing the YZ plane.

### 2. **Annotations**
   - **Create Annotations:** Users can click on points in the point cloud to create annotations. Each annotation can be edited to include comments or other relevant information.
   - **Edit Annotations:** Users can modify the text of existing annotations at any time.
   - **Delete Annotations:** Annotations can be removed individually if they are no longer needed.
   - **Position Adjustment:** Annotations are automatically repositioned on the screen based on the current camera view.

### 3. **Points of Interest (POIs)**
   - **Create POIs:** Similar to annotations, users can add points of interest to the point cloud. POIs can include a name and description.
   - **Edit POIs:** POIs can be modified to update their name and description.
   - **Toggle Visibility:** Users can show or hide the details of a POI while keeping its icon visible in the scene.
   - **Delete POIs:** Users can remove POIs when they are no longer relevant.
   - **Icon and Box Positioning:** The POI icons and description boxes are dynamically repositioned to stay visible based on the camera view.

### 4. **Paths**
   - **Create Paths:** Users can plot a series of points in the point cloud to create a path. Each path can have a unique name and description.
   - **Edit Paths:** Existing paths can be updated with new points, a new name, or a new description.
   - **Delete Paths:** Paths can be deleted entirely, including all associated points and lines.
   - **Path Visualization:** Paths are visualized as red spheres (representing points) connected by a tube (representing the path itself).

### 5. **Report Generation**
   - **Generate Report:** Users can generate a detailed report of all the annotations, POIs, and paths. The report includes the coordinates and descriptions of each element, and it is downloadable as a `.txt` file.
   - **Report Content:**
     - **Annotations:** Lists each annotation with its location and associated comment.
     - **POIs:** Lists each POI with its location, name, and description.
     - **Paths:** Provides details of each path, including the path name, description, and coordinates of each point.

### 6. **Dynamic Loading**
   - **Chunk Loading:** The application dynamically loads point cloud chunks as needed based on the user's view and camera position, optimizing performance and resource usage.
   - **Frustum Culling:** Chunks that are no longer in the camera’s view are automatically unloaded to maintain efficiency.

## How to Use

1. **Starting the App:** On launching the application, the 3D point cloud viewer will initialize with the Free view mode.
2. **Switching Views:** Use the dropdown menu to switch between Free, XY, XZ, and YZ views.
3. **Adding Annotations:** Click the annotation tool and click on a point in the cloud to add an annotation.
4. **Adding POIs:** Activate the POI tool, click on a point in the cloud, and enter the name and description.
5. **Creating Paths:** Activate the path tool, click to add points in the cloud, and connect them into a path.
6. **Generating Reports:** Once your annotations, POIs, and paths are set, click on the "Generate Report" button to download a comprehensive report.

## File Structure

- **App.js:** The main component that manages the state of the application and handles view switching, tool activation, and report generation.
- **PointCloudViewer.js:** The core component responsible for rendering the 3D point cloud, managing annotations, POIs, and paths, and handling interactions like clicking and dragging.
- **AnnotationTool.js:** Handles the UI and functionality for creating and managing annotations.
- **POITool.js:** Handles the UI and functionality for creating and managing points of interest.
- **PathTool.js:** Handles the UI and functionality for creating and managing paths.
- **Path.js:** A class representing a path object with name, description, and points.

## Installation and Setup

To run this project locally:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd point-cloud-viewer
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Start the development server:**
   ```
   npm start
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

## Dependencies

- **React:** For building the UI.
- **THREE.js:** For rendering and managing the 3D scene.
- **React Icons:** For UI icons used in POIs.
- **PCDLoader:** For loading PCD (Point Cloud Data) files into the scene.

## Future Improvements

- **Undo/Redo Functionality:** Adding the ability to undo and redo actions, particularly useful for path creation and annotation editing.
- **3D Model Support:** Expanding the app to support loading and displaying 3D models alongside point clouds.
- **Enhanced Reporting:** Including more detailed metadata and visual representations in the generated reports.

