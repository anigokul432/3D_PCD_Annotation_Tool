// src/Compress.js

const fs = require('fs');
const path = require('path');
const PCL = require('pcl.js');

async function compressPCD() {
  // Initialize PCL
  await PCL.init();

  const inputFilePath = path.join(__dirname, '../public/assets/infy_campus_v6.pcd');
  const outputFilePath = path.join(__dirname, '../public/assets/infy_campus_v6_compressed.pcd');

  // Read the input PCD file as a binary buffer
  const pcdData = fs.readFileSync(inputFilePath);

  // Convert buffer to ArrayBuffer
  const arrayBuffer = Uint8Array.from(pcdData).buffer;

  // Load the PCD data into PCL
  const cloud = PCL.loadPCDData(arrayBuffer, PCL.PointXYZ);

  // Compress the PCD file and get the data as ArrayBuffer
  const compressedData = PCL.savePCDDataBinaryCompressed(cloud);

  // Write the compressed data to the desired output path
  fs.writeFileSync(outputFilePath, Buffer.from(compressedData));

  console.log('PCD file compressed and saved successfully at', outputFilePath);
}

compressPCD().catch(err => console.error(err));
