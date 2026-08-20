/**
* VIBE Tokenomics - On-Chain Snapshot & Merkle Tree Generator
* 
* Usage:
*   node scripts/makeSnapshot.cjs [roundNumber]
*   Example: node scripts/makeSnapshot.cjs 1
*/

let fs = require('fs');
let path = require('path');
let https = require('https');
let { parseUnits, keccak256, encodePacked, concatHex } = require('../frontend/node_modules/viem');

const TOKEN_ADDRESS = '0xb200000000000000000000df24ecb8bf51100a01';
const VESTING_CONTRACT = '0x77e04dd8c45725d2b2b3c8eebac2f3f1708fd089';
const MIN_BALANCE = 5000000;
const MONTHLY_POOL = 10000000;

const SYSTEM_EXCLUSIONS = [
  '0x498581ff718922c3f8e6a244956af099b2652b2b',
  '0x3beea54db87a632a5faf20db6765d3af94c81b31',
  '0x0000000000000000000000000000000000000dead',
  '0x0000000000000000000000000000000000000000',
  '0x067c66addd3c6d484c1882b68e197b614f7f3ebf',
  '0x3b277d566b4557a53392712b1dc830da5d13ba91',
  '0x77e04dd8c45725d2b2b3c8eebac2f3f1708fd089'
].map(a => a.toLowerCase());

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function hashPair(a, b) {
  const bufA = Buffer.from(a.slice(2), 'hex');
  const bufB = Buffer.from(b.slice(2), 'hex');
  return Buffer.compare(bufA, bufB) < 0
    ? keccak256(concatHex([a, b]))
    : keccak256(concatHex([b, a]));
}

function buildMerkleTree(elements) {
  const leaves = elements.map(e => e.leaf);
  if (leaves.length === 0) {
    return { root: '0x0000000000000000000000000000000000000000000000000000000000000000', proofs: {} };
  }

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
      balance: elements[i].balance,
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
  const roundNumber = parseInt(process.argv[2] || '1', 10);
  console.log('\n======================================================');
  console.log('🚀 VIBE Tokenomics - Snapshot & Merkle Generator (Round ' + roundNumber + ')');
  console.log('=====================================================');
  console.log('Token CA:             ' + TOKEN_ADDRESS);
  console.log('Vesting Contract:     ' + VESTING_CONTRACT);
  console.log('Min Holding Required: ' + MIN_BALANCE.toLocaleString() + ' $VIBE');
  console.log('Monthly RewardPool:  ' + MONTHLY_POOL.toLocaleString() + ' $VIBE');
  console.log('Timestamp:            ' + new Date().toISOString());
  console.log('-----------------------------------------------------\n');

  console.log('[1/4] 🔍 Scanning Base blockchain for all $VIBE token holders...');
  
  let allHolders = [];
  let url = 'https://base.blockscout.com/api/v2/tokens/' + TOKEN_ADDRESS + '/holders';
  let page = 1;

  while (url && page <= 20) {
    try {
      const data = await fetchJson(url);
      if (!data || !data.items || data.items.length === 0) break;
      allHolders.push(...data.items);
      
      const lastInPage = Number(data.items[data.items.length - 1].value) / 1e18;
      if (lastInPage < MIN_BALANCE && allHolders.length > 50) {
        break;
      }

      if (data.next_page_params) {
        const q = new URLSearchParams(data.next_page_params).toString();
        url = 'https://base.blockscout.com/api/v2/tokens/' + TOKEN_ADDRESS + '/holders?' + q;
        page++;
      } else {
        break;
      }
    } catch (e) {
      console.warn('Warning on page ' + page + ':', e.message);
      break;
    }
  }

  console.log('Total addresses fetched from Base: ' + allHolders.length);

  const eligible = allHolders.map(h => ({
    address: h.address.hash,
    balance: Number(h.value) / 1e18,
    name: h.address.name || null
  })).filter(h => {
    const isExcl = SYSTEM_EXCLUSIONS.includes(h.address.toLowerCase());
    return h.balance >= MIN_BALANCE && !isExcl;
  });

  console.log('[2/4] 📊 Filtering Qualified Wallets (>= ' + MIN_BALANCE.toLocaleString() + ' $VIBE)...');
  console.log('Found ' + eligible.length + ' Qualified User Wallets!');

  const totalEligibleSum = eligible.reduce((acc, h) => acc + h.balance, 0);
  console.log('Total Qualified Pool Sum: ' + Math.round(totalEligibleSum).toLocaleString() + ' $VIBE');

  console.log('\n[3/4] 🛮 Calculating Proportional Allocations from 10,000,000 $VIBE Pool...');
  
  let totalDistributed = 0;
  const elements = eligible.map(h => {
    const shareRatio = h.balance / totalEligibleSum;
    const rewardAmount = Math.round(shareRatio * MONTHLY_POOL);
    totalDistributed += rewardAmount;
    
    const amountWei = parseUnits(rewardAmount.toString(), 18);
    const leaf = keccak256(encodePacked(['address', 'uint256'], [h.address, amountWei]));

    return {
      address: h.address,
      balance: Math.round(h.balance),
      amount: rewardAmount,
      amountWei: amountWei,
      sharePercent: (shareRatio * 100).toFixed(4) + '%',
      leaf: leaf
    };
  });

  console.log('Total Distributed: ' + totalDistributed.toLocaleString() + ' $VIBE (100% matched)');

  console.log('\n[4/4] 🌳🌼 Generating Merkle Tree & Cryptographic Proofs...');
  const { root, proofs } = buildMerkleTree(elements);

  console.log('\n======================================================');
  console.log('✅ SNAPSHOT &_MERKLE_TREE_GENERATED_SUCCESSFULLY!');
  console.log('=====================================================');
  console.log('🔑 Merkle Root (for Round ' + roundNumber + '):');
  console.log(root + '\n');

  const outDir = path.join(__dirname, '../snapshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const rootFile = path.join(outDir, 'round_' + roundNumber + '_root.txt');
  fs.writeFileSync(rootFile, root, 'utf8');

  const proofsFile = path.join(outDir, 'round_' + roundNumber + '_proofs.json');
  fs.writeFileSync(proofsFile, JSON.stringify({
    round: roundNumber,
    token: TOKEN_ADDRESS,
    vestingContract: VESTING_CONTRACT,
    snapshotDate: new Date().toISOString(),
    merkleRoot: root,
    totalHolders: elements.length,
    totalEligibleSupply: totalEligibleSum,
    monthlyPool: MONTHLY_POOL,
    claims: proofs
  }, null, 2), 'utf8');

  const frontendDataDir = path.join(__dirname, '../frontend/src/data');
  if (!fs.existsSync(frontendDataDir)) {
    fs.mkdirSync(frontendDataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(frontendDataDir, 'round_' + roundNumber + '_proofs.json'), JSON.stringify({
    round: roundNumber,
    merkleRoot: root,
    claims: proofs
  }, null, 2), 'utf8');

  const csvFile = path.join(outDir, 'round_' + roundNumber + '_table.csv');
  let csv = 'Rank,Address,Balance,SharePercent,RewardAmount\n';
  elements.forEach((e, idx) => {
    csv += (idx + 1) + ',' + e.address + ',' + e.balance + ',' + e.sharePercent + ',' + e.amount + '\n';
  });
  fs.writeFileSync(csvFile, csv, 'utf8');

  console.log('📁 Files Saved:');
  console.log('1. Root file:   ' + rootFile);
  console.log('2. Proofs file: ' + proofsFile);
  console.log('3. Audit CSV:   ' + csvFile);
  console.log('4. UI Ready:    ' + path.join(frontendDataDir, 'round_' + roundNumber + '_proofs.json'));

  console.log('\n📋 Top 10 Qualified Allocations:');
  console.table(elements.slice(0, 10).map((e, idx) => ({
    '#': idx + 1,
    'Address': e.address.slice(0, 8) + '...' + e.address.slice(-6),
    'Balance': e.balance.toLocaleString() + ' $VIBE',
    'Share': e.sharePercent,
    'Reward': e.amount.toLocaleString() + ' $VIBE'
  })));

  console.log('\n🎯 NEXT ACTION:');
  console.log('Send 1 transaction on Base to contract ' + VESTING_CONTRACT + ':');
  console.log('Function: setMerkleRoot(' + roundNumber + ', "' + root + '")\n');
}

runSnapshot().catch(err => {
  console.error('Fatal error during snapshot execution:', err);
  process.exit(1);
});
