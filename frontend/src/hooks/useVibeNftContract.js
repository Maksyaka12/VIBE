import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, parseEther, formatEther, encodeFunctionData, parseAbi } from 'viem';
import { base } from 'viem/chains';

export const NFT_CONTRACT_ADDRESS = '0xcB0311b8B94494625F86Ef0359C36F55f8A9C67F';
export const VIBE_TOKEN_ADDRESS = '0xb200000000000000000000df24ecb8bf51100a01';
export const BUILDER_CODE = 'bc_wsbqqe2u';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
});

const NFT_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function MAX_PER_WALLET() view returns (uint256)',
  'function ethPrice() view returns (uint256)',
  'function vibePrice() view returns (uint256)',
  'function mintLive() view returns (bool)',
  'function totalMintedCount() view returns (uint256)',
  'function walletMintCount(address) view returns (uint256)',
  'function getRemainingTokens() view returns (uint256)',
  'function mintWithETH() payable',
  'function mintWithVIBE() external'
]);

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]);

export function useVibeNftContract() {
  const { authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = user?.wallet?.address;

  const [totalMinted, setTotalMinted] = useState(0);
  const [remainingTokens, setRemainingTokens] = useState(333);
  const [maxSupply, setMaxSupply] = useState(333);
  const [ethPriceWei, setEthPriceWei] = useState(parseEther('0.005'));
  const [vibePriceWei, setVibePriceWei] = useState(BigInt('1000000000000000000000000')); // 1,000,000 * 10^18
  const [hasMinted, setHasMinted] = useState(false);
  const [mintCount, setMintCount] = useState(0);
  const [mintLive, setMintLive] = useState(true);

  const [isMintingEth, setIsMintingEth] = useState(false);
  const [isMintingVibe, setIsMintingVibe] = useState(false);
  const [isApprovingVibe, setIsApprovingVibe] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [lastMintedId, setLastMintedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mintSuccess, setMintSuccess] = useState(false);

  // Fetch On-Chain State
  const fetchContractState = useCallback(async () => {
    try {
      const [minted, remaining, supply, ethP, vibeP, live] = await Promise.all([
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'totalMintedCount' }),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'getRemainingTokens' }),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'MAX_SUPPLY' }),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'ethPrice' }),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'vibePrice' }),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'mintLive' })
      ]);

      setTotalMinted(Number(minted));
      setRemainingTokens(Number(remaining));
      setMaxSupply(Number(supply));
      setEthPriceWei(ethP);
      setVibePriceWei(vibeP);
      setMintLive(live);

      if (walletAddress) {
        const userCount = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'walletMintCount',
          args: [walletAddress]
        });
        setMintCount(Number(userCount));
        setHasMinted(Number(userCount) >= 1);
      }
    } catch (e) {
      console.error('Error fetching NFT contract state:', e);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchContractState();
    const interval = setInterval(fetchContractState, 15000);
    return () => clearInterval(interval);
  }, [fetchContractState]);

  // Web3 Transaction Dispatcher
  const sendWeb3Transaction = async (to, valueBigInt, dataHex) => {
    const connectedWallet = wallets.find(
      (w) => w.address?.toLowerCase() === walletAddress?.toLowerCase()
    ) || wallets[0];

    if (connectedWallet) {
      const provider = await connectedWallet.getEthereumProvider();
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to,
          value: valueBigInt ? '0x' + valueBigInt.toString(16) : '0x0',
          data: dataHex
        }]
      });
      return hash;
    }

    if (window.ethereum) {
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to,
          value: valueBigInt ? '0x' + valueBigInt.toString(16) : '0x0',
          data: dataHex
        }]
      });
      return hash;
    }

    throw new Error('No compatible Web3 wallet found');
  };

  // 1. Mint with ETH
  const mintWithETH = async () => {
    if (!authenticated || !walletAddress) {
      login();
      return;
    }
    setErrorMessage('');
    setMintSuccess(false);
    setIsMintingEth(true);

    try {
      const dataHex = encodeFunctionData({
        abi: NFT_ABI,
        functionName: 'mintWithETH'
      });

      const hash = await sendWeb3Transaction(NFT_CONTRACT_ADDRESS, ethPriceWei, dataHex);
      setTxHash(hash);

      // Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        setMintSuccess(true);
        await fetchContractState();
      } else {
        throw new Error('Transaction reverted on Base');
      }
    } catch (e) {
      console.error('Mint with ETH failed:', e);
      setErrorMessage(e?.shortMessage || e?.message || 'Transaction failed');
    } finally {
      setIsMintingEth(false);
    }
  };

  // 2. Mint with $VIBE
  const mintWithVIBE = async () => {
    if (!authenticated || !walletAddress) {
      login();
      return;
    }
    setErrorMessage('');
    setMintSuccess(false);
    setIsMintingVibe(true);

    try {
      // Check ERC20 allowance
      const currentAllowance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress, NFT_CONTRACT_ADDRESS]
      });

      if (currentAllowance < vibePriceWei) {
        setIsApprovingVibe(true);
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [NFT_CONTRACT_ADDRESS, BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')] // MaxUint256
        });

        const approveHash = await sendWeb3Transaction(VIBE_TOKEN_ADDRESS, BigInt(0), approveData);
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        setIsApprovingVibe(false);
      }

      // Execute Mint with VIBE
      const mintData = encodeFunctionData({
        abi: NFT_ABI,
        functionName: 'mintWithVIBE'
      });

      const hash = await sendWeb3Transaction(NFT_CONTRACT_ADDRESS, BigInt(0), mintData);
      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        setMintSuccess(true);
        await fetchContractState();
      } else {
        throw new Error('Mint with VIBE reverted on Base');
      }
    } catch (e) {
      console.error('Mint with VIBE failed:', e);
      setErrorMessage(e?.shortMessage || e?.message || 'Transaction failed');
    } finally {
      setIsApprovingVibe(false);
      setIsMintingVibe(false);
    }
  };

  return {
    contractAddress: NFT_CONTRACT_ADDRESS,
    totalMinted,
    remainingTokens,
    maxSupply,
    ethPriceFormatted: formatEther(ethPriceWei),
    vibePriceFormatted: Number(formatEther(vibePriceWei)).toLocaleString('en-US'),
    hasMinted,
    mintCount,
    mintLive,
    isMintingEth,
    isMintingVibe,
    isApprovingVibe,
    txHash,
    lastMintedId,
    errorMessage,
    mintSuccess,
    mintWithETH,
    mintWithVIBE,
    refetch: fetchContractState
  };
}
