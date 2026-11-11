/**
 * @file nav_calculator.mjs
 * Net Asset Value (NAV) and share math engine for SSR.FUN on Solana.
 * Provides high-precision valuation, mint/redeem share tracking, and PnL metrics.
 */

const PRECISION_SCALE = 1_000_000n; // 6 decimals fixed-point precision

export class NavCalculator {
  /**
   * Calculate total portfolio value (AUM in USD) and NAV per share.
   * @param {Object} params
   * @param {Array<{symbol: string, balance: number, priceUsd: number}>} params.holdings
   * @param {number} params.totalSharesSupply
   * @param {number} [params.initialNav=100.0] - Default initial NAV if supply is 0
   * @returns {{ aumUsd: number, navPerShare: number, totalShares: number, assetValues: Record<string, number> }}
   */
  static calculateNav({ holdings, totalSharesSupply, initialNav = 100.0 }) {
    if (!Array.isArray(holdings)) {
      throw new TypeError('Holdings must be an array');
    }

    let totalAumUsd = 0;
    const assetValues = {};

    for (const h of holdings) {
      if (typeof h.balance !== 'number' || typeof h.priceUsd !== 'number') {
        throw new TypeError(`Invalid balance or price for asset ${h.symbol}`);
      }
      if (h.balance < 0 || h.priceUsd < 0) {
        throw new RangeError(`Negative balance or price for asset ${h.symbol}`);
      }
      const val = h.balance * h.priceUsd;
      assetValues[h.symbol] = Number(val.toFixed(4));
      totalAumUsd += val;
    }

    totalAumUsd = Number(totalAumUsd.toFixed(4));

    if (totalSharesSupply <= 0) {
      return {
        aumUsd: totalAumUsd,
        navPerShare: initialNav,
        totalShares: 0,
        assetValues,
      };
    }

    const navPerShare = Number((totalAumUsd / totalSharesSupply).toFixed(6));
    return {
      aumUsd: totalAumUsd,
      navPerShare,
      totalShares: totalSharesSupply,
      assetValues,
    };
  }

  /**
   * Calculate shares to mint for a given deposit value.
   * @param {number} depositUsd
   * @param {number} currentNav
   * @param {number} totalSharesSupply
   * @param {number} [mintFeeBps=15] - 15 basis points fee (0.15%)
   * @returns {{ sharesToMint: number, feeUsd: number, netDepositUsd: number }}
   */
  static calculateMint({ depositUsd, currentNav, totalSharesSupply, mintFeeBps = 15 }) {
    if (depositUsd <= 0) {
      throw new RangeError('Deposit amount must be positive');
    }
    if (currentNav <= 0) {
      throw new RangeError('Current NAV must be positive');
    }

    const feeRate = mintFeeBps / 10_000;
    const feeUsd = Number((depositUsd * feeRate).toFixed(4));
    const netDepositUsd = Number((depositUsd - feeUsd).toFixed(4));
    const sharesToMint = Number((netDepositUsd / currentNav).toFixed(6));

    return {
      sharesToMint,
      feeUsd,
      netDepositUsd,
    };
  }

  /**
   * Calculate payout value when burning reserve shares.
   * @param {number} sharesToBurn
   * @param {number} currentNav
   * @param {number} [redeemFeeBps=20] - 20 basis points fee (0.20%)
   * @returns {{ grossPayoutUsd: number, feeUsd: number, netPayoutUsd: number }}
   */
  static calculateRedeem({ sharesToBurn, currentNav, redeemFeeBps = 20 }) {
    if (sharesToBurn <= 0) {
      throw new RangeError('Shares to burn must be positive');
    }
    if (currentNav <= 0) {
      throw new RangeError('Current NAV must be positive');
    }

    const grossPayoutUsd = Number((sharesToBurn * currentNav).toFixed(4));
    const feeRate = redeemFeeBps / 10_000;
    const feeUsd = Number((grossPayoutUsd * feeRate).toFixed(4));
    const netPayoutUsd = Number((grossPayoutUsd - feeUsd).toFixed(4));

    return {
      grossPayoutUsd,
      feeUsd,
      netPayoutUsd,
    };
  }

  /**
   * Calculate performance PnL and return metrics.
   * @param {number} launchNav
   * @param {number} currentNav
   * @returns {{ pnlPercent: number, absoluteChange: number, isProfitable: boolean }}
   */
  static calculatePnL(launchNav, currentNav) {
    if (launchNav <= 0) {
      throw new RangeError('Launch NAV must be greater than zero');
    }
    const absoluteChange = Number((currentNav - launchNav).toFixed(6));
    const pnlPercent = Number(((absoluteChange / launchNav) * 100).toFixed(4));
    return {
      pnlPercent,
      absoluteChange,
      isProfitable: absoluteChange >= 0,
    };
  }
}
