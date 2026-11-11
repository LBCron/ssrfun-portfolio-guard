import test from 'node:test';
import assert from 'node:assert/strict';
import { NavCalculator } from '../src/nav_calculator.mjs';

test('NavCalculator.calculateNav - computes correct AUM and NAV per share', () => {
  const holdings = [
    { symbol: 'SOL', balance: 10, priceUsd: 150 },
    { symbol: 'SPY', balance: 5, priceUsd: 500 },
    { symbol: 'USDC', balance: 1000, priceUsd: 1 },
  ];
  const totalSharesSupply = 50;

  const res = NavCalculator.calculateNav({ holdings, totalSharesSupply });
  assert.equal(res.aumUsd, 5000.0);
  assert.equal(res.navPerShare, 100.0);
  assert.equal(res.totalShares, 50);
  assert.equal(res.assetValues.SOL, 1500.0);
  assert.equal(res.assetValues.SPY, 2500.0);
  assert.equal(res.assetValues.USDC, 1000.0);
});

test('NavCalculator.calculateNav - handles initial bootstrap when supply is 0', () => {
  const holdings = [{ symbol: 'USDC', balance: 500, priceUsd: 1 }];
  const res = NavCalculator.calculateNav({ holdings, totalSharesSupply: 0, initialNav: 100.0 });
  assert.equal(res.aumUsd, 500.0);
  assert.equal(res.navPerShare, 100.0);
  assert.equal(res.totalShares, 0);
});

test('NavCalculator.calculateNav - throws on negative balance or price', () => {
  assert.throws(() => {
    NavCalculator.calculateNav({
      holdings: [{ symbol: 'SOL', balance: -1, priceUsd: 100 }],
      totalSharesSupply: 10,
    });
  }, RangeError);
});

test('NavCalculator.calculateMint - computes shares to mint and deduction of fee', () => {
  const depositUsd = 1000;
  const currentNav = 100.0;
  const mintFeeBps = 20; // 0.20%

  const mint = NavCalculator.calculateMint({
    depositUsd,
    currentNav,
    totalSharesSupply: 50,
    mintFeeBps,
  });

  assert.equal(mint.feeUsd, 2.0);
  assert.equal(mint.netDepositUsd, 998.0);
  assert.equal(mint.sharesToMint, 9.98);
});

test('NavCalculator.calculateRedeem - computes payout and deduction of fee', () => {
  const sharesToBurn = 5.0;
  const currentNav = 120.0;
  const redeemFeeBps = 25; // 0.25%

  const redeem = NavCalculator.calculateRedeem({
    sharesToBurn,
    currentNav,
    redeemFeeBps,
  });

  assert.equal(redeem.grossPayoutUsd, 600.0);
  assert.equal(redeem.feeUsd, 1.5);
  assert.equal(redeem.netPayoutUsd, 598.5);
});

test('NavCalculator.calculatePnL - computes accurate return percentage', () => {
  const pnlGain = NavCalculator.calculatePnL(100.0, 115.5);
  assert.equal(pnlGain.pnlPercent, 15.5);
  assert.equal(pnlGain.absoluteChange, 15.5);
  assert.equal(pnlGain.isProfitable, true);

  const pnlLoss = NavCalculator.calculatePnL(100.0, 92.0);
  assert.equal(pnlLoss.pnlPercent, -8.0);
  assert.equal(pnlLoss.absoluteChange, -8.0);
  assert.equal(pnlLoss.isProfitable, false);
});
