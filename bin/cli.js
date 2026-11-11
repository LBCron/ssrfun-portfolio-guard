#!/usr/bin/env node
/**
 * @file bin/cli.js
 * Command-line interface for @lbcron/ssrfun-portfolio-guard.
 */

import { NavCalculator } from '../src/nav_calculator.mjs';
import { PortfolioOptimizer } from '../src/portfolio_optimizer.mjs';
import { BetaAuditor } from '../src/beta_auditor.mjs';
import { InvestmentThesis } from '../src/investment_thesis.mjs';
import { BENCHMARKS } from '../src/types.mjs';

const command = process.argv[2] || 'help';

switch (command) {
  case 'nav': {
    const holdings = [
      { symbol: 'SOL', balance: 1.5, priceUsd: 185.50 },
      { symbol: 'cbBTC', balance: 0.002, priceUsd: 88500.00 },
      { symbol: 'SPY', balance: 0.5, priceUsd: 595.20 },
      { symbol: 'GLD', balance: 1.0, priceUsd: 242.80 },
    ];
    const nav = NavCalculator.calculateNav({ holdings, totalSharesSupply: 10 });
    console.log(JSON.stringify(nav, null, 2));
    break;
  }

  case 'rebalance': {
    const currentHoldings = [
      { symbol: 'SOL', balance: 2.0, priceUsd: 185.50 },     // $371.00
      { symbol: 'cbBTC', balance: 0.001, priceUsd: 88500.00 }, // $88.50
      { symbol: 'SPY', balance: 0.2, priceUsd: 595.20 },     // $119.04
      { symbol: 'GLD', balance: 0.5, priceUsd: 242.80 },     // $121.40
    ];
    const targetWeights = BENCHMARKS.ALL_WEATHER;
    const plan = PortfolioOptimizer.generateRebalanceOrders({
      currentHoldings,
      targetWeights,
    });
    console.log(JSON.stringify(plan, null, 2));
    break;
  }

  case 'audit': {
    const bugs = BetaAuditor.getBugReports();
    console.log(`Found ${bugs.length} audited bug reports for SSR.FUN:`);
    for (const b of bugs) {
      console.log(`[${b.id}] (${b.severity}) ${b.title}`);
    }
    break;
  }

  case 'thesis': {
    const thesis = InvestmentThesis.getThesis();
    console.log(thesis.xPostCopy);
    break;
  }

  case 'export-submission': {
    const wallet = process.argv[3] || '32647Bri8KhJQE11x26iF7fpae9nouCJSZ8Y2VPpq5yM';
    const handle = process.argv[4] || '@LBCron';
    const submission = BetaAuditor.formatFeedbackSubmission(wallet, handle);
    console.log(submission);
    break;
  }

  default: {
    console.log(`
ssrfun-guard - Autonomous Portfolio Optimizer & Beta Auditor for SSR.FUN on Solana

Commands:
  nav               Calculate portfolio valuation and NAV per share
  rebalance         Generate multi-asset rebalance orders
  audit             List audited reproducible bug reports
  thesis            Print quantitative investment thesis and X copy
  export-submission Generate full markdown submission for Superteam Earn
`);
    break;
  }
}
