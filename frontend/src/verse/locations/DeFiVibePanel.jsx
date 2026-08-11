import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { parseEther, encodeFunctionData } from 'viem';
import { useUserBalances } from '../hooks/useUserBalances';

const BUILDER_CODE = 'bc_wsbqqe2u';
const BUILDER_CODE_HEX = '62635f7773627171653275'; // bc_wsbqqe2u in hex

const SWAP_ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481'; // Uniswap V3 SwapRouter02 on Base
const WETH_ADDRESS = '0x4200000000000000000000df24ecb8bf51100a01';
const VIBE_TOKEN_ADDRESS = '0xb200000000000000000000df24ecb8bf51100a01';

const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function'
  }
];

export default function DeFiVibePanel({ player }) {
  const { authenticated, user, sendTransaction, login } = usePrivy();
  const rawAddress = user?.wallet?.address;
  const balances = useUserBalances(rawAddress);

  const [activeTab, setActiveTab] = useState('in_game'); // 'in_game' | 'o1_widget'
  const [fromAmount, setFromAmount] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  const vibeRate = 238000000; // 1 ETH = ~238M $VIBE
  const estimatedVibe = fromAmount && !isNaN(fromAmount) ? (Number(fromAmount) * vibeRate).toLocaleString() : '0';

  const handleSwap = async () => {
    if (!authenticated || !rawAddress) {
      if (login) login();
      return;
    }
    if (!fromAmount || isNaN(fromAmount) || Number(fromAmount) <= 0) {
      setTxStatus('⚠️ Enter a valid ETH amount');
      return;
    }

    setSwapping(true);
    setTxStatus('⌛ Confirming transaction in your wallet...');

    try {
      const amountWei = parseEther(fromAmount);

      const baseCalldata = encodeFunctionData({
        abi: SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [
          {
            tokenIn: WETH_ADDRESS,
            tokenOut: VIBE_TOKEN_ADDRESS,
            fee: 10000, // 1% pool fee
            recipient: rawAddress,
            amountIn: amountWei,
            amountOutMinimum: 0n,
            sqrtPriceLimitX96: 0n
          }
        ]
      });

      // Append Builder Code bc_wsbqqe2u hex payload to calldata
      const finalCalldata = baseCalldata + BUILDER_CODE_HEX;

      const unsignedTx = {
        to: SWAP_ROUTER_ADDRESS,
        value: amountWei,
        data: finalCalldata
      };

      if (sendTransaction) {
        await sendTransaction(unsignedTx);
        setTxStatus('✅ Swap transaction submitted to Base!');
      } else {
        // Fallback: direct window.ethereum
        const ethereum = window.ethereum;
        if (ethereum) {
          await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: rawAddress,
              to: SWAP_ROUTER_ADDRESS,
              value: '0x' + amountWei.toString(16),
              data: finalCalldata
            }]
          });
          setTxStatus('✅ Swap transaction submitted to Base!');
        } else {
          setTxStatus('⚠️ No Web3 wallet provider found');
        }
      }
    } catch (err) {
      console.error('Swap error:', err);
      if (err?.message?.includes('user rejected')) {
        setTxStatus('✕ Transaction rejected in wallet');
      } else {
        setTxStatus(`⚠️ Transaction failed: ${err?.shortMessage || err?.message || 'Error'}`);
      }
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px', padding: '4px' }}>
      {/* Mode Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <button
          onClick={() => setActiveTab('in_game')}
          style={{
            flex: 1,
            fontFamily: 'var(--vv-pixel)',
            fontSize: '11px',
            fontWeight: 900,
            padding: '12px',
            borderRadius: '10px',
            border: activeTab === 'in_game' ? '2px solid #00f5ff' : '1.5px solid rgba(255, 255, 255, 0.15)',
            background: activeTab === 'in_game' ? 'rgba(0, 245, 255, 0.2)' : 'rgba(2, 11, 26, 0.8)',
            color: activeTab === 'in_game' ? '#00f5ff' : '#aaa',
            cursor: 'pointer',
            boxShadow: activeTab === 'in_game' ? '0 0 16px rgba(0, 245, 255, 0.4)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          ⚡ REAL IN-GAME DEX (O1 ROUTER)
        </button>
        <button
          onClick={() => setActiveTab('o1_widget')}
          style={{
            flex: 1,
            fontFamily: 'var(--vv-pixel)',
            fontSize: '11px',
            fontWeight: 900,
            padding: '12px',
            borderRadius: '10px',
            border: activeTab === 'o1_widget' ? '2px solid #ffd700' : '1.5px solid rgba(255, 255, 255, 0.15)',
            background: activeTab === 'o1_widget' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(2, 11, 26, 0.8)',
            color: activeTab === 'o1_widget' ? '#ffd700' : '#aaa',
            cursor: 'pointer',
            boxShadow: activeTab === 'o1_widget' ? '0 0 16px rgba(255, 215, 0, 0.4)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          🚀 O1 LAUNCHPAD DAPP WIDGET
        </button>
      </div>

      {activeTab === 'in_game' ? (
        <>
          {/* Builder Code Status Banner */}
          <div style={{
            background: 'rgba(0, 245, 255, 0.15)',
            border: '1.5px solid rgba(0, 245, 255, 0.5)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(0, 245, 255, 0.2)'
          }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            <div style={{ fontSize: '10px', color: '#00f5ff', lineHeight: 1.6 }}>
              <strong style={{ color: '#fff' }}>O1 ROUTER REAL WEB3 SWAP:</strong> Swaps trigger a real on-chain transaction in your wallet on Base Mainnet, embedding Builder Code <code>{BUILDER_CODE}</code>!
            </div>
          </div>

          {/* Main Swap Card */}
          <div style={{
            background: 'rgba(4, 20, 48, 0.95)',
            border: '2px solid #00f5ff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '16px', letterSpacing: '0.5px' }}>
              SWAP ETH ➔ $VIBE (BASE MAINNET)
            </div>

            {/* FROM Token Input */}
            <div style={{ background: '#020b1a', border: '1.5px solid rgba(0,245,255,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '9px', marginBottom: '8px' }}>
                <span>YOU PAY</span>
                <span>BALANCE: {balances.loading ? 'Loading...' : `${balances.ethFormatted} ETH`}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="0.001"
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    setTxStatus('');
                  }}
                  style={{
                    flex: 1,
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '14px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    outline: 'none',
                    fontWeight: 900
                  }}
                />
                <button
                  onClick={() => setFromAmount('0.005')}
                  style={{
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '9px',
                    background: 'rgba(0, 245, 255, 0.2)',
                    border: '1px solid #00f5ff',
                    color: '#00f5ff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  0.005 ETH
                </button>
                <span style={{ color: '#00f5ff', fontSize: '11px', fontWeight: 900, background: 'rgba(0,245,255,0.15)', padding: '6px 12px', borderRadius: '6px' }}>
                  ETH
                </span>
              </div>
            </div>

            {/* Swap Arrow */}
            <div style={{ textAlign: 'center', margin: '-4px 0 8px 0', color: '#ffd700', fontSize: '14px' }}>
              ⬇
            </div>

            {/* TO Token Input */}
            <div style={{ background: '#020b1a', border: '1.5px solid rgba(0,245,255,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '9px', marginBottom: '8px' }}>
                <span>YOU RECEIVE (ESTIMATED)</span>
                <span>CURRENT BALANCE: {balances.loading ? 'Loading...' : `${balances.vibeFormatted} $VIBE`}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1, color: '#00ff88', fontSize: '14px', fontWeight: 900 }}>
                  {estimatedVibe}
                </div>
                <span style={{ color: '#ffd700', fontSize: '11px', fontWeight: 900, background: 'rgba(255,215,0,0.15)', padding: '6px 12px', borderRadius: '6px' }}>
                  $VIBE
                </span>
              </div>
            </div>

            {/* Status Message */}
            {txStatus && (
              <div style={{
                marginBottom: '14px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: txStatus.includes('✅') ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 102, 0.15)',
                border: txStatus.includes('✅') ? '1px solid #00ff88' : '1px solid #ff4466',
                color: txStatus.includes('✅') ? '#00ff88' : '#ff4466',
                fontSize: '10px',
                fontWeight: 900
              }}>
                {txStatus}
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={swapping || !fromAmount || Number(fromAmount) <= 0}
              style={{
                width: '100%',
                fontFamily: 'var(--vv-pixel)',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                border: '2px solid #fff',
                borderRadius: '8px',
                padding: '14px',
                color: '#fff',
                fontWeight: 900,
                cursor: swapping ? 'default' : 'pointer',
                boxShadow: '0 4px 0 #0033aa'
              }}
            >
              {swapping ? 'CONFIRM IN WALLET...' : 'EXECUTE REAL SWAP ON BASE 🚀'}
            </button>
          </div>
        </>
      ) : (
        /* O1 Launchpad Embedded Widget View */
        <div style={{
          background: 'rgba(4, 20, 48, 0.95)',
          border: '2px solid #ffd700',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '11px', color: '#ffd700', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>O1 LAUNCHPAD TOKEN SWAP DAPP</span>
            <a
              href="https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#00f5ff', textDecoration: 'none' }}
            >
              OPEN FULL TAB ↗
            </a>
          </div>
          <iframe
            src="https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453"
            title="o1 Exchange VIBE Swap"
            style={{
              width: '100%',
              height: '460px',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              borderRadius: '8px',
              background: '#020b1a'
            }}
          />
        </div>
      )}
    </div>
  );
}
