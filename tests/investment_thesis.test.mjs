import test from 'node:test';
import assert from 'node:assert/strict';
import { InvestmentThesis } from '../src/investment_thesis.mjs';

test('InvestmentThesis.getThesis - returns thesis markdown and valid allocation', () => {
  const res = InvestmentThesis.getThesis({
    creatorHandle: '@LBCron',
    reserveName: 'SSR All-Weather Alpha Reserve',
    reserveSymbol: 'SSR-AWA',
  });

  assert.ok(res.title.includes('SSR-AWA'));
  assert.ok(res.thesisMarkdown.includes('Investment Thesis: SSR All-Weather Alpha Reserve'));
  assert.ok(res.xPostCopy.includes('https://ssr.fun/#/campaign'));
  assert.ok(res.xPostCopy.includes('@strategicsuperr'));

  // Ensure allocations sum to exactly 1.0
  const totalWeight = Object.values(res.targetAllocations).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(totalWeight - 1.0) < 0.0001);
  assert.equal(res.metrics.expectedSharpe, 1.84);
});
