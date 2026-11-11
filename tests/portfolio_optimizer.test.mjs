import test from 'node:test';
import assert from 'node:assert/strict';
import { PortfolioOptimizer } from '../src/portfolio_optimizer.mjs';

test('PortfolioOptimizer.normalizeWeights - normalizes arbitrary weights to 1.0', () => {
  const raw = { SOL: 50, SPY: 50 };
  const normalized = PortfolioOptimizer.normalizeWeights(raw);
  assert.equal(normalized.SOL, 0.5);
  assert.equal(normalized.SPY, 0.5);
  assert.equal(normalized.SOL + normalized.SPY, 1.0);
});

test('PortfolioOptimizer.evaluatePortfolio - evaluates expected return and Sharpe', () => {
  const weights = { SOL: 0.5, SPY: 0.5 };
  const assetParams = {
    SOL: { expectedReturn: 0.30, volatility: 0.60 },
    SPY: { expectedReturn: 0.12, volatility: 0.18 },
  };
  const evalResult = PortfolioOptimizer.evaluatePortfolio(weights, assetParams, 0.045);

  assert.equal(evalResult.expectedReturn, 0.21);
  assert.ok(evalResult.portfolioVolatility > 0.20 && evalResult.portfolioVolatility < 0.35);
  assert.ok(evalResult.sharpeRatio > 0.5);
});

test('PortfolioOptimizer.generateRebalanceOrders - generates correct buy and sell orders', () => {
  const currentHoldings = [
    { symbol: 'SOL', balance: 4, priceUsd: 150 }, // $600 (60%)
    { symbol: 'SPY', balance: 0.8, priceUsd: 500 }, // $400 (40%)
  ];
  // Target 50% / 50% ($500 each)
  const targetWeights = { SOL: 0.5, SPY: 0.5 };

  const res = PortfolioOptimizer.generateRebalanceOrders({
    currentHoldings,
    targetWeights,
    minTradeThresholdUsd: 1.0,
    maxSlippageBps: 30,
  });

  assert.equal(res.totalAumUsd, 1000.0);
  assert.equal(res.turnoverUsd, 100.0);

  const solOrder = res.rebalanceOrders.find((o) => o.symbol === 'SOL');
  const spyOrder = res.rebalanceOrders.find((o) => o.symbol === 'SPY');

  assert.equal(solOrder.action, 'SELL');
  assert.equal(solOrder.deltaUsd, -100.0);
  assert.ok(Math.abs(solOrder.deltaUnits - 0.666667) < 0.001);

  assert.equal(spyOrder.action, 'BUY');
  assert.equal(spyOrder.deltaUsd, 100.0);
  assert.equal(spyOrder.deltaUnits, 0.2);
});
