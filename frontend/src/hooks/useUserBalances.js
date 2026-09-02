import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

const VIBE_TOKEN_ADDRESS = '0xb200000000000000000000df24ecb8bf51100a01';
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export function useUserBalances(address) {
  const [balances, setBalances] = useState({
    eth: '0',
    vibe: '0',
    ethFormatted: '0.0000',
    vibeFormatted: '0',
    exactVibeStr: '0',
    loading: false,
    rawEth: 0n,
    rawVibe: 0n
  });

  useEffect(() => {
    if (!address) {
      setBalances({
        eth: '0',
        vibe: '0',
        ethFormatted: '0.0000',
        vibeFormatted: '0',
        exactVibeStr: '0',
        loading: false,
        rawEth: 0n,
        rawVibe: 0n
      });
      return;
    }

    let isSubscribed = true;

    async function fetchBalances() {
      setBalances((prev) => ({ ...prev, loading: true }));
      try {
        const client = createPublicClient({ chain: base, transport: http() });

        const [ethBalance, vibeBalance] = await Promise.all([
          client.getBalance({ address }).catch(() => 0n),
          client.readContract({
            address: VIBE_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
          }).catch(() => 0n),
        ]);

        if (!isSubscribed) return;

        const exactVibeStr = formatUnits(vibeBalance, 18);
        const ethNum = parseFloat(formatUnits(ethBalance, 18));
        const vibeNum = parseFloat(exactVibeStr);

        const ethFormatted = ethNum.toFixed(4);
        const vibeFormatted = vibeNum >= 1000000
          ? (vibeNum / 1000000).toFixed(2) + 'M'
          : vibeNum >= 1000
          ? (vibeNum / 1000).toFixed(2) + 'K'
          : vibeNum.toLocaleString(undefined, { maximumFractionDigits: 2 });

        setBalances({
          eth: ethNum.toString(),
          vibe: exactVibeStr,
          ethFormatted,
          vibeFormatted,
          exactVibeStr,
          loading: false,
          rawEth: ethBalance,
          rawVibe: vibeBalance
        });
      } catch (err) {
        console.error('Error fetching on-chain balances:', err);
        if (isSubscribed) setBalances((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchBalances();
    const timer = setInterval(fetchBalances, 15000);
    return () => {
      isSubscribed = false;
      clearInterval(timer);
    };
  }, [address]);

  return balances;
}
