const fs = require('fs');
const path = require('path');
const PCL = require('pcl.js');

async function splitPCD() {
  // Initialize PCL
  await PCL.init();

  const inputFilePath = path.join(__dirname, '../public/assets/infy_campus_v6.pcd');
  const outputDir = path.join(__dirname, '../public/assets/chunks_v2');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Read the input PCD file as a binary buffer
  const pcdData = fs.readFileSync(inputFilePath);

  // Convert buffer to ArrayBuffer
  const arrayBuffer = Uint8Array.from(pcdData).buffer;

  // Load the PCD data into PCL
  const cloud = PCL.loadPCDData(arrayBuffer, PCL.PointXYZI);

  // Get the number of points and determine the chunk size
  const totalPoints = cloud.size;
  const numChunks = 4;
  const chunkSize = Math.ceil(totalPoints / numChunks);

  console.log(`Total points: ${totalPoints}`);
  console.log(`Chunk size: ${chunkSize}`);

  // Split and save each chunk
  for (let i = 0; i < numChunks; i++) {
    const chunkStart = i * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize, totalPoints);

    // Create a new point cloud for the chunk
    const chunkCloud = new PCL.PointCloud(PCL.PointXYZI);

    console.log(`Creating chunk ${i} with points from ${chunkStart} to ${chunkEnd - 1}`);

    for (let j = chunkStart; j < chunkEnd; j+=50) {
      const point = cloud.points.get(j);
      if (point) {
        // console.log(`Adding point ${j}: (${point.x}, ${point.y}, ${point.z})`);
        chunkCloud.addPoint(point);
      } else {
        // console.log(`Null point at index ${j}`);
      }
    }

    console.log(`Chunk ${i} size: ${chunkCloud.size}`);

    // Compress and save the chunk
    const compressedData = PCL.savePCDDataBinary(chunkCloud);
    const chunkFilePath = path.join(outputDir, `infy_campus_v6_chunk_${i}.pcd`);
    fs.writeFileSync(chunkFilePath, Buffer.from(compressedData));

    console.log(`Chunk ${i} saved:`, chunkFilePath);
  }
}

splitPCD().catch(err => console.error(err));
