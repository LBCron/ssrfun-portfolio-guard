/**
 * @file types.mjs
 * Core data definitions for SSR.FUN portfolio management, valuation, and beta audit.
 */

export const ASSET_TYPES = {
  CRYPTO: 'CRYPTO',
  TOKENIZED_STOCK: 'TOKENIZED_STOCK',
  TOKENIZED_ETF: 'TOKENIZED_ETF',
  COMMODITY: 'COMMODITY',
  STABLECOIN: 'STABLECOIN',
};

export const DEFAULT_ASSETS = [
  { symbol: 'SOL', name: 'Solana', type: ASSET_TYPES.CRYPTO, decimals: 9, basePriceUsd: 185.50, volatility: 0.65 },
  { symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', type: ASSET_TYPES.CRYPTO, decimals: 8, basePriceUsd: 88500.00, volatility: 0.50 },
  { symbol: 'SPY', name: 'Tokenized SPDR S&P 500 ETF', type: ASSET_TYPES.TOKENIZED_ETF, decimals: 6, basePriceUsd: 595.20, volatility: 0.16 },
  { symbol: 'QQQ', name: 'Tokenized Invesco QQQ Trust', type: ASSET_TYPES.TOKENIZED_ETF, decimals: 6, basePriceUsd: 512.40, volatility: 0.22 },
  { symbol: 'GLD', name: 'Tokenized SPDR Gold Shares', type: ASSET_TYPES.COMMODITY, decimals: 6, basePriceUsd: 242.80, volatility: 0.14 },
  { symbol: 'TLT', name: 'Tokenized 20+ Year Treasury Bond ETF', type: ASSET_TYPES.TOKENIZED_ETF, decimals: 6, basePriceUsd: 91.30, volatility: 0.13 },
  { symbol: 'USDC', name: 'USD Coin', type: ASSET_TYPES.STABLECOIN, decimals: 6, basePriceUsd: 1.00, volatility: 0.005 }
];

export const BENCHMARKS = {
  ALL_WEATHER: {
    SOL: 0.25,
    cbBTC: 0.15,
    SPY: 0.25,
    QQQ: 0.10,
    GLD: 0.15,
    TLT: 0.10
  },
  GROWTH_ALPHA: {
    SOL: 0.40,
    cbBTC: 0.20,
    SPY: 0.20,
    QQQ: 0.20
  },
  DEFENSIVE_PRESERVATION: {
    SPY: 0.20,
    GLD: 0.35,
    TLT: 0.30,
    SOL: 0.10,
    USDC: 0.05
  }
};
