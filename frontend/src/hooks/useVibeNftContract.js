import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, parseEther, formatEther, encodeFunctionData, parseAbi } from 'viem';
import { base } from 'viem/chains';

export const NFT_CONTRACT_ADDRESS = '0x9E92307Dbec2d0aE4BBF14cA93E1cA00edC4b886';
export const VIBE_TOKEN_ADDRESS = '0xb200000000000000000000df24ecb8bf51100a01';
export const ADMIN_ADDRESS = '0x4C91d3beD372c11795b9cE9A9017Dfe447Bf050A';
export const BUILDER_CODE = 'bc_wsbqqe2u';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.public.blastapi.io')
});

const NFT_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function MAX_PER_WALLET() view returns (uint256)',
  'function getCurrentPhase() view returns (uint8)',
  'function getCurrentEthPrice() view returns (uint256)',
  'function ethPrice() view returns (uint256)',
  'function vibePrice() view returns (uint256)',
  'function mintLive() view returns (bool)',
  'function totalMintedCount() view returns (uint256)',
  'function walletMintCount(address) view returns (uint256)',
  'function getRemainingTokens() view returns (uint256)',
  'function mintWithETH() payable',
  'function mintWithVIBE(uint256 vibeAmount) external',
  'function mintWithVIBE() external',
  'function adminSwapAndBurn(uint256 ethAmount, bytes customSwapCalldata) external'
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
  const [currentPhase, setCurrentPhase] = useState(1);
  const [ethPriceWei, setEthPriceWei] = useState(parseEther('0.005'));
  const [vibePriceWei, setVibePriceWei] = useState(BigInt('1000000000000000000000000'));
  const [hasMinted, setHasMinted] = useState(false);
  const [mintCount, setMintCount] = useState(0);
  const [mintLive, setMintLive] = useState(true);
  const [contractEthBalance, setContractEthBalance] = useState('0');

  const [isMintingEth, setIsMintingEth] = useState(false);
  const [isMintingVibe, setIsMintingVibe] = useState(false);
  const [isApprovingVibe, setIsApprovingVibe] = useState(false);
  const [isAdminSwapping, setIsAdminSwapping] = useState(false);
  const [adminSwapSuccess, setAdminSwapSuccess] = useState(false);
  const [adminTxHash, setAdminTxHash] = useState('');
  const [txHash, setTxHash] = useState('');
  const [lastMintedId, setLastMintedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mintSuccess, setMintSuccess] = useState(false);

  // Fetch On-Chain State
  const fetchContractState = useCallback(async () => {
    try {
      const [minted, remaining, supply, live, ethBal] = await Promise.all([
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'totalMintedCount' }).catch(() => 0),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'getRemainingTokens' }).catch(() => 333),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'MAX_SUPPLY' }).catch(() => 333),
        publicClient.readContract({ address: NFT_CONTRACT_ADDRESS, abi: NFT_ABI, functionName: 'mintLive' }).catch(() => true),
        publicClient.getBalance({ address: NFT_CONTRACT_ADDRESS }).catch(() => BigInt(0))
      ]);

      const mintedNum = Number(minted);
      setTotalMinted(mintedNum);
      setRemainingTokens(Number(remaining));
      setMaxSupply(Number(supply));
      setMintLive(live);
      setContractEthBalance(formatEther(ethBal));

      // Automated phase calculation
      let phase = 1;
      let price = parseEther('0.005');
      if (mintedNum < 103) {
        phase = 1;
        price = parseEther('0.005');
      } else if (mintedNum < 203) {
        phase = 2;
        price = parseEther('0.015');
      } else if (mintedNum < 303) {
        phase = 3;
        price = parseEther('0.05');
      } else {
        phase = 4;
        price = parseEther('0.1');
      }
      setCurrentPhase(phase);
      setEthPriceWei(price);

      if (walletAddress) {
        const userCount = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'walletMintCount',
          args: [walletAddress]
        }).catch(() => 0);
        setMintCount(Number(userCount));
        setHasMinted(Number(userCount) >= 1);
      }
    } catch (e) {
      console.error('Error fetching NFT contract state:', e);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchContractState();
    const interval = setInterval(fetchContractState, 12000);
    return () => clearInterval(interval);
  }, [fetchContractState]);

  // Web3 Transaction Dispatcher
  const sendWeb3Transaction = async (to, valueBigInt, dataHex, customGas = '0x7A120') => {
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
          data: dataHex,
          gas: customGas
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
          data: dataHex,
          gas: customGas
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

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        let mintedId = null;
        if (receipt.logs) {
          const transferLog = receipt.logs.find((log) =>
            log.address?.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase() &&
            log.topics && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          );
          if (transferLog && transferLog.topics && transferLog.topics[3]) {
            mintedId = Number(BigInt(transferLog.topics[3]));
          }
        }
        if (!mintedId) {
          mintedId = (totalMinted || 0) + 1;
        }
        setLastMintedId(mintedId);
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
  const mintWithVIBE = async (customVibeAmountWei) => {
    if (!authenticated || !walletAddress) {
      login();
      return;
    }
    setErrorMessage('');
    setMintSuccess(false);
    setIsMintingVibe(false);

    const amountToSend = customVibeAmountWei || vibePriceWei;

    try {
      // Check ERC20 allowance
      const currentAllowance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress, NFT_CONTRACT_ADDRESS]
      });

      if (currentAllowance < amountToSend) {
        setIsApprovingVibe(true);
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [NFT_CONTRACT_ADDRESS, BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')]
        });

        const approveHash = await sendWeb3Transaction(VIBE_TOKEN_ADDRESS, BigInt(0), approveData);
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        setIsApprovingVibe(false);
      }

      setIsMintingVibe(true);

      // Execute Mint with VIBE
      const mintData = encodeFunctionData({
        abi: NFT_ABI,
        functionName: 'mintWithVIBE',
        args: [amountToSend]
      });

      const hash = await sendWeb3Transaction(NFT_CONTRACT_ADDRESS, BigInt(0), mintData);
      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        let mintedId = null;
        if (receipt.logs) {
          const transferLog = receipt.logs.find((log) =>
            log.address?.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase() &&
            log.topics && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          );
          if (transferLog && transferLog.topics && transferLog.topics[3]) {
            mintedId = Number(BigInt(transferLog.topics[3]));
          }
        }
        if (!mintedId) {
          mintedId = (totalMinted || 0) + 1;
        }
        setLastMintedId(mintedId);
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

  // 3. Admin Swap & Auto-Burn
  const executeAdminSwapAndBurn = async (ethAmountStr) => {
    if (!authenticated || !walletAddress) {
      login();
      return;
    }
    setErrorMessage('');
    setAdminSwapSuccess(false);
    setIsAdminSwapping(true);
    setAdminTxHash('');

    try {
      const ethAmountWei = parseEther(ethAmountStr.toString());
      const dataHex = encodeFunctionData({
        abi: NFT_ABI,
        functionName: 'adminSwapAndBurn',
        args: [ethAmountWei, '0x']
      });

      const hash = await sendWeb3Transaction(NFT_CONTRACT_ADDRESS, BigInt(0), dataHex);
      setAdminTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        setAdminSwapSuccess(true);
        await fetchContractState();
      } else {
        throw new Error('Admin Swap & Burn reverted on Base');
      }
    } catch (e) {
      console.error('Admin Swap & Burn failed:', e);
      setErrorMessage(e?.shortMessage || e?.message || 'Admin Swap & Burn failed');
    } finally {
      setIsAdminSwapping(false);
    }
  };

  return {
    contractAddress: NFT_CONTRACT_ADDRESS,
    totalMinted,
    remainingTokens,
    maxSupply,
    currentPhase,
    ethPriceFormatted: formatEther(ethPriceWei),
    vibePriceFormatted: Number(formatEther(vibePriceWei)).toLocaleString('en-US'),
    contractEthBalance,
    hasMinted,
    mintCount,
    mintLive,
    isMintingEth,
    isMintingVibe,
    isApprovingVibe,
    isAdminSwapping,
    adminSwapSuccess,
    adminTxHash,
    txHash,
    lastMintedId,
    errorMessage,
    mintSuccess,
    mintWithETH,
    mintWithVIBE,
    executeAdminSwapAndBurn,
    refetch: fetchContractState
  };
}
