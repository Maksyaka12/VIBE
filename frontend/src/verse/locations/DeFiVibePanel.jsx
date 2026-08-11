import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseEther, encodeFunctionData, parseUnits } from 'viem';
import { useUserBalances } from '../hooks/useUserBalances';

const BUILDER_CODE = 'bc_wsbqqe2u';
const BUILDER_CODE_HEX = '62635f7773627171653275'; // bc_wsbqqe2u hex payload

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

const MULTICALL_ABI = [
  {
    inputs: [{ name: 'data', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', type: 'bytes[]' }],
    stateMutability: 'payable',
    type: 'function'
  }
];

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export default function DeFiVibePanel({ player }) {
  const { authenticated, user, sendTransaction, login } = usePrivy();
  const { wallets } = useWallets();
  const rawAddress = user?.wallet?.address;
  const balances = useUserBalances(rawAddress);

  const [mode, setMode] = useState('buy'); // 'buy' (ETH -> VIBE) | 'sell' (VIBE -> ETH)
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState(1.0); // 1%
  const [swapping, setSwapping] = useState(false);
  const [txStatus, setTxStatus] = useState({ type: '', msg: '', hash: '' });

  // Rate: 1 ETH ~ 238,000,000 $VIBE
  const vibeRate = 238000000;

  const estimatedOutput = React.useMemo(() => {
    if (!fromAmount || isNaN(fromAmount) || Number(fromAmount) <= 0) return '0';
    if (mode === 'buy') {
      const out = Number(fromAmount) * vibeRate;
      return out >= 1000000
        ? (out / 1000000).toFixed(2) + 'M'
        : out >= 1000
        ? (out / 1000).toFixed(2) + 'K'
        : out.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } else {
      const out = Number(fromAmount) / vibeRate;
      return out.toFixed(6);
    }
  }, [fromAmount, mode, vibeRate]);

  // Universal Web3 transaction helper supporting all wallet types
  const executeWeb3Tx = async (to, valueBigInt, dataHex) => {
    // 1. Find connected Privy wallet provider
    const connectedWallet = wallets.find(
      (w) => w.address?.toLowerCase() === rawAddress?.toLowerCase()
    ) || wallets[0];

    if (connectedWallet) {
      const provider = await connectedWallet.getEthereumProvider();
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: rawAddress,
          to,
          value: valueBigInt ? '0x' + valueBigInt.toString(16) : '0x0',
          data: dataHex
        }]
      });
      return hash;
    }

    // 2. Browser window.ethereum fallback
    if (window.ethereum) {
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: rawAddress,
          to,
          value: valueBigInt ? '0x' + valueBigInt.toString(16) : '0x0',
          data: dataHex
        }]
      });
      return hash;
    }

    // 3. Privy sendTransaction fallback
    if (sendTransaction) {
      const res = await sendTransaction({
        to,
        value: valueBigInt,
        data: dataHex
      });
      return res?.transactionHash || res?.hash || '';
    }

    throw new Error('No active Web3 wallet found');
  };

  const handlePreset = (val) => {
    setFromAmount(val);
    setTxStatus({ type: '', msg: '', hash: '' });
  };

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'buy' ? 'sell' : 'buy'));
    setFromAmount('');
    setTxStatus({ type: '', msg: '', hash: '' });
  };

  const handleSwap = async () => {
    if (!authenticated || !rawAddress) {
      if (login) login();
      return;
    }
    if (!fromAmount || isNaN(fromAmount) || Number(fromAmount) <= 0) {
      setTxStatus({ type: 'error', msg: '⚠️ Enter a valid swap amount' });
      return;
    }

    setSwapping(true);
    setTxStatus({ type: 'info', msg: '⌛ Confirming in your Web3 wallet...' });

    try {
      if (mode === 'buy') {
        // BUY: Pay ETH -> Receive VIBE
        const amountWei = parseEther(fromAmount);

        // Encode inner exactInputSingle call
        const exactInputSingleCalldata = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: WETH_ADDRESS,
              tokenOut: VIBE_TOKEN_ADDRESS,
              fee: 10000, // 1% pool tier
              recipient: rawAddress,
              amountIn: amountWei,
              amountOutMinimum: 0n,
              sqrtPriceLimitX96: 0n
            }
          ]
        });

        // Wrap in multicall to allow native ETH msg.value handling on Uniswap V3 SwapRouter02
        const multicallCalldata = encodeFunctionData({
          abi: MULTICALL_ABI,
          functionName: 'multicall',
          args: [[exactInputSingleCalldata]]
        });

        // Append Builder Code bc_wsbqqe2u hex suffix
        const finalCalldata = multicallCalldata + BUILDER_CODE_HEX;

        const txHash = await executeWeb3Tx(SWAP_ROUTER_ADDRESS, amountWei, finalCalldata);

        setTxStatus({
          type: 'success',
          msg: '🎉 Swap Submitted to Base Mainnet!',
          hash: txHash
        });
      } else {
        // SELL: Pay VIBE -> Receive ETH (Step 1: Approve, Step 2: Swap)
        const amountVibeWei = parseUnits(fromAmount, 18);

        setTxStatus({ type: 'info', msg: '⌛ Step 1/2: Approving $VIBE for o1 Router...' });

        const approveCalldata = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [SWAP_ROUTER_ADDRESS, amountVibeWei]
        });

        await executeWeb3Tx(VIBE_TOKEN_ADDRESS, 0n, approveCalldata);

        setTxStatus({ type: 'info', msg: '⌛ Step 2/2: Confirming $VIBE ➔ ETH Swap...' });

        const swapCalldata = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: VIBE_TOKEN_ADDRESS,
              tokenOut: WETH_ADDRESS,
              fee: 10000,
              recipient: rawAddress,
              amountIn: amountVibeWei,
              amountOutMinimum: 0n,
              sqrtPriceLimitX96: 0n
            }
          ]
        });

        const finalSwapCalldata = swapCalldata + BUILDER_CODE_HEX;

        const txHash = await executeWeb3Tx(SWAP_ROUTER_ADDRESS, 0n, finalSwapCalldata);

        setTxStatus({
          type: 'success',
          msg: '🎉 $VIBE Sale Submitted to Base Mainnet!',
          hash: txHash
        });
      }
    } catch (err) {
      console.error('Swap execution error:', err);
      if (err?.message?.includes('user rejected') || err?.message?.includes('User rejected')) {
        setTxStatus({ type: 'error', msg: '✕ Transaction rejected in wallet' });
      } else {
        setTxStatus({ type: 'error', msg: `⚠️ Swap failed: ${err?.shortMessage || err?.message || 'Error'}` });
      }
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px', padding: '4px' }}>
      {/* Top Banner: O1 Exchange API & Builder Code Status */}
      <div style={{
        background: 'rgba(0, 245, 255, 0.12)',
        border: '1.5px solid rgba(0, 245, 255, 0.5)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 245, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '26px' }}>⚡</span>
          <div>
            <div style={{ color: '#00f5ff', fontSize: '13px', fontWeight: 900, letterSpacing: '0.8px', marginBottom: '2px' }}>
              O1 EXCHANGE IN-GAME DEX ENGINE
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px' }}>
              Native Web3 Swap Powered by o1 Router API & Base Builder Code <code>{BUILDER_CODE}</code>
            </div>
          </div>
        </div>
        <div style={{
          background: 'rgba(0, 255, 136, 0.15)',
          border: '1px solid #00ff88',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '9px',
          color: '#00ff88',
          fontWeight: 900,
          whiteSpace: 'nowrap'
        }}>
          ● BASE MAINNET LIVE
        </div>
      </div>

      {/* Main Pixel Swap Window Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.96)',
        border: '3px solid #00f5ff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 245, 255, 0.25)'
      }}>
        {/* Header & Mode Switcher */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 900, letterSpacing: '0.8px' }}>
            {mode === 'buy' ? 'BUY $VIBE (PAY ETH)' : 'SELL $VIBE (RECEIVE ETH)'}
          </div>

          {/* Slippage Tolerance Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', color: '#88aacc', fontWeight: 900 }}>SLIPPAGE:</span>
            {[0.5, 1.0, 3.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                style={{
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '9px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: slippage === s ? '1px solid #00f5ff' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: slippage === s ? 'rgba(0, 245, 255, 0.25)' : 'rgba(2, 11, 26, 0.6)',
                  color: slippage === s ? '#00f5ff' : '#aaa',
                  cursor: 'pointer',
                  fontWeight: 900
                }}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* INPUT CARD 1: YOU PAY */}
        <div style={{
          background: '#020b1a',
          border: '2px solid rgba(0, 245, 255, 0.4)',
          borderRadius: '12px',
          padding: '16px 18px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '9px', marginBottom: '10px', fontWeight: 900 }}>
            <span>YOU PAY</span>
            <span>
              BALANCE:{' '}
              <strong style={{ color: mode === 'buy' ? '#00f5ff' : '#ffd700' }}>
                {balances.loading
                  ? 'Loading...'
                  : mode === 'buy'
                  ? `${balances.ethFormatted} ETH`
                  : `${balances.vibeFormatted} $VIBE`}
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value);
                setTxStatus({ type: '', msg: '', hash: '' });
              }}
              style={{
                flex: 1,
                fontFamily: 'var(--vv-pixel)',
                fontSize: '18px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                outline: 'none',
                fontWeight: 900
              }}
            />
            <span style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '11px',
              fontWeight: 900,
              color: mode === 'buy' ? '#00f5ff' : '#ffd700',
              background: mode === 'buy' ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 215, 0, 0.15)',
              border: mode === 'buy' ? '1px solid #00f5ff' : '1px solid #ffd700',
              padding: '8px 14px',
              borderRadius: '8px'
            }}>
              {mode === 'buy' ? 'ETH' : '$VIBE'}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {mode === 'buy' ? (
              ['0.001', '0.005', '0.01', '0.05'].map((val) => (
                <button
                  key={val}
                  onClick={() => handlePreset(val)}
                  style={{
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '9px',
                    background: 'rgba(0, 245, 255, 0.12)',
                    border: '1px solid rgba(0, 245, 255, 0.4)',
                    color: '#00f5ff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 900
                  }}
                >
                  {val} ETH
                </button>
              ))
            ) : (
              <button
                onClick={() => handlePreset(balances.vibe || '0')}
                style={{
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '9px',
                  background: 'rgba(255, 215, 0, 0.12)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  color: '#ffd700',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 900
                }}
              >
                MAX $VIBE
              </button>
            )}
          </div>
        </div>

        {/* FLIP DIRECTION BUTTON ↕ */}
        <div style={{ textAlign: 'center', margin: '-4px 0 10px 0' }}>
          <button
            onClick={handleToggleMode}
            title="Switch Swap Direction"
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '14px',
              background: 'rgba(4, 20, 48, 0.95)',
              border: '2px solid #00f5ff',
              color: '#ffd700',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(0, 245, 255, 0.5)',
              transition: 'transform 0.2s ease'
            }}
          >
            ↕
          </button>
        </div>

        {/* INPUT CARD 2: YOU RECEIVE */}
        <div style={{
          background: '#020b1a',
          border: '2px solid rgba(0, 245, 255, 0.4)',
          borderRadius: '12px',
          padding: '16px 18px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '9px', marginBottom: '10px', fontWeight: 900 }}>
            <span>YOU RECEIVE (ESTIMATED)</span>
            <span>
              CURRENT BALANCE:{' '}
              <strong style={{ color: mode === 'buy' ? '#ffd700' : '#00f5ff' }}>
                {balances.loading
                  ? 'Loading...'
                  : mode === 'buy'
                  ? `${balances.vibeFormatted} $VIBE`
                  : `${balances.ethFormatted} ETH`}
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              fontFamily: 'var(--vv-pixel)',
              fontSize: '18px',
              color: '#00ff88',
              fontWeight: 900
            }}>
              {estimatedOutput}
            </div>
            <span style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '11px',
              fontWeight: 900,
              color: mode === 'buy' ? '#ffd700' : '#00f5ff',
              background: mode === 'buy' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 245, 255, 0.15)',
              border: mode === 'buy' ? '1px solid #ffd700' : '1px solid #00f5ff',
              padding: '8px 14px',
              borderRadius: '8px'
            }}>
              {mode === 'buy' ? '$VIBE' : 'ETH'}
            </span>
          </div>
        </div>

        {/* Status Toast Message */}
        {txStatus.msg && (
          <div style={{
            marginBottom: '18px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: txStatus.type === 'success'
              ? 'rgba(0, 255, 136, 0.15)'
              : txStatus.type === 'error'
              ? 'rgba(255, 68, 102, 0.15)'
              : 'rgba(0, 245, 255, 0.15)',
            border: txStatus.type === 'success'
              ? '1.5px solid #00ff88'
              : txStatus.type === 'error'
              ? '1.5px solid #ff4466'
              : '1.5px solid #00f5ff',
            color: txStatus.type === 'success'
              ? '#00ff88'
              : txStatus.type === 'error'
              ? '#ff4466'
              : '#00f5ff',
            fontSize: '10px',
            fontWeight: 900,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{txStatus.msg}</span>
            {txStatus.hash && (
              <a
                href={`https://basescan.org/tx/${txStatus.hash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00f5ff', textDecoration: 'underline' }}
              >
                BASESCAN ↗
              </a>
            )}
          </div>
        )}

        {/* MAIN SWAP ACTION BUTTON */}
        <button
          onClick={handleSwap}
          disabled={swapping || !fromAmount || Number(fromAmount) <= 0}
          style={{
            width: '100%',
            fontFamily: 'var(--vv-pixel)',
            fontSize: '13px',
            fontWeight: 900,
            background: mode === 'buy'
              ? 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)'
              : 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
            border: '2.5px solid #ffffff',
            borderRadius: '10px',
            padding: '16px',
            color: mode === 'buy' ? '#ffffff' : '#020b1a',
            cursor: swapping ? 'default' : 'pointer',
            boxShadow: mode === 'buy'
              ? '0 4px 0 #0033aa, 0 0 24px rgba(0, 245, 255, 0.5)'
              : '0 4px 0 #cc5500, 0 0 24px rgba(255, 215, 0, 0.5)',
            letterSpacing: '1px',
            transition: 'all 0.15s ease'
          }}
        >
          {swapping
            ? 'CONFIRM IN WALLET...'
            : mode === 'buy'
            ? 'BUY $VIBE VIA O1 ROUTER 🚀'
            : 'SELL $VIBE VIA O1 ROUTER ⚡'}
        </button>

        {/* Footer Info */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          justify: 'space-between',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '9px'
        }}>
          <span>EXECUTIVE ROUTER: o1 Launchpad / Uniswap V3</span>
          <span>BUILDER PROGRAM: {BUILDER_CODE}</span>
        </div>
      </div>
    </div>
  );
}
