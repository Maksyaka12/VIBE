const fs = require('fs');
const path = require('path');

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZGI0MTUzYy0yN2M2LTQzMzAtOWI4Ni02MWI5NGY1Njk2NTUiLCJlbWFpbCI6Im1ha3NpbS5zb3Jva2E2OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjc0YmY3Njc4NDFiZGMyYTMzZTUiLCJzY29wZWRLZXlTZWNyZXQiOiI2ODRkMmY0NjVhYjA4MWI4MTg0N2QxOWY3YzE4MTBiNmQ3NmU4NWE3ODVhNDJhODMyMjliODMyNmJiMGY3ZTg0IiwiZXhwIjoxODE4MjUwMjQwfQ._yZ_7Q2jWa4NyJ4H-Cj7VnuhWkQOzu_Iie6A2PnwtRs';
const METADATA_DIR = path.join(__dirname, 'frontend', 'public', 'nft', 'metadata');

async function uploadToPinata() {
  console.log('Reading files from:', METADATA_DIR);
  const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files to upload as a folder...`);

  // Node 18+ native FormData
  const formData = new FormData();

  for (const filename of files) {
    const filePath = path.join(METADATA_DIR, filename);
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'application/json' });
    // In Pinata, to pin a folder, filepath should be "folderName/fileName.json"
    formData.append('file', blob, `metadata/${filename}`);
  }

  const pinataMetadata = JSON.stringify({
    name: 'Vibe Club Genesis Metadata'
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1
  });
  formData.append('pinataOptions', pinataOptions);

  console.log('Sending request to Pinata API...');

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  console.log('\n🎉 SUCCESS! PINATA UPLOAD COMPLETED!');
  console.log('IpfsHash (CID):', data.IpfsHash);
  console.log('PinSize:', data.PinSize);
  console.log('Timestamp:', data.Timestamp);
  console.log(`\nYour Smart Contract Base URI: ipfs://${data.IpfsHash}/`);
}

uploadToPinata().catch(console.error);
