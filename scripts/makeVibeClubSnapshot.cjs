/**
 * Vibe Club NFT - Direct On-Chain Snapshot & Merkle Tree Generator
 * 
 * Generates equal-share Merkle proofs for verified Vibe Club NFT holders on Base Mainnet.
 * 
 * Usage:
 *   node scripts/makeVibeClubSnapshot.cjs [epochNumber] [poolAmount] [optionalBlockNumber]
 * 
 * Examples:
 *   node scripts/makeVibeClubSnapshot.cjs 1 2500000
 *   node scripts/makeVibeClubSnapshot.cjs 2 3000000
 */

const fs = require('fs');
const path = require('path');
const { createPublicClient, http, fallback, parseAbi, parseUnits, formatUnits, keccak256, encodePacked, concatHex } = require('../frontend/node_modules/viem');
const { base } = require('../frontend/node_modules/viem/chains');

const NFT_CONTRACT = '0x9E92307Dbec2d0aE4BBF14cA93E1cA00edC4b886';
const TOKEN_ADDRESS = '0xb200000000000000000000df24ecb8bf51100a01';

const SYSTEM_EXCLUSIONS = [
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead'
].map(a => a.toLowerCase());

function hashPair(a, b) {
  const bufA = Buffer.from(a.slice(2), 'hex');
  const bufB = Buffer.from(b.slice(2), 'hex');
  return Buffer.compare(bufA, bufB) < 0
    ? keccak256(concatHex([a, b]))
    : keccak256(concatHex([b, a]));
}

function buildMerkleTree(elements) {
  const leaves = elements.map(e => e.leaf);
  if (leaves.length === 0) return { root: '0x0', proofs: {} };

  let layers = [leaves];
  while (layers[layers.length - 1].length > 1) {
    const currentLayer = layers[layers.length - 1];
    const nextLayer = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        nextLayer.push(hashPair(currentLayer[i], currentLayer[i + 1]));
      } else {
        nextLayer.push(currentLayer[i]);
      }
    }
    layers.push(nextLayer);
  }

  const root = layers[layers.length - 1][0];
  const proofs = {};
  for (let i = 0; i < elements.length; i++) {
    const proof = [];
    let idx = i;
    for (let l = 0; l < layers.length - 1; l++) {
      const layer = layers[l];
      const isRightNode = idx % 2 === 1;
      const pairIdx = isRightNode ? idx - 1 : idx + 1;
      if (pairIdx < layer.length) {
        proof.push(layer[pairIdx]);
      }
      idx = Math.floor(idx / 2);
    }
    proofs[elements[i].address.toLowerCase()] = {
      address: elements[i].address,
      nftCount: elements[i].nftCount,
      tokenIds: elements[i].tokenIds,
      amount: elements[i].amount,
      amountWei: elements[i].amountWei.toString(),
      sharePercent: elements[i].sharePercent,
      leaf: elements[i].leaf,
      proof: proof
    };
  }
  return { root, proofs };
}

async function runSnapshot() {
  const epochNumber = parseInt(process.argv[2] || '1', 10);
  const poolAmountInput = parseFloat(process.argv[3] || '2500000');
  const targetBlockInput = process.argv[4] ? BigInt(process.argv[4]) : null;

  console.log('\n======================================================');
  console.log('👑 VIBE Club NFT - Royalty Snapshot & Merkle Generator (Epoch ' + epochNumber + ')');
  console.log('======================================================');
  console.log('NFT Contract:         ' + NFT_CONTRACT);
  console.log('Royalty Pool:         ' + poolAmountInput.toLocaleString() + ' $VIBE');
  console.log('Distribution Rule:    EQUAL SHARE per unique NFT holder');
  console.log('Timestamp:            ' + new Date().toISOString());
  console.log('-----------------------------------------------------\n');

  const RPC_LIST = [
    'https://base-mainnet.public.blastapi.io',
    'https://mainnet.base.org',
    'https://1rpc.io/base',
    'https://base.llamarpc.com'
  ];

  const client = createPublicClient({
    chain: base,
    transport: fallback(RPC_LIST.map(url => http(url)))
  });

  const snapshotBlock = targetBlockInput || await client.getBlockNumber();
  const blockData = await client.getBlock({ blockNumber: snapshotBlock });
  const blockTime = new Date(Number(blockData.timestamp) * 1000).toUTCString();

  console.log(`[1/3] ⛓️ Connecting to Base Mainnet at Block #${snapshotBlock}`);
  console.log(`      Block Timestamp: ${blockTime}`);

  const nftAbi = parseAbi([
    'function totalMintedCount() view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)'
  ]);

  const totalMinted = await client.readContract({
    address: NFT_CONTRACT,
    abi: nftAbi,
    functionName: 'totalMintedCount',
    blockNumber: snapshotBlock
  });

  const totalMintedNum = Number(totalMinted);
  console.log(`      Total Minted NFTs: ${totalMintedNum}`);

  if (totalMintedNum === 0) {
    console.error('❌ No NFTs have been minted yet.');
    process.exit(1);
  }

  const MAX_SUPPLY = 333;
  console.log(`\n[2/3] 🔍 Querying current owners of tokens #1 to #${MAX_SUPPLY}...`);

  const ownerCalls = [];
  for (let id = 1; id <= MAX_SUPPLY; id++) {
    ownerCalls.push({
      address: NFT_CONTRACT,
      abi: nftAbi,
      functionName: 'ownerOf',
      args: [BigInt(id)]
    });
  }

  const ownerResults = await client.multicall({
    contracts: ownerCalls,
    blockNumber: snapshotBlock,
    allowFailure: true
  });

  // Aggregate by unique holder wallet
  const holderMap = new Map(); // address => array of tokenIds

  for (let i = 0; i < ownerResults.length; i++) {
    const tokenId = i + 1;
    const res = ownerResults[i];
    if (res.status === 'success' && res.result) {
      const owner = res.result.toLowerCase();
      if (SYSTEM_EXCLUSIONS.includes(owner)) continue;

      if (!holderMap.has(owner)) {
        holderMap.set(owner, []);
      }
      holderMap.get(owner).push(tokenId);
    }
  }

  const uniqueHolders = Array.from(holderMap.keys()).map(address => ({
    address,
    nftCount: holderMap.get(address).length,
    tokenIds: holderMap.get(address)
  }));

  // Sort descending by NFT count, then alphabetically
  uniqueHolders.sort((a, b) => b.nftCount - a.nftCount || a.address.localeCompare(b.address));

  const totalUniqueWallets = uniqueHolders.length;
  console.log(`=== Found EXACTLY ${totalUniqueWallets} Unique NFT Holder Wallets ===`);
  console.log(`Total NFTs Accounted: ${uniqueHolders.reduce((acc, h) => acc + h.nftCount, 0)} / ${totalMintedNum}`);

  // Equal share calculation: poolAmount / totalUniqueWallets
  const equalRewardAmount = Math.floor(poolAmountInput / totalUniqueWallets);
  const remainder = poolAmountInput - (equalRewardAmount * totalUniqueWallets);

  console.log(`\n[3/3] 🧮 Allocation Calculation:`);
  console.log(`      Each holder receives: ${equalRewardAmount.toLocaleString()} $VIBE`);
  if (remainder > 0) {
    console.log(`      (Remainder ${remainder} $VIBE added to top holder wallet to match exact 100% pool)`);
  }

  let totalDistributed = 0;
  const elements = uniqueHolders.map((h, idx) => {
    // Add remainder to the first holder so the sum matches poolAmount exactly
    const rewardAmount = idx === 0 ? (equalRewardAmount + remainder) : equalRewardAmount;
    totalDistributed += rewardAmount;

    const amountWei = parseUnits(rewardAmount.toString(), 18);
    const leaf = keccak256(encodePacked(['address', 'uint256', 'uint256'], [h.address, BigInt(epochNumber), amountWei]));

    return {
      address: h.address,
      nftCount: h.nftCount,
      tokenIds: h.tokenIds,
      amount: rewardAmount,
      amountWei: amountWei,
      sharePercent: ((rewardAmount / poolAmountInput) * 100).toFixed(4) + '%',
      leaf: leaf
    };
  });

  console.log(`      Total Distributed: ${totalDistributed.toLocaleString()} $VIBE (100% full pool)`);

  console.log('\n🌳 Building Merkle Tree & Proofs...');
  const { root, proofs } = buildMerkleTree(elements);

  console.log('\n======================================================');
  console.log('✅ VIBE CLUB SNAPSHOT & MERKLE Generated Successfully!');
  console.log('======================================================');
  console.log(`🔑 Merkle Root (for Royalty Epoch ${epochNumber}):`);
  console.log(root + '\n');

  // Ensure directories exist
  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  const frontendDataDir = path.join(__dirname, '..', 'frontend', 'src', 'data');
  if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });
  if (!fs.existsSync(frontendDataDir)) fs.mkdirSync(frontendDataDir, { recursive: true });

  const baseFileName = `royalty_${epochNumber}`;

  // 1. Save Full Proofs JSON
  const proofsPayload = {
    epoch: epochNumber,
    poolAmount: poolAmountInput,
    totalHolders: totalUniqueWallets,
    snapshotBlock: snapshotBlock.toString(),
    snapshotTime: blockTime,
    merkleRoot: root,
    claims: proofs
  };

  const proofsJsonPath = path.join(snapshotDir, `${baseFileName}_proofs.json`);
  fs.writeFileSync(proofsJsonPath, JSON.stringify(proofsPayload, null, 2));
  console.log(`📁 Saved Proofs:   snapshots/${baseFileName}_proofs.json`);

  // Sync to frontend data folder
  const frontendProofsPath = path.join(frontendDataDir, `${baseFileName}_proofs.json`);
  fs.writeFileSync(frontendProofsPath, JSON.stringify(proofsPayload, null, 2));
  console.log(`📁 Frontend Data:  frontend/src/data/${baseFileName}_proofs.json`);

  // 2. Save Merkle Root TXT
  const rootTxtPath = path.join(snapshotDir, `${baseFileName}_root.txt`);
  fs.writeFileSync(rootTxtPath, root);
  console.log(`📁 Saved Root:     snapshots/${baseFileName}_root.txt`);

  // 3. Save Summary CSV Table
  const csvRows = ['Rank,Address,NFT_Count,Token_IDs,Reward_VIBE,Share_Percent,Leaf'];
  elements.forEach((e, idx) => {
    csvRows.push(`${idx + 1},${e.address},${e.nftCount},"${e.tokenIds.join(';')}",${e.amount},${e.sharePercent},${e.leaf}`);
  });
  const csvPath = path.join(snapshotDir, `${baseFileName}_table.csv`);
  fs.writeFileSync(csvPath, csvRows.join('\n'));
  console.log(`📁 Saved Table:    snapshots/${baseFileName}_table.csv`);

  console.log('\n------------------------------------------------------');
  console.log('Top 10 NFT Holders in Snapshot:');
  elements.slice(0, 10).forEach((e, i) => {
    console.log(`  #${i + 1} ${e.address} | ${e.nftCount} NFTs -> ${e.amount.toLocaleString()} $VIBE`);
  });
  console.log('------------------------------------------------------\n');
}

runSnapshot().catch(err => {
  console.error('\n❌ Fatal Snapshot Error:', err);
  process.exit(1);
});
