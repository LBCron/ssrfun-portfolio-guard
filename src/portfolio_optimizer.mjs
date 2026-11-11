/**
 * @file portfolio_optimizer.mjs
 * Modern Portfolio Theory (MPT) & Risk Parity Engine for SSR.FUN on Solana.
 * Optimizes allocations between crypto (SOL, cbBTC) and tokenized real-world assets (SPY, QQQ, GLD, TLT).
 */

import { DEFAULT_ASSETS, BENCHMARKS } from './types.mjs';

export class PortfolioOptimizer {
  /**
   * Normalize an allocation weight vector so its sum is exactly 1.0.
   * @param {Record<string, number>} rawWeights
   * @returns {Record<string, number>}
   */
  static normalizeWeights(rawWeights) {
    const total = Object.values(rawWeights).reduce((acc, v) => acc + Math.max(0, v), 0);
    if (total <= 0) {
      throw new RangeError('Sum of positive weights must be greater than zero');
    }
    const normalized = {};
    for (const [k, v] of Object.entries(rawWeights)) {
      normalized[k] = Number((Math.max(0, v) / total).toFixed(4));
    }
    return normalized;
  }

  /**
   * Compute portfolio metrics: expected annual return, annualized volatility, and Sharpe ratio.
   * @param {Record<string, number>} weights - Normalized weights (sum ~ 1.0)
   * @param {Record<string, { expectedReturn: number, volatility: number }>} assetParams
   * @param {number} [riskFreeRate=0.045] - 4.5% US Treasury risk-free rate
   * @returns {{ expectedReturn: number, portfolioVolatility: number, sharpeRatio: number }}
   */
  static evaluatePortfolio(weights, assetParams, riskFreeRate = 0.045) {
    let expectedReturn = 0;
    let variance = 0;

    for (const [sym, w] of Object.entries(weights)) {
      const p = assetParams[sym] || { expectedReturn: 0.10, volatility: 0.25 };
      expectedReturn += w * p.expectedReturn;
      // Simplified diagonal + diversification cross-term
      variance += Math.pow(w * p.volatility, 2);
    }

    // Add inter-asset correlation damping (crypto vs equities correlation ~ 0.35)
    const diversificationFactor = 0.82;
    const portfolioVolatility = Number((Math.sqrt(variance) * diversificationFactor).toFixed(4));
    expectedReturn = Number(expectedReturn.toFixed(4));
    const excessReturn = expectedReturn - riskFreeRate;
    const sharpeRatio = portfolioVolatility > 0 ? Number((excessReturn / portfolioVolatility).toFixed(3)) : 0;

    return {
      expectedReturn,
      portfolioVolatility,
      sharpeRatio,
    };
  }

  /**
   * Generate rebalancing trades from current portfolio holdings to target allocation.
   * @param {Object} params
   * @param {Array<{symbol: string, balance: number, priceUsd: number}>} params.currentHoldings
   * @param {Record<string, number>} params.targetWeights
   * @param {number} [params.minTradeThresholdUsd=1.0] - Minimum trade size to ignore dust
   * @param {number} [params.maxSlippageBps=50] - 50 bps (0.5%) maximum allowed slippage
   * @returns {{
   *   totalAumUsd: number,
   *   rebalanceOrders: Array<{
   *     symbol: string,
   *     action: 'BUY' | 'SELL' | 'HOLD',
   *     currentValueUsd: number,
   *     targetValueUsd: number,
   *     deltaUsd: number,
   *     deltaUnits: number,
   *     maxSlippageBps: number
   *   }>,
   *   turnoverUsd: number
   * }}
   */
  static generateRebalanceOrders({
    currentHoldings,
    targetWeights,
    minTradeThresholdUsd = 1.0,
    maxSlippageBps = 50,
  }) {
    const totalAum = currentHoldings.reduce((acc, h) => acc + h.balance * h.priceUsd, 0);
    const normTargets = this.normalizeWeights(targetWeights);
    const holdingMap = new Map(currentHoldings.map((h) => [h.symbol, h]));

    // Include symbols from current holdings and targets
    const allSymbols = Array.from(new Set([...holdingMap.keys(), ...Object.keys(normTargets)]));

    const orders = [];
    let turnoverUsd = 0;

    for (const sym of allSymbols) {
      const holding = holdingMap.get(sym) || { symbol: sym, balance: 0, priceUsd: 1.0 };
      const currentVal = holding.balance * holding.priceUsd;
      const targetWeight = normTargets[sym] || 0;
      const targetVal = totalAum * targetWeight;
      const deltaUsd = targetVal - currentVal;

      let action = 'HOLD';
      if (Math.abs(deltaUsd) >= minTradeThresholdUsd) {
        action = deltaUsd > 0 ? 'BUY' : 'SELL';
        turnoverUsd += Math.abs(deltaUsd);
      }

      const deltaUnits = holding.priceUsd > 0 ? Number((Math.abs(deltaUsd) / holding.priceUsd).toFixed(6)) : 0;

      orders.push({
        symbol: sym,
        action,
        currentValueUsd: Number(currentVal.toFixed(2)),
        targetValueUsd: Number(targetVal.toFixed(2)),
        deltaUsd: Number(deltaUsd.toFixed(2)),
        deltaUnits,
        maxSlippageBps,
      });
    }

    return {
      totalAumUsd: Number(totalAum.toFixed(2)),
      rebalanceOrders: orders.sort((a, b) => Math.abs(b.deltaUsd) - Math.abs(a.deltaUsd)),
      turnoverUsd: Number((turnoverUsd / 2).toFixed(2)), // buy volume equals sell volume
    };
  }
}
